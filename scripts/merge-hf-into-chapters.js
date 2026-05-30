/**
 * Merge Hugging Face sanskrit + transliteration into backend/data/chapters/chapterN.js
 * Run after: npm run gita:sync-hf-audio -- --text-only  (or full sync)
 *
 *   npm run gita:merge-hf-chapters
 *   npm run gita:merge-hf-chapters -- --chapter=1
 */
const fs = require('fs');
const path = require('path');
const {
  loadHfVerses,
  hfToLineBreakdown,
  shlokaIdToVerseId,
} = require('../lib/gita-hf');

const CHAPTERS_DIR = path.join(__dirname, '..', 'backend', 'data', 'chapters');

function parseChapterArg() {
  const arg = process.argv.find((a) => a.startsWith('--chapter='));
  if (!arg) return null;
  return parseInt(arg.split('=')[1], 10);
}

function mergeVerse(verse, verseId, hfEntry) {
  if (!hfEntry?.sanskrit && !hfEntry?.transliteration) return verse;

  const sanskrit = (hfEntry.sanskrit || verse.sanskrit || '').trim();
  const transliteration = (hfEntry.transliteration || verse.transliteration || '').trim();
  const hfRows = hfToLineBreakdown(sanskrit, transliteration);
  const existing = verse.lineBreakdown || verse.word_by_word || [];

  const lineBreakdown =
    existing.length > 0
      ? existing.map((row, i) => {
          const hfRow = hfRows[i] || hfRows[hfRows.length - 1] || {};
          return {
            ...row,
            sanskrit: hfRow.sanskrit || row.sanskrit,
            transliteration: hfRow.transliteration || row.transliteration,
            word: hfRow.transliteration || row.word || row.transliteration,
          };
        })
      : hfRows.map((hfRow) => ({
          sanskrit: hfRow.sanskrit,
          transliteration: hfRow.transliteration,
          word: hfRow.transliteration,
          en: '',
          te: '',
        }));

  return {
    ...verse,
    sanskrit,
    transliteration,
    lineBreakdown,
    word_by_word: lineBreakdown,
    hfMerged: true,
  };
}

function writeChapterFile(chapterNum, shlokas) {
  const filePath = path.join(CHAPTERS_DIR, `chapter${chapterNum}.js`);
  const body = JSON.stringify(shlokas, null, 4);
  const content = `const CHAPTER_${chapterNum}_SHLOKAS = ${body};\n\nmodule.exports = CHAPTER_${chapterNum}_SHLOKAS;\n`;
  fs.writeFileSync(filePath, content, 'utf8');
}

function main() {
  const hf = loadHfVerses();
  const chapterFilter = parseChapterArg();
  const chapters = chapterFilter
    ? [chapterFilter]
    : Array.from({ length: 18 }, (_, i) => i + 1);

  let merged = 0;
  let missing = 0;

  for (const ch of chapters) {
    const filePath = path.join(CHAPTERS_DIR, `chapter${ch}.js`);
    if (!fs.existsSync(filePath)) {
      console.warn(`Skip missing ${filePath}`);
      continue;
    }
    delete require.cache[require.resolve(filePath)];
    const shlokas = require(filePath);
    let chMerged = 0;

    for (const [key, verse] of Object.entries(shlokas)) {
      if (!/^\d+\.\d+$/.test(key)) continue;
      const entry = hf.verses?.[key];
      if (!entry || typeof entry !== 'object') {
        missing++;
        continue;
      }
      const text =
        typeof entry === 'object'
          ? { sanskrit: entry.sanskrit, transliteration: entry.transliteration }
          : null;
      if (!text?.sanskrit && !text?.transliteration) {
        missing++;
        continue;
      }
      shlokas[key] = mergeVerse(verse, key, text);
      chMerged++;
      merged++;
    }

    writeChapterFile(ch, shlokas);
    console.log(`Chapter ${ch}: merged ${chMerged} verses → ${filePath}`);
  }

  console.log(`Done. merged=${merged} missing_hf=${missing}`);
  if (missing) {
    console.log('Run: npm run gita:sync-hf-audio -- --text-only');
  }
}

main();
