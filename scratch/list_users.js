const { Pool } = require('pg');
require('dotenv').config();

async function listUsers() {
  const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_5PRUZwQnmj6E@ep-summer-smoke-amhl15la-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query("SELECT id, username, email, role FROM users");
    console.log('--- ALL REGISTERED USERS ---');
    console.table(res.rows);
  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await pool.end();
  }
}

listUsers();
