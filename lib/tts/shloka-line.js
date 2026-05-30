const { toRhythmicText } = require('./rhythm');

/** One line of a śloka — cache key is this text + lang (not line + meaning). */
function lineTextFromRow(row, lang) {
  if (!row) return '';
  const isTe = lang === 'te' || lang === 'te-IN';
  if (isTe && row.sanskrit_te) return String(row.sanskrit_te).trim();
  return String(row.transliteration || row.word || row.sanskrit || '').trim();
}

function linesFromBreakdown(breakdown, lang) {
  if (!breakdown?.length) return [];
  return breakdown.map((row) => lineTextFromRow(row, lang)).filter(Boolean);
}

function linesFromVerse(verse, lang) {
  const breakdown = verse?.lineBreakdown || verse?.word_by_word;
  return linesFromBreakdown(breakdown, lang);
}

/** Normalized text used for TTS API + cache lookup. */
function normalizeLineTtsText(text) {
  if (!text) return '';
  const trimmed = String(text).trim();
  if (!trimmed) return '';
  return toRhythmicText(trimmed);
}

module.exports = {
  lineTextFromRow,
  linesFromBreakdown,
  linesFromVerse,
  normalizeLineTtsText,
};
