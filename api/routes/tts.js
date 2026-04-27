const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Simple file-based caching for audio to prevent hitting the API too often
const CACHE_DIR = path.join(__dirname, '../data/audio_cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Map frontend languages to Sarvam AI supported languages
const SARVAM_LANG_MAP = {
  'hi': 'hi-IN',
  'te': 'te-IN',
  'ta': 'ta-IN',
  'en': 'en-IN',
  'sa': 'hi-IN' // Fallback for Sanskrit (Sarvam handles Sanskrit well under Hindi)
};

router.post('/', async (req, res) => {
  try {
    const { text, target_language_code, speaker = 'meera' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const langCode = SARVAM_LANG_MAP[target_language_code] || 'hi-IN';
    
    // Create a cache key based on text, language, and speaker
    const hash = crypto.createHash('md5').update(`${text}_${langCode}_${speaker}`).digest('hex');
    const cacheFile = path.join(CACHE_DIR, `${hash}.wav`);

    // Check cache
    if (fs.existsSync(cacheFile)) {
      const audioBuffer = fs.readFileSync(cacheFile);
      const base64Audio = audioBuffer.toString('base64');
      return res.json({ audios: [base64Audio] });
    }

    // Check if API key is configured
    if (!process.env.SARVAM_API_KEY) {
      // Return a 501 Not Implemented so frontend can fallback to browser TTS gracefully
      return res.status(501).json({ error: 'Sarvam API key not configured on server' });
    }

    // Call Sarvam API
    const response = await axios.post(
      'https://api.sarvam.ai/text-to-speech',
      {
        text: text,
        target_language_code: langCode,
        speaker: speaker === 'meera' ? 'shubh' : speaker,
        model: 'bulbul:v3' 
      },
      {
        headers: {
          'api-subscription-key': process.env.SARVAM_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.audios && response.data.audios.length > 0) {
      // Save to cache
      const audioBuffer = Buffer.from(response.data.audios[0], 'base64');
      fs.writeFileSync(cacheFile, audioBuffer);
      
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
