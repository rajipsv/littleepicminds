/**
 * Dhruv Jaradi chanting audio (Apache-2.0, JDhruv14/Bhagavad-Gita_Audio).
 * Local WAVs: lib/data/gita_audio/{verseId}.wav — npm run gita:sync-hf-audio → gita:upload-r2
 * Production playback: R2 only via GITA_AUDIO_BASE_URL / VITE_GITA_AUDIO_BASE_URL
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
const HF_ROWS_API = `https://datasets-server.huggingface.co/rows?dataset=${encodeURIComponent(HF_DATASET)}&config=default&split=train`;
const HF_PLAY_URL_TTL_MS = 45 * 60 * 1000;
const hfPlayUrlCache = new Map();

function hfAudioUrlFromField(audioField) {
  if (!audioField) return null;
  if (Array.isArray(audioField)) {
    const first = audioField[0];
    return first?.src || first?.url || null;
  }
  if (typeof audioField === 'object') {
    return audioField.src || audioField.url || null;
  }
  return null;
}

/** For offline sync scripts only — not used at playback runtime. */
async function fetchHfAudioUrlByTrainIndex(trainIndex) {
  const idx = Number(trainIndex);
  if (!Number.isFinite(idx) || idx < 0) return null;
  const url = `${HF_ROWS_API}&offset=${idx}&length=1`;
  for (let attempt = 0; attempt <= 3; attempt++) {
    const res = await fetch(url);
    if (res.ok) {
      const page = await res.json();
      const audioUrl = hfAudioUrlFromField(page.rows?.[0]?.row?.audio);
      return audioUrl || null;
    }
    if (attempt < 3 && (res.status >= 500 || res.status === 429)) {
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      continue;
    }
    return null;
  }
  return null;
}

/** For offline sync scripts only — not used at playback runtime. */
async function resolveHfPlayUrl(verseId) {
  const cached = hfPlayUrlCache.get(verseId);
  if (cached && Date.now() - cached.at < HF_PLAY_URL_TTL_MS) {
    return cached.url;
  }
  const manifest = loadManifest();
  const entry = manifest.verses?.[verseId];
  const trainIndex =
    typeof entry === 'object' && entry?.trainIndex != null ? entry.trainIndex : null;
  let url = null;
  if (trainIndex != null) {
    url = await fetchHfAudioUrlByTrainIndex(trainIndex);
  }
  if (!url) url = getVerseManifestUrl(manifest, verseId);
  if (url) hfPlayUrlCache.set(verseId, { url, at: Date.now() });
  return url;
}

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

function getVerseManifestMeta(manifest, verseId) {
  const entry = manifest?.verses?.[verseId];
  if (!entry || typeof entry !== 'object') return {};
  const meta = {};
  const introEnd = Number(entry.introEnd);
  if (Number.isFinite(introEnd) && introEnd > 0) meta.introEnd = introEnd;
  const introStart = Number(entry.introStart);
  if (Number.isFinite(introStart) && introStart >= 0) meta.introStart = introStart;
  const lineCount = Number(entry.lineCount);
  if (Number.isFinite(lineCount) && lineCount > 0) meta.lineCount = lineCount;
  const gap = entry.midSpeakerGap;
  if (gap && Number.isFinite(Number(gap.start)) && Number.isFinite(Number(gap.end))) {
    meta.midSpeakerGap = { start: Number(gap.start), end: Number(gap.end), label: gap.label };
  }
  return meta;
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

function setVerseManifestEntry(manifest, verseId, { url, local, trainIndex, lineTimings, lineCount, introEnd } = {}) {
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
    if (introEnd != null) entry.introEnd = introEnd;
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
  if (!/^\d+\.\d+$/.test(String(verseId).replace(/[^0-9.]/g, ''))) return false;
  if (!getGitaAudioBaseUrl()) return false;
  const manifest = loadManifest();
  return Boolean(manifest.verses?.[verseId]);
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
  return getCdnAudioUrl(verseId);
}

function listAvailableVerseIds() {
  const manifest = loadManifest();
  return Object.keys(manifest.verses || {})
    .filter((id) => /^\d+\.\d+$/.test(id))
    .sort();
}

function getPublicAudioPath(verseId) {
  return getCdnAudioUrl(verseId);
}

function registerGitaAudioRoutes(router) {
  router.get('/manifest', (req, res) => {
    const manifest = loadManifest();
    const verses = listAvailableVerseIds();
    const audioBaseUrl = getGitaAudioBaseUrl();
    res.json({
      ...manifest,
      attribution: getHfAudioAttribution(),
      audioBaseUrl,
      audioConfigured: Boolean(audioBaseUrl),
      count: verses.length,
      verses: verses.reduce((acc, id) => {
        const timings = getVerseLineTimings(manifest, id);
        const meta = getVerseManifestMeta(manifest, id);
        const rawEntry = manifest.verses?.[id];
        const lineEnds =
          typeof rawEntry === 'object' && Array.isArray(rawEntry.lineEnds)
            ? rawEntry.lineEnds
            : null;
        const introEndVal =
          typeof rawEntry === 'object' && rawEntry.introEnd != null
            ? rawEntry.introEnd
            : meta.introEnd;
        const introStartVal =
          typeof rawEntry === 'object' && rawEntry.introStart != null
            ? rawEntry.introStart
            : meta.introStart;
        const midSpeakerGap =
          typeof rawEntry === 'object' && rawEntry.midSpeakerGap
            ? rawEntry.midSpeakerGap
            : meta.midSpeakerGap;
        const durationVal =
          typeof rawEntry === 'object' && rawEntry.duration != null
            ? rawEntry.duration
            : lineEnds?.length
              ? Math.max(...lineEnds.map(Number).filter(Number.isFinite)) + 0.5
              : timings?.length
                ? Math.max(...timings.map(Number).filter(Number.isFinite)) + 0.5
                : undefined;
        const cdn = getCdnAudioUrl(id);
        const entry = {
          ...(cdn ? { url: cdn, cdnUrl: cdn } : {}),
          ...(timings ? { lineTimings: timings } : {}),
          ...(lineEnds ? { lineEnds } : {}),
          ...(introEndVal != null ? { introEnd: introEndVal } : {}),
          ...(introStartVal != null ? { introStart: introStartVal } : {}),
          ...(midSpeakerGap ? { midSpeakerGap } : {}),
          ...(Number.isFinite(durationVal) && durationVal > 0 ? { duration: durationVal } : {}),
          ...meta,
        };
        acc[id] = entry;
        return acc;
      }, {}),
    });
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
  resolveHfPlayUrl,
  fetchHfAudioUrlByTrainIndex,
  registerGitaAudioRoutes,
};

