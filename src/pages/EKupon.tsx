import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Keyboard,
  CheckCircle2,
  AlertCircle,
  Ticket,
  Clock,
  Loader2,
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Header from '@/components/layout/Header';

type TabType = 'scan' | 'manual';

interface ClaimedCoupon {
  code: string;
  description: string;
  claimedAt: string;
}

interface ClaimResult {
  code: string;
  description: string;
  claimedAt: string;
}

const STORAGE_KEY = 'masjidkita_claimed_coupons';

function getSavedCoupons(): ClaimedCoupon[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCoupon(coupon: ClaimedCoupon) {
  const existing = getSavedCoupons();
  const alreadyExists = existing.some((c) => c.code === coupon.code);
  if (!alreadyExists) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([coupon, ...existing]));
  }
}

export default function EKupon() {
  const [activeTab, setActiveTab] = useState<TabType>('scan');
  const [manualCode, setManualCode] = useState('');
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [claimedCoupons, setClaimedCoupons] = useState<ClaimedCoupon[]>(getSavedCoupons);
  const [scannerReady, setScannerReady] = useState(false);

  const getDeviceId = () => {
    let id = localStorage.getItem('masjidkita_device_id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('masjidkita_device_id', id);
    }
    return id;
  };

  const claimCoupon = useCallback(
    async (code: string) => {
      if (loading || !code.trim()) return;
      setLoading(true);
      setError(null);
      setClaimResult(null);

      try {
        const cleanCode = code.trim();
        const isEvent = cleanCode.startsWith('EVENT:');
        
        const endpoint = isEvent ? '/api/coupons/claim-event' : '/api/coupons/claim';
        const body = isEvent ? { eventId: cleanCode.replace('EVENT:', '') } : { code: cleanCode };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-device-id': getDeviceId()
          },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (res.ok) {
          const result: ClaimResult = {
            code: data.data?.code ?? cleanCode,
            description: data.data?.description ?? 'Kupon Makanan',
            claimedAt: data.data?.claimedAt ?? new Date().toISOString(),
          };
          setClaimResult(result);
          saveCoupon(result);
          setClaimedCoupons(getSavedCoupons());
        } else if (res.status === 409) {
          setError(data.error || 'Kupon sudah diklaim');
        } else if (res.status === 404) {
          setError(data.error || 'Kode kupon tidak ditemukan');
        } else if (res.status === 410) {
          setError(data.error || 'Kupon sudah kadaluarsa');
        } else {
          setError(data.error || 'Terjadi kesalahan. Silakan coba lagi.');
        }
      } catch {
        setError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const handleReset = () => {
    setClaimResult(null);
    setError(null);
    setManualCode('');
  };

  // QR Scanner setup
  useEffect(() => {
    if (activeTab !== 'scan' || claimResult || loading) return;

    setScannerReady(false);
    let scanner: Html5QrcodeScanner | null = null;

    // Delay initialization to allow DOM to settle
    const timeout = setTimeout(() => {
      const el = document.getElementById('ekupon-qr-reader');
      if (!el) return;

      scanner = new Html5QrcodeScanner(
        'ekupon-qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText: string) => {
          claimCoupon(decodedText);
          scanner?.clear().catch(() => {});
        },
        () => {}
      );

      setScannerReady(true);
    }, 300);

    return () => {
      clearTimeout(timeout);
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [activeTab, claimResult, loading, claimCoupon]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      claimCoupon(manualCode);
    }
  };

  // Success View
  if (claimResult) {
    return (
      <div className="flex min-h-screen flex-col bg-bg-primary">
        <Header showBack={true} />
        <div className="mx-auto w-full max-w-lg flex-1 px-4 pt-3 pb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="overflow-hidden rounded-2xl bg-bg-card shadow-lg"
          >
            {/* Green gradient header */}
            <div className="flex flex-col items-center bg-gradient-to-br from-emerald-500 to-emerald-700 px-6 py-8 text-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
              >
                <CheckCircle2 size={56} strokeWidth={1.5} />
              </motion.div>
              <h2 className="mt-3 text-xl font-bold">Kupon Berhasil Diklaim!</h2>
            </div>

            {/* Coupon details */}
            <div className="space-y-4 p-6">
              {/* Event description */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  Deskripsi
                </p>
                <p className="mt-1 text-base font-semibold text-text-primary">
                  {claimResult.description}
                </p>
              </div>

              {/* Coupon code */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  Kode Kupon
                </p>
                <p className="mt-1 rounded-xl bg-bg-elevated px-4 py-3 font-mono text-lg font-bold tracking-widest text-primary">
                  {claimResult.code}
                </p>
              </div>

              {/* Claimed timestamp */}
              <div className="flex items-center gap-2 text-text-muted">
                <Clock size={14} />
                <span className="text-xs">
                  Diklaim pada{' '}
                  {new Date(claimResult.claimedAt).toLocaleString('id-ID', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </span>
              </div>

              {/* Instructional text */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-center text-sm font-medium text-amber-800">
                  📋 Tunjukkan kupon ini kepada panitia saat pengambilan makanan
                </p>
              </div>

              {/* Reset button */}
              <button
                onClick={handleReset}
                className="pressable w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-md transition-all active:scale-[0.98]"
              >
                Klaim Kupon Lain
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <Header showBack={true} />

      <div className="mx-auto w-full max-w-lg flex-1 px-4 pt-3 pb-24">
        {/* Tab Switcher */}
        <div className="mb-4 flex rounded-xl bg-bg-elevated p-1">
          {(
            [
              { key: 'scan', label: 'Scan QR', icon: QrCode },
              { key: 'manual', label: 'Masukkan Kode', icon: Keyboard },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key);
                setError(null);
              }}
              className={`pressable relative flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                activeTab === key
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-muted'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
            >
              <AlertCircle size={20} className="flex-shrink-0 text-red-500" />
              <p className="text-sm font-medium text-red-700">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 flex items-center justify-center gap-3 rounded-xl bg-bg-card py-8 shadow-sm"
            >
              <Loader2 size={24} className="animate-spin text-primary" />
              <span className="text-sm font-medium text-text-secondary">
                Mengklaim kupon...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content */}
        {!loading && (
          <AnimatePresence mode="wait">
            {/* Scan QR Tab */}
            {activeTab === 'scan' && (
              <motion.div
                key="scan-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="rounded-2xl bg-bg-card p-5 shadow-sm">
                  {/* Instruction */}
                  <div className="mb-4 flex flex-col items-center text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
                      <QrCode size={28} className="text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      Pindai Kode QR
                    </h3>
                    <p className="mt-1 text-xs text-text-muted">
                      Arahkan kamera ke kode QR kupon makanan
                    </p>
                  </div>

                  {/* Scanner Container */}
                  <div className="ekupon-scanner-wrapper overflow-hidden rounded-xl">
                    <div id="ekupon-qr-reader" />
                  </div>

                  {!scannerReady && (
                    <div className="flex items-center justify-center gap-2 py-8">
                      <Loader2 size={20} className="animate-spin text-primary" />
                      <span className="text-xs text-text-muted">
                        Memuat kamera...
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Manual Code Tab */}
            {activeTab === 'manual' && (
              <motion.div
                key="manual-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="rounded-2xl bg-bg-card p-5 shadow-sm">
                  <div className="mb-5 flex flex-col items-center text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
                      <Keyboard size={28} className="text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      Masukkan Kode Kupon
                    </h3>
                    <p className="mt-1 text-xs text-text-muted">
                      Ketik kode kupon yang tertera pada tiket Anda
                    </p>
                  </div>

                  <form onSubmit={handleManualSubmit} className="space-y-3">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      placeholder="Contoh: KUPON-ABC123"
                      className="w-full rounded-xl border border-primary-100 bg-white py-3.5 px-4 text-center font-mono text-base font-semibold tracking-widest text-text-primary placeholder:text-text-muted placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:tracking-normal shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="submit"
                      disabled={!manualCode.trim()}
                      className="pressable w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Klaim Kupon
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Claimed History */}
        {claimedCoupons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="mt-6"
          >
            <div className="mb-3 flex items-center gap-2">
              <Ticket size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-text-primary">
                Kupon Terklaim
              </h3>
              <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-bold text-primary">
                {claimedCoupons.length}
              </span>
            </div>

            <div className="space-y-2">
              {claimedCoupons.map((coupon, idx) => (
                <motion.div
                  key={`${coupon.code}-${idx}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="flex items-center gap-3 rounded-xl bg-bg-card p-3.5 shadow-sm"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs font-bold tracking-wider text-text-primary">
                      {coupon.code}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-text-muted">
                      {coupon.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-[10px] text-text-muted">
                      {new Date(coupon.claimedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Custom styles for html5-qrcode scanner */}
      <style>{`
        .ekupon-scanner-wrapper #ekupon-qr-reader {
          border: none !important;
          border-radius: 12px;
          overflow: hidden;
        }
        .ekupon-scanner-wrapper #ekupon-qr-reader img[alt="Info icon"] {
          display: none !important;
        }
        .ekupon-scanner-wrapper #ekupon-qr-reader #ekupon-qr-reader__status_span {
          display: none !important;
        }
        .ekupon-scanner-wrapper #ekupon-qr-reader #ekupon-qr-reader__header_message {
          display: none !important;
        }
        .ekupon-scanner-wrapper #ekupon-qr-reader a {
          display: none !important;
        }
        .ekupon-scanner-wrapper #ekupon-qr-reader img {
          margin: 0 auto 16px auto !important;
          display: block !important;
        }
        .ekupon-scanner-wrapper #ekupon-qr-reader #ekupon-qr-reader__dashboard_section_csr {
          text-align: center !important;
        }
        .ekupon-scanner-wrapper #ekupon-qr-reader #ekupon-qr-reader__dashboard_section_csr > span {
          display: block !important;
          margin-bottom: 8px !important;
          font-weight: 500 !important;
        }
        .ekupon-scanner-wrapper #ekupon-qr-reader #ekupon-qr-reader__dashboard_section_csr select {
          display: block !important;
          margin: 0 auto 16px auto !important;
          width: 100% !important;
          max-width: 250px !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          border: 1px solid #e5e7eb !important;
          font-size: 13px !important;
          background-color: #f9fafb !important;
        }
        .ekupon-scanner-wrapper #ekupon-qr-reader #ekupon-qr-reader__dashboard_section_csr button {
          background-color: var(--color-primary, #16a34a) !important;
          color: white !important;
          border: none !important;
          border-radius: 10px !important;
          padding: 10px 24px !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          cursor: pointer !important;
          margin: 0 auto !important;
        }
        .ekupon-scanner-wrapper #ekupon-qr-reader video {
          border-radius: 8px !important;
          margin: 0 auto !important;
        }
        .ekupon-scanner-wrapper #ekupon-qr-reader #ekupon-qr-reader__scan_region {
          border: none !important;
          margin: 0 auto !important;
          text-align: center !important;
        }
        .ekupon-scanner-wrapper #ekupon-qr-reader__dashboard_section {
          padding: 12px 0 !important;
        }
      `}</style>
    </div>
  );
}