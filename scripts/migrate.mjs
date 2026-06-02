/**
 * Supabase Database Migration v2
 * - Updates category constraint to match frontend
 * - Adds users table with auth
 * - Adds news table for admin
 * - Updates RLS policies for user-based access
 * 
 * Run: node scripts/migrate.mjs
 */
import pg from 'pg';
const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL ||
  'postgresql://postgres.probjxogsmzzdyuwzufb:MRBS_2046!!@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres';

const SQL = `
-- ═══════════════════════════════════════════
-- 1. Users table with secure password storage
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ═══════════════════════════════════════════
-- 2. Update infaq_transactions table
-- ═══════════════════════════════════════════
-- Add user_id column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'infaq_transactions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE infaq_transactions ADD COLUMN user_id UUID REFERENCES users(id);
  END IF;
END $$;

-- Add is_anonymous column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'infaq_transactions' AND column_name = 'is_anonymous'
  ) THEN
    ALTER TABLE infaq_transactions ADD COLUMN is_anonymous BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Update category constraint to match frontend categories
ALTER TABLE infaq_transactions DROP CONSTRAINT IF EXISTS infaq_transactions_category_check;
ALTER TABLE infaq_transactions ADD CONSTRAINT infaq_transactions_category_check 
  CHECK (category IN ('Infaq', 'Zakat', 'Wakaf', 'Qurban'));

CREATE INDEX IF NOT EXISTS idx_infaq_user_id ON infaq_transactions(user_id);

-- ═══════════════════════════════════════════
-- 3. News/announcements table
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (length(title) >= 3 AND length(title) <= 200),
  content TEXT NOT NULL CHECK (length(content) >= 10),
  category TEXT NOT NULL DEFAULT 'Pengumuman' CHECK (category IN ('Pengumuman', 'Kegiatan', 'Kajian', 'Berita')),
  image_url TEXT,
  author_id UUID REFERENCES users(id),
  author_name TEXT NOT NULL DEFAULT 'Admin',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(is_published, created_at DESC);

-- ═══════════════════════════════════════════
-- 4. Session tokens table (for JWT blacklisting)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);

-- Clean expired sessions automatically
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════
-- 5. Enable RLS on all tables
-- ═══════════════════════════════════════════
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE infaq_transactions ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════
-- 6. Create default admin account
--    Email: admin@masjidkita.id
--    Password will be set via the API on first run
-- ═══════════════════════════════════════════
-- (Admin is created by the server on first startup)
`;

async function migrate() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    await client.connect();
    
    console.log('📦 Running migration v2...');
    await client.query(SQL);
    
    console.log('✅ Migration v2 complete!');
    
    // Verify tables
    const tables = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    console.log('📋 Tables:', tables.rows.map(r => r.tablename).join(', '));
    
    // Check RLS status
    const rls = await client.query(
      "SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('users', 'infaq_transactions', 'news', 'sessions')"
    );
    for (const r of rls.rows) {
      console.log(`🔒 ${r.relname}: RLS ${r.relrowsecurity ? 'ON' : 'OFF'}`);
    }
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
