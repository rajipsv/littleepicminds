/**
 * Generate Bhagavad Gita content for all 18 chapters:
 * - shloka records (backend/data/chapters/chapterN.js)
 * - themes for seeds, seekers, warriors (themes_*.json)
 *
 * Preserves existing rich content for chapters 1, 2, 15 (themes + shlokas).
 * Syncs api/data/chapters/chapter1.js → backend when api version is larger.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const BACKEND_DATA = path.join(ROOT, 'backend', 'data');
const API_DATA = path.join(ROOT, 'api', 'data');
const BLUEPRINTS = require('./gita-chapter-blueprints');
const chaptersConfig = require(path.join(BACKEND_DATA, 'chapters.json'));

const EMOJIS = ['🌱', '📖', '💡', '🌟', '🎯', '🛡️', '⚖️', '🔥', '🌳', '✨', '☀️', '🧘', '💪', '🦋', '🏆'];

function loadJsModule(filePath, exportName) {
  if (!fs.existsSync(filePath)) return {};
  const code = fs.readFileSync(filePath, 'utf-8').replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
  if (filePath.endsWith('.json')) return JSON.parse(code);
  try {
    return require(filePath);
  } catch {
    const sandbox = { module: { exports: {} }, exports: {} };
    vm.runInContext(code, vm.createContext(sandbox));
    return sandbox.module.exports || {};
  }
}

function loadAllExistingShlokas() {
  const shlokas = {};
  const gitaDataPath = path.join(BACKEND_DATA, 'gita_data.js');
  if (fs.existsSync(gitaDataPath)) {
    const sandbox = { window: {} };
    vm.runInContext(fs.readFileSync(gitaDataPath, 'utf-8'), vm.createContext(sandbox));
    if (sandbox.window.GITA_DATA?.shlokas) Object.assign(shlokas, sandbox.window.GITA_DATA.shlokas);
  }
  const chDir = path.join(BACKEND_DATA, 'chapters');
  if (fs.existsSync(chDir)) {
    fs.readdirSync(chDir).filter((f) => f.endsWith('.js')).forEach((f) => {
      Object.assign(shlokas, loadJsModule(path.join(chDir, f)));
    });
  }
  return shlokas;
}

function syncApiChapter1() {
  const apiCh1 = path.join(API_DATA, 'chapters', 'chapter1.js');
  const backendCh1 = path.join(BACKEND_DATA, 'chapters', 'chapter1.js');
  if (!fs.existsSync(apiCh1)) return;
  const apiKeys = Object.keys(loadJsModule(apiCh1));
  const backendKeys = fs.existsSync(backendCh1) ? Object.keys(loadJsModule(backendCh1)) : [];
  if (apiKeys.length >= backendKeys.length) {
    fs.copyFileSync(apiCh1, backendCh1);
    console.log(`✅ Synced api chapter1.js → backend (${apiKeys.length} shlokas)`);
  }
}

function verseRange(ch, start, end) {
  const ids = [];
  for (let v = start; v <= end; v++) ids.push(`${ch}.${v}`);
  return ids;
}

function splitRanges(count, parts) {
  const size = Math.ceil(count / parts);
  const ranges = [];
  for (let i = 0; i < parts; i++) {
    const start = i * size + 1;
    const end = Math.min((i + 1) * size, count);
    if (start <= end) ranges.push({ start, end });
  }
  return ranges;
}

function makeExercises(ch, v, lesson, level) {
  const base = lesson.idea;
  const seeds = {
    question: `What is the main idea of Chapter ${ch}, Verse ${v}?`,
    question_te: `అధ్యాయం ${ch}, శ్లోకం ${v} యొక్క ముఖ్య ఆలోచన ఏమిటి?`,
    options: [base, 'Only winning matters', 'Ignore your duty'],
    correct: 0,
  };
  const seekers = {
    question: `What does Krishna teach about ${base} in ${ch}.${v}?`,
    question_te: `${ch}.${v}లో ${lesson.ideaTe} గురించి కృష్ణుడు ఏమి బోధిస్తాడు?`,
    options: [lesson.moral, 'Never try hard', 'Hurt others to succeed'],
    correct: 0,
  };
  const warriors = {
    question: `In ${ch}.${v}, which understanding is closest to the Gita teaching?`,
    question_te: `${ch}.${v}లో గీత బోధనకు దగ్గరగా ఉన్న అవగాహన ఏది?`,
    options: [lesson.moral, 'Act only for selfish gain', 'Avoid all responsibility'],
    correct: 0,
  };
  return { seeds, seekers, warriors }[level] || seeds;
}

function generateShloka(ch, v, meta, lessonIndex) {
  const lessons = meta.lessons || [{ idea: meta.theme, ideaTe: meta.theme, moral: meta.theme, moralTe: meta.theme }];
  const lesson = lessons[lessonIndex % lessons.length];
  const key = `${ch}.${v}`;
  return {
    sanskrit: `श्रीमद्भगवद्गीता — अध्याय ${ch}, श्लोक ${v}`,
    transliteration: `śrīmad-bhagavad-gītā — chapter ${ch}, verse ${v}`,
    en: {
      meaning: `In Chapter ${ch} (${meta.title}), Krishna teaches about ${lesson.idea}.`,
      childMeaning: `Krishna helps us understand ${lesson.idea} in a simple way, like a wise friend guiding us on ${meta.theme}.`,
      activity: `Write or draw one way you can practice "${lesson.idea}" today.`,
    },
    te: {
      meaning: `అధ్యాయం ${ch} (${meta.title})లో, కృష్ణుడు ${lesson.ideaTe} గురించి బోధిస్తాడు.`,
      childMeaning: `కృష్ణుడు ${lesson.ideaTe}ను సరళంగా అర్థం చేసుకోవడానికి సహాయం చేస్తాడు — ${meta.theme} మార్గంలో.`,
      activity: `ఈరోజు "${lesson.ideaTe}"ను అభ్యసించే ఒక మార్గాన్ని రాయండి లేదా గీయండి.`,
    },
    exercises: {
      seeds: makeExercises(ch, v, lesson, 'seeds'),
      seekers: makeExercises(ch, v, lesson, 'seekers'),
      warriors: makeExercises(ch, v, lesson, 'warriors'),
    },
    telugu_script: `శ్రీమద్భగవద్గీత — అధ్యాయం ${ch}, శ్లోకం ${v}`,
    lineBreakdown: [
      {
        sanskrit: `अध्याय ${ch} श्लोक ${v}`,
        word: `chapter ${ch} verse ${v}`,
        sanskrit_te: `అధ్యాయం ${ch} శ్లోకం ${v}`,
        en: lesson.moral,
        te: lesson.moralTe,
      },
    ],
  };
}

function buildStory(level, ch, meta, range, lesson, idx) {
  const prefix = level === 'seeds' ? 's' : level === 'seekers' ? 'sk' : 'w';
  const kidName = ['Riya', 'Arjun', 'Maya', 'Dev', 'Anika', 'Kiran'][idx % 6];
  const seedsContent = `${kidName} faced a challenge at school that felt like a big battle. At first ${kidName} wanted to quit. Then ${kidName} remembered what Krishna teaches in Chapter ${ch} about ${lesson.idea}. ${kidName} took a deep breath and tried again with a kind heart.`;
  const seekersContent = `${kidName} had to make a hard choice between what was easy and what was right. Friends gave different advice, and ${kidName} felt confused. Reading the Gita, ${kidName} saw how Arjuna also felt torn on the field of Kurukshetra. Krishna's teaching on ${lesson.idea} helped ${kidName} choose courage over comfort.`;
  const warriorsContent = `In Chapter ${ch} (${meta.title}), Krishna explains ${lesson.idea} through verses ${range.start} to ${range.end}. This section of the Gita connects the epic story of Arjuna's dilemma to timeless ethics: ${lesson.moral} The verses invite us to examine our own duties, motives, and faith with honest discrimination.`;

  const content =
    level === 'seeds' ? seedsContent : level === 'seekers' ? seekersContent : warriorsContent;

  const content_te =
    level === 'seeds'
      ? `${kidName} పాఠశాలలో ఒక పెద్ద సవాలును ఎదుర్కొన్నాడు. మొదట వదులుకోవాలనుకున్నాడు. అప్పుడు అధ్యాయం ${ch}లో కృష్ణుడు ${lesson.ideaTe} గురించి బోధించినది గుర్తుకు వచ్చింది. లోతైన శ్వాస తీసుకుని మంచి హృదయంతో మళ్ళీ ప్రయత్నించాడు.`
      : level === 'seekers'
        ? `${kidName} సులభమైనది మరియు సరైనది మధ్య ఎంపిక చేయాల్సి వచ్చింది. గీతలో అర్జునుడు కూడా గందరగోళంలో ఉన్నాడని చూశాడు. ${lesson.ideaTe} పై కృష్ణ బోధన సౌకర్యం కంటే ధైర్యాన్ని ఎంచుకోవడానికి సహాయపడింది.`
        : `అధ్యాయం ${ch} (${meta.title})లో, కృష్ణుడు ${range.start}–${range.end} శ్లోకాల ద్వారా ${lesson.ideaTe}ను వివరిస్తాడు. ${lesson.moralTe}`;

  return {
    id: `theme_${prefix}${ch}_${idx + 1}`,
    title: `${meta.theme}: Part ${idx + 1}`,
    title_te: `${meta.theme}: భాగం ${idx + 1}`,
    emoji: EMOJIS[idx % EMOJIS.length],
    micro_theme: lesson.idea,
    micro_theme_te: lesson.ideaTe,
    shlokas: verseRange(ch, range.start, range.end),
    story: {
      title: level === 'seeds' ? `${kidName}'s Lesson` : `${meta.title} — Verses ${range.start}–${range.end}`,
      title_te: level === 'seeds' ? `${kidName} పాఠం` : `${meta.title} — శ్లోకాలు ${range.start}–${range.end}`,
      content,
      content_te,
      moral: lesson.moral,
      moral_te: lesson.moralTe,
    },
    activity:
      level === 'seeds'
        ? `Draw how "${lesson.idea}" looks in your life today.`
        : level === 'seekers'
          ? `Journal: When did you need courage for "${lesson.idea}"? What did you do?`
          : `Reflect on verses ${range.start}–${range.end}: list three ways ${lesson.idea} applies to your week.`,
    activity_te:
      level === 'seeds'
        ? `"${lesson.ideaTe}" మీ జీవితంలో ఎలా ఉందో గీయండి.`
        : level === 'seekers'
          ? `"${lesson.ideaTe}" కోసం మీకు ధైర్యం అవసరమైన సమయాన్ని జర్నల్‌లో రాయండి.`
          : `శ్లోకాలు ${range.start}–${range.end}పై ఆలోచించి, ఈ వారం "${lesson.ideaTe}" ఎలా వర్తిస్తుందో మూడు మార్గాలు రాయండి.`,
    videoUrl: '',
  };
}

function generateThemesForChapter(ch, count, meta) {
  const lessons = meta.lessons || [{ idea: meta.theme, ideaTe: meta.theme, moral: meta.theme, moralTe: meta.theme }];
  const seedsRanges = splitRanges(count, Math.min(3, Math.max(2, Math.ceil(count / 20))));
  const seekersRanges = splitRanges(count, Math.min(4, Math.max(3, Math.ceil(count / 15))));
  const warriorsRanges = splitRanges(count, Math.min(6, Math.max(4, Math.ceil(count / 12))));

  return {
    seeds: seedsRanges.map((r, i) => buildStory('seeds', ch, meta, r, lessons[i % lessons.length], i)),
    seekers: seekersRanges.map((r, i) => buildStory('seekers', ch, meta, r, lessons[i % lessons.length], i)),
    warriors: warriorsRanges.map((r, i) => buildStory('warriors', ch, meta, r, lessons[i % lessons.length], i)),
  };
}

function writeChapterFile(ch, shlokasForChapter) {
  const filePath = path.join(BACKEND_DATA, 'chapters', `chapter${ch}.js`);
  const sorted = {};
  Object.keys(shlokasForChapter)
    .sort((a, b) => {
      const [, av] = a.split('.').map(Number);
      const [, bv] = b.split('.').map(Number);
      return av - bv;
    })
    .forEach((k) => {
      sorted[k] = shlokasForChapter[k];
    });
  const content = `const CHAPTER_${ch}_SHLOKAS = ${JSON.stringify(sorted, null, 4)};\n\nmodule.exports = CHAPTER_${ch}_SHLOKAS;\n`;
  fs.writeFileSync(filePath, content, 'utf-8');
}

function main() {
  syncApiChapter1();

  const themesSeeds = loadJsModule(path.join(BACKEND_DATA, 'themes_seeds.json'));
  const themesSeekers = loadJsModule(path.join(BACKEND_DATA, 'themes_seekers.json'));
  const themesWarriors = loadJsModule(path.join(BACKEND_DATA, 'themes_warriors.json'));

  if (!themesSeeds.gita) themesSeeds.gita = {};
  if (!themesSeekers.gita) themesSeekers.gita = {};
  if (!themesWarriors.gita) themesWarriors.gita = {};

  const allShlokas = loadAllExistingShlokas();

  for (const bp of BLUEPRINTS) {
    const chMeta = chaptersConfig.chapters.find((c) => c.id === bp.id);
    const count = chMeta?.count || 20;
    const meta = { ...bp, title: bp.title || chMeta?.title, theme: bp.theme || chMeta?.theme };

    const chapterShlokas = {};
    for (let v = 1; v <= count; v++) {
      const key = `${bp.id}.${v}`;
      chapterShlokas[key] = allShlokas[key] || generateShloka(bp.id, v, meta, v - 1);
      allShlokas[key] = chapterShlokas[key];
    }

    writeChapterFile(bp.id, chapterShlokas);
    console.log(`✅ Chapter ${bp.id}: ${count} shlokas`);

    if (!bp.skipThemes) {
      const generated = generateThemesForChapter(bp.id, count, meta);
      themesSeeds.gita[String(bp.id)] = generated.seeds;
      themesSeekers.gita[String(bp.id)] = generated.seekers;
      themesWarriors.gita[String(bp.id)] = generated.warriors;
      console.log(`   Themes: seeds=${generated.seeds.length}, seekers=${generated.seekers.length}, warriors=${generated.warriors.length}`);
    }
  }

  fs.writeFileSync(path.join(BACKEND_DATA, 'themes_seeds.json'), JSON.stringify(themesSeeds, null, 2), 'utf-8');
  fs.writeFileSync(path.join(BACKEND_DATA, 'themes_seekers.json'), JSON.stringify(themesSeekers, null, 2), 'utf-8');
  fs.writeFileSync(path.join(BACKEND_DATA, 'themes_warriors.json'), JSON.stringify(themesWarriors, null, 2), 'utf-8');

  // Mirror to api/data for deploy parity
  if (fs.existsSync(API_DATA)) {
    fs.mkdirSync(path.join(API_DATA, 'chapters'), { recursive: true });
    fs.copyFileSync(path.join(BACKEND_DATA, 'themes_seeds.json'), path.join(API_DATA, 'themes_seeds.json'));
    fs.copyFileSync(path.join(BACKEND_DATA, 'themes_seekers.json'), path.join(API_DATA, 'themes_seekers.json'));
    fs.copyFileSync(path.join(BACKEND_DATA, 'themes_warriors.json'), path.join(API_DATA, 'themes_warriors.json'));
    for (let ch = 1; ch <= 18; ch++) {
      const src = path.join(BACKEND_DATA, 'chapters', `chapter${ch}.js`);
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(API_DATA, 'chapters', `chapter${ch}.js`));
    }
  }

  const total = Object.keys(allShlokas).filter((k) => /^\d+\.\d+$/.test(k)).length;
  console.log(`\n🚀 Done. Total Gita shloka keys: ${total}`);
  console.log(`   Theme chapters — seeds: ${Object.keys(themesSeeds.gita).length}, seekers: ${Object.keys(themesSeekers.gita).length}, warriors: ${Object.keys(themesWarriors.gita).length}`);
}

main();
