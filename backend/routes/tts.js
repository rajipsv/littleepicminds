const express = require('express');
const { synthesizeSpeech } = require('../../lib/tts');

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

module.exports = router;
