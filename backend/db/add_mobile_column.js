const { Pool } = require('pg');
require('dotenv').config();

async function addMobileColumn() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set!');
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    // Add mobile column if it doesn't exist
    await pool.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='mobile') THEN
          ALTER TABLE users ADD COLUMN mobile VARCHAR(20);
        END IF;
      END $$;
    `);
    
    console.log('Successfully added mobile column to users table!');
  } catch (err) {
    console.error('Failed to update database:', err);
  } finally {
    await pool.end();
  }
}

addMobileColumn();
