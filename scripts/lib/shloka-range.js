/**
 * Parse shloka lists: arrays, comma-separated pairs, or ranges "1.1-1.3".
 */
function parseVerseId(id) {
  const [ch, v] = String(id).trim().split('.').map(Number);
  return { ch, v };
}

function formatVerseId(ch, v) {
  return `${ch}.${v}`;
}

function expandShlokaRange(rangeStr) {
  const s = String(rangeStr).trim().replace(/–/g, '-');
  if (!s.includes('-')) return [s.trim()];
  const [start, end] = s.split('-').map((x) => x.trim());
  const a = parseVerseId(start);
  const b = parseVerseId(end);
  if (a.ch !== b.ch) throw new Error(`Cross-chapter range not supported: ${rangeStr}`);
  const out = [];
  for (let v = a.v; v <= b.v; v++) out.push(formatVerseId(a.ch, v));
  return out;
}

/** @param {string[]|string} input */
function normalizeShlokas(input) {
  if (Array.isArray(input)) return input.map((x) => String(x).trim());
  const s = String(input).trim();
  if (s.includes(',')) {
    return s.split(',').map((x) => x.trim()).filter(Boolean);
  }
  return expandShlokaRange(s);
}

module.exports = { expandShlokaRange, normalizeShlokas, parseVerseId, formatVerseId };
