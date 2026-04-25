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
};
