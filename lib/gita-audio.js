/**
 * Apache-2.0 verse chanting audio from JDhruv14/Bhagavad-Gita_Audio (Hugging Face).
 * Local: lib/data/gita_audio/{chapter}.{verse}.wav — npm run gita:sync-hf-audio
 * Production: HF resolve URLs in lib/data/gita-verse-audio-manifest.json
 */
const fs = require('fs');
const path = require('path');
const {
  HF_DATASET,
  HF_LICENSE,
  shlokaIdToVerseId,
  getHfAudioAttribution,
} = require('./gita-hf');

const ROOT = path.join(__dirname, '..');
const AUDIO_DIR = path.join(ROOT, 'lib', 'data', 'gita_audio');
const MANIFEST_PATH = path.join(ROOT, 'lib', 'data', 'gita-verse-audio-manifest.json');

function verseIdToFilename(verseId) {
  return `${verseId}.wav`;
}

function getAudioFilePath(verseId) {
  const safe = String(verseId).replace(/[^0-9.]/g, '');
  if (!/^\d+\.\d+$/.test(safe)) return null;
  return path.join(AUDIO_DIR, verseIdToFilename(safe));
}

function normalizeVerseManifestEntry(entry) {
  if (!entry) return null;
  if (typeof entry === 'string' && entry.startsWith('http')) return { url: entry };
  if (typeof entry === 'object' && entry.url) return { url: String(entry.url) };
  if (entry === true) return { local: true };
  return null;
}

function getVerseManifestUrl(manifest, verseId) {
  const norm = normalizeVerseManifestEntry(manifest?.verses?.[verseId]);
  return norm?.url || null;
}

function getVerseLineTimings(manifest, verseId) {
  const entry = manifest?.verses?.[verseId];
  if (!entry || typeof entry !== 'object') return null;
  const t = entry.lineTimings;
  if (!Array.isArray(t) || t.length < 2) return null;
  return t.map((x) => Number(x)).filter((x) => Number.isFinite(x));
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return { version: 1, source: HF_DATASET, license: HF_LICENSE, verses: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } catch {
    return { version: 1, source: HF_DATASET, license: HF_LICENSE, verses: {} };
  }
}

function saveManifest(manifest) {
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
}

function setVerseManifestEntry(manifest, verseId, { url, local, trainIndex, lineTimings, lineCount } = {}) {
  if (!manifest.verses) manifest.verses = {};
  const prev = manifest.verses[verseId];
  const prevUrl =
    typeof prev === 'string' && prev.startsWith('http')
      ? prev
      : typeof prev === 'object'
        ? prev?.url
        : null;
  const resolvedUrl = url || prevUrl;
  const idx = trainIndex ?? (typeof prev === 'object' ? prev?.trainIndex : undefined);
  const timings = lineTimings ?? (typeof prev === 'object' ? prev?.lineTimings : undefined);
  const count = lineCount ?? (typeof prev === 'object' ? prev?.lineCount : undefined);
  if (resolvedUrl) {
    const entry = { url: resolvedUrl };
    if (idx != null) entry.trainIndex = idx;
    if (local) entry.local = true;
    if (timings) entry.lineTimings = timings;
    if (count != null) entry.lineCount = count;
    manifest.verses[verseId] = entry;
  } else if (local) {
    manifest.verses[verseId] = { local: true };
  }
}

function hasLocalVerseAudio(verseId) {
  const fp = getAudioFilePath(verseId);
  return Boolean(fp && fs.existsSync(fp));
}

function hasVerseAudio(verseId) {
  if (hasLocalVerseAudio(verseId)) return true;
  const manifest = loadManifest();
  return Boolean(getVerseManifestUrl(manifest, verseId));
}

/** Public CDN base (no trailing slash), e.g. https://pub-xxx.r2.dev */
function getGitaAudioBaseUrl() {
  const base = (process.env.GITA_AUDIO_BASE_URL || '').trim().replace(/\/$/, '');
  return base || null;
}

function getCdnAudioUrl(verseId) {
  const base = getGitaAudioBaseUrl();
  const safe = String(verseId).replace(/[^0-9.]/g, '');
  if (!base || !/^\d+\.\d+$/.test(safe)) return null;
  return `${base}/${verseIdToFilename(safe)}`;
}

function getManifestAudioUrl(verseId) {
  const manifest = loadManifest();
  return getVerseManifestUrl(manifest, verseId);
}

function listAvailableVerseIds() {
  const manifest = loadManifest();
  const ids = new Set();
  for (const id of Object.keys(manifest.verses || {})) {
    if (hasVerseAudio(id)) ids.add(id);
  }
  if (!fs.existsSync(AUDIO_DIR)) return [...ids].sort();
  for (const f of fs.readdirSync(AUDIO_DIR)) {
    if (f.endsWith('.wav')) ids.add(f.replace(/\.wav$/, ''));
  }
  return [...ids].sort();
}

function getPublicAudioPath(verseId) {
  const cdn = getCdnAudioUrl(verseId);
  if (cdn) return cdn;
  if (hasLocalVerseAudio(verseId)) {
    return `/api/gita-audio/${encodeURIComponent(verseId)}`;
  }
  const hf = getManifestAudioUrl(verseId);
  if (hf) return hf;
  return null;
}

function registerGitaAudioRoutes(router) {
  router.get('/manifest', (req, res) => {
    const manifest = loadManifest();
    const verses = listAvailableVerseIds();
    res.json({
      ...manifest,
      attribution: getHfAudioAttribution(),
      audioBaseUrl: getGitaAudioBaseUrl(),
      count: verses.length,
      verses: verses.reduce((acc, id) => {
        const timings = getVerseLineTimings(manifest, id);
        acc[id] = {
          url: getPublicAudioPath(id),
          ...(timings ? { lineTimings: timings } : {}),
        };
        return acc;
      }, {}),
    });
  });

  router.get('/:verseId', (req, res) => {
    const verseId = decodeURIComponent(req.params.verseId);
    const filePath = getAudioFilePath(verseId);
    if (filePath && fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.sendFile(path.resolve(filePath));
    }
    const hfUrl = getManifestAudioUrl(verseId);
    if (hfUrl) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.redirect(302, hfUrl);
    }
    return res.status(404).json({ error: 'Chant audio not available', verseId });
  });
}

module.exports = {
  AUDIO_DIR,
  MANIFEST_PATH,
  HF_DATASET,
  HF_LICENSE,
  shlokaIdToVerseId,
  verseIdToFilename,
  normalizeVerseManifestEntry,
  getVerseManifestUrl,
  getVerseLineTimings,
  setVerseManifestEntry,
  getGitaAudioBaseUrl,
  getCdnAudioUrl,
  getManifestAudioUrl,
  getAudioFilePath,
  loadManifest,
  saveManifest,
  hasLocalVerseAudio,
  hasVerseAudio,
  listAvailableVerseIds,
  getPublicAudioPath,
  registerGitaAudioRoutes,
};
