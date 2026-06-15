/**
 * Write Pandit roadmap v3 → gita-seeds-curriculum.json + gita-seekers-curriculum.json
 * Run: node scripts/apply-pandit-curriculum-v3.js
 */
const fs = require('fs');
const path = require('path');
const roadmap = require('./data/pandit-roadmap-curriculum-v3');

const SEEDS_PATH = path.join(__dirname, 'data', 'gita-seeds-curriculum.json');
const SEEKERS_PATH = path.join(__dirname, 'data', 'gita-seekers-curriculum.json');

const EXPECTED = {
  seeds: 60,
  seekers: 60,
};

function stringifyChapters(chapters) {
  const out = {};
  for (const [ch, data] of Object.entries(chapters)) {
    out[String(ch)] = {
      title: data.title,
      themes: data.themes.map((t) => ({
        id: t.id,
        shlokas: t.shlokas,
        theme: t.theme,
        ...(t.theme_te ? { theme_te: t.theme_te } : {}),
      })),
    };
  }
  return out;
}

function countThemes(chapters) {
  return Object.values(chapters).reduce((n, ch) => n + ch.themes.length, 0);
}

function main() {
  const seedsDoc = {
    meta: roadmap.seeds.meta,
    chapters: stringifyChapters(roadmap.seeds.chapters),
  };
  const seekersDoc = {
    meta: roadmap.seekers.meta,
    chapters: stringifyChapters(roadmap.seekers.chapters),
  };

  const seedsCount = countThemes(roadmap.seeds.chapters);
  const seekersCount = countThemes(roadmap.seekers.chapters);

  if (seedsCount !== EXPECTED.seeds) {
    throw new Error(`Seeds count ${seedsCount} !== ${EXPECTED.seeds}`);
  }
  if (seekersCount !== EXPECTED.seekers) {
    throw new Error(`Seekers count ${seekersCount} !== ${EXPECTED.seekers}`);
  }

  fs.writeFileSync(SEEDS_PATH, `${JSON.stringify(seedsDoc, null, 2)}\n`);
  fs.writeFileSync(SEEKERS_PATH, `${JSON.stringify(seekersDoc, null, 2)}\n`);

  console.log(`Wrote ${SEEDS_PATH} (${seedsCount} themes, v${seedsDoc.meta.version})`);
  console.log(`Wrote ${SEEKERS_PATH} (${seekersCount} themes, v${seekersDoc.meta.version})`);
}

main();
