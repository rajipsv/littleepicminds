/**
 * Rebuild lineBreakdown for all Gita shlokas: one row per poetic line (~4), not per word.
 * Updates backend/data/chapters and mirrors to lib/data.
 */
const fs = require('fs');
const path = require('path');
const { buildLineBreakdown } = require('./gita-line-breakdown');

const ROOT = path.join(__dirname, '..');
const BACKEND_DATA = path.join(ROOT, 'backend', 'data');
const LIB_DATA = path.join(ROOT, 'lib', 'data');
const VERSE_FILE = path.join(__dirname, 'data', 'gita-verse.json');
const TE_CACHE_FILE = path.join(__dirname, 'data', 'line-te-cache.json');

const chaptersConfig = require(path.join(BACKEND_DATA, 'chapters.json'));

function loadTeCache() {
  if (!fs.existsSync(TE_CACHE_FILE)) return null;
  const obj = JSON.parse(fs.readFileSync(TE_CACHE_FILE, 'utf8'));
  return new Map(Object.entries(obj));
}

let verseIndex = null;
if (fs.existsSync(VERSE_FILE)) {
  const VERSES = require(VERSE_FILE);
  verseIndex = new Map();
  for (const v of VERSES) {
    verseIndex.set(`${v.chapter_number}.${v.verse_number}`, v);
  }
}

function loadChapter(ch) {
  return require(path.join(BACKEND_DATA, 'chapters', `chapter${ch}.js`));
}

function writeChapterFile(ch, shlokas) {
  const sorted = {};
  Object.keys(shlokas)
    .sort((a, b) => parseInt(a.split('.')[1], 10) - parseInt(b.split('.')[1], 10))
    .forEach((k) => {
      sorted[k] = shlokas[k];
    });
  const filePath = path.join(BACKEND_DATA, 'chapters', `chapter${ch}.js`);
  const content = `const CHAPTER_${ch}_SHLOKAS = ${JSON.stringify(sorted, null, 4)};\n\nmodule.exports = CHAPTER_${ch}_SHLOKAS;\n`;
  fs.writeFileSync(filePath, content, 'utf-8');
}

function mirrorToLib(ch) {
  if (!fs.existsSync(LIB_DATA)) return;
  const src = path.join(BACKEND_DATA, 'chapters', `chapter${ch}.js`);
  const dest = path.join(LIB_DATA, 'chapters', `chapter${ch}.js`);
  if (fs.existsSync(src)) fs.copyFileSync(src, dest);
}

function main() {
  let total = 0;
  let changed = 0;
  const teCache = loadTeCache();

  for (const chMeta of chaptersConfig.chapters) {
    const ch = chMeta.id;
    const chapter = loadChapter(ch);
    const out = { ...chapter };

    for (const key of Object.keys(out)) {
      if (!/^\d+\.\d+$/.test(key)) continue;
      const shloka = out[key];
      const source = verseIndex?.get(key);
      const before = shloka.lineBreakdown?.length || 0;

      shloka.lineBreakdown = buildLineBreakdown({
        transliteration: source?.transliteration || shloka.transliteration,
        sanskrit: source?.text || shloka.sanskrit,
        telugu_script: shloka.telugu_script,
        word_meanings: source?.word_meanings,
        existingBreakdown: shloka.lineBreakdown,
        fallbackMeaning: shloka.en?.meaning,
        fallbackMeaningTe: shloka.te?.meaning,
        teCache,
      });

      const after = shloka.lineBreakdown.length;
      if (after !== before) changed++;
      total++;
    }

    writeChapterFile(ch, out);
    mirrorToLib(ch);
    console.log(`✅ Chapter ${ch}: ${chMeta.count} verses (line breakdown updated)`);
  }

  console.log(`\n🚀 Done. ${total} shlokas processed, ${changed} had different row counts.`);
}

main();
