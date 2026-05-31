/**
 * Curated per-verse pada lines (IAST) for Learn step — manual source of truth.
 * File: scripts/data/gita-pada-lines.json
 */
const fs = require('fs');
const path = require('path');

const PADALINES_PATH = path.join(__dirname, '..', 'scripts', 'data', 'gita-pada-lines.json');

function loadPadaLinesFile() {
  if (!fs.existsSync(PADALINES_PATH)) {
    return {
      version: 1,
      _comment:
        'Optional intro = narrator (e.g. sañjaya uvāca), not a pada line. lines = 4 IAST padas. Run npm run gita:line-breakdown after edits. Draft export: npm run gita:pada-lines:export',
      verses: {},
    };
  }
  try {
    return JSON.parse(fs.readFileSync(PADALINES_PATH, 'utf8'));
  } catch {
    return { version: 1, verses: {} };
  }
}

function savePadaLinesFile(data) {
  fs.mkdirSync(path.dirname(PADALINES_PATH), { recursive: true });
  fs.writeFileSync(PADALINES_PATH, JSON.stringify(data, null, 2), 'utf8');
}

/** @returns {{ intro?: string, lines: string[] }|null} */
function normalizeVerseEntry(entry) {
  if (!entry) return null;
  if (Array.isArray(entry)) {
    const lines = entry.map((l) => String(l).trim()).filter(Boolean);
    return lines.length ? { lines } : null;
  }
  if (typeof entry !== 'object') return null;
  const intro =
    typeof entry.intro === 'string'
      ? entry.intro.trim()
      : typeof entry.chantIntro === 'string'
        ? entry.chantIntro.trim()
        : entry.intro?.iast?.trim() || entry.intro?.transliteration?.trim() || '';
  const raw = entry.lines || entry.padas || entry.iast;
  if (!Array.isArray(raw)) return intro ? { intro, lines: [] } : null;
  const lines = raw.map((l) => String(l).trim()).filter(Boolean);
  if (!lines.length && !intro) return null;
  return { ...(intro ? { intro } : {}), lines };
}

function getVersePadaOverride(verseId, data = loadPadaLinesFile()) {
  return normalizeVerseEntry(data.verses?.[verseId]);
}

function setVersePadaOverride(data, verseId, entry) {
  if (!data.verses) data.verses = {};
  const norm = normalizeVerseEntry(entry);
  if (norm?.lines?.length) data.verses[verseId] = norm;
  else delete data.verses[verseId];
}

module.exports = {
  PADALINES_PATH,
  loadPadaLinesFile,
  savePadaLinesFile,
  getVersePadaOverride,
  setVersePadaOverride,
  normalizeVerseEntry,
};
