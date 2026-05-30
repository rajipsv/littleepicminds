const express = require('express');
const jwt = require('jsonwebtoken');
const contentData = require('../data');
const { applyHfToVerse, applyHfToChapterMap } = require('../../lib/gita-hf');

const router = express.Router();

// Helper: map Hanuman numeric verse index to data key
function getHanumanKey(index) {
  const v = parseInt(index);
  if (v <= 2) return `Doha ${v}`;
  if (v <= 42) return `Verse ${v - 2}`;
  return `Doha ${v - 40}`;
}

function getHanumanVerse(verseParam) {
  if (contentData.hanumanChalisa[verseParam]) return contentData.hanumanChalisa[verseParam];
  const key = getHanumanKey(verseParam);
  return contentData.hanumanChalisa[key] || null;
}

// GET /api/verses/chapters - Get chapter list + levels config
router.get('/chapters', (req, res) => {
  res.json({
    chapters: contentData.chapters,
    levels: contentData.levels,
  });
});

// GET /api/verses?scripture=gita&chapter=1&verse=1
// GET /api/verses?scripture=hanuman&verse=Verse 1
// GET /api/verses?scripture=hanuman&verse=5  (numeric fallback)
router.get('/', (req, res) => {
  try {
    const { scripture, chapter, verse } = req.query;
    console.log(`Verses Request: scripture=${scripture}, chapter=${chapter}, verse=${verse}`);

    if (scripture === 'hanuman') {
      if (verse) {
        const data = getHanumanVerse(verse);
        if (!data) return res.status(404).json({ error: 'Verse not found' });
        return res.json({ ...data, id: verse });
      }
      // Return all Hanuman Chalisa verses
      return res.json(contentData.hanumanChalisa);
    }

    // Default: Gita
    if (chapter && verse) {
      const key = `${chapter}.${verse}`;
      const data = contentData.shlokas[key];
      if (!data) return res.status(404).json({ error: 'Shloka not found', key });
      return res.json(applyHfToVerse({ ...data, id: key }, key));
    }

    if (chapter) {
      const chapterShlokas = {};
      for (const [key, val] of Object.entries(contentData.shlokas)) {
        if (key.startsWith(`${chapter}.`)) {
          chapterShlokas[key] = { ...val, id: key };
        }
      }
      console.log(`Found ${Object.keys(chapterShlokas).length} shlokas for chapter ${chapter}`);
      return res.json(applyHfToChapterMap(chapterShlokas));
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

// GET /api/verses/quiz/:scripture/:chapter/:verse — Quiz from shloka exercises or theme
router.get('/quiz/:scripture/:chapter/:verse', (req, res) => {
  try {
    const { scripture, chapter, verse } = req.params;
    const level = req.query.level || 'seekers';

    const generateShlokaQuestions = (shloka, ch, v) => {
      if (!shloka) return [];
      if (shloka.exercises && shloka.exercises[level]) {
        const ex = shloka.exercises[level];
        return [{
          question: ex.question,
          question_te: ex.question_te,
          options: ex.options,
          correct: ex.correct,
        }];
      }
      const childMeaning = shloka.en?.childMeaning || '';
      const activity = shloka.en?.activity || '';
      return [
        {
          question: `What is the main teaching of Shloka ${ch}.${v}?`,
          options: [
            childMeaning.substring(0, 80) + (childMeaning.length > 80 ? '...' : ''),
            'Only the strong should fight',
            'Wealth brings happiness',
          ],
          correct: 0,
        },
        {
          question: activity ? `The activity for Shloka ${ch}.${v} suggests:` : `What lesson does Shloka ${ch}.${v} teach?`,
          options: activity
            ? [activity.substring(0, 80) + (activity.length > 80 ? '...' : ''), 'Always expect a reward', 'Only act for praise']
            : [(shloka.en?.meaning || '').substring(0, 80), 'Avoid good deeds', 'Compete to defeat others'],
          correct: 0,
        },
      ];
    };

    if (typeof verse === 'string' && verse.startsWith('theme_')) {
      const chThemes = contentData.themes?.gita?.[chapter]?.[level] || [];
      const theme = chThemes.find((t) => t.id === verse);
      if (!theme) return res.status(404).json({ error: 'Theme not found' });

      let themeQuestions = [];
      (theme.shlokas || []).forEach((shlokaId) => {
        const shloka = contentData.shlokas[shlokaId];
        const parts = shlokaId.split('.');
        const vNum = parts[parts.length - 1];
        themeQuestions = themeQuestions.concat(generateShlokaQuestions(shloka, chapter, vNum));
      });
      if (!themeQuestions.length) return res.status(404).json({ error: 'No questions for this theme' });
      return res.json(themeQuestions);
    }

    let shloka = null;
    if (scripture === 'gita') {
      shloka = contentData.shlokas[`${chapter}.${verse}`];
    } else if (scripture === 'hanuman') {
      shloka = getHanumanVerse(verse);
    }
    if (!shloka) return res.status(404).json({ error: 'Shloka not found' });
    return res.json(generateShlokaQuestions(shloka, chapter, verse));
  } catch (err) {
    console.error('Quiz error:', err.message);
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
