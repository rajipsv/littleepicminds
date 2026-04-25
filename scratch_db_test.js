const { Client } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_5PRUZwQnmj6E@ep-summer-smoke-amhl15la-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testConnection() {
  console.log('Testing connection to NeonDB...');
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully!');

    // Check if users table exists
    const res = await client.query("SELECT to_regclass('public.users')");
    const tableExists = res.rows[0].to_regclass;
    console.log('Table "users" exists:', !!tableExists);

    if (!tableExists) {
      console.log('Table "users" missing. Creating it...');
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          age INTEGER,
          grade VARCHAR(50),
          level VARCHAR(50),
          role VARCHAR(50) DEFAULT 'student',
          is_premium BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Table "users" created.');
    }

    // List columns to be sure
    const columns = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
    console.log('Columns in "users" table:');
    columns.rows.forEach(row => console.log(` - ${row.column_name} (${row.data_type})`));

  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await client.end();
  }
}

testConnection();
