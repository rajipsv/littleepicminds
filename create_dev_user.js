const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_5PRUZwQnmj6E@ep-summer-smoke-amhl15la-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function createDevUser() {
  const username = 'devuser';
  const email = 'devuser@example.com';
  const password = 'password123';
  
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const client = new Client({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    
    // Check if user exists
    const check = await client.query('SELECT id FROM users WHERE username = $1', [username]);
    if (check.rows.length > 0) {
      console.log('User devuser already exists. Updating password...');
      await client.query('UPDATE users SET password_hash = $1 WHERE username = $2', [passwordHash, username]);
    } else {
      await client.query(
        'INSERT INTO users (username, email, password_hash, name, age, grade, level, role, is_premium) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)',
        [username, email, passwordHash, 'Developer User', 25, '12', 'seekers', 'student']
      );
      console.log('✅ User devuser created successfully!');
    }

    await client.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

createDevUser();
