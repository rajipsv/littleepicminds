const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const {
  normalizeEmail,
  normalizeUsername,
  validateUsername,
  validateEmail,
  validatePassword,
  hashPassword,
  verifyPassword,
  signAccessToken,
  verifyAccessToken,
  sanitizeUser,
  createAuthMiddleware,
  requireRole,
  parseRole,
  getJwtSecret,
} = require('../lib/auth');
const { rateLimit: authRateLimit } = require('../lib/auth-rate-limit');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { applyHfToVerse, applyHfToChapterMap } = require('../lib/gita-hf');

// --- DATABASE CONFIG ---
const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
}) : null;

const db = {
  query: (text, params) => {
    if (!pool) return Promise.reject(new Error('DATABASE_URL is not set!'));
    return pool.query(text, params);
  }
};

const JWT_SECRET = getJwtSecret();
const authRequired = createAuthMiddleware();
const adminAuth = [authRequired, requireRole('admin')];

// Helper: determine learning level from age
function getLevelFromAge(age) {
  if (!age) return 'seeds';
  if (age <= 7) return 'seeds';
  if (age <= 10) return 'seekers';
  return 'warriors';
}

async function loadUserById(userId) {
  const result = await db.query(
    `SELECT id, username, email, name, role, is_premium, level, age, grade, mobile,
            account_status, created_at, last_login_at
     FROM users WHERE id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}

async function loadUserJournalSummary(userId) {
  const progressRes = await db.query(
    'SELECT chapter_number as chapter, verse_id as shloka, question, response FROM journal_entries WHERE user_id = $1',
    [userId]
  );
  return progressRes.rows;
}

// --- DATA LOADING ---
let data = { shlokas: {}, hanumanChalisa: {}, evaluations: {}, chapters: [], levels: {} };
try {
  data = require('../lib/data');
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
router.post('/auth/register', authRateLimit({ max: 10, keyPrefix: 'register' }), async (req, res) => {
  try {
    const { username, email, password, name, age, grade, mobile } = req.body;

    const u = validateUsername(username);
    if (!u.ok) return res.status(400).json({ error: u.error });
    const e = validateEmail(email);
    if (!e.ok) return res.status(400).json({ error: e.error });
    const p = validatePassword(password);
    if (!p.ok) return res.status(400).json({ error: p.error });

    const finalAge = age && !isNaN(parseInt(age, 10)) ? parseInt(age, 10) : null;
    const level = getLevelFromAge(finalAge);
    const passwordHash = await hashPassword(password);

    const result = await db.query(
      `INSERT INTO users (username, email, password_hash, name, age, grade, level, role, is_premium, mobile, account_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'student', false, $8, 'active')
       RETURNING id, username, email, name, role, is_premium, level, age, grade, mobile, account_status`,
      [u.value, e.value, passwordHash, name || u.value, finalAge, grade || null, level, mobile || null]
    );

    const user = result.rows[0];
    const token = signAccessToken(user);
    res.status(201).json({ token, user: { ...user, completed: [] } });
  } catch (err) {
    console.error('Register error:', err.message);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Username or email already exists.' });
    }
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

router.post('/auth/login', authRateLimit({ max: 15, keyPrefix: 'login' }), async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginId = email ? normalizeEmail(email) : normalizeUsername(username);
    if (!loginId || !password) {
      return res.status(400).json({ error: 'Username or email and password are required.' });
    }

    const result = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [loginId]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const user = result.rows[0];
    if (user.account_status === 'suspended') {
      return res.status(403).json({ error: 'This account has been suspended. Contact support.' });
    }

    const isMatch = await verifyPassword(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials.' });

    await db.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    const completed = await loadUserJournalSummary(user.id);
    const token = signAccessToken(user);
    res.json({ token, user: { ...sanitizeUser(user), completed } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/auth/me', authRequired, async (req, res) => {
  try {
    const user = await loadUserById(req.auth.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.account_status === 'suspended') {
      return res.status(403).json({ error: 'Account suspended.' });
    }
    const completed = await loadUserJournalSummary(user.id);
    res.json({ ...user, completed });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/auth/change-password', authRequired, authRateLimit({ max: 8, keyPrefix: 'pwd' }), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required.' });
    }
    const np = validatePassword(newPassword, { label: 'New password' });
    if (!np.ok) return res.status(400).json({ error: np.error });
    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'New password must be different from the current password.' });
    }

    const row = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.auth.id]);
    if (row.rows.length === 0) return res.status(404).json({ error: 'User not found.' });

    const ok = await verifyPassword(currentPassword, row.rows[0].password_hash);
    if (!ok) return res.status(400).json({ error: 'Current password is incorrect.' });

    const passwordHash = await hashPassword(newPassword);
    await db.query(
      'UPDATE users SET password_hash = $1, password_changed_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, req.auth.id]
    );
    res.json({ status: 'success', message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err.message);
    res.status(500).json({ error: 'Could not update password.' });
  }
});

router.put('/auth/profile', authRequired, async (req, res) => {
  try {
    const { name, age, grade } = req.body;
    const parsedAge = age !== '' && age !== undefined && age !== null ? parseInt(age, 10) : null;
    const level = getLevelFromAge(parsedAge);

    const updatedUser = await db.query(
      `UPDATE users SET name = COALESCE($1, name), age = $2, grade = $3, level = $4
       WHERE id = $5
       RETURNING id, username, email, name, role, is_premium, age, grade, level, mobile, account_status`,
      [name || null, parsedAge, grade || null, level, req.auth.id]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/auth/upgrade', authRequired, async (req, res) => {
  try {
    await db.query('UPDATE users SET is_premium = true WHERE id = $1', [req.auth.id]);
    const user = await loadUserById(req.auth.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN
router.get('/auth/admin/users', ...adminAuth, async (req, res) => {
  try {
    const users = await db.query(
      `SELECT id, username, email, name, is_premium, role, level, age, grade, mobile,
              account_status, created_at, last_login_at
       FROM users ORDER BY id`
    );
    res.json(users.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/auth/admin/users', ...adminAuth, async (req, res) => {
  try {
    const { username, email, password, name, role, is_premium, age, grade, mobile } = req.body;
    const u = validateUsername(username);
    if (!u.ok) return res.status(400).json({ error: u.error });
    const e = validateEmail(email);
    if (!e.ok) return res.status(400).json({ error: e.error });
    const p = validatePassword(password);
    if (!p.ok) return res.status(400).json({ error: p.error });

    const finalAge = age && !isNaN(parseInt(age, 10)) ? parseInt(age, 10) : null;
    const level = getLevelFromAge(finalAge);
    const passwordHash = await hashPassword(password);
    const userRole = parseRole(role, { allowAdmin: true });

    const result = await db.query(
      `INSERT INTO users (username, email, password_hash, name, age, grade, level, role, is_premium, mobile, account_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
       RETURNING id, username, email, name, role, is_premium, level, age, grade, mobile, account_status`,
      [
        u.value,
        e.value,
        passwordHash,
        name || u.value,
        finalAge,
        grade || null,
        level,
        userRole,
        !!is_premium,
        mobile || null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Username or email already exists.' });
    }
    res.status(500).json({ error: 'Could not create user.' });
  }
});

router.post('/auth/admin/users/:id/reset-password', ...adminAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { newPassword } = req.body;
    const np = validatePassword(newPassword, { label: 'New password' });
    if (!np.ok) return res.status(400).json({ error: np.error });

    const passwordHash = await hashPassword(newPassword);
    const result = await db.query(
      'UPDATE users SET password_hash = $1, password_changed_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username',
      [passwordHash, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ status: 'success', user_id: userId });
  } catch (err) {
    res.status(500).json({ error: 'Could not reset password.' });
  }
});

router.post('/auth/admin/toggle-subscription', ...adminAuth, async (req, res) => {
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

router.post('/auth/admin/set-account-status', ...adminAuth, async (req, res) => {
  try {
    const { user_id, status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Status must be active or suspended.' });
    }
    if (user_id === req.auth.id) {
      return res.status(400).json({ error: 'You cannot change your own account status.' });
    }
    await db.query('UPDATE users SET account_status = $1 WHERE id = $2', [status, user_id]);
    res.json({ status: 'success', account_status: status });
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

// Helper: map Hanuman numeric verse index to data key
function getHanumanKey(index) {
  const v = parseInt(index);
  if (v <= 2) return `Doha ${v}`;
  if (v <= 42) return `Verse ${v - 2}`;
  return `Doha ${v - 40}`;
}

// GET /api/verses — Hanuman verse lookup
function getHanumanVerse(verseParam) {
  // Try direct key first (e.g., "Verse 1", "Doha 1")
  if (data.hanumanChalisa[verseParam]) return data.hanumanChalisa[verseParam];
  // Fall back to numeric mapping
  const key = getHanumanKey(verseParam);
  return data.hanumanChalisa[key] || null;
}

router.get('/themes/:scripture/:chapter', (req, res) => {
  try {
    const { scripture, chapter } = req.params;
    const { level } = req.query; // seeds, seekers, warriors

    // Robust chapter lookup: try direct, string, and "chapter" prefix
    const chapterId = chapter.toString();
    const chapterKey = chapterId.startsWith('chapter') ? chapterId.replace('chapter', '') : chapterId;
    
    const scriptureData = data.themes[scripture] || data.themes[scripture.toLowerCase()];
    if (!scriptureData) {
      console.log(`[DEBUG] Scripture ${scripture} not found in themes. Available:`, Object.keys(data.themes));
      return res.status(404).json({ error: `Scripture ${scripture} not found in themes` });
    }

    const chapterData = scriptureData[chapterKey] || scriptureData[`chapter${chapterKey}`] || scriptureData[chapterId];
    
    if (!chapterData) {
      console.log(`[DEBUG] No chapter data found for Ch ${chapterKey}. Available:`, Object.keys(scriptureData));
      return res.status(404).json({ error: `No themes found for chapter ${chapterKey}` });
    }
    
    let themesToReturn = [];

    // Flexible level matching
    if (!Array.isArray(chapterData)) {
      const requestedLevel = (level || 'seekers').toLowerCase();
      themesToReturn = chapterData[requestedLevel] || 
                       chapterData['seekers'] || 
                       chapterData['seeds'] || 
                       chapterData['warriors'] || 
                       [];
    } else {
      themesToReturn = chapterData;
    }
    
    // Inject actual shloka data (Sanskrit, transliteration, audio, meanings) into each theme
    const themesWithShlokas = themesToReturn.map(theme => {
      const populatedShlokas = (theme.shlokas || []).map(shlokaId => {
        const shlokaObj = data.shlokas[shlokaId];
        return shlokaObj ? { ...shlokaObj, id: shlokaId } : { error: 'Shloka data missing', id: shlokaId };
      });
      return { ...theme, shlokaData: populatedShlokas };
    });
    
    res.json(themesWithShlokas);
  } catch (err) {
    console.error('Themes API error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/verses', (req, res) => {
  try {
    const { scripture, chapter, verse } = req.query;
    if (scripture === 'hanuman') {
      if (verse) {
        const d = getHanumanVerse(verse);
        if (!d) return res.status(404).json({ error: 'Verse not found' });
        return res.json({ ...d, id: verse });
      }
      const hanumanWithIds = {};
      for (const [key, val] of Object.entries(data.hanumanChalisa || {})) {
        hanumanWithIds[key] = { ...val, id: key };
      }
      return res.json(hanumanWithIds);
    }

    if (scripture === 'ramayana') {
      return res.status(404).json({ error: 'Ramayana content coming soon' });
    }

    // Default to gita if no scripture or scripture is gita
    if (chapter && verse) {
      const key = `${chapter}.${verse}`;
      const d = data.shlokas[key];
      if (!d) return res.status(404).json({ error: 'Shloka not found' });
      return res.json(applyHfToVerse({ ...d, id: key }, key));
    }
    if (chapter) {
      const chapterShlokas = {};
      const prefix = `${chapter}.`;
      for (const [key, val] of Object.entries(data.shlokas || {})) {
        if (key.startsWith(prefix)) {
          chapterShlokas[key] = { ...val, id: key };
        }
      }
      return res.json(applyHfToChapterMap(chapterShlokas));
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
  console.log(`[DEBUG] Quiz Request: ${req.params.scripture}/${req.params.chapter}/${req.params.verse}`);
  try {
    const { scripture, chapter, verse } = req.params;
    const level = req.query.level || 'seeds';
    console.log(`[DEBUG] Level: ${level}`);

    // Helper to generate questions for a single shloka
    const generateShlokaQuestions = (shloka, ch, v) => {
      if (!shloka) return [];
      
      // Use existing exercises if available
      if (shloka.exercises && shloka.exercises[level]) {
        const ex = shloka.exercises[level];
        return [{ question: ex.question, options: ex.options, correct: ex.correct }];
      }

      const meaning = shloka.en?.meaning || '';
      const childMeaning = shloka.en?.childMeaning || '';
      const activity = shloka.en?.activity || '';

      return [
        {
          question: `What is the main teaching of Shloka ${ch}.${v}?`,
          options: [
            childMeaning.substring(0, 80) + (childMeaning.length > 80 ? '...' : ''),
            'Only the strong should fight',
            'Wealth brings happiness'
          ],
          correct: 0
        },
        {
          question: activity ? `The activity for this shloka (${ch}.${v}) suggests:` : `What lesson does Shloka ${ch}.${v} teach?`,
          options: activity ? [
            activity.substring(0, 80) + (activity.length > 80 ? '...' : ''),
            'Always expect something in return',
            'Only do things for praise'
          ] : [
            meaning.substring(0, 80) + (meaning.length > 80 ? '...' : ''),
            'Avoid doing good deeds',
            'Compete to defeat others'
          ],
          correct: 0
        }
      ];
    };

    // Case 1: Theme-based Quiz (Aggregated)
    if (typeof verse === 'string' && verse.startsWith('theme_')) {
      console.log(`[DEBUG] Processing Theme Quiz: ${verse}`);
      const chThemes = data.themes?.gita?.[chapter]?.[level] || [];
      const theme = chThemes.find(t => t.id === verse);
      
      if (!theme) return res.status(404).json({ error: 'Theme not found' });
      
      let themeQuestions = [];
      if (theme.shlokas && Array.isArray(theme.shlokas)) {
        theme.shlokas.forEach(shlokaId => {
          const shloka = data.shlokas[shlokaId];
          const parts = shlokaId.split('.');
          const vNum = parts[parts.length - 1];
          const qList = generateShlokaQuestions(shloka, chapter, vNum);
          themeQuestions = [...themeQuestions, ...qList];
        });
      }
      
      if (themeQuestions.length === 0) return res.status(404).json({ error: 'No questions found for this theme' });
      return res.json(themeQuestions);
    }

    // Case 2: Single Shloka Quiz
    let shloka = null;
    if (scripture === 'gita') {
      const key = `${chapter}.${verse}`;
      shloka = data.shlokas[key];
    } else if (scripture === 'hanuman') {
      shloka = getHanumanVerse(verse);
    }

    if (!shloka) return res.status(404).json({ error: 'Shloka not found' });
    const questions = generateShlokaQuestions(shloka, chapter, verse);
    res.json(questions);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// JOURNALS & PROGRESS
router.get('/journal/:username', authRequired, async (req, res) => {
  try {
    const { username } = req.params;
    const userResult = await db.query('SELECT id, username FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const target = userResult.rows[0];
    if (req.auth.role !== 'admin' && req.auth.id !== target.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    const result = await db.query(
      'SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY completed_at DESC',
      [target.id]
    );
    res.json(result.rows);
  } catch (err) {
    if (err.message.includes('DATABASE_URL')) return res.json([]);
    res.status(500).json({ error: err.message });
  }
});


router.post('/journal', async (req, res) => {
  try {
    const { scripture, chapter_number, verse_id, question, response } = req.body;
    
    // Extract userId from token
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized: No token provided' });
    
    let decoded;
    try {
      const token = authHeader.split(' ')[1];
      decoded = verifyAccessToken(token);
    } catch (e) {
      return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
    }
    
    const userId = decoded.user.id;
    
    console.log(`Saving journal for User ${userId}: Ch ${chapter_number}, Verse ${verse_id}`);

    const isHanuman = scripture === 'hanuman';
    const chNum = parseInt(chapter_number) || (isHanuman ? 1 : 1);
    let shlokaNum = parseInt(verse_id);
    
    // Handle Hanuman verse IDs (Doha1, Verse1, etc.)
    if (isHanuman && typeof verse_id === 'string') {
      const matches = verse_id.match(/\d+/g);
      if (matches && matches.length > 0) {
        shlokaNum = parseInt(matches[matches.length - 1]);
      }
    } else
    // Improved parsing for theme IDs (e.g., "theme_1_5" -> 5, "theme_1_5_seeds" -> 5)
    if (isNaN(shlokaNum) && typeof verse_id === 'string') {
      const matches = verse_id.match(/\d+/g);
      if (matches && matches.length > 0) {
        shlokaNum = parseInt(matches[matches.length - 1]);
      }
    } else if (typeof verse_id === 'string' && verse_id.includes('.')) {
      // Handle "1.1", "1.2" style
      const parts = verse_id.split('.');
      shlokaNum = parseInt(parts[parts.length - 1]);
    }

    // 1. Save to Journal Table
    try {
      await db.query(
        'INSERT INTO journal_entries (user_id, scripture, chapter_number, verse_id, question, response) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, scripture, chNum, verse_id, question, response]
      );
    } catch (e) {
      console.error('Journal table fail:', e.message);
      if (e.message.includes('DATABASE_URL')) {
        console.warn('DB not configured, skipping journal save');
        return res.status(201).json({ status: 'saved_offline', warning: 'DB not configured' });
      }
      throw e;
    }

    // 2. Save to Progress Table - only for valid numeric verses
    if (verse_id && !isNaN(shlokaNum) && typeof shlokaNum === 'number') {
      try {
        const existing = await db.query(
          'SELECT id FROM progress WHERE user_id = $1 AND scripture = $2 AND chapter = $3 AND shloka = $4',
          [userId, scripture || 'gita', chNum, shlokaNum]
        );
        
        if (existing.rows.length === 0) {
          await db.query(
            'INSERT INTO progress (user_id, scripture, chapter, shloka, activity_question, activity_response) VALUES ($1, $2, $3, $4, $5, $6)',
            [userId, scripture || 'gita', chNum, shlokaNum, question, response]
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
    }

    res.status(201).json({ status: 'saved' });
  } catch (err) {
    console.error('Final Journal error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/evaluations/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { level } = req.query; // seeds, seekers, or warriors

    const quizResult = await db.query('SELECT scripture, chapter_id, best_score, attempts FROM evaluations WHERE user_id = $1', [userId]);
    const verseResult = await db.query('SELECT scripture, chapter, COUNT(DISTINCT shloka) as completed_count FROM progress WHERE user_id = $1 GROUP BY scripture, chapter', [userId]);
    const themeResult = await db.query("SELECT DISTINCT verse FROM quiz_results WHERE user_id = $1 AND verse LIKE '%theme%'", [userId]);

    // Build theme lookup set
    const completedThemes = new Set(themeResult.rows.map(r => r.verse));

    // Compute total themes and unique shlokas per chapter for the requested level
    const effectiveLevel = level || 'seekers';
    const themeCounts = {};
    const themeVerseCounts = {};
    if (data.themes && data.themes.gita) {
      Object.keys(data.themes.gita).forEach(ch => {
        const chapterData = data.themes.gita[ch];
        const levelThemes = chapterData[effectiveLevel];
        if (Array.isArray(levelThemes)) {
          themeCounts[ch] = levelThemes.length;
          // Count unique shlokas across all themes in this chapter
          const uniqueShlokas = new Set();
          levelThemes.forEach(theme => {
            (theme.shlokas || []).forEach(s => uniqueShlokas.add(s));
          });
          themeVerseCounts[ch] = uniqueShlokas.size;
        }
      });
    }

    // Gita Progress
    const gitaProgress = (data.chapters || []).map(ch => {
      const chKey = String(ch.id);
      const q = quizResult.rows.find(r => r.scripture === 'gita' && r.chapter_id == ch.id);
      const v = verseResult.rows.find(r => r.scripture === 'gita' && r.chapter == ch.id);
      return {
        chapter_number: ch.id,
        total_verses: ch.count,
        total_theme_verses: themeVerseCounts[chKey] || 0,
        verses_completed: v ? parseInt(v.completed_count) : 0,
        best_score: q ? q.best_score : 0,
        total_themes: themeCounts[chKey] || 0,
        themes_completed: 0
      };
    });

    // Count themes completed per chapter by matching ID patterns
    for (const ch of gitaProgress) {
      const chStr = String(ch.chapter_number);
      // Seeds: theme_sd{chapter}_* (legacy theme_s*), Seekers: theme_sk*, Warriors: theme_w*
      const prefixes = [`theme_sd${chStr}_`, `theme_s${chStr}_`, `theme_sk${chStr}_`, `theme_w${chStr}_`];
      for (const themeId of completedThemes) {
        if (prefixes.some(p => themeId.startsWith(p))) {
          ch.themes_completed = (ch.themes_completed || 0) + 1;
        }
      }
    }

    // Hanuman Progress
    const hResult = verseResult.rows.find(r => r.scripture === 'hanuman');
    const hanumanProgress = {
      verses_completed: hResult ? parseInt(hResult.completed_count) : 0,
      total_verses: 44,
      is_mastered: hResult && parseInt(hResult.completed_count) >= 44
    };

    res.json({ gita: gitaProgress, hanuman: hanumanProgress });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// --- Line meaning Telugu (cache-first; batch via npm run gita:translate-lines) ---
const { translateLineMeaning } = require('../lib/translate/line-meaning');

router.post('/translate-meaning', async (req, res) => {
  try {
    const { text } = req.body;
    const { te, source } = await translateLineMeaning(text);
    res.json({ te, source });
  } catch (err) {
    console.error('[Translate meaning]:', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Failed to translate' });
  }
});

// --- TTS (Voice Generation) — google default, sarvam fallback; cache in lib/data/audio_cache ---
const { synthesizeSpeech, synthesizeSpeechLines } = require('../lib/tts');

router.post('/tts', async (req, res) => {
  try {
    const { text, target_language_code } = req.body;
    const result = await synthesizeSpeech({ text, targetLanguageCode: target_language_code });
    res.json(result);
  } catch (err) {
    console.error('[TTS Error]:', err.message);
    const useBrowser = err.useBrowser !== false;
    const status = useBrowser ? 503 : err.status || 500;
    res.status(status).json({
      error: err.message || 'Failed to generate speech',
      useBrowser,
    });
  }
});

const { registerGitaAudioRoutes } = require('../lib/gita-audio');
const gitaAudioRouter = express.Router();
registerGitaAudioRoutes(gitaAudioRouter);
router.use('/gita-audio', gitaAudioRouter);

router.post('/tts/lines', async (req, res) => {
  try {
    const { lines, target_language_code } = req.body;
    const result = await synthesizeSpeechLines({
      lines,
      targetLanguageCode: target_language_code,
    });
    res.json(result);
  } catch (err) {
    console.error('[TTS lines Error]:', err.message);
    const useBrowser = err.useBrowser !== false;
    const status = useBrowser ? 503 : err.status || 500;
    res.status(status).json({
      error: err.message || 'Failed to generate speech',
      useBrowser,
    });
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
    let { scripture, chapter_number, score, verse, quiz_details } = req.body;
    
    // Handle Hanuman - treat as unique scripture (no chapter-based scoring in evaluations)
    const isHanuman = scripture === 'hanuman';
    const effectiveChNum = isHanuman ? null : parseInt(chapter_number);
    
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.user.id;

    // 1. Save quiz score to evaluations table (only for Gita chapters) — upsert to handle theme re-quizzes
    if (!isHanuman && effectiveChNum) {
      await db.query(
        `INSERT INTO evaluations (user_id, scripture, chapter_id, score, best_score, attempts)
         VALUES ($1, $2, $3, $4, $5, 1)
         ON CONFLICT (user_id, chapter_id)
         DO UPDATE SET scripture = $2, score = $4, best_score = GREATEST(evaluations.best_score, $5), attempts = evaluations.attempts + 1, completed_at = CURRENT_TIMESTAMP`,
        [userId, scripture || 'gita', effectiveChNum, score, score]
      );
    }

    // 2. Save to progress table (so verses count toward mastery + leaderboard)
    let shlokaNum = parseInt(verse);
    if (isNaN(shlokaNum) && typeof verse === 'string' && verse.includes('theme')) {
      const matches = verse.match(/\d+/g);
      if (matches && matches.length > 1) {
        shlokaNum = parseInt(matches[matches.length - 1]);
      }
    }
    if (verse && !isNaN(shlokaNum)) {
      const chNum = isHanuman ? 1 : (parseInt(chapter_number) || 1);
      const existingProgress = await db.query(
        'SELECT id FROM progress WHERE user_id = $1 AND scripture = $2 AND chapter = $3 AND shloka = $4',
        [userId, scripture || 'gita', chNum, shlokaNum]
      );
      if (existingProgress.rows.length === 0) {
        await db.query(
          'INSERT INTO progress (user_id, scripture, chapter, shloka, completed_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
          [userId, scripture || 'gita', chNum, shlokaNum]
        );
      }
    }

    // 3. Save individual Q&A to quiz_results table
    if (quiz_details && Array.isArray(quiz_details)) {
      await db.query(
        'INSERT INTO quiz_results (user_id, scripture, chapter, verse, score, questions, completed_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)',
        [userId, scripture || 'gita', chapter_number, verse, score, JSON.stringify(quiz_details)]
      ).catch(e => console.error('quiz_results insert skipped:', e.message));
    }

    res.status(200).json({ status: 'saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quiz-history/:userId — Get all quiz attempts for a user
router.get('/quiz-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await db.query(
      'SELECT * FROM quiz_results WHERE user_id = $1 ORDER BY completed_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/evaluations/hanuman-overall/:userId — Calculate overall Hanuman Chalisa score
router.get('/evaluations/hanuman-overall/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let quizResultRows = [];
    try {
      const quizResult = await db.query(
        'SELECT * FROM quiz_results WHERE user_id = $1 ORDER BY verse',
        [userId]
      );
      quizResultRows = quizResult.rows;
    } catch (e) {
      console.warn('DB Query failed for hanuman-overall (fallback to empty):', e.message);
    }

    // Group by verse and keep only the highest score per verse
    // Only count if scripture is 'hanuman' (if column exists)
    const verseScores = {};
    quizResultRows.forEach(r => {
      if (r.scripture && r.scripture !== 'hanuman') return; 
      
      const key = r.verse;
      if (!verseScores[key] || r.score > verseScores[key]) {
        verseScores[key] = r.score;
      }
    });

    const scores = Object.values(verseScores);
    const totalVerses = scores.length;
    const totalScore = scores.reduce((sum, s) => sum + parseFloat(s), 0);
    const averageScore = totalVerses > 0 ? Math.round(totalScore / totalVerses) : 0;
    const bestScore = totalVerses > 0 ? Math.max(...scores) : 0;
    const worstScore = totalVerses > 0 ? Math.min(...scores) : 0;

    res.json({
      total_verses_attempted: totalVerses,
      total_verses_available: 44,
      average_score: averageScore,
      best_score: bestScore,
      worst_score: worstScore,
      verse_scores: verseScores
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AI Chat (Gemini) ---
router.post('/chat', async (req, res) => {
  try {
    const { message, scripture } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(501).json({ error: 'AI Guru is currently resting. Please add GEMINI_API_KEY to enable real AI responses!' });
    }

    const systemPrompt = scripture === 'hanuman' 
      ? "You are a wise and friendly Guru named Sri Hanuman Guru. You are teaching a child about the Hanuman Chalisa. Your goal is to explain the wisdom, courage, and devotion of Lord Hanuman in a simple, inspiring, and child-friendly way. If the question is NOT related to Hanuman, Rama, or the Hanuman Chalisa, gently remind the child to focus on the current lesson. Answer in the language of the question (English or Telugu)."
      : "You are a wise and friendly Guru named Sri Krishna. You are teaching a child about the Bhagavad Gita. Your goal is to explain the wisdom of Krishna in a simple, inspiring, and child-friendly way. If the question is NOT related to Krishna, Arjuna, or the Bhagavad Gita, gently remind the child to focus on the current lesson. Answer in the language of the question (English or Telugu).";

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\nChild: ${message}` }]
          }
        ]
      }
    );

    const aiText = response.data.candidates[0].content.parts[0].text;
    res.json({ response: aiText });
  } catch (err) {
    console.error('[AI Chat Error]:', err.message);
    res.status(500).json({ error: 'Failed to reach the AI Guru' });
  }
});

