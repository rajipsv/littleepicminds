const { Pool } = require('pg');
require('dotenv').config();

async function updateRoles() {
  const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_5PRUZwQnmj6E@ep-summer-smoke-amhl15la-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await pool.query("UPDATE users SET role = 'admin' WHERE email IN ('raji.psv@gmail.com', 'raji.psv05@gmail.com')");
    console.log('Successfully updated DB roles for raji.psv emails to admin.');
  } catch (err) {
    console.error('Update failed:', err);
  } finally {
    await pool.end();
  }
}

updateRoles();
