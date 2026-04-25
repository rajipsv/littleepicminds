const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.send('API_OK_SIMPLE');
});

app.get('/api/test', (req, res) => {
  res.json({ 
    env: {
      has_db_url: !!process.env.DATABASE_URL,
      node_env: process.env.NODE_ENV,
      cwd: process.cwd(),
      dirname: __dirname
    }
  });
});

module.exports = app;
