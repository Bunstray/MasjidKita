// ═══════════════════════════════════════════
// Infaq Receipt Service — Supabase backend + localStorage cache
// ═══════════════════════════════════════════

export interface InfaqReceipt {
  id: string;        // receipt_id: INF-YYYYMMDD-XXXXX
  date: string;      // ISO date string
  category: string;
  amount: number;
  paymentMethod: string;
  paymentType: 'qris' | 'ewallet' | 'bank';
  status: 'success' | 'pending' | 'failed';
  donorName: string;
}

// ── Configuration ──
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const STORAGE_KEY = 'masjidkita_infaq_receipts';
const DEVICE_ID_KEY = 'masjidkita_device_id';

// ── Device ID (persistent anonymous identifier) ──
function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    // Generate a cryptographically strong random ID
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    id = Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// ── Local cache management ──
function cacheReceipts(receipts: InfaqReceipt[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
  } catch {
    // Storage full — silently fail
  }
}

function getCachedReceipts(): InfaqReceipt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as InfaqReceipt[];
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════════
// API Functions
// ═══════════════════════════════════════════

/**
 * Save a new infaq transaction to the server
 * Falls back to localStorage if server is unreachable
 */
export async function saveReceipt(params: {
  category: string;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  donorName: string;
  isAnonymous?: boolean;
  token?: string | null;
}): Promise<InfaqReceipt> {
  const deviceId = getDeviceId();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Device-ID': deviceId,
  };

  if (params.token) {
    headers['Authorization'] = `Bearer ${params.token}`;
  }

  try {
    const res = await fetch(`${API_BASE}/api/infaq`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...params,
        deviceId,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Server error' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const json = await res.json();
    const receipt: InfaqReceipt = json.data;

    // Cache locally
    const cached = getCachedReceipts();
    cached.unshift(receipt);
    cacheReceipts(cached);

    return receipt;
  } catch (err) {
    // Offline fallback — save to localStorage only
    console.warn('Server unreachable, saving locally:', err);

    const receipt: InfaqReceipt = {
      id: generateReceiptId(),
      date: new Date().toISOString(),
      category: params.category,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      paymentType: params.paymentType as InfaqReceipt['paymentType'],
      status: 'success',
      donorName: params.isAnonymous ? 'Hamba Allah' : (params.donorName || 'Hamba Allah'),
    };

    const cached = getCachedReceipts();
    cached.unshift(receipt);
    cacheReceipts(cached);

    return receipt;
  }
}

/**
 * Get all receipts — tries server first, falls back to cache
 */
export async function getReceipts(token?: string | null): Promise<InfaqReceipt[]> {
  const deviceId = getDeviceId();
  
  const headers: Record<string, string> = {
    'X-Device-ID': deviceId,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}/api/infaq`, {
      headers,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const receipts: InfaqReceipt[] = json.data;

    // Update local cache
    cacheReceipts(receipts);

    return receipts;
  } catch {
    // Offline — return cached
    return getCachedReceipts();
  }
}

/**
 * Get a single receipt by ID
 */
export async function getReceiptById(id: string): Promise<InfaqReceipt | null> {
  // Try cache first (instant)
  const cached = getCachedReceipts();
  const local = cached.find((r) => r.id === id);
  if (local) return local;

  // Try server
  try {
    const res = await fetch(`${API_BASE}/api/infaq/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════

export function generateReceiptId(): string {
  const now = new Date();
  const date =
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rand = '';
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `INF-${date}-${rand}`;
}

export function formatRupiah(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
