const axios = require('axios');

const MODEL = 'bulbul:v3';
const SPEAKER = 'roopa';

async function synthesize({ text, langCode }) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    const err = new Error('Sarvam API key not configured');
    err.code = 'NOT_CONFIGURED';
    throw err;
  }

  const response = await axios.post(
    'https://api.sarvam.ai/text-to-speech',
    {
      text,
      target_language_code: langCode,
      speaker: SPEAKER,
      model: MODEL,
    },
    {
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );

  const b64 = response.data?.audios?.[0];
  if (!b64) {
    throw new Error('Invalid response from Sarvam AI');
  }

  return {
    audioBase64: b64,
    provider: 'sarvam',
    speaker: SPEAKER,
    model: MODEL,
    audioEncoding: 'WAV',
  };
}

module.exports = { synthesize, SPEAKER, MODEL };
