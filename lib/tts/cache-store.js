const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { resolveCacheDir, ensureCacheDir } = require('./cache');

const LEGACY_PROVIDERS = ['sarvam', 'google'];

/** Canonical key: same audio for same text+lang regardless of TTS provider (saves Sarvam credits). */
function getCanonicalKey(rhythmicText, langCode) {
  return crypto.createHash('md5').update(`${langCode}\0${rhythmicText}`).digest('hex');
}

function getLegacyKey(providerName, rhythmicText, langCode) {
  return crypto
    .createHash('md5')
    .update(`${providerName}_${rhythmicText}_${langCode}`)
    .digest('hex');
}

function getReadDirs() {
  const dirs = [];
  const primary = resolveCacheDir();
  if (primary) dirs.push(primary);

  const root = path.join(__dirname, '..', '..');
  const bundled = path.join(root, 'lib', 'data', 'audio_cache');
  if (bundled !== primary && fs.existsSync(bundled)) {
    dirs.push(bundled);
  }

  const extra = process.env.TTS_CACHE_EXTRA_DIRS;
  if (extra) {
    for (const p of extra.split(path.delimiter)) {
      const resolved = path.resolve(p.trim());
      if (resolved && !dirs.includes(resolved) && fs.existsSync(resolved)) {
        dirs.push(resolved);
      }
    }
  }
  return dirs;
}

function metaPath(wavPath) {
  return `${wavPath}.json`;
}

function loadEntry(wavPath) {
  const audioBuffer = fs.readFileSync(wavPath);
  let meta = { provider: 'cache', speaker: '', model: '', audioEncoding: 'WAV' };
  const mp = metaPath(wavPath);
  if (fs.existsSync(mp)) {
    try {
      meta = { ...meta, ...JSON.parse(fs.readFileSync(mp, 'utf8')) };
    } catch (_) {
      /* ignore */
    }
  }
  return {
    audios: [audioBuffer.toString('base64')],
    provider: meta.provider,
    speaker: meta.speaker || '',
    model: meta.model || '',
    audioEncoding: meta.audioEncoding || 'WAV',
    cached: true,
    cachePath: wavPath,
  };
}

/**
 * Find cached WAV in any read directory (canonical first, then legacy provider keys).
 */
function readCache(rhythmicText, langCode) {
  const canonical = getCanonicalKey(rhythmicText, langCode);
  const dirs = getReadDirs();

  for (const dir of dirs) {
    const canonicalFile = path.join(dir, `${canonical}.wav`);
    if (fs.existsSync(canonicalFile)) {
      return loadEntry(canonicalFile);
    }
  }

  for (const dir of dirs) {
    for (const providerName of LEGACY_PROVIDERS) {
      const legacy = getLegacyKey(providerName, rhythmicText, langCode);
      const legacyFile = path.join(dir, `${legacy}.wav`);
      if (fs.existsSync(legacyFile)) {
        const entry = loadEntry(legacyFile);
        if (process.env.TTS_CACHE_PROMOTE_LEGACY !== 'false') {
          try {
            writeCache(rhythmicText, langCode, entry.audios[0], {
              provider: entry.provider,
              speaker: entry.speaker,
              model: entry.model,
              audioEncoding: entry.audioEncoding,
            });
          } catch (_) {
            /* read-only fs */
          }
        }
        return entry;
      }
    }
  }

  return null;
}

/**
 * Write to primary cache dir using canonical key only.
 */
function writeCache(rhythmicText, langCode, audioBase64, meta = {}) {
  const writeDir = ensureCacheDir();
  const canonical = getCanonicalKey(rhythmicText, langCode);
  const cacheFile = path.join(writeDir, `${canonical}.wav`);
  const audioBuffer = Buffer.from(audioBase64, 'base64');
  fs.writeFileSync(cacheFile, audioBuffer);
  fs.writeFileSync(
    metaPath(cacheFile),
    JSON.stringify({
      provider: meta.provider || 'unknown',
      speaker: meta.speaker || '',
      model: meta.model || '',
      audioEncoding: meta.audioEncoding || 'WAV',
      langCode,
      textPreview: rhythmicText.slice(0, 80),
      cachedAt: new Date().toISOString(),
    }),
    'utf8'
  );
  return cacheFile;
}

function countCacheFiles() {
  let count = 0;
  for (const dir of getReadDirs()) {
    try {
      count += fs.readdirSync(dir).filter((f) => f.endsWith('.wav')).length;
    } catch (_) {
      /* ignore */
    }
  }
  return count;
}

module.exports = {
  getCanonicalKey,
  getLegacyKey,
  getReadDirs,
  readCache,
  writeCache,
  countCacheFiles,
};
