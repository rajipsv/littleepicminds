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
let data = { shlokas: {}, hanumanChalisa: {}, evaluations: {}, chapters: [], levels: {} };
try {
  data = require('./data');
} catch (e) {
  console.warn('Could not load static data:', e.message);
}

const app = express();
app.use(cors());
app.use(express.json());

// --- ROUTER SETUP ---
// We use a router to handle both /api/* and /* paths for Vercel compatibility
const router = express.Router();

// AUTH
router.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password, age, grade } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, age, grade, name, level, role, is_premium) VALUES ($1, $2, $3, $4, $5, $1, $6, $7, false) RETURNING id, username, email, name, role, is_premium, level, age, grade',
      [username, email, hashedPassword, age, grade, 'seeds', 'student']
    );
    const user = result.rows[0];
    const token = jwt.sign({ user: { id: user.id, username: user.username } }, JWT_SECRET);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await db.query('SELECT * FROM users WHERE username = $1 OR email = $1', [username]);
    if (result.rows.length === 0) return res.status(400).send('Invalid credentials');
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).send('Invalid credentials');
    const token = jwt.sign({ user: { id: user.id, username: user.username, role: user.role, is_premium: user.is_premium, level: user.level } }, JWT_SECRET);
    const { password_hash: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// VERSES & CHAPTERS
router.get('/verses/chapters', (req, res) => {
  res.json({
    chapters: data.chapters || [],
    levels: data.levels || {},
  });
});

router.get('/verses', (req, res) => {
  try {
    const { scripture, chapter, verse } = req.query;
    if (scripture === 'hanuman') {
      if (verse) {
        const d = data.hanumanChalisa[verse];
        if (!d) return res.status(404).json({ error: 'Verse not found' });
        return res.json({ ...d, id: verse });
      }
      const hanumanWithIds = {};
      for (const [key, val] of Object.entries(data.hanumanChalisa || {})) {
        hanumanWithIds[key] = { ...val, id: key };
      }
      return res.json(hanumanWithIds);
    }
    if (chapter && verse) {
      const key = `${chapter}.${verse}`;
      const d = data.shlokas[key];
      if (!d) return res.status(404).json({ error: 'Shloka not found' });
      return res.json({ ...d, id: key });
    }
    if (chapter) {
      const chapterShlokas = {};
      const prefix = `${chapter}.`;
      for (const [key, val] of Object.entries(data.shlokas || {})) {
        if (key.startsWith(prefix)) {
          chapterShlokas[key] = { ...val, id: key };
        }
      }
      return res.json(chapterShlokas);
    }
    res.json({ gita: Object.keys(data.shlokas || {}).length, hanuman: Object.keys(data.hanumanChalisa || {}).length });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/verses/evaluations/:scripture/:chapter/:level', (req, res) => {
  try {
    const { scripture, chapter, level } = req.params;
    let evals = data.evaluations || {};
    
    if (scripture === 'hanuman') {
      const hData = evals['hanuman'] || evals['1'];
      const levelData = hData ? (hData[level] || hData['seeds']) : null;
      if (!levelData) return res.status(404).send('Hanuman evaluation not found');
      return res.json(levelData);
    }

    const chData = evals[chapter] || evals[parseInt(chapter)];
    if (!chData) return res.status(404).send(`No quiz found for Chapter ${chapter}`);
    
    const levelData = chData[level] || chData['seeds'];
    if (!levelData) return res.status(404).send(`No quiz found for level ${level}`);
    
    res.json(levelData);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Fallback for direct shloka or chapter evaluations
router.get('/verses/evaluations/:id', (req, res) => {
  try {
    const { id } = req.params;
    let chapter = id;
    if (id.includes('.')) {
      chapter = id.split('.')[0];
    }
    
    let evals = data.evaluations || {};
    const chData = evals[chapter] || evals[parseInt(chapter)];
    if (!chData) return res.status(404).send(`No quiz found for ${id}`);
    
    // Default to seeds if level not specified
    const levelData = chData['seeds'] || Object.values(chData)[0];
    res.json(levelData);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// JOURNALS & PROGRESS
router.get('/journal/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const userResult = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) return res.status(404).send('User not found');
    const result = await db.query(
      'SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY completed_at DESC',
      [userResult.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/journal', async (req, res) => {
  try {
    const { scripture, chapter_number, verse_id, question, response } = req.body;
    
    // Extract userId from token
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send('Unauthorized');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.user.id;
    
    console.log(`Saving journal for User ${userId}: Ch ${chapter_number}, Verse ${verse_id}`);

    const chNum = parseInt(chapter_number);
    let shlokaNum = parseInt(verse_id);
    if (typeof verse_id === 'string' && verse_id.includes('.')) {
      const parts = verse_id.split('.');
      shlokaNum = parseInt(parts[parts.length - 1]);
    }

    // 1. Save to Journal Table
    await db.query(
      'INSERT INTO journal_entries (user_id, scripture, chapter_number, verse_id, question, response) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, scripture, chNum, verse_id, question, response]
    ).catch(e => console.error('Journal table fail:', e.message));

    // 2. Save to Progress Table (Self-healing upsert)
    try {
      const existing = await db.query(
        'SELECT id FROM progress WHERE user_id = $1 AND chapter = $2 AND shloka = $3',
        [userId, chNum, shlokaNum]
      );
      
      if (existing.rows.length === 0) {
        await db.query(
          'INSERT INTO progress (user_id, chapter, shloka, activity_question, activity_response) VALUES ($1, $2, $3, $4, $5)',
          [userId, chNum, shlokaNum, question, response]
        );
      } else {
        await db.query(
          'UPDATE progress SET activity_question = $1, activity_response = $2, completed_at = CURRENT_TIMESTAMP WHERE id = $3',
          [question, response, existing.rows[0].id]
        );
      }
    } catch (e) {
      console.error('Progress table fail:', e.message);
    }

    res.status(201).send('Saved');
  } catch (err) {
    console.error('Final Journal error:', err.message);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

router.get('/evaluations/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const quizResult = await db.query('SELECT chapter_id, best_score, attempts FROM evaluations WHERE user_id = $1', [userId]);
    const verseResult = await db.query('SELECT chapter, COUNT(DISTINCT shloka) as completed_count FROM progress WHERE user_id = $1 GROUP BY chapter', [userId]);

    const progress = (data.chapters || []).map(ch => {
      const q = quizResult.rows.find(r => r.chapter_id == ch.id);
      const v = verseResult.rows.find(r => r.chapter == ch.id);
      return {
        chapter_number: ch.id,
        total_verses: ch.count,
        verses_completed: v ? parseInt(v.completed_count) : 0,
        best_score: q ? q.best_score : 0,
        attempts: q ? q.attempts : 0
      };
    });
    res.json({ progress });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/evaluations', async (req, res) => {
  try {
    const { chapter_number, score } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send('Unauthorized');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.user.id;

    const existing = await db.query('SELECT * FROM evaluations WHERE user_id = $1 AND chapter_id = $2', [userId, chapter_number]);
    if (existing.rows.length > 0) {
      const current = existing.rows[0];
      const newBest = Math.max(parseFloat(current.best_score), score);
      await db.query(
        'UPDATE evaluations SET score = $1, best_score = $2, attempts = attempts + 1, completed_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND chapter_id = $4',
        [score, newBest, userId, chapter_number]
      );
    } else {
      await db.query(
        'INSERT INTO evaluations (user_id, chapter_id, score, best_score, attempts) VALUES ($1, $2, $3, $3, 1)',
        [userId, chapter_number, score]
      );
    }
    res.status(200).send('Score saved');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/test', async (req, res) => {
  try {
    let dbStatus = false;
    let tablesReady = false;
    
    try {
      const result = await db.query('SELECT 1');
      dbStatus = !!result;

      // BOOTSTRAP TABLES (Self-healing)
      await db.query(`
        CREATE TABLE IF NOT EXISTS journal_entries (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          scripture VARCHAR,
          chapter_number INTEGER,
          verse_id VARCHAR,
          question TEXT,
          response TEXT,
          completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS progress (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          chapter INTEGER,
          shloka INTEGER,
          activity_question TEXT,
          activity_response TEXT,
          completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      // Add constraint if missing
      await db.query(`ALTER TABLE progress ADD CONSTRAINT unique_user_shloka UNIQUE (user_id, chapter, shloka)`).catch(e => {});
      
      await db.query(`
        CREATE TABLE IF NOT EXISTS evaluations (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          chapter_id INTEGER,
          score DECIMAL,
          best_score DECIMAL,
          attempts INTEGER DEFAULT 1,
          completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      tablesReady = true;
    } catch (e) { console.error('DB Bootstrap Error:', e.message); }

    // Diagnostics
    let sampleProgress = [];
    let sampleJournals = [];
    try {
      const pRes = await db.query('SELECT * FROM progress LIMIT 3');
      sampleProgress = pRes.rows;
      const jRes = await db.query('SELECT * FROM journal_entries LIMIT 3');
      sampleJournals = jRes.rows;
    } catch(e) {}

    res.json({
      has_db: dbStatus,
      tables_ready: tablesReady,
      shloka_count: Object.keys(data.shlokas || {}).length,
      chapters_count: (data.chapters || []).length,
      evaluations_count: Object.keys(data.evaluations || {}).length,
      db_diagnostics: {
        progress_entries: sampleProgress,
        journal_entries: sampleJournals
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MOUNT ROUTER
app.use('/api', router);
app.use('/', router); // Also handle root for direct function calls

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});

module.exports = app;
