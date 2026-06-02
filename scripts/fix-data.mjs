import pg from 'pg';
const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL ||
  'postgresql://postgres.probjxogsmzzdyuwzufb:MRBS_2046!!@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres';

async function fix() {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    
    // Drop the old constraint first
    await client.query("ALTER TABLE infaq_transactions DROP CONSTRAINT IF EXISTS infaq_transactions_category_check");
    console.log('✅ Dropped old constraint');
    
    // Fix existing rows to new names
    await client.query("UPDATE infaq_transactions SET category = 'Infaq' WHERE category = 'Infaq Umum'");
    await client.query("UPDATE infaq_transactions SET category = 'Wakaf' WHERE category = 'Pembangunan'");
    await client.query("UPDATE infaq_transactions SET category = 'Zakat' WHERE category = 'Infaq Jumat'");
    console.log('✅ Fixed category names');
    
    // Delete test data
    await client.query("DELETE FROM infaq_transactions WHERE device_id LIKE 'test-%'");
    console.log('✅ Cleaned test data');
    
    // Re-add the correct constraint
    await client.query("ALTER TABLE infaq_transactions ADD CONSTRAINT infaq_transactions_category_check CHECK (category IN ('Infaq', 'Zakat', 'Wakaf', 'Qurban'))");
    console.log('✅ Added new constraint');
    
  } finally {
    await client.end();
  }
}

fix();
