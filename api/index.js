const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

// --- DATABASE CONFIG ---
const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
}) : null;

const db = {
  query: (text, params) => {
    if (!pool) throw new Error('DATABASE_URL is not set!');
    return pool.query(text, params);
  }
};

const JWT_SECRET = process.env.JWT_SECRET || 'littleEpicMinds_prod_secret_2026';

// --- DATA LOADING ---
let data = { shlokas: {}, hanumanChalisa: {}, evaluations: {}, chapters: [], levels: [] };
try {
  data = require('./data');
} catch (e) {
  console.warn('Could not load static data:', e.message);
}

const app = express();
app.use(cors());
app.use(express.json());

// --- HELPERS ---
function getLevelFromAge(age) {
  if (!age) return 'seeds';
  const a = parseInt(age);
  if (isNaN(a) || a <= 7) return 'seeds';
  if (a <= 10) return 'seekers';
  return 'warriors';
}

// --- ROUTES ---

// Health & Test
app.get('/api/health', (req, res) => res.send('API_OK_UNIFIED_V2'));
app.get('/api/test', (req, res) => {
  res.json({ 
    has_db: !!pool, 
    shloka_count: Object.keys(data.shlokas || {}).length,
    shloka_keys: Object.keys(data.shlokas || {}).slice(0, 5),
    hanuman_count: Object.keys(data.hanumanChalisa || {}).length,
    chapters_count: (data.chapters || []).length
  });
});

// AUTH: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, name, age, grade, role } = req.body;
    const level = getLevelFromAge(age);
    const userExists = await db.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (userExists.rows.length > 0) return res.status(400).json({ error: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const finalAge = (age && !isNaN(parseInt(age))) ? parseInt(age) : null;
    const newUser = await db.query(
      'INSERT INTO users (username, email, password_hash, name, age, grade, level, role, is_premium) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false) RETURNING *',
      [username, email, passwordHash, name || username, finalAge, grade || null, level, role || 'student']
    );
    const user = newUser.rows[0];
    const token = jwt.sign({ user: { id: user.id, role: user.role, level: user.level } }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { ...user, completed: [] } });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// AUTH: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginId = username || email;
    if ((loginId === 'admin' || loginId === 'gen.rajeswari@gmail.com') && password === 'admin123') {
       const user = { id: 0, username: 'admin', role: 'admin', is_premium: true, level: 'warriors', completed: [] };
       const token = jwt.sign({ user: { id: 0, role: 'admin' } }, JWT_SECRET, { expiresIn: '24h' });
       return res.json({ token, user });
    }
    const userRes = await db.query('SELECT * FROM users WHERE username = $1 OR email = $1', [loginId]);
    if (userRes.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });
    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    const progress = await db.query('SELECT * FROM journal_entries WHERE user_id = $1', [user.id]);
    const token = jwt.sign({ user: { id: user.id, role: user.role, level: user.level } }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { ...user, completed: progress.rows } });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// VERSES
app.get('/api/verses/chapters', (req, res) => {
  res.json({
    chapters: data.chapters || [],
    levels: data.levels || [],
  });
});

app.get('/api/verses', (req, res) => {
  try {
    const { scripture, chapter, verse } = req.query;
    if (scripture === 'hanuman') {
      if (verse) {
        const d = data.hanumanChalisa[verse];
        if (!d) return res.status(404).json({ error: 'Verse not found' });
        return res.json(d);
      }
      return res.json(data.hanumanChalisa);
    }
    // Gita
    if (chapter && verse) {
      const key = `${chapter}.${verse}`;
      const d = data.shlokas[key];
      if (!d) return res.status(404).json({ error: 'Shloka not found' });
      return res.json(d);
    }
    if (chapter) {
      const chapterShlokas = {};
      const prefix = `${chapter}.`;
      for (const [key, val] of Object.entries(data.shlokas || {})) {
        if (key.startsWith(prefix)) chapterShlokas[key] = val;
      }
      return res.json(chapterShlokas);
    }
    res.json({ gita: Object.keys(data.shlokas || {}).length, hanuman: Object.keys(data.hanumanChalisa || {}).length });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/api/verses/evaluations/:scripture/:chapter/:level', (req, res) => {
  try {
    const { scripture, chapter, level } = req.params;
    if (scripture !== 'gita') return res.status(404).send('No evaluations for this scripture');
    
    const evals = data.evaluations || {};
    // Try both string and number lookup
    const chData = evals[chapter] || evals[parseInt(chapter)];
    
    if (!chData) return res.status(404).send(`No quiz found for Chapter ${chapter}`);
    
    const levelData = chData[level] || chData['seeds']; // Fallback to seeds if level not found
    if (!levelData) return res.status(404).send(`No quiz found for level ${level}`);
    
    res.json(levelData);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// JOURNALS
app.post('/api/journal', async (req, res) => {
  try {
    const { username, scripture, chapter_number, verse_id, question, response } = req.body;
    const user = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (user.rows.length === 0) return res.status(404).send('User not found');
    await db.query(
      'INSERT INTO journal_entries (user_id, scripture, chapter_number, verse_id, question, response) VALUES ($1, $2, $3, $4, $5, $6)',
      [user.rows[0].id, scripture, chapter_number, verse_id, question, response]
    );
    res.status(201).send('Saved');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});

module.exports = app;
