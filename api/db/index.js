const { Pool } = require('pg');
require('dotenv').config();

const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
}) : null;

module.exports = {
  query: (text, params) => {
    if (!pool) {
      console.warn('DB Query attempted but DATABASE_URL is not set!');
      return { rows: [] };
    }
    return pool.query(text, params);
  },
  ensureTables: async () => {
    if (!pool) return;
    try {
      console.log('Checking database tables...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
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
          mobile VARCHAR(20),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Database tables verified.');
    } catch (err) {
      console.error('Error verifying tables:', err.message);
    }
  }
};
