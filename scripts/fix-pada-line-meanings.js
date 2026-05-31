/**
 * Fix meaningsEn/Te row 0 when intro is set but gloss is narrator text (e.g. "Arjuna said").
 *   npm run gita:fix-pada-meanings -- --from=1 --to=9
 */
const path = require('path');
const {
  splitVerseMeaning,
  stripAddresseeFromBody,
  stripNarratorLeadFromBody,
} = require('./gita-line-breakdown');
const { loadPadaLinesFile, savePadaLinesFile } = require('../lib/gita-pada-lines');

const BACKEND_DATA = path.join(__dirname, '..', 'backend', 'data');
const chaptersConfig = require(path.join(BACKEND_DATA, 'chapters.json'));

function parseRange() {
  const fromArg = process.argv.find((a) => a.startsWith('--from='));
  const toArg = process.argv.find((a) => a.startsWith('--to='));
  return {
    from: fromArg ? parseInt(fromArg.split('=')[1], 10) : 1,
    to: toArg ? parseInt(toArg.split('=')[1], 10) : 18,
  };
}

function looksLikeNarratorGloss(s) {
  const t = String(s || '').trim();
  if (!t) return false;
  return (
    /\bsaid\b/i.test(t) ||
    /\bspoke\b/i.test(t) ||
    /^"O [A-Za-z]/i.test(t) ||
    (t.length < 32 && /\b(uvāca|uvācha|uvacha)\b/i.test(t))
  );
}

function bodyMeanings(shloka, lineCount) {
  let en = (shloka.en?.meaning || '').trim();
  let te = (shloka.te?.meaning || '').trim();
  const colon = en.indexOf(':');
  if (colon > 0) en = en.slice(colon + 1).trim();
  en = stripNarratorLeadFromBody(en);
  en = stripAddresseeFromBody(en);
  if (te && /ఇలా అన్నాడు|అన్నాడు:/.test(te)) {
    const parts = te.split(/ఇలా అన్నాడు[:\s]*/);
    if (parts.length > 1) te = parts.slice(1).join('').trim();
  }
  te = stripNarratorLeadFromBody(te);
  te = stripAddresseeFromBody(te);
  return {
    meaningsEn: splitVerseMeaning(en, lineCount),
    meaningsTe: splitVerseMeaning(te, lineCount),
  };
}

function main() {
  const { from, to } = parseRange();
  const data = loadPadaLinesFile();
  let fixed = 0;

  for (let ch = from; ch <= to; ch++) {
    const fp = path.join(BACKEND_DATA, 'chapters', `chapter${ch}.js`);
    delete require.cache[require.resolve(fp)];
    const chapter = require(fp);

    for (const [verseId, entry] of Object.entries(data.verses || {})) {
      if (!verseId.startsWith(`${ch}.`)) continue;
      if (!entry?.intro || !entry?.lines?.length) continue;
      const lineCount = entry.lines.length;
      const shloka = chapter[verseId];
      if (!shloka) continue;
      const en0 = entry.meaningsEn?.[0];
      const te0 = entry.meaningsTe?.[0];
      const needsFix =
        looksLikeNarratorGloss(en0) ||
        looksLikeNarratorGloss(te0) ||
        !entry.meaningsEn?.length;
      if (!needsFix) continue;
      const m = bodyMeanings(shloka, lineCount);
      if (m.meaningsEn?.length === lineCount) {
        entry.meaningsEn = m.meaningsEn;
        fixed++;
      } else if (looksLikeNarratorGloss(en0)) {
        delete entry.meaningsEn;
      }
      if (m.meaningsTe?.length === lineCount) {
        entry.meaningsTe = m.meaningsTe;
      } else if (entry.meaningsTe?.[0] && looksLikeNarratorGloss(entry.meaningsTe[0])) {
        delete entry.meaningsTe;
      }
    }
  }

  savePadaLinesFile(data);
  console.log(`Fixed narrator-on-row0 meanings for ${fixed} verses (ch ${from}–${to}).`);
}

main();
