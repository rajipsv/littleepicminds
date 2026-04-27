const { Pool } = require('pg');
require('dotenv').config();

async function checkUserRole() {
  const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_5PRUZwQnmj6E@ep-summer-smoke-amhl15la-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query("SELECT id, username, email, role FROM users WHERE email = 'gen.rajeswari@gmail.com'");
    console.log('--- USER DATA ---');
    console.table(res.rows);
    
    if (res.rows.length > 0 && res.rows[0].role !== 'admin') {
      console.log('User found but role is NOT admin. Updating...');
      await pool.query("UPDATE users SET role = 'admin' WHERE email = 'gen.rajeswari@gmail.com'");
      console.log('Role updated to admin successfully!');
    } else if (res.rows.length === 0) {
      console.log('User not found in DB. This is strange if you registered.');
    } else {
      console.log('User is already an admin in DB.');
    }
  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await pool.end();
  }
}

checkUserRole();
