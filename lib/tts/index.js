const { toBcp47 } = require('./lang-map');
const { toRhythmicText } = require('./rhythm');
const sarvam = require('./providers/sarvam');
const google = require('./providers/google');
const { readCache, writeCache } = require('./cache-store');

const PROVIDERS = { sarvam, google };

function hasGoogleTts() {
  return Boolean(process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

function hasSarvamTts() {
  return Boolean(process.env.SARVAM_API_KEY);
}

/** Providers with credentials configured */
function getProviderOrder() {
  const mode = (process.env.TTS_PROVIDER || 'auto').toLowerCase();
  if (mode === 'browser' || mode === 'client') return [];

  const chain = [];
  const add = (name) => {
    if (name === 'google' && hasGoogleTts()) chain.push('google');
    if (name === 'sarvam' && hasSarvamTts()) chain.push('sarvam');
  };

  if (mode === 'google') {
    add('google');
    add('sarvam');
    return chain;
  }
  if (mode === 'sarvam' || mode === 'hybrid') {
    add('sarvam');
    add('google');
    return chain;
  }
  add('sarvam');
  add('google');
  return chain;
}

function isRetryable(err) {
  const status = err.response?.status;
  if (status === 402 || status === 429 || status === 503) return true;
  if (err.code === 'NOT_CONFIGURED') return true;
  return false;
}

async function runProvider(name, rhythmicText, langCode) {
  const provider = PROVIDERS[name];
  if (!provider) throw new Error(`Unknown TTS provider: ${name}`);
  return provider.synthesize({ text: rhythmicText, langCode });
}

/**
 * Synthesize speech: cache-first (no API if same text+lang was synthesized before).
 */
async function synthesizeSpeech({ text, targetLanguageCode }) {
  if (!text || !String(text).trim()) {
    const err = new Error('Text is required');
    err.status = 400;
    throw err;
  }

  const rhythmicText = toRhythmicText(text);
  const langCode = toBcp47(targetLanguageCode);

  const cached = readCache(rhythmicText, langCode);
  if (cached) {
    console.log(`[TTS] cache HIT lang=${langCode} (${cached.provider})`);
    return cached;
  }

  const order = getProviderOrder();
  if (order.length === 0 || (process.env.TTS_PROVIDER || 'auto').toLowerCase() === 'browser') {
    const err = new Error(
      'No paid TTS configured. Use free browser voice (automatic fallback) or set SARVAM_API_KEY / GOOGLE_TTS_API_KEY.'
    );
    err.status = 503;
    err.useBrowser = true;
    throw err;
  }

  console.log(`[TTS] cache MISS lang=${langCode} — calling ${order.join(' → ')}`);

  let lastError;
  for (const providerName of order) {
    try {
      const result = await runProvider(providerName, rhythmicText, langCode);
      writeCache(rhythmicText, langCode, result.audioBase64, {
        provider: result.provider,
        speaker: result.speaker,
        model: result.model,
        audioEncoding: result.audioEncoding,
      });
      console.log(`[TTS] cached via ${result.provider} (saved for reuse, no repeat API call)`);
      return {
        audios: [result.audioBase64],
        provider: result.provider,
        speaker: result.speaker,
        model: result.model,
        audioEncoding: result.audioEncoding || 'WAV',
        cached: false,
      };
    } catch (err) {
      lastError = err;
      console.warn(`[TTS] ${providerName} failed: ${err.message}`);
      if (!isRetryable(err) && err.code !== 'NOT_CONFIGURED') break;
    }
  }

  const fail = new Error(
    lastError?.message ||
      'TTS failed. Add SARVAM_API_KEY (free trial credits) or use browser voice fallback.'
  );
  fail.status = 500;
  fail.useBrowser = true;
  throw fail;
}

module.exports = {
  synthesizeSpeech,
  getProviderOrder,
  toRhythmicText,
  toBcp47,
  readCache,
  writeCache,
};
