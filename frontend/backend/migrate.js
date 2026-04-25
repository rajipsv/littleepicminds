const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set!');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf-8');
    
    console.log('Executing schema.sql...');
    await pool.query(schemaSql);
    
    console.log('Migration successful! Tables created.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
