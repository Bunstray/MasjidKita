/**
 * MasjidKita API Server v2 — with Auth, Admin, and News
 * 
 * Security: bcrypt passwords, JWT tokens, rate limiting,
 * CORS, input validation, parameterized SQL, XSS prevention
 */
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const { Pool } = pg;

// ═══════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════
const PORT = process.env.PORT || 3001;
const DATABASE_URL = process.env.DATABASE_URL ||
  'postgresql://postgres.probjxogsmzzdyuwzufb:MRBS_2046!!@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres';
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRY = '7d';
const BCRYPT_ROUNDS = 12;

const ALLOWED_ORIGINS = [
  'http://localhost:5173', 'http://localhost:5174',
  'http://localhost:3000', 'http://localhost:4173',
];

const VALID_CATEGORIES = ['Infaq', 'Zakat', 'Wakaf', 'Qurban'];
const VALID_PAYMENT_TYPES = ['qris', 'ewallet', 'bank'];
const VALID_NEWS_CATEGORIES = ['Pengumuman', 'Kegiatan', 'Kajian', 'Berita'];
const MIN_AMOUNT = 1000;
const MAX_AMOUNT = 100_000_000;

// ═══════════════════════════════════════════
// Database
// ═══════════════════════════════════════════
const pool = new Pool({ connectionString: DATABASE_URL, max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000 });

// ═══════════════════════════════════════════
// Rate Limiter
// ═══════════════════════════════════════════
const rateLimitMap = new Map();
function checkRateLimit(key, max = 5, windowMs = 60000) {
  const now = Date.now();
  if (!rateLimitMap.has(key)) { rateLimitMap.set(key, [now]); return true; }
  const ts = rateLimitMap.get(key).filter(t => now - t < windowMs);
  ts.push(now);
  rateLimitMap.set(key, ts);
  return ts.length <= max;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, ts] of rateLimitMap.entries()) {
    const v = ts.filter(t => now - t < 120000);
    if (v.length === 0) rateLimitMap.delete(k); else rateLimitMap.set(k, v);
  }
}, 300000);

