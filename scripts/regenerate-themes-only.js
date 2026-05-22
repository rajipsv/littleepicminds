/**
 * Regenerate themes_seeds / themes_seekers / themes_warriors only (keeps shloka files).
 */
const fs = require('fs');
const path = require('path');
const BLUEPRINTS = require('./gita-chapter-blueprints');
const chaptersConfig = require(path.join(__dirname, '..', 'backend', 'data', 'chapters.json'));

const ROOT = path.join(__dirname, '..');
const BACKEND_DATA = path.join(ROOT, 'backend', 'data');
const LIB_DATA = path.join(ROOT, 'lib', 'data');

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

const EMOJIS = ['🌱', '📖', '💡', '🌟', '🎯', '🛡️', '⚖️', '🔥', '🌳', '✨', '☀️', '🧘'];
const { getMoralStory } = require('./gita-theme-stories');

function buildStory(level, ch, meta, range, lesson, idx) {
  const prefix = level === 'seeds' ? 's' : level === 'seekers' ? 'sk' : 'w';
  const moral = getMoralStory(lesson.idea, level, idx);
  if (moral) {
    return {
      id: `theme_${prefix}${ch}_${idx + 1}`,
      title: moral.title,
      title_te: moral.title_te,
      emoji: moral.emoji || EMOJIS[idx % EMOJIS.length],
      micro_theme: lesson.idea,
      micro_theme_te: lesson.ideaTe,
      shlokas: verseRange(ch, range.start, range.end),
      story: {
        title: moral.storyTitle,
        title_te: moral.storyTitle_te,
        content: moral.content,
        content_te: moral.content_te,
        moral: lesson.moral,
        moral_te: lesson.moralTe,
      },
      activity: moral.activity,
      activity_te: moral.activity_te,
      videoUrl: '',
    };
  }
  return null;
}

function generateThemesForChapter(ch, count, meta) {
  const lessons = meta.lessons || [{ idea: meta.theme, ideaTe: meta.theme, moral: meta.theme, moralTe: meta.theme }];
  const seedsRanges = splitRanges(count, Math.min(3, Math.max(2, Math.ceil(count / 20))));
  const seekersRanges = splitRanges(count, Math.min(4, Math.max(3, Math.ceil(count / 15))));
  const warriorsRanges = splitRanges(count, Math.min(6, Math.max(4, Math.ceil(count / 12))));

  const seeds = [];
  const seekers = [];
  seedsRanges.forEach((r, i) => {
    const t = buildStory('seeds', ch, meta, r, lessons[i % lessons.length], i);
    if (t) seeds.push(t);
  });
  seekersRanges.forEach((r, i) => {
    const t = buildStory('seekers', ch, meta, r, lessons[i % lessons.length], i);
    if (t) seekers.push(t);
  });
  const warriors = warriorsRanges.map((r, i) => {
    const lesson = lessons[i % lessons.length];
    const prefix = 'w';
    const partTitles = ['First Steps', 'Growing Stronger', 'Deeper Wisdom', 'Clearer Vision', 'Steady Heart', 'Final Light'];
    return {
      id: `theme_${prefix}${ch}_${i + 1}`,
      title: `${meta.theme}: ${partTitles[i % partTitles.length]}`,
      title_te: `${meta.theme}: ${partTitles[i % partTitles.length]}`,
      emoji: EMOJIS[i % EMOJIS.length],
      micro_theme: lesson.idea,
      micro_theme_te: lesson.ideaTe,
      shlokas: verseRange(ch, r.start, r.end),
      story: {
        title: `${meta.title} — Verses ${r.start}–${r.end}`,
        title_te: `${meta.title} — శ్లోకాలు ${r.start}–${r.end}`,
        content: `Krishna teaches ${lesson.idea} in Chapter ${ch}, verses ${r.start}–${r.end}. ${lesson.moral}`,
        content_te: `అధ్యాయం ${ch}, శ్లోకాలు ${r.start}–${r.end}: ${lesson.ideaTe}. ${lesson.moralTe}`,
        moral: lesson.moral,
        moral_te: lesson.moralTe,
      },
      activity: `Reflect: how does "${lesson.idea}" apply this week?`,
      activity_te: `"${lesson.ideaTe}" ఈ వారం ఎలా వర్తిస్తుంది?`,
      videoUrl: '',
    };
  });

  return { seeds, seekers, warriors };
}

function main() {
  const themesSeeds = { gita: {} };
  const themesSeekers = { gita: {} };
  const themesWarriors = { gita: {} };

  for (const bp of BLUEPRINTS) {
    if (bp.skipThemes) {
      const existingSeeds = require(path.join(BACKEND_DATA, 'themes_seeds.json'));
      const existingSeekers = require(path.join(BACKEND_DATA, 'themes_seekers.json'));
      const existingWarriors = require(path.join(BACKEND_DATA, 'themes_warriors.json'));
      themesSeeds.gita[String(bp.id)] = existingSeeds.gita[String(bp.id)];
      themesSeekers.gita[String(bp.id)] = existingSeekers.gita[String(bp.id)];
      themesWarriors.gita[String(bp.id)] = existingWarriors.gita[String(bp.id)];
      console.log(`⏭️  Chapter ${bp.id}: kept handcrafted themes`);
      continue;
    }
    const chMeta = chaptersConfig.chapters.find((c) => c.id === bp.id);
    const count = chMeta?.count || 20;
    const meta = { ...bp, title: bp.title || chMeta?.title, theme: bp.theme || chMeta?.theme };
    const generated = generateThemesForChapter(bp.id, count, meta);
    themesSeeds.gita[String(bp.id)] = generated.seeds;
    themesSeekers.gita[String(bp.id)] = generated.seekers;
    themesWarriors.gita[String(bp.id)] = generated.warriors;
    console.log(`✅ Chapter ${bp.id}: seeds=${generated.seeds[0]?.title} | seekers=${generated.seekers[0]?.title}`);
  }

  fs.writeFileSync(path.join(BACKEND_DATA, 'themes_seeds.json'), JSON.stringify(themesSeeds, null, 2), 'utf8');
  fs.writeFileSync(path.join(BACKEND_DATA, 'themes_seekers.json'), JSON.stringify(themesSeekers, null, 2), 'utf8');
  fs.writeFileSync(path.join(BACKEND_DATA, 'themes_warriors.json'), JSON.stringify(themesWarriors, null, 2), 'utf8');

  if (fs.existsSync(LIB_DATA)) {
    fs.copyFileSync(path.join(BACKEND_DATA, 'themes_seeds.json'), path.join(LIB_DATA, 'themes_seeds.json'));
    fs.copyFileSync(path.join(BACKEND_DATA, 'themes_seekers.json'), path.join(LIB_DATA, 'themes_seekers.json'));
    fs.copyFileSync(path.join(BACKEND_DATA, 'themes_warriors.json'), path.join(LIB_DATA, 'themes_warriors.json'));
  }
  console.log('\n🚀 Theme regeneration complete.');
}

main();
