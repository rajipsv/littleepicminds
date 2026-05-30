const axios = require('axios');

/** WaveNet voices — within Google free tier; good te/hi/en-IN coverage */
const VOICE_BY_LANG = {
  'te-IN': 'te-IN-Wavenet-A',
  'hi-IN': 'hi-IN-Wavenet-D',
  'ta-IN': 'ta-IN-Wavenet-A',
  'en-IN': 'en-IN-Wavenet-D',
};

function getVoice(langCode) {
  return VOICE_BY_LANG[langCode] || 'en-IN-Wavenet-D';
}

async function synthesizeWithApiKey({ text, langCode, apiKey }) {
  const voiceName = getVoice(langCode);
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`;
  const res = await axios.post(
    url,
    {
      input: { text },
      voice: { languageCode: langCode, name: voiceName },
      audioConfig: { audioEncoding: 'MP3', speakingRate: 0.95 },
    },
    { headers: { 'Content-Type': 'application/json' }, timeout: 60000 }
  );
  const b64 = res.data?.audioContent;
  if (!b64) throw new Error('Invalid response from Google TTS');
  return {
    audioBase64: b64,
    provider: 'google',
    speaker: voiceName,
    model: 'wavenet',
    audioEncoding: 'MP3',
  };
}

async function synthesizeWithClient({ text, langCode }) {
  const textToSpeech = require('@google-cloud/text-to-speech');
  const client = new textToSpeech.TextToSpeechClient();
  const voiceName = getVoice(langCode);
  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: { languageCode: langCode, name: voiceName },
    audioConfig: { audioEncoding: 'MP3', speakingRate: 0.95 },
  });
  if (!response.audioContent) throw new Error('Invalid response from Google TTS');
  return {
    audioBase64: Buffer.from(response.audioContent).toString('base64'),
    provider: 'google',
    speaker: voiceName,
    model: 'wavenet',
    audioEncoding: 'MP3',
  };
}

async function synthesize({ text, langCode }) {
  const apiKey = process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
  if (apiKey) {
    return synthesizeWithApiKey({ text, langCode, apiKey });
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      return await synthesizeWithClient({ text, langCode });
    } catch (e) {
      const err = new Error(`Google TTS failed: ${e.message}`);
      err.code = 'GOOGLE_TTS_ERROR';
      throw err;
    }
  }
  const err = new Error(
    'Google TTS not configured (set GOOGLE_TTS_API_KEY or GOOGLE_APPLICATION_CREDENTIALS)'
  );
  err.code = 'NOT_CONFIGURED';
  throw err;
}

module.exports = { synthesize, getVoice, VOICE_BY_LANG };
