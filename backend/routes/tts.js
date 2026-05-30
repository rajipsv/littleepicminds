const express = require('express');
const { synthesizeSpeech, synthesizeSpeechLines } = require('../../lib/tts');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { text, target_language_code } = req.body;
    const result = await synthesizeSpeech({ text, targetLanguageCode: target_language_code });
    res.json(result);
  } catch (err) {
    console.error('[TTS]', err.message);
    const status = err.status || 500;
    res.status(status).json({
      error: err.message || 'Failed to generate speech',
      ...(err.useBrowser ? { useBrowser: true } : {}),
    });
  }
});

/** Per-line cache: same clips for full śloka sequence and line-by-line play */
router.post('/lines', async (req, res) => {
  try {
    const { lines, target_language_code } = req.body;
    const result = await synthesizeSpeechLines({
      lines,
      targetLanguageCode: target_language_code,
    });
    res.json(result);
  } catch (err) {
    console.error('[TTS lines]', err.message);
    const status = err.status || 500;
    res.status(status).json({
      error: err.message || 'Failed to generate speech',
      ...(err.useBrowser ? { useBrowser: true } : {}),
    });
  }
});

module.exports = router;
