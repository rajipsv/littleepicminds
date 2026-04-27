const { Client } = require('pg');

async function checkTestingUser() {
  const client = new Client({ 
    connectionString: 'postgresql://neondb_owner:npg_5PRUZwQnmj6E@ep-summer-smoke-amhl15la-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require', 
    ssl: { rejectUnauthorized: false } 
  });
  
  try {
    await client.connect();
    console.log("Users:");
    const res = await client.query("SELECT id, username FROM users ORDER BY id DESC LIMIT 5;");
    console.table(res.rows);
    
    console.log("\nJournal Entries:");
    const jRes = await client.query("SELECT * FROM journal_entries ORDER BY id DESC LIMIT 5;");
    console.table(jRes.rows);
    
    console.log("\nProgress Entries:");
    const pRes = await client.query("SELECT * FROM progress ORDER BY id DESC LIMIT 5;");
    console.table(pRes.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkTestingUser();
