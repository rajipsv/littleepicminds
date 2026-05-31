/**
 * Rebuild lineBreakdown for all Gita shlokas: one row per poetic line (~4), not per word.
 * Updates backend/data/chapters and mirrors to lib/data.
 */
const fs = require('fs');
const path = require('path');
const { buildLineBreakdown } = require('./gita-line-breakdown');
const { getVersePadaOverride, loadPadaLinesFile } = require('../lib/gita-pada-lines');

const ROOT = path.join(__dirname, '..');
const BACKEND_DATA = path.join(ROOT, 'backend', 'data');
const LIB_DATA = path.join(ROOT, 'lib', 'data');
const VERSE_FILE = path.join(__dirname, 'data', 'gita-verse.json');
const TE_CACHE_FILE = path.join(__dirname, 'data', 'line-te-cache.json');

const chaptersConfig = require(path.join(BACKEND_DATA, 'chapters.json'));
const MANIFEST_FILE = path.join(ROOT, 'lib', 'data', 'gita-verse-audio-manifest.json');

function loadManifestAudioMeta() {
  if (!fs.existsSync(MANIFEST_FILE)) return { counts: new Map(), weights: new Map() };
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  const counts = new Map();
  const weights = new Map();
  for (const [verseId, entry] of Object.entries(manifest.verses || {})) {
    const timings = entry?.lineTimings;
    if (!Array.isArray(timings) || timings.length < 2) continue;
    const count =
      Number.isInteger(entry.lineCount) ? entry.lineCount : timings.length - 1;
    counts.set(verseId, count);
    const w = [];
    for (let i = 0; i < count; i++) {
      const end = i < timings.length - 1 ? Number(timings[i + 1]) : Number(timings[i]);
      w.push(Math.max(0.05, end - Number(timings[i])));
    }
    if (w.length === count) weights.set(verseId, w);
  }
  return { counts, weights };
}

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

function parseChapterArg() {
  const arg = process.argv.find((a) => a.startsWith('--chapter='));
  if (!arg) return null;
  return parseInt(arg.split('=')[1], 10);
}

function main() {
  const chapterFilter = parseChapterArg();
  let total = 0;
  let changed = 0;
  const teCache = loadTeCache();
  loadPadaLinesFile();
  let fromPadaFile = 0;

  for (const chMeta of chaptersConfig.chapters) {
    const ch = chMeta.id;
    if (chapterFilter && ch !== chapterFilter) continue;
    const chapter = loadChapter(ch);
    const out = { ...chapter };

    for (const key of Object.keys(out)) {
      if (!/^\d+\.\d+$/.test(key)) continue;
      const shloka = out[key];
      const source = verseIndex?.get(key);
      const before = shloka.lineBreakdown?.length || 0;

      const padaOverride = getVersePadaOverride(key);
      if (padaOverride?.lines?.length) fromPadaFile++;

      const breakdown = buildLineBreakdown({
        transliteration: shloka.transliteration || source?.transliteration,
        sanskrit: shloka.sanskrit || source?.text,
        telugu_script: shloka.telugu_script,
        word_meanings: source?.word_meanings,
        existingBreakdown: shloka.lineBreakdown,
        fallbackMeaning: shloka.en?.meaning,
        fallbackMeaningTe: shloka.te?.meaning,
        padaOverride,
        teCache,
      });
      if (breakdown.chantIntro) {
        shloka.chantIntro = breakdown.chantIntro;
        delete breakdown.chantIntro;
      } else {
        delete shloka.chantIntro;
      }
      shloka.lineBreakdown = breakdown;
      shloka.word_by_word = shloka.lineBreakdown;

      const after = shloka.lineBreakdown.length;
      if (after !== before) changed++;
      total++;
    }

    writeChapterFile(ch, out);
    mirrorToLib(ch);
    console.log(`✅ Chapter ${ch}: ${chMeta.count} verses (line breakdown updated)`);
  }

  console.log(
    `\n🚀 Done. ${total} shlokas processed, ${fromPadaFile} from gita-pada-lines.json, ${changed} had different row counts.`
  );
}

main();
