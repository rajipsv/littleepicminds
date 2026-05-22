/**
 * Apply gita-seeds-curriculum.json → gita-theme-clusters.json (seeds only).
 * Migrates legacy s{ch}_* / sk-pilot overlaps to sd{ch}_* where themes match.
 *
 * Run: npm run gita:sync-seeds-curriculum
 */
const fs = require('fs');
const path = require('path');
const { normalizeShlokas } = require('./lib/shloka-range');

const CURRICULUM_PATH = path.join(__dirname, 'data', 'gita-seeds-curriculum.json');
const CLUSTERS_PATH = path.join(__dirname, 'data', 'gita-theme-clusters.json');
const AUTHORED_PATH = path.join(__dirname, 'data', 'gita-theme-stories-authored.json');

const LEGACY_TO_SD = {
  s1_01: 'sd1_05',
  s1_02: 'sd1_06',
  s1_03: 'sd1_07',
  s1_04: 'sd1_08',
  s1_05: 'sd1_09',
  s1_06: 'sd1_10',
  s1_07: 'sd1_10',
};

function migrateAuthored(authored) {
  if (!authored.stories) authored.stories = {};
  let moved = 0;
  for (const [oldId, newId] of Object.entries(LEGACY_TO_SD)) {
    const src = authored.stories[oldId];
    if (!src) continue;
    const dst = authored.stories[newId];
    if (!dst || require('./lib/story-quality').isPlaceholderStory(dst)) {
      authored.stories[newId] = {
        ...src,
        id: newId,
        micro_theme: src.micro_theme,
      };
      moved++;
    }
  }
  return moved;
}

function main() {
  const curriculum = JSON.parse(fs.readFileSync(CURRICULUM_PATH, 'utf8'));
  const clusters = JSON.parse(fs.readFileSync(CLUSTERS_PATH, 'utf8'));
  const authored = fs.existsSync(AUTHORED_PATH)
    ? JSON.parse(fs.readFileSync(AUTHORED_PATH, 'utf8'))
    : { version: 1, stories: {} };

  const quotas = {};
  let seedsTotal = 0;

  for (const [ch, chData] of Object.entries(curriculum.chapters)) {
    const seeds = chData.themes.map((t, i) => ({
      id: t.id,
      shlokas: normalizeShlokas(t.shlokas),
      idea: t.theme,
      ideaTe: t.theme_te || '',
      chapterTitle: chData.title,
      priority: i < Math.ceil(chData.themes.length / 2) ? 1 : 2,
    }));
    if (!clusters.gita[ch]) clusters.gita[ch] = { seeds: [], seekers: clusters.gita[ch]?.seekers || [] };
    clusters.gita[ch].seeds = seeds;
    quotas[ch] = {
      seeds: seeds.length,
      seekers: clusters.meta.quotas?.[ch]?.seekers ?? (clusters.gita[ch].seekers || []).length,
    };
    seedsTotal += seeds.length;
  }

  clusters.meta.seedsTotal = seedsTotal;
  clusters.meta.seedsCurriculumVersion = curriculum.meta.version;
  clusters.meta.quotas = quotas;
  clusters.meta.shlokasPerCluster = '2 (seeds curriculum)';

  const moved = migrateAuthored(authored);

  fs.writeFileSync(CLUSTERS_PATH, JSON.stringify(clusters, null, 2), 'utf8');
  fs.writeFileSync(AUTHORED_PATH, JSON.stringify(authored, null, 2), 'utf8');

  console.log(`✅ Synced ${seedsTotal} seed themes (sd*) into clusters`);
  console.log(`   Migrated ${moved} legacy s1_* stories → sd1_*`);
  console.log('Next: npm run gita:validate-clusters');
}

main();
