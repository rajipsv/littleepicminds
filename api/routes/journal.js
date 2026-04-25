const express = require('express');
const db = require('../db');

const router = express.Router();

// Mock in-memory storage for when DB is not configured
let mockJournal = [];

// GET /api/journal/:username — Get all journal entries for a user
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    if (!process.env.DATABASE_URL) {
      return res.json(mockJournal.filter(entry => entry.username === username));
    }

    const result = await db.query(
      `SELECT j.*, u.username FROM journal_entries j 
       JOIN users u ON j.user_id = u.id 
       WHERE u.username = $1 
       ORDER BY completed_at DESC`,
      [username]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Journal fetch error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/journal/progress/:userId — Get completed shlokas for progress sync
router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!process.env.DATABASE_URL) {
      return res.json({ completed: mockJournal.filter(e => e.user_id == userId) });
    }

    const result = await db.query(
      'SELECT chapter_number as chapter, verse_id as shloka, question, response FROM journal_entries WHERE user_id = $1 ORDER BY completed_at DESC',
      [userId]
    );

    res.json({ completed: result.rows });
  } catch (err) {
    console.error('Progress fetch error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/journal — Save a completed activity with question + response
router.post('/', async (req, res) => {
  try {
    const { user_id, username, scripture, chapter_number, verse_id, question, response, notes } = req.body;

    if (!process.env.DATABASE_URL) {
      const newEntry = {
        id: Date.now(),
        user_id,
        username,
        scripture: scripture || 'gita',
        chapter_number,
        verse_id,
        question: question || '',
        response: response || '',
        notes: notes || '',
        completed_at: new Date().toISOString(),
      };
      mockJournal.unshift(newEntry);
      return res.status(201).json(newEntry);
    }

    // Get user id from username if not provided
    let userId = user_id;
    if (!userId && username) {
      const userRes = await db.query('SELECT id FROM users WHERE username = $1', [username]);
      if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      userId = userRes.rows[0].id;
    }

    // Check if already exists (avoid duplicates)
    const existing = await db.query(
      'SELECT id FROM journal_entries WHERE user_id = $1 AND chapter_number = $2 AND verse_id = $3',
      [userId, chapter_number, verse_id]
    );

    if (existing.rows.length > 0) {
      // Update existing entry
      const result = await db.query(
        'UPDATE journal_entries SET question = $1, response = $2, notes = $3, completed_at = CURRENT_TIMESTAMP WHERE user_id = $4 AND chapter_number = $5 AND verse_id = $6 RETURNING *',
        [question || '', response || '', notes || '', userId, chapter_number, verse_id]
      );
      return res.json({ status: 'updated', ...result.rows[0] });
    }

    const newEntry = await db.query(
      'INSERT INTO journal_entries (user_id, scripture, chapter_number, verse_id, question, response, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, scripture || 'gita', chapter_number, verse_id, question || '', response || '', notes || '']
    );

    res.status(201).json(newEntry.rows[0]);
  } catch (err) {
    console.error('Journal save error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
