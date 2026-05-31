const { toBcp47 } = require('./lang-map');
const { toRhythmicText } = require('./rhythm');
const { normalizeLineTtsText } = require('./shloka-line');
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

/**
 * Provider chain for each request.
 * hybrid | auto | sarvam (default): Sarvam → Google → browser (client)
 * google: Google → Sarvam
 */
function getProviderOrder(langCode) {
  const mode = (process.env.TTS_PROVIDER || 'hybrid').toLowerCase();
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
  if (mode === 'sarvam-only') {
    add('sarvam');
    return chain;
  }
  // Telugu: Google WaveNet te-IN is more reliable on Vercel than Sarvam quota errors
  if (langCode === 'te-IN') {
    add('google');
    add('sarvam');
    return chain;
  }
  // hybrid, auto, sarvam — Sarvam first, Google fallback when keyed
  add('sarvam');
  add('google');
  return chain;
}

/** Prefer script detection; fall back to requested UI language for Latin/English prose. */
function langCodeFromText(text, targetLanguageCode) {
  const s = String(text || '');
  if (/[\u0C00-\u0C7F]/.test(s)) return 'te-IN';
  if (/[\u0900-\u097F]/.test(s)) return 'hi-IN';
  if (/[A-Za-z]/.test(s)) return 'en-IN';
  return toBcp47(targetLanguageCode);
}

function providerFailureDetail(err) {
  const status = err.response?.status;
  const parts = [status ? `HTTP ${status}` : null, err.code, err.message].filter(Boolean);
  return parts.join(' — ');
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

  const rhythmicText = normalizeLineTtsText(text) || toRhythmicText(text);
  const langCode = langCodeFromText(rhythmicText, targetLanguageCode);

  const cached = readCache(rhythmicText, langCode);
  if (cached) {
    console.log(`[TTS] cache HIT lang=${langCode} (${cached.provider})`);
    return cached;
  }

  const order = getProviderOrder(langCode);
  const ttsMode = (process.env.TTS_PROVIDER || 'hybrid').toLowerCase();
  if (order.length === 0 || ttsMode === 'browser') {
    const err = new Error(
      'No paid TTS configured. Use free browser voice (automatic fallback) or set SARVAM_API_KEY / GOOGLE_TTS_API_KEY.'
    );
    err.status = 503;
    err.useBrowser = true;
    throw err;
  }

  console.log(`[TTS] cache MISS lang=${langCode} — calling ${order.join(' → ')}`);

  let lastError;
  const attempted = [];
  for (const providerName of order) {
    attempted.push(providerName);
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
        fallbackFrom:
          attempted.length > 1 ? attempted.slice(0, -1).join(',') : undefined,
      };
    } catch (err) {
      lastError = err;
      console.warn(`[TTS] ${providerName} failed: ${providerFailureDetail(err)}`);
    }
  }

  const fail = new Error(
    lastError?.message ||
      `TTS failed (tried: ${attempted.join(' → ') || 'none'}). Set GOOGLE_TTS_API_KEY for Google fallback or use browser voice.`
  );
  fail.status = 500;
  fail.useBrowser = true;
  throw fail;
}

/**
 * Batch TTS for śloka lines — each line is cached independently (shared with line-by-line UI).
 */
async function synthesizeSpeechLines({ lines, targetLanguageCode }) {
  if (!Array.isArray(lines) || lines.length === 0) {
    const err = new Error('lines array is required');
    err.status = 400;
    throw err;
  }
  const segments = [];
  for (const raw of lines) {
    const text = String(raw || '').trim();
    if (!text) {
      segments.push({ audios: [], skipped: true });
      continue;
    }
    segments.push(await synthesizeSpeech({ text, targetLanguageCode }));
  }
  return { segments };
}

module.exports = {
  synthesizeSpeech,
  synthesizeSpeechLines,
  getProviderOrder,
  toRhythmicText,
  toBcp47,
  langCodeFromText,
  readCache,
  writeCache,
  normalizeLineTtsText,
};
