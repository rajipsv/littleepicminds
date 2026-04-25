const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_5PRUZwQnmj6E@ep-summer-smoke-amhl15la-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const JWT_SECRET = 'littleEpicMinds_dev_secret_2026';

async function simulateRegister() {
  console.log('Simulating registration logic...');
  
  const username = 'test_antigravity_' + Date.now();
  const email = username + '@example.com';
  const password = 'Password123!';
  
  try {
    console.log('1. Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    console.log('✅ Hash created:', passwordHash.substring(0, 10) + '...');

    console.log('2. Connecting to DB...');
    const client = new Client({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    console.log('✅ Connected.');

    console.log('3. Inserting user...');
    const res = await client.query(
      'INSERT INTO users (username, email, password_hash, name, age, grade, level, role, is_premium) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false) RETURNING id, username, email, name, role, is_premium, level, age, grade',
      [username, email, passwordHash, username, 10, '5', 'seeds', 'student']
    );
    const user = res.rows[0];
    console.log('✅ User inserted. ID:', user.id);

    console.log('4. Signing JWT...');
    const payload = { user: { id: user.id, role: user.role, is_premium: user.is_premium, level: user.level } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    console.log('✅ Token created:', token.substring(0, 10) + '...');

    await client.end();
    console.log('🏁 ALL STEPS SUCCESSFUL!');

  } catch (err) {
    console.error('❌ SIMULATION FAILED:', err.message);
    console.error(err.stack);
  }
}

simulateRegister();
