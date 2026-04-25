const { Client } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_5PRUZwQnmj6E@ep-summer-smoke-amhl15la-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function checkRecentUsers() {
  console.log('Checking recent users in NeonDB...');
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 5');
    console.log('Most recent users:');
    res.rows.forEach(row => {
      console.log(` - ID: ${row.id}, User: ${row.username}, Email: ${row.email}, Created: ${row.created_at}`);
    });
  } catch (err) {
    console.error('❌ Query failed:', err.message);
  } finally {
    await client.end();
  }
}

checkRecentUsers();
