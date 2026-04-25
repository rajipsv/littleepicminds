const express = require('express');
const jwt = require('jsonwebtoken');
const contentData = require('../data');

const router = express.Router();

// GET /api/verses/chapters - Get chapter list + levels config
router.get('/chapters', (req, res) => {
  res.json({
    chapters: contentData.chapters,
    levels: contentData.levels,
  });
});

// GET /api/verses?scripture=gita&chapter=1&verse=1
// GET /api/verses?scripture=hanuman&verse=Verse 1
router.get('/', (req, res) => {
  try {
    const { scripture, chapter, verse } = req.query;

    if (scripture === 'hanuman') {
      if (verse) {
        const data = contentData.hanumanChalisa[verse];
        if (!data) return res.status(404).json({ error: 'Verse not found' });
        return res.json(data);
      }
      // Return all Hanuman Chalisa verses
      return res.json(contentData.hanumanChalisa);
    }

    // Default: Gita
    if (chapter && verse) {
      const key = `${chapter}.${verse}`;
      const data = contentData.shlokas[key];
      if (!data) return res.status(404).json({ error: 'Shloka not found', key });
      return res.json(data);
    }

    if (chapter) {
      // Return all shlokas for a chapter
      const chapterShlokas = {};
      for (const [key, val] of Object.entries(contentData.shlokas)) {
        if (key.startsWith(`${chapter}.`)) {
          chapterShlokas[key] = val;
        }
      }
      return res.json(chapterShlokas);
    }

    // Return summary: available keys
    const gitaKeys = Object.keys(contentData.shlokas);
    const hanumanKeys = Object.keys(contentData.hanumanChalisa);
    res.json({
      gita: { count: gitaKeys.length, keys: gitaKeys },
      hanuman: { count: hanumanKeys.length, keys: hanumanKeys },
    });
  } catch (err) {
    console.error('Verses error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/verses/evaluations/:scripture/:chapter/:level - Get quiz questions
router.get('/evaluations/:scripture/:chapter/:level', (req, res) => {
  const { scripture, chapter, level } = req.params;
  
  // Currently we only have Gita evaluations in the static data
  if (scripture !== 'gita') {
    return res.status(404).json({ error: 'No evaluations for this scripture yet' });
  }

  const chapterData = contentData.evaluations[chapter];
  if (!chapterData || !chapterData[level]) {
    return res.status(404).json({ error: 'No evaluations for this chapter/level yet' });
  }
  
  res.json(chapterData[level]);
});

module.exports = router;
