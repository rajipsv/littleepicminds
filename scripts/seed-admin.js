/**
 * Create or update the platform admin (bcrypt password, never plaintext in code).
 *
 * Set in backend/.env:
 *   ADMIN_EMAIL=you@example.com
 *   ADMIN_USERNAME=admin
 *   ADMIN_PASSWORD=YourStrongPassword1
 *
 *   npm run db:seed-admin
 */
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
const { hashPassword, validateEmail, validatePassword, validateUsername } = require('../lib/auth');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required.');
    process.exit(1);
  }

  const email = process.env.ADMIN_EMAIL;
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env');
    process.exit(1);
  }

  const e = validateEmail(email);
  const u = validateUsername(username);
  const p = validatePassword(password, { label: 'ADMIN_PASSWORD' });
  if (!e.ok || !u.ok || !p.ok) {
    console.error(e.error || u.error || p.error);
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const passwordHash = await hashPassword(password);

  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active'`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE`);
    const existing = await pool.query('SELECT id FROM users WHERE email = $1 OR username = $2', [
      e.value,
      u.value,
    ]);

    if (existing.rows.length) {
      await pool.query(
        `UPDATE users SET password_hash = $1, role = 'admin', is_premium = true, account_status = 'active',
         level = 'warriors', email = $2, username = $3 WHERE id = $4`,
        [passwordHash, e.value, u.value, existing.rows[0].id]
      );
      console.log(`Updated admin user id=${existing.rows[0].id} (${u.value})`);
    } else {
      const ins = await pool.query(
        `INSERT INTO users (username, email, password_hash, name, role, is_premium, level, account_status)
         VALUES ($1, $2, $3, $4, 'admin', true, 'warriors', 'active')
         RETURNING id`,
        [u.value, e.value, passwordHash, 'Platform Admin']
      );
      console.log(`Created admin user id=${ins.rows[0].id} (${u.value})`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
