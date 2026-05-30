const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ROOT = path.join(__dirname, '..', '..');
const CACHE_PATHS = [
  path.join(ROOT, 'lib', 'data', 'line-te-cache.json'),
  path.join(ROOT, 'scripts', 'data', 'line-te-cache.json'),
];

function hasTeluguScript(text) {
  return Boolean(text && /[\u0C00-\u0C7F]/.test(text));
}

let memoryCache = null;

function loadCache() {
  if (memoryCache) return memoryCache;
  for (const p of CACHE_PATHS) {
    if (fs.existsSync(p)) {
      try {
        memoryCache = JSON.parse(fs.readFileSync(p, 'utf8'));
        return memoryCache;
      } catch (_) {
        /* try next */
      }
    }
  }
  memoryCache = {};
  return memoryCache;
}

function saveCacheEntry(key, te) {
  const cache = loadCache();
  cache[key] = te;
  memoryCache = cache;
  for (const p of CACHE_PATHS) {
    try {
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, JSON.stringify(cache, null, 2), 'utf8');
    } catch (_) {
      /* read-only fs */
    }
  }
}

async function translateLiveSarvam(text, apiKey) {
  const response = await axios.post(
    'https://api.sarvam.ai/translate',
    {
      input: text,
      source_language_code: 'en-IN',
      target_language_code: 'te-IN',
      model: 'mayura:v1',
      mode: 'formal',
    },
    {
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );
  const te = (response.data?.translated_text || '').trim();
  if (!te || !hasTeluguScript(te)) {
    throw new Error('Invalid translation response');
  }
  return te;
}

/**
 * Resolve EN → TE for line meanings. Cache-first; live Sarvam only if TRANSLATE_LIVE=true.
 */
async function translateLineMeaning(text) {
  const key = String(text || '').trim();
  if (!key) {
    const err = new Error('Text is required');
    err.status = 400;
    throw err;
  }

  const cache = loadCache();
  if (cache[key]) return { te: cache[key], source: 'cache' };

  const live = process.env.TRANSLATE_LIVE === 'true';
  if (!live) {
    const err = new Error(
      'Telugu translation not in cache. Run: npm run gita:translate-lines'
    );
    err.status = 404;
    throw err;
  }

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    const err = new Error('Translation not configured (SARVAM_API_KEY or run gita:translate-lines)');
    err.status = 501;
    throw err;
  }

  const te = await translateLiveSarvam(key, apiKey);
  saveCacheEntry(key, te);
  return { te, source: 'sarvam' };
}

module.exports = {
  translateLineMeaning,
  loadCache,
  hasTeluguScript,
  CACHE_PATHS,
};
