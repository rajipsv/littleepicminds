/**
 * Build scripts/data/gita-theme-clusters.json from famous verses + quotas.
 * Run: node scripts/generate-theme-clusters.js
 */
const fs = require('fs');
const path = require('path');
const FAMOUS = require('./gita-famous-verses');
const BLUEPRINTS = require('./gita-chapter-blueprints');
const chaptersConfig = require(path.join(__dirname, '..', 'backend', 'data', 'chapters.json'));

const OUT = path.join(__dirname, 'data', 'gita-theme-clusters.json');

/** Proportional quotas (sum seeds=100, seekers=200) */
const QUOTAS = {};
const counts = chaptersConfig.chapters.map((c) => c.count);
const total = counts.reduce((a, b) => a + b, 0);
chaptersConfig.chapters.forEach((c, i) => {
  QUOTAS[c.id] = {
    seeds: Math.round((100 * c.count) / total),
    seekers: Math.round((200 * c.count) / total),
  };
});
let sSum = Object.values(QUOTAS).reduce((a, q) => a + q.seeds, 0);
let kSum = Object.values(QUOTAS).reduce((a, q) => a + q.seekers, 0);
if (sSum !== 100) QUOTAS[18].seeds += 100 - sSum;
if (kSum !== 200) QUOTAS[18].seekers += 200 - kSum;

/** From update_themes.js — Ch 1 dense 2-shloka themes (Arjuna's lament arc) */
const CH1_UPDATE_THEMES = [
  { shlokas: ['1.28', '1.29'], idea: 'Fear and confusion can take over' },
  { shlokas: ['1.29', '1.30'], idea: 'Fear affects body and mind' },
  { shlokas: ['1.30', '1.31'], idea: 'Confusion makes decisions hard' },
  { shlokas: ['1.31', '1.32'], idea: 'Running away from duty' },
  { shlokas: ['1.33', '1.34'], idea: 'Attachment affects decisions' },
  { shlokas: ['1.34', '1.35'], idea: 'Hard choices with loved ones' },
  { shlokas: ['1.35', '1.36'], idea: 'Saying no to responsibility' },
  { shlokas: ['1.36', '1.37'], idea: 'Overthinking outcomes' },
  { shlokas: ['1.38', '1.39'], idea: 'Overthinking leads to stress' },
  { shlokas: ['1.40', '1.41'], idea: 'Confusion clouds right thinking' },
  { shlokas: ['1.41', '1.42'], idea: 'One negative thought leads to another' },
  { shlokas: ['1.42', '1.43'], idea: 'Fear of losing everything' },
  { shlokas: ['1.44', '1.45'], idea: 'Giving up mentally' },
  { shlokas: ['1.46', '1.47'], idea: 'Shutting down and quitting' },
];

/** From update_themes.js — Ch 15 upside-down tree arc */
const CH15_UPDATE_THEMES = [
  { shlokas: ['15.1', '15.2'], idea: 'Life is like a growing tree' },
  { shlokas: ['15.2', '15.3'], idea: 'Cut unnecessary attachments' },
  { shlokas: ['15.3', '15.4'], idea: 'Look for what is real' },
  { shlokas: ['15.4', '15.5'], idea: 'Purity leads to higher understanding' },
  { shlokas: ['15.6', '15.7'], idea: 'Real light is inside you' },
  { shlokas: ['15.7', '15.8'], idea: 'Soul continues its journey' },
  { shlokas: ['15.8', '15.9'], idea: 'We carry habits and impressions' },
  { shlokas: ['15.10', '15.11'], idea: 'Not everyone understands deeply' },
  { shlokas: ['15.12', '15.13'], idea: 'Life energy is everywhere' },
  { shlokas: ['15.13', '15.14'], idea: 'What we consume shapes us' },
  { shlokas: ['15.14', '15.15'], idea: 'Understanding comes from within' },
  { shlokas: ['15.16', '15.17'], idea: 'Some things change, some do not' },
  { shlokas: ['15.17', '15.18'], idea: 'There is something higher than all' },
  { shlokas: ['15.18', '15.19'], idea: 'Knowing truth brings wisdom' },
  { shlokas: ['15.19', '15.20'], idea: 'Understanding life leads to fulfillment' },
];

const IDEA_LABELS = {
  1: {
    seeds: [
      'Look carefully before you begin',
      'Fear and confusion can take over',
      'Confusion makes decisions hard',
      'Attachment affects decisions',
      'Overthinking leads to stress',
      'Giving up mentally',
      'Shutting down and quitting',
    ],
  },
};

function clustersFromUpdateThemes(chId, themes, quota) {
  return themes.slice(0, quota).map((t, i) => ({
    shlokas: t.shlokas,
    idea: t.idea,
    priority: i < 3 ? 1 : 2,
  }));
}

function toIds(ch, nums) {
  return nums.map((n) => `${ch}.${n}`);
}