// ═══════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════
function sanitize(str, maxLen = 100) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').replace(/[<>"'`;\\]/g, '').trim().substring(0, maxLen);
}

function hashIP(ip) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip + '_mk_salt_v2').digest('hex').substring(0, 16);
}

function generateReceiptId() {
  const now = new Date();
  const d = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0');
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let r = '';
  for (let i = 0; i < 5; i++) r += c.charAt(Math.floor(Math.random() * c.length));
  return `INF-${d}-${r}`;
}

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// ═══════════════════════════════════════════
// Auth Middleware
// ═══════════════════════════════════════════
function authMiddleware(requireAdmin = false) {
  return async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token diperlukan' });
    }
    try {
      const token = header.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      if (requireAdmin && decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Akses admin diperlukan' });
      }
      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({ error: 'Token tidak valid atau kadaluarsa' });
    }
  };
}

// Optional auth — sets req.user if token present, but doesn't block
function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    } catch { /* ignore invalid token */ }
  }
  next();
}

// ═══════════════════════════════════════════
// Express App
// ═══════════════════════════════════════════
const app = express();
app.use(express.json({ limit: '50kb' }));
app.use(cors({
  origin: (origin, cb) => {
    // Allow if no origin (e.g. server-to-server), if in ALLOWED_ORIGINS, or if it's a Vercel domain
    if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) {
      cb(null, true);
    } else {
      cb(new Error('CORS not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-ID'],
  credentials: true,
}));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// ═══════════════════════════════════════════
// HEALTH
// ═══════════════════════════════════════════
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ═══════════════════════════════════════════
// AUTH: Register
// ═══════════════════════════════════════════
app.post('/api/auth/register', async (req, res) => {
  try {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    if (!checkRateLimit(`reg_${ip}`, 3, 300000)) {
      return res.status(429).json({ error: 'Terlalu banyak percobaan. Coba lagi dalam 5 menit.' });
    }

    const { email, password, name } = req.body;
    const cleanEmail = sanitize(email, 255).toLowerCase();
    const cleanName = sanitize(name, 100);

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: 'Email tidak valid' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter' });
    }
    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ error: 'Nama minimal 2 karakter' });
    }

    // Check if email exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email sudah terdaftar' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const result = await pool.query(
      'INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at',
      [cleanEmail, cleanName, passwordHash, 'user']
    );
    const user = result.rows[0];
    const token = signToken(user);

    res.status(201).json({
      success: true,
      data: { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// ═══════════════════════════════════════════
// AUTH: Login
// ═══════════════════════════════════════════
app.post('/api/auth/login', async (req, res) => {
  try {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    if (!checkRateLimit(`login_${ip}`, 10, 300000)) {
      return res.status(429).json({ error: 'Terlalu banyak percobaan login. Coba lagi dalam 5 menit.' });
    }

    const { email, password } = req.body;
    const cleanEmail = sanitize(email, 255).toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({ error: 'Email dan password diperlukan' });
    }

    const result = await pool.query('SELECT id, email, name, password_hash, role FROM users WHERE email = $1', [cleanEmail]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const token = signToken(user);
    res.json({
      success: true,
      data: { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// ═══════════════════════════════════════════
// AUTH: Get current user
// ═══════════════════════════════════════════
app.get('/api/auth/me', authMiddleware(), (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

// ═══════════════════════════════════════════
// INFAQ: Create (authenticated users get user_id linked)
// ═══════════════════════════════════════════
app.post('/api/infaq', optionalAuth, async (req, res) => {
  try {
    const deviceId = sanitize(req.headers['x-device-id'] || req.body.deviceId, 64);
    if (!deviceId) return res.status(400).json({ error: 'Device ID diperlukan' });
    if (!checkRateLimit(`infaq_${deviceId}`, 5, 60000)) {
      return res.status(429).json({ error: 'Terlalu banyak permintaan. Tunggu sebentar.' });
    }

    const { category, amount, paymentMethod, paymentType, donorName, isAnonymous } = req.body;
    const numAmount = Number(amount);

    if (!Number.isInteger(numAmount) || numAmount < MIN_AMOUNT || numAmount > MAX_AMOUNT) {
      return res.status(400).json({ error: `Jumlah harus antara ${MIN_AMOUNT.toLocaleString()} dan ${MAX_AMOUNT.toLocaleString()}` });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Kategori tidak valid' });
    }
    if (!VALID_PAYMENT_TYPES.includes(paymentType)) {
      return res.status(400).json({ error: 'Tipe pembayaran tidak valid' });
    }

    const cleanPaymentMethod = sanitize(paymentMethod, 50);
    if (!cleanPaymentMethod) return res.status(400).json({ error: 'Metode pembayaran tidak valid' });

    // If user is logged in, use their name (unless anonymous)
    const anonymous = isAnonymous === true;
    let cleanDonorName;
    if (req.user && !anonymous) {
      cleanDonorName = req.user.name;
    } else if (anonymous) {
      cleanDonorName = 'Hamba Allah';
    } else {
      cleanDonorName = sanitize(donorName, 100) || 'Hamba Allah';
    }

    const receiptId = generateReceiptId();
    const userId = req.user?.id || null;
    const ipHash = hashIP(req.ip || req.socket?.remoteAddress);

    const result = await pool.query(
      `INSERT INTO infaq_transactions 
        (receipt_id, device_id, user_id, donor_name, is_anonymous, category, amount, payment_method, payment_type, status, ip_hash, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'success', $10, $11)
       RETURNING id, receipt_id, donor_name, is_anonymous, category, amount, payment_method, payment_type, status, created_at`,
      [receiptId, deviceId, userId, cleanDonorName, anonymous, category, numAmount, cleanPaymentMethod, paymentType, ipHash, sanitize(req.headers['user-agent'], 200)]
    );

    const row = result.rows[0];
    res.status(201).json({
      success: true,
      data: {
        id: row.receipt_id, date: row.created_at, category: row.category,
        amount: Number(row.amount), paymentMethod: row.payment_method,
        paymentType: row.payment_type, status: row.status,
        donorName: row.donor_name, isAnonymous: row.is_anonymous,
      },
    });
  } catch (err) {
    console.error('POST /api/infaq error:', err.message);
    if (err.code === '23505') return res.status(409).json({ error: 'Transaksi duplikat' });
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// ═══════════════════════════════════════════
// INFAQ: Get user's own history (auth required)
// ═══════════════════════════════════════════
app.get('/api/infaq', optionalAuth, async (req, res) => {
  try {
    let result;
    if (req.user) {
      // Logged-in: get by user_id
      result = await pool.query(
        `SELECT receipt_id, donor_name, is_anonymous, category, amount, payment_method, payment_type, status, created_at
         FROM infaq_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
        [req.user.id]
      );
    } else {
      // Guest: get by device_id
      const deviceId = sanitize(req.headers['x-device-id'], 64);
      if (!deviceId) return res.status(400).json({ error: 'Device ID diperlukan' });
      result = await pool.query(
        `SELECT receipt_id, donor_name, is_anonymous, category, amount, payment_method, payment_type, status, created_at
         FROM infaq_transactions WHERE device_id = $1 AND user_id IS NULL ORDER BY created_at DESC LIMIT 100`,
        [deviceId]
      );
    }

    const data = result.rows.map(r => ({
      id: r.receipt_id, date: r.created_at, category: r.category,
      amount: Number(r.amount), paymentMethod: r.payment_method,
      paymentType: r.payment_type, status: r.status,
      donorName: r.donor_name, isAnonymous: r.is_anonymous,
    }));
    res.json({ success: true, data });
  } catch (err) {
    console.error('GET /api/infaq error:', err.message);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// ═══════════════════════════════════════════
// INFAQ: Admin — get ALL transactions
// ═══════════════════════════════════════════
app.get('/api/admin/infaq', authMiddleware(true), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT receipt_id, donor_name, is_anonymous, category, amount, payment_method, payment_type, status, created_at
       FROM infaq_transactions ORDER BY created_at DESC LIMIT 500`
    );
    const data = result.rows.map(r => ({
      id: r.receipt_id, date: r.created_at, category: r.category,
      amount: Number(r.amount), paymentMethod: r.payment_method,
      paymentType: r.payment_type, status: r.status,
      donorName: r.is_anonymous ? 'Hamba Allah' : r.donor_name,
      isAnonymous: r.is_anonymous,
    }));
    const total = data.reduce((s, d) => s + d.amount, 0);
    res.json({ success: true, data, total, count: data.length });
  } catch (err) {
    console.error('GET /api/admin/infaq error:', err.message);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// ═══════════════════════════════════════════
// NEWS: List (public)
// ═══════════════════════════════════════════
app.get('/api/news', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, content, category, image_url, author_name, created_at
       FROM news WHERE is_published = true ORDER BY created_at DESC LIMIT 50`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('GET /api/news error:', err.message);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// ═══════════════════════════════════════════
// NEWS: Create (admin only)
// ═══════════════════════════════════════════
app.post('/api/admin/news', authMiddleware(true), async (req, res) => {
  try {
    const { title, content, category, imageUrl } = req.body;
    const cleanTitle = sanitize(title, 200);
    const cleanContent = (typeof content === 'string' ? content : '').replace(/<script[^>]*>.*?<\/script>/gi, '').substring(0, 5000);
    const cleanCategory = VALID_NEWS_CATEGORIES.includes(category) ? category : 'Pengumuman';
    const cleanImage = sanitize(imageUrl, 500);

    if (cleanTitle.length < 3) return res.status(400).json({ error: 'Judul minimal 3 karakter' });
    if (cleanContent.length < 10) return res.status(400).json({ error: 'Konten minimal 10 karakter' });

    const result = await pool.query(
      `INSERT INTO news (title, content, category, image_url, author_id, author_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, content, category, image_url, author_name, created_at`,
      [cleanTitle, cleanContent, cleanCategory, cleanImage || null, req.user.id, req.user.name]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('POST /api/admin/news error:', err.message);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// ═══════════════════════════════════════════
// NEWS: Delete (admin only)
// ═══════════════════════════════════════════
app.delete('/api/admin/news/:id', authMiddleware(true), async (req, res) => {
  try {
    const id = sanitize(req.params.id, 50);
    await pool.query('DELETE FROM news WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/news error:', err.message);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// ═══════════════════════════════════════════
// 404 + Error handlers
// ═══════════════════════════════════════════
app.use((_req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan' }));
app.use((err, _req, res, _next) => {
  console.error('Unhandled:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ═══════════════════════════════════════════
// Bootstrap: Create default admin on startup
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
async function bootstrap() {
  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = 'admin@masjidkita.id'");
    if (existing.rows.length === 0) {
      const hash = await bcrypt.hash('admin123', BCRYPT_ROUNDS);
      await pool.query(
        "INSERT INTO users (email, name, password_hash, role) VALUES ('admin@masjidkita.id', 'Admin Masjid', $1, 'admin')",
        [hash]
      );
      console.log('👤 Default admin created: admin@masjidkita.id / admin123');
    }
  } catch (err) {
    console.error('Bootstrap error:', err.message);
  }
}

// Automatically bootstrap on load (safe for serverless)
bootstrap();

// Only listen if not on Vercel (Vercel uses the exported app)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🕌 MasjidKita API v2 running on http://localhost:${PORT}`);
    console.log(`🔒 CORS: ${ALLOWED_ORIGINS.join(', ')}`);
  });
}

export default app;
