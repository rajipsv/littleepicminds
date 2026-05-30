/**
 * Apache-2.0 verse chanting audio from JDhruv14/Bhagavad-Gita_Audio (Hugging Face).
 * Files: lib/data/gita_audio/{chapter}.{verse}.wav — run npm run gita:sync-hf-audio
 */
const fs = require('fs');
const path = require('path');
const { HF_DATASET, HF_LICENSE, shlokaIdToVerseId } = require('./gita-hf');

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

function hasVerseAudio(verseId) {
  const fp = getAudioFilePath(verseId);
  return Boolean(fp && fs.existsSync(fp));
}

function listAvailableVerseIds() {
  const manifest = loadManifest();
  const fromManifest = Object.keys(manifest.verses || {}).filter((id) => manifest.verses[id]);
  if (fromManifest.length) return fromManifest.sort();
  if (!fs.existsSync(AUDIO_DIR)) return [];
  return fs
    .readdirSync(AUDIO_DIR)
    .filter((f) => f.endsWith('.wav'))
    .map((f) => f.replace(/\.wav$/, ''))
    .sort();
}

function getPublicAudioPath(verseId) {
  if (!hasVerseAudio(verseId)) return null;
  return `/api/gita-audio/${encodeURIComponent(verseId)}`;
}

function registerGitaAudioRoutes(router) {
  router.get('/manifest', (req, res) => {
    const manifest = loadManifest();
    const verses = listAvailableVerseIds();
    res.json({
      ...manifest,
      count: verses.length,
      verses: verses.reduce((acc, id) => {
        acc[id] = getPublicAudioPath(id);
        return acc;
      }, {}),
    });
  });

  router.get('/:verseId', (req, res) => {
    const verseId = decodeURIComponent(req.params.verseId);
    const filePath = getAudioFilePath(verseId);
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Chant audio not available', verseId });
    }
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.sendFile(path.resolve(filePath));
  });
}

module.exports = {
  AUDIO_DIR,
  MANIFEST_PATH,
  HF_DATASET,
  HF_LICENSE,
  shlokaIdToVerseId,
  verseIdToFilename,
  getAudioFilePath,
  loadManifest,
  saveManifest,
  hasVerseAudio,
  listAvailableVerseIds,
  getPublicAudioPath,
  registerGitaAudioRoutes,
};