/** Ensure 2–3 verse numbers within chapter bounds */
function normalizeCluster(ch, nums, maxVerse) {
  let v = [...nums].filter((n) => n >= 1 && n <= maxVerse);
  if (v.length === 0) v = [1, 2];
  if (v.length === 1) {
    if (v[0] < maxVerse) v.push(v[0] + 1);
    else v.unshift(v[0] - 1);
  }
  if (v.length > 3) v = v.slice(0, 3);
  while (v.length < 2) {
    const last = v[v.length - 1];
    if (last < maxVerse) v.push(last + 1);
    else v.unshift(v[0] - 1);
  }
  return v;
}

function chapterLessons(chId) {
  return BLUEPRINTS.find((b) => b.id === chId)?.lessons || [];
}

function anchorVerses(entry) {
  return Array.isArray(entry) ? entry : entry.verses || entry;
}

function clustersFromAnchors(ch, anchors, maxVerse, quota, defaultIdea, level) {
  const lessons = chapterLessons(ch);
  const raw = anchors.map((entry, i) => {
    const nums = anchorVerses(entry);
    const idea =
      (typeof entry === 'object' && !Array.isArray(entry) && entry.idea) ||
      IDEA_LABELS[ch]?.[level]?.[i] ||
      lessons[i % lessons.length]?.idea ||
      defaultIdea;
    return {
      shlokas: toIds(ch, normalizeCluster(ch, nums, maxVerse)),
      idea,
      ideaTe: lessons[i % lessons.length]?.ideaTe,
      moral: lessons[i % lessons.length]?.moral,
      moralTe: lessons[i % lessons.length]?.moralTe,
      priority: i < 3 ? 1 : 2,
    };
  });

  if (raw.length >= quota) return raw.slice(0, quota);

  const out = [...raw];
  let cursor = 1;
  while (out.length < quota) {
    const lesson = lessons[out.length % lessons.length];
    const start = cursor;
    const end = Math.min(cursor + 2, maxVerse);
    out.push({
      shlokas: toIds(ch, normalizeCluster(ch, [start, end], maxVerse)),
      idea: lesson?.idea || defaultIdea,
      ideaTe: lesson?.ideaTe,
      moral: lesson?.moral,
      moralTe: lesson?.moralTe,
      priority: 2,
    });
    cursor += 3;
    if (cursor > maxVerse) cursor = 1;
  }
  return out;
}

function buildChapter(chId, verseCount) {
  const famous = FAMOUS[chId] || { seeds: [], seekers: [] };
  const q = QUOTAS[chId];
  const chapterTheme =
    chaptersConfig.chapters.find((c) => c.id === chId)?.theme || `Chapter ${chId}`;

  if (chId === 1) {
    const seedPicks = [0, 2, 4, 8, 12, 13].map((i) => CH1_UPDATE_THEMES[i]);
    const seeds = [
      {
        shlokas: ['1.1', '1.20'],
        idea: 'Look carefully before you begin',
        priority: 1,
      },
      ...clustersFromUpdateThemes(1, seedPicks, q.seeds - 1),
    ];
    return {
      seeds,
      seekers: clustersFromUpdateThemes(1, CH1_UPDATE_THEMES, q.seekers),
    };
  }

  if (chId === 15) {
    return {
      seeds: clustersFromUpdateThemes(15, CH15_UPDATE_THEMES, q.seeds),
      seekers: clustersFromUpdateThemes(15, CH15_UPDATE_THEMES, q.seekers),
    };
  }

  return {
    seeds: clustersFromAnchors(chId, famous.seeds, verseCount, q.seeds, chapterTheme, 'seeds'),
    seekers: clustersFromAnchors(
      chId,
      famous.seekers,
      verseCount,
      q.seekers,
      `${chapterTheme} — deeper look`,
      'seekers'
    ),
  };
}

function main() {
  const gita = {};
  chaptersConfig.chapters.forEach((c) => {
    gita[String(c.id)] = buildChapter(c.id, c.count);
  });

  const payload = {
    meta: {
      version: 1,
      seedsTotal: 100,
      seekersTotal: 200,
      shlokasPerCluster: '2-3',
      quotas: QUOTAS,
    },
    gita,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8');

  let seeds = 0;
  let seekers = 0;
  const errors = [];
  for (const [ch, data] of Object.entries(gita)) {
    seeds += data.seeds.length;
    seekers += data.seekers.length;
    for (const level of ['seeds', 'seekers']) {
      data[level].forEach((cluster, i) => {
        const n = cluster.shlokas.length;
        if (n < 2 || n > 3) errors.push(`Ch ${ch} ${level}[${i}]: ${n} shlokas`);
      });
    }
  }

  console.log(`Wrote ${OUT}`);
  console.log(`Seeds: ${seeds} (target 100), Seekers: ${seekers} (target 200)`);
  if (errors.length) {
    console.error('Validation errors:', errors.slice(0, 10));
    process.exit(1);
  }
}

main();
