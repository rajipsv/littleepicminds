/**
 * Hugging Face Bhagavad-Gita_Audio (Apache-2.0) — text + audio overlay for app verses.
 */
const fs = require('fs');
const path = require('path');
const { getVersePadaOverride } = require('./gita-pada-lines');

const ROOT = path.join(__dirname, '..');
const HF_VERSES_PATH = path.join(ROOT, 'lib', 'data', 'gita-hf-verses.json');

const HF_DATASET = 'JDhruv14/Bhagavad-Gita_Audio';
const HF_LICENSE = 'Apache-2.0';
const HF_AUDIO_AUTHOR = 'Dhruv Jaradi';
const HF_AUDIO_DATASET_URL = 'https://huggingface.co/datasets/JDhruv14/Bhagavad-Gita_Audio';

function getHfAudioAttribution() {
  return {
    dataset: HF_DATASET,
    author: HF_AUDIO_AUTHOR,
    license: HF_LICENSE,
    url: HF_AUDIO_DATASET_URL,
    credit: `Verse chanting audio by ${HF_AUDIO_AUTHOR} (${HF_DATASET}, Apache-2.0).`,
  };
}

function shlokaIdToVerseId(shlokaId) {
  const m = String(shlokaId).match(/^(\d+)_(\d+)$/);
  if (!m) return null;
  return `${m[1]}.${m[2]}`;
}

function normalizeEntry(entry) {
  if (!entry) return null;
  if (entry === true) return { audio: true };
  if (typeof entry === 'object') return entry;
  return null;
}

function loadHfVerses() {
  if (!fs.existsSync(HF_VERSES_PATH)) {
    return { version: 1, source: HF_DATASET, license: HF_LICENSE, verses: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(HF_VERSES_PATH, 'utf8'));
  } catch {
    return { version: 1, source: HF_DATASET, license: HF_LICENSE, verses: {} };
  }
}

function saveHfVerses(data) {
  fs.mkdirSync(path.dirname(HF_VERSES_PATH), { recursive: true });
  fs.writeFileSync(HF_VERSES_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function getHfVerseText(verseId) {
  const data = loadHfVerses();
  const entry = normalizeEntry(data.verses?.[verseId]);
  if (!entry?.sanskrit && !entry?.transliteration) return null;
  return {
    sanskrit: entry.sanskrit || '',
    transliteration: entry.transliteration || '',
  };
}

/** Split HF full śloka into ~4 line chunks (| in Sanskrit, . in IAST). */
function hfToLineBreakdown(sanskrit, transliteration) {
  const sanParts = String(sanskrit || '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
  const transParts = String(transliteration || '')
    .split(/\s*\.\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  const n = Math.max(sanParts.length, transParts.length, 1);
  const rows = [];
  for (let i = 0; i < n; i++) {
    const transliterationLine = transParts[i] || transParts[0] || '';
    rows.push({
      sanskrit: sanParts[i] || sanParts[0] || '',
      transliteration: transliterationLine,
      word: transliterationLine,
    });
  }
  return rows;
}

/** Keep curated pada rows (4 lines, chant intro) — HF uses fewer `.` chunks than Learn step. */
function shouldPreserveCuratedLineBreakdown(verse, verseId, hfRowCount) {
  const existing = verse.lineBreakdown || verse.word_by_word;
  if (!existing?.length) return false;
  if (verse.chantIntro) return true;
  if (getVersePadaOverride(verseId)) return true;
  if (hfRowCount > 0 && existing.length !== hfRowCount) return true;
  return false;
}

/** Overlay HF Devanagari/IAST per line only when counts align with curated breakdown. */
function mergeHfLineBreakdown(verse, verseId, sanskrit, transliteration) {
  const hfRows = hfToLineBreakdown(sanskrit, transliteration);
  const existing = verse.lineBreakdown || verse.word_by_word;
  if (!existing?.length) return hfRows;
  if (shouldPreserveCuratedLineBreakdown(verse, verseId, hfRows.length)) {
    return existing;
  }
  return existing.map((row, i) => {
    const hfRow = hfRows[i] || hfRows[hfRows.length - 1] || {};
    return {
      ...row,
      sanskrit: hfRow.sanskrit || row.sanskrit,
      transliteration: hfRow.transliteration || row.transliteration,
      word: hfRow.transliteration || row.word || row.transliteration,
    };
  });
}

function formatSanskritDisplay(sanskrit) {
  return String(sanskrit || '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * Overlay HF sanskrit/transliteration (and line breakdown) onto chapter verse JSON.
 * Keeps en/te meanings, exercises, child text from existing data.
 */
function applyHfToVerse(verse, verseId) {
  if (!verse || !verseId) return verse;
  const hf = getHfVerseText(verseId);
  if (!hf) return verse;

  const mergedBreakdown = mergeHfLineBreakdown(verse, verseId, hf.sanskrit, hf.transliteration);
  const keepChapterText = String(verse.transliteration || '').includes('\n');

  return {
    ...verse,
    id: verse.id || verseId,
    sanskrit: keepChapterText ? verse.sanskrit : hf.sanskrit,
    transliteration: keepChapterText ? verse.transliteration : hf.transliteration,
    lineBreakdown: mergedBreakdown,
    word_by_word: mergedBreakdown,
    hfSource: HF_DATASET,
    hfSanskritDisplay: formatSanskritDisplay(keepChapterText ? verse.sanskrit : hf.sanskrit),
  };
}

function applyHfToChapterMap(chapterShlokas) {
  const out = {};
  for (const [key, val] of Object.entries(chapterShlokas || {})) {
    out[key] = applyHfToVerse({ ...val, id: key }, key);
  }
  return out;
}

module.exports = {
  HF_VERSES_PATH,
  HF_DATASET,
  HF_LICENSE,
  HF_AUDIO_AUTHOR,
  HF_AUDIO_DATASET_URL,
  getHfAudioAttribution,
  shlokaIdToVerseId,
  loadHfVerses,
  saveHfVerses,
  getHfVerseText,
  hfToLineBreakdown,
  shouldPreserveCuratedLineBreakdown,
  mergeHfLineBreakdown,
  formatSanskritDisplay,
  applyHfToVerse,
  applyHfToChapterMap,
};
