/**
 * Export draft pada lines into scripts/data/gita-pada-lines.json for manual editing.
 *
 *   npm run gita:pada-lines:export
 *   npm run gita:pada-lines:export -- --chapter=1
 *   npm run gita:pada-lines:export -- --force   # overwrite existing entries
 */
const path = require('path');
const {
  extractSpeakerPrefix,
  bodyPadasToFourLines,
} = require('./gita-line-breakdown');
const {
  loadPadaLinesFile,
  savePadaLinesFile,
  setVersePadaOverride,
} = require('../lib/gita-pada-lines');

const BACKEND_DATA = path.join(__dirname, '..', 'backend', 'data');
const chaptersConfig = require(path.join(BACKEND_DATA, 'chapters.json'));

function parseChapterArg() {
  const arg = process.argv.find((a) => a.startsWith('--chapter='));
  if (!arg) return null;
  return parseInt(arg.split('=')[1], 10);
}

function inferFromShloka(shloka) {
  const transliteration = (shloka.transliteration || '').trim();
  if (!transliteration) return null;
  const { speaker, bodyPadas } = extractSpeakerPrefix(transliteration);
  const lines = bodyPadasToFourLines(bodyPadas);
  if (!lines.length) return null;
  return {
    ...(speaker ? { intro: speaker } : {}),
    lines,
  };
}

function main() {
  const chapterFilter = parseChapterArg();
  const force = process.argv.includes('--force');
  const data = loadPadaLinesFile();
  let added = 0;
  let skipped = 0;

  for (const chMeta of chaptersConfig.chapters) {
    const ch = chMeta.id;
    if (chapterFilter && ch !== chapterFilter) continue;
    delete require.cache[require.resolve(path.join(BACKEND_DATA, 'chapters', `chapter${ch}.js`))];
    const chapter = require(path.join(BACKEND_DATA, 'chapters', `chapter${ch}.js`));

    for (const [verseId, shloka] of Object.entries(chapter)) {
      if (!/^\d+\.\d+$/.test(verseId)) continue;
      if (!force && data.verses?.[verseId]) {
        skipped++;
        continue;
      }
      const draft = inferFromShloka(shloka);
      if (!draft) continue;
      setVersePadaOverride(data, verseId, draft);
      added++;
    }
  }

  savePadaLinesFile(data);
  console.log(
    `✅ gita-pada-lines.json updated (added/updated=${added}, skipped existing=${skipped}, force=${force})`
  );
  console.log(`   ${require('../lib/gita-pada-lines').PADALINES_PATH}`);
  console.log('   Edit lines, then: npm run gita:line-breakdown');
}

main();
