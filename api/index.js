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

// Helper: determine learning level from age
function getLevelFromAge(age) {
  if (!age) return 'seeds';
  if (age <= 7) return 'seeds';
  if (age <= 10) return 'seekers';
  return 'warriors';
}

// Admin Middleware
const adminAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

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
    const { username, email, password, name, age, grade, role, mobile } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    
    const level = getLevelFromAge(age);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const finalAge = (age && !isNaN(parseInt(age))) ? parseInt(age) : null;

    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, name, age, grade, level, role, is_premium, mobile) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, $9) RETURNING id, username, email, name, role, is_premium, level, age, grade, mobile',
      [username, email, passwordHash, name || username, finalAge, grade || null, level, role || 'student', mobile || null]
    );
    
    const user = result.rows[0];
    const payload = { user: { id: user.id, role: user.role, is_premium: user.is_premium, level: user.level } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({ 
      token, 
      user: { ...user, completed: [] } 
    });
  } catch (err) {
    console.error('Register error:', err.message);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Username or email already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginId = username || email;

    // Hardcoded admin fallback
    if ((loginId === 'gen.rajeswari@gmail.com' || loginId === 'admin') && password === 'admin123') {
      const adminUser = {
        id: 0, username: 'admin', email: 'gen.rajeswari@gmail.com',
        name: 'Hub Admin', role: 'admin', is_premium: true,
        level: 'warriors', age: 30, grade: 'N/A', completed: []
      };
      const payload = { user: { id: 0, role: 'admin', is_premium: true, level: 'warriors' } };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ token, user: adminUser });
    }

    const result = await db.query('SELECT * FROM users WHERE username = $1 OR email = $1', [loginId]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });
    
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Fetch progress
    const progressRes = await db.query(
      'SELECT chapter_number as chapter, verse_id as shloka, question, response FROM journal_entries WHERE user_id = $1',
      [user.id]
    );

    const payload = { user: { id: user.id, role: user.role, is_premium: user.is_premium, level: user.level } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    
    const { password_hash: _, ...userWithoutPassword } = user;
    res.json({ 
      token, 
      user: { ...userWithoutPassword, completed: progressRes.rows } 
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN
router.get('/auth/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await db.query(
      'SELECT id, username, email, name, is_premium, role, level, age, grade, mobile FROM users ORDER BY id'
    );
    res.json(users.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/auth/admin/toggle-subscription', adminAuth, async (req, res) => {
  try {
    const { user_id } = req.body;
    const user = await db.query('SELECT id, is_premium FROM users WHERE id = $1', [user_id]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const newStatus = !user.rows[0].is_premium;
    await db.query('UPDATE users SET is_premium = $1 WHERE id = $2', [newStatus, user_id]);
    res.json({ status: 'success', is_premium: newStatus });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
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

// GET /api/verses/quiz/:scripture/:chapter/:verse — Generate quiz from shloka content
router.get('/verses/quiz/:scripture/:chapter/:verse', (req, res) => {
  try {
    const { scripture, chapter, verse } = req.params;
    const level = req.query.level || 'seeds';

    let shloka = null;
    if (scripture === 'gita') {
      const key = `${chapter}.${verse}`;
      shloka = data.shlokas[key];
    } else if (scripture === 'hanuman') {
      shloka = data.hanumanChalisa[verse];
    }

    if (!shloka) return res.status(404).json({ error: 'Shloka not found' });

    // Use existing exercises if available
    if (shloka.exercises && shloka.exercises[level]) {
      const ex = shloka.exercises[level];
      return res.json([{ question: ex.question, options: ex.options, correct: ex.correct }]);
    }

    // Auto-generate 3 MCQ questions from shloka meaning
    const meaning = shloka.en?.meaning || '';
    const childMeaning = shloka.en?.childMeaning || '';
    const activity = shloka.en?.activity || '';

    const questions = [
      {
        question: `What is the main teaching of Shloka ${chapter}.${verse}?`,
        options: [
          childMeaning.substring(0, 60) + (childMeaning.length > 60 ? '...' : ''),
          'Only the strong should fight',
          'Wealth brings happiness'
        ],
        correct: 0
      },
      {
        question: `In Shloka ${chapter}.${verse}, what does Krishna want us to focus on?`,
        options: [
          'Getting rewards and prizes',
          'Doing our duty with full effort',
          'Avoiding all responsibilities'
        ],
        correct: 1
      },
      {
        question: activity ? `The activity for this shloka suggests:` : `What lesson does this shloka teach?`,
        options: activity ? [
          activity.substring(0, 60) + (activity.length > 60 ? '...' : ''),
          'Always expect something in return',
          'Only do things for praise'
        ] : [
          meaning.substring(0, 60) + (meaning.length > 60 ? '...' : ''),
          'Avoid doing good deeds',
          'Compete to defeat others'
        ],
        correct: 0
      }
    ];

    res.json(questions);
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

// GET /api/leaderboard — Rank all users by total shlokas completed
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.username, u.name, u.level,
        COUNT(DISTINCT CONCAT(p.chapter, '-', p.shloka)) as total_completed
      FROM users u
      LEFT JOIN progress p ON p.user_id = u.id
      WHERE u.role = 'student'
      GROUP BY u.id, u.username, u.name, u.level
      ORDER BY total_completed DESC
    `);
    const leaderboard = result.rows.map((row, idx) => ({
      rank: idx + 1,
      id: row.id,
      username: row.username,
      name: row.name,
      level: row.level,
      total_completed: parseInt(row.total_completed)
    }));
    res.json({ leaderboard, total_users: leaderboard.length });
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
