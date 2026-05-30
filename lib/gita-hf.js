/**
 * Hugging Face Bhagavad-Gita_Audio (Apache-2.0) — text + audio overlay for app verses.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HF_VERSES_PATH = path.join(ROOT, 'lib', 'data', 'gita-hf-verses.json');

const HF_DATASET = 'JDhruv14/Bhagavad-Gita_Audio';
const HF_LICENSE = 'Apache-2.0';

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

  const lineBreakdown = verse.lineBreakdown || verse.word_by_word;
  const mergedBreakdown =
    lineBreakdown?.length && hf.sanskrit
      ? lineBreakdown.map((row, i) => {
          const hfRows = hfToLineBreakdown(hf.sanskrit, hf.transliteration);
          const hfRow = hfRows[i] || hfRows[0];
          return {
            ...row,
            sanskrit: hfRow?.sanskrit || row.sanskrit,
            transliteration: hfRow?.transliteration || row.transliteration,
            word: hfRow?.transliteration || row.word || row.transliteration,
          };
        })
      : hfToLineBreakdown(hf.sanskrit, hf.transliteration);

  return {
    ...verse,
    id: verse.id || verseId,
    sanskrit: hf.sanskrit,
    transliteration: hf.transliteration,
    lineBreakdown: mergedBreakdown,
    word_by_word: mergedBreakdown,
    hfSource: HF_DATASET,
    hfSanskritDisplay: formatSanskritDisplay(hf.sanskrit),
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
  shlokaIdToVerseId,
  loadHfVerses,
  saveHfVerses,
  getHfVerseText,
  hfToLineBreakdown,
  formatSanskritDisplay,
  applyHfToVerse,
  applyHfToChapterMap,
};
