import { pool } from '../server/db';

async function check() {
  try {
    const [countResult] = await pool.query('SELECT COUNT(*) as count FROM real_estate_listings');
    console.log('Total listings:', countResult);
    
    const [sample] = await pool.query('SELECT id, tenant_id, title, type, city, available FROM real_estate_listings LIMIT 10');
    console.log('Sample listings:', JSON.stringify(sample, null, 2));
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

check();
