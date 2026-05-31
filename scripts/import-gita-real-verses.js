/**
 * Replace placeholder shloka text with real Sanskrit, transliteration,
 * Telugu script (transliterated), and word-by-word breakdown.
 *
 * Sources (downloaded to scripts/data/):
 * - gita-verse.json — sanskrit, transliteration, word_meanings
 * - gita-translation.json — English meanings (Swami Sivananda preferred)
 */
const fs = require('fs');
const path = require('path');
const Sanscript = require('@indic-transliteration/sanscript');
const { buildLineBreakdown, cleanSanskrit: cleanSk } = require('./gita-line-breakdown');

const { DATA_DIR } = require('./lib/data-dir');
const SCRIPT_DATA = path.join(__dirname, 'data');
const VERSE_FILE = path.join(SCRIPT_DATA, 'gita-verse.json');
const TRANSLATION_FILE = path.join(SCRIPT_DATA, 'gita-translation.json');

function ensureSourceData() {
  fs.mkdirSync(SCRIPT_DATA, { recursive: true });
  const urls = [
    ['gita-verse.json', 'https://ravisiyer.github.io/gita-data/v1/verse.json'],
    ['gita-translation.json', 'https://ravisiyer.github.io/gita-data/v1/translation.json'],
  ];
  const https = require('https');
  for (const [name, url] of urls) {
    const dest = path.join(SCRIPT_DATA, name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) continue;
    console.log(`Downloading ${name}...`);
    require('child_process').execSync(
      `powershell -NoProfile -Command "(Invoke-WebRequest -Uri '${url}' -UseBasicParsing).Content | Set-Content -Path '${dest}' -Encoding utf8"`,
      { stdio: 'inherit', maxBuffer: 50 * 1024 * 1024 }
    );
  }
}

ensureSourceData();
const VERSES = require(VERSE_FILE);
const TRANSLATIONS = require(TRANSLATION_FILE);
const chaptersConfig = require(path.join(DATA_DIR, 'chapters.json'));

const PREFERRED_AUTHORS = ['Swami Sivananda', 'Swami Gambirananda', 'Swami Adidevananda'];

function cleanSanskrit(text) {
  return cleanSk(text);
}

function isPlaceholderShloka(entry) {
  const s = entry?.sanskrit || '';
  return (
    s.includes('श्रीमद्भगवद्गीता') ||
    s.includes('अध्याय') ||
    s.startsWith('श्रीमद्भगवद्गीता')
  );
}

function toTeluguScript(text) {
  try {
    return Sanscript.t(text, 'devanagari', 'telugu');
  } catch {
    return text;
  }
}

function toTeluguFromIast(word) {
  try {
    return Sanscript.t(word, 'iast', 'telugu');
  } catch {
    return word;
  }
}

function isPlaceholderTe(entry) {
  const m = entry?.te?.meaning || '';
  return m.includes('అధ్యాయం') || m.includes('Path of Action') || m.includes('Karma Yoga)');
}


function buildEnglishMap() {
  const byVerseId = new Map();
  for (const t of TRANSLATIONS) {
    if (t.lang !== 'english') continue;
    const id = t.verse_id;
    if (!byVerseId.has(id)) byVerseId.set(id, []);
    byVerseId.get(id).push(t);
  }
  const pick = new Map();
  for (const [id, list] of byVerseId) {
    let chosen = list.find((x) => PREFERRED_AUTHORS.includes(x.authorName));
    if (!chosen) chosen = list[0];
    if (chosen) pick.set(id, chosen.description.replace(/\s+/g, ' ').trim());
  }
  return pick;
}

function loadChapter(ch) {
  const file = path.join(DATA_DIR, 'chapters', `chapter${ch}.js`);
  if (!fs.existsSync(file)) return {};
  return require(file);
}

function verseIndex() {
  const map = new Map();
  for (const v of VERSES) {
    const key = `${v.chapter_number}.${v.verse_number}`;
    map.set(key, v);
  }
  return map;
}

function mergeShloka(existing, source, english) {
  const sanskrit = cleanSanskrit(source.text);
  const transliteration = (source.transliteration || '').trim();
  const telugu_script = toTeluguScript(sanskrit);
  const placeholder = !existing || isPlaceholderShloka(existing);

  const merged = { ...(existing || {}) };

  merged.sanskrit = sanskrit;
  merged.transliteration = transliteration;
  merged.telugu_script = telugu_script;
  merged.lineBreakdown = buildLineBreakdown({
    transliteration,
    sanskrit,
    telugu_script,
    word_meanings: source.word_meanings,
    existingBreakdown: merged.lineBreakdown,
    fallbackMeaning: english || merged.en?.meaning,
  });

  if (!merged.en) merged.en = {};
  if (!merged.te) merged.te = {};

  if (english) {
    if (placeholder || !merged.en.meaning || merged.en.meaning.includes('Chapter ')) {
      merged.en.meaning = english;
    }
    if (placeholder && (!merged.en.childMeaning || merged.en.childMeaning.includes('wise friend'))) {
      merged.en.childMeaning = english.length > 160 ? english.slice(0, 157) + '...' : english;
    }
  }

  if (placeholder || isPlaceholderTe(merged)) {
    merged.te = merged.te || {};
    if (english) {
      merged.te.meaning = english;
      merged.te.childMeaning =
        english.length > 160 ? english.slice(0, 157) + '...' : english;
    }
  }

  if (!merged.exercises) {
    merged.exercises = existing?.exercises || {
      seeds: { question: 'Main idea?', question_te: 'ముఖ్య ఆలోచన?', options: ['Yes', 'No', 'Maybe'], correct: 0 },
      seekers: { question: 'Teaching?', question_te: 'బోధ?', options: ['Yes', 'No', 'Maybe'], correct: 0 },
      warriors: { question: 'Deeper meaning?', question_te: 'లోతైన అర్థం?', options: ['Yes', 'No', 'Maybe'], correct: 0 },
    };
  }

  return merged;
}

function writeChapterFile(ch, shlokas) {
  const sorted = {};
  Object.keys(shlokas)
    .sort((a, b) => parseInt(a.split('.')[1]) - parseInt(b.split('.')[1]))
    .forEach((k) => {
      sorted[k] = shlokas[k];
    });
  const filePath = path.join(DATA_DIR, 'chapters', `chapter${ch}.js`);
  const content = `const CHAPTER_${ch}_SHLOKAS = ${JSON.stringify(sorted, null, 4)};\n\nmodule.exports = CHAPTER_${ch}_SHLOKAS;\n`;
  fs.writeFileSync(filePath, content, 'utf-8');
}

function main() {
  const index = verseIndex();
  const englishMap = buildEnglishMap();
  let updated = 0;
  let skipped = 0;

  for (const chMeta of chaptersConfig.chapters) {
    const ch = chMeta.id;
    const existingChapter = loadChapter(ch);
    const out = { ...existingChapter };

    for (let v = 1; v <= chMeta.count; v++) {
      const key = `${ch}.${v}`;
      const source = index.get(key);
      if (!source) {
        skipped++;
        continue;
      }
      out[key] = mergeShloka(out[key], source, englishMap.get(source.id));
      updated++;
    }

    writeChapterFile(ch, out);
    console.log(`✅ Chapter ${ch}: ${chMeta.count} verses written`);
  }

  console.log(`\n🚀 Import complete. Updated ${updated} verses, missing source: ${skipped}`);
}

main();
