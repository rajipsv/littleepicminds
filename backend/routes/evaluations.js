const express = require('express');
const db = require('../db');

const router = express.Router();

// In-memory fallback when no DB configured
let mockEvaluations = [];

// POST /api/evaluations — Save quiz score + progress + Q&A details (main endpoint)
router.post('/', async (req, res) => {
  try {
    const { scripture, chapter_number, score, verse, quiz_details } = req.body;

    if (!process.env.DATABASE_URL) {
      const entry = { id: Date.now(), scripture, chapter_id: chapter_number, score, best_score: score, attempts: 1 };
      mockEvaluations.push(entry);
      if (verse) {
        console.log(`[MOCK] Progress saved: scripture=${scripture}, chapter=${chapter_number}, verse=${verse}`);
      }
      if (quiz_details) {
        console.log(`[MOCK] Quiz details saved: ${quiz_details.length} questions`);
      }
      return res.status(201).json({ status: 'saved' });
    }

    // 1. Save quiz score to evaluations table
    const existing = await db.query(
      'SELECT * FROM evaluations WHERE user_id = $1 AND chapter_id = $2 AND scripture = $3',
      [req.user?.id || 0, chapter_number, scripture || 'gita']
    );
    if (existing.rows.length > 0) {
      const current = existing.rows[0];
      const newBest = Math.max(parseFloat(current.best_score), score);
      await db.query(
        'UPDATE evaluations SET score = $1, best_score = $2, attempts = attempts + 1, completed_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND chapter_id = $4 AND scripture = $5',
        [score, newBest, req.user?.id || 0, chapter_number, scripture || 'gita']
      );
    } else {
      await db.query(
        'INSERT INTO evaluations (user_id, scripture, chapter_id, score, best_score, attempts) VALUES ($1, $2, $3, $4, $5, 1)',
        [req.user?.id || 0, scripture || 'gita', chapter_number, score, score]
      );
    }

    // 2. Save to progress table (so verses count toward mastery + leaderboard)
    if (verse) {
      const shlokaNum = parseInt(verse);
      const chNum = parseInt(chapter_number);
      const existingProgress = await db.query(
        'SELECT id FROM progress WHERE user_id = $1 AND scripture = $2 AND chapter = $3 AND shloka = $4',
        [req.user?.id || 0, scripture || 'gita', chNum, shlokaNum]
      );
      if (existingProgress.rows.length === 0) {
        await db.query(
          'INSERT INTO progress (user_id, scripture, chapter, shloka, completed_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
          [req.user?.id || 0, scripture || 'gita', chNum, shlokaNum]
        );
      }
    }

    // 3. Save individual Q&A to quiz_results table
    if (quiz_details && Array.isArray(quiz_details)) {
      await db.query(
        'INSERT INTO quiz_results (user_id, scripture, chapter, verse, score, questions, completed_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)',
        [req.user?.id || 0, scripture || 'gita', chapter_number, verse, score, JSON.stringify(quiz_details)]
      );
    }

    res.status(200).json({ status: 'saved' });
  } catch (err) {
    console.error('Evaluation save error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/evaluations/submit — Save quiz score (legacy endpoint)
router.post('/submit', async (req, res) => {
  try {
    const { user_id, chapter_id, score, time_taken } = req.body;

    if (!process.env.DATABASE_URL) {
      const existing = mockEvaluations.find(e => e.user_id === user_id && e.chapter_id === chapter_id);
      if (existing) {
        existing.attempts += 1;
        existing.best_score = Math.max(existing.best_score, score);
        existing.time_taken = time_taken;
        return res.json(existing);
      }
      const entry = { id: Date.now(), user_id, chapter_id, score, best_score: score, attempts: 1, time_taken };
      mockEvaluations.push(entry);
      return res.status(201).json(entry);
    }

    // Upsert: update if exists, insert if not
    const existing = await db.query(
      'SELECT * FROM evaluations WHERE user_id = $1 AND chapter_id = $2',
      [user_id, chapter_id]
    );

    if (existing.rows.length > 0) {
      const current = existing.rows[0];
      if (current.attempts >= 3) {
        return res.status(400).json({ error: 'Maximum 3 attempts reached', best_score: current.best_score });
      }

      const newBest = Math.max(parseFloat(current.best_score), score);
      const result = await db.query(
        'UPDATE evaluations SET score = $1, best_score = $2, attempts = attempts + 1, time_taken = $3, completed_at = CURRENT_TIMESTAMP WHERE user_id = $4 AND chapter_id = $5 RETURNING *',
        [score, newBest, time_taken, user_id, chapter_id]
      );
      return res.json(result.rows[0]);
    }

    const result = await db.query(
      'INSERT INTO evaluations (user_id, chapter_id, score, best_score, attempts, time_taken) VALUES ($1, $2, $3, $3, 1, $4) RETURNING *',
      [user_id, chapter_id, score, time_taken]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Evaluation submit error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/evaluations/:userId — Get all evaluation results for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!process.env.DATABASE_URL) {
      return res.json({ evaluations: mockEvaluations.filter(e => e.user_id == userId) });
    }

    const result = await db.query(
      'SELECT chapter_id, score, best_score, attempts, time_taken, completed_at FROM evaluations WHERE user_id = $1 ORDER BY chapter_id',
      [userId]
    );

    res.json({ evaluations: result.rows });
  } catch (err) {
    console.error('Fetch evaluations error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/evaluations/quiz-history/:userId — Get all quiz attempts for a user
router.get('/quiz-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!process.env.DATABASE_URL) {
      return res.json([]);
    }

    const result = await db.query(
      'SELECT * FROM quiz_results WHERE user_id = $1 ORDER BY completed_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch quiz history error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/evaluations/hanuman-overall/:userId — Calculate overall Hanuman Chalisa score
router.get('/hanuman-overall/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!process.env.DATABASE_URL) {
      return res.json({ total_verses_attempted: 0, total_verses_available: 44, average_score: 0, best_score: 0, worst_score: 0, verse_scores: {} });
    }

    const quizResult = await db.query(
      'SELECT scripture, chapter, verse, score FROM quiz_results WHERE user_id = $1 AND scripture = $2 ORDER BY verse',
      [userId, 'hanuman']
    );

    const verseScores = {};
    quizResult.rows.forEach(r => {
      const key = r.verse;
      if (!verseScores[key] || r.score > verseScores[key]) {
        verseScores[key] = r.score;
      }
    });

    const totalVerses = Object.keys(verseScores).length;
    const totalScore = Object.values(verseScores).reduce((sum, s) => sum + parseFloat(s), 0);
    const averageScore = totalVerses > 0 ? Math.round(totalScore / totalVerses) : 0;
    const bestScore = totalVerses > 0 ? Math.max(...Object.values(verseScores)) : 0;
    const worstScore = totalVerses > 0 ? Math.min(...Object.values(verseScores)) : 0;

    res.json({
      total_verses_attempted: totalVerses,
      total_verses_available: 44,
      average_score: averageScore,
      best_score: bestScore,
      worst_score: worstScore,
      verse_scores: verseScores
    });
  } catch (err) {
    console.error('Hanuman overall error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
