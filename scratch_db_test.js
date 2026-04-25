const { Client } = require('pg');

async function checkSchema() {
  const client = new Client({ 
    connectionString: 'postgresql://neondb_owner:npg_5PRUZwQnmj6E@ep-summer-smoke-amhl15la-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require', 
    ssl: { rejectUnauthorized: false } 
  });
  
  try {
    await client.connect();
    const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkSchema();
