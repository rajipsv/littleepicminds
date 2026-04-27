const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// NOTE: Vercel /api routes run in a serverless environment. 
// Filesystem caching in /api/data might not persist between requests,
// but we'll try to use /tmp or just rely on the API for now.
const CACHE_DIR = '/tmp/audio_cache';
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const SARVAM_LANG_MAP = {
  'hi': 'hi-IN',
  'te': 'te-IN',
  'ta': 'ta-IN',
  'en': 'en-IN',
  'sa': 'hi-IN'
};

router.post('/', async (req, res) => {
  try {
    let { text, target_language_code, speaker = 'roopa' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // --- RHYTHM ENGINE (Local Sync) ---
    // Replace newlines and full stops with commas to force Sarvam to pause
    const rhythmicText = text
      .replace(/\n/g, ', ') 
      .replace(/\. /g, ', ')
      .replace(/॥/g, ', ')
      .replace(/।/g, ', ');

    const langCode = SARVAM_LANG_MAP[target_language_code] || 'hi-IN';
    
    // Check if API key exists in env or use hardcoded fallback provided by user
    const apiKey = process.env.SARVAM_API_KEY || 'sk_f4cnob0d_214NOB5ybuCkeyorusK51ljv';

    console.log(`[TTS] Processing: "${rhythmicText.substring(0, 30)}..." Lang: ${langCode} Voice: ${speaker}`);

    const response = await axios.post(
      'https://api.sarvam.ai/text-to-speech',
      {
        text: rhythmicText,
        target_language_code: langCode,
        speaker: speaker,
        model: 'bulbul:v3' 
      },
      {
        headers: {
          'api-subscription-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.audios && response.data.audios.length > 0) {
      return res.json(response.data);
    } else {
      throw new Error('Invalid response from Sarvam AI');
    }

  } catch (err) {
    console.error('TTS API Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

module.exports = router;