// --- Self-Learning Chat Logic ---
router.post('/chat/missed', async (req, res) => {
  try {
    const { question, scripture } = req.body;
    await db.query(
      'INSERT INTO missed_questions (question, scripture) VALUES ($1, $2) ON CONFLICT (question) DO UPDATE SET ask_count = missed_questions.ask_count + 1',
      [question, scripture]
    );
    res.json({ status: 'logged' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/chat/wisdom', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM dynamic_wisdom');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/chat/wisdom', ...adminAuth, async (req, res) => {
  try {
    const { keywords, answer_en, answer_te, scripture } = req.body;
    await db.query(
      'INSERT INTO dynamic_wisdom (keywords, answer_en, answer_te, scripture) VALUES ($1, $2, $3, $4)',
      [keywords, answer_en, answer_te, scripture]
    );
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Database Bootstrap (Self-Healing) ---
async function bootstrapDB() {
  try {
    await db.query(`
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
        scripture VARCHAR DEFAULT 'gita',
        chapter INTEGER,
        shloka INTEGER,
        activity_question TEXT,
        activity_response TEXT,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS evaluations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        scripture VARCHAR DEFAULT 'gita',
        chapter_id INTEGER,
        score DECIMAL,
        best_score DECIMAL,
        attempts INTEGER DEFAULT 1,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS missed_questions (
        id SERIAL PRIMARY KEY,
        question TEXT UNIQUE,
        scripture VARCHAR,
        ask_count INTEGER DEFAULT 1,
        is_resolved BOOLEAN DEFAULT FALSE,
        first_asked TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS dynamic_wisdom (
        id SERIAL PRIMARY KEY,
        keywords TEXT[],
        answer_en TEXT,
        answer_te TEXT,
        scripture VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS quiz_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        scripture VARCHAR DEFAULT 'gita',
        chapter INTEGER,
        verse VARCHAR,
        score DECIMAL,
        questions JSONB,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active'`).catch(() => {});
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE`).catch(() => {});
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE`).catch(() => {});

    // Migration: Add scripture column if missing
    await db.query(`ALTER TABLE progress ADD COLUMN IF NOT EXISTS scripture VARCHAR DEFAULT 'gita'`).catch(() => {});
    await db.query(`ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS scripture VARCHAR DEFAULT 'gita'`).catch(() => {});
    
    // Add constraint if missing
    await db.query(`ALTER TABLE progress DROP CONSTRAINT IF EXISTS unique_user_shloka`).catch(() => {});
    await db.query(`ALTER TABLE progress ADD CONSTRAINT unique_user_scripture_shloka UNIQUE (user_id, scripture, chapter, shloka)`).catch(e => {});
    console.log('--- DB Tables Verified ---');
  } catch (e) {
    console.error('--- DB Bootstrap Error ---', e.message);
  }
}

// Run bootstrap immediately
bootstrapDB();

router.get('/test', async (req, res) => {
  try {
    let dbStatus = false;
    try {
      const result = await db.query('SELECT NOW()');
      dbStatus = !!result.rows;
    } catch (e) { console.error('Test DB Error:', e.message); }

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
      status: 'API is running',
      database_connected: dbStatus,
      diagnostics: {
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
