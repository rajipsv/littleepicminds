/**
 * Apply gita-seekers-curriculum.json → gita-theme-clusters.json (seekers only).
 * Migrates old sk stories to new IDs by shloka overlap (keeps handcrafted pilots).
 *
 * Run: npm run gita:sync-seekers-curriculum
 */
const fs = require('fs');
const path = require('path');
const { normalizeShlokas } = require('./lib/shloka-range');
const { isPlaceholderStory } = require('./lib/story-quality');

const CURRICULUM_PATH = path.join(__dirname, 'data', 'gita-seekers-curriculum.json');
const CLUSTERS_PATH = path.join(__dirname, 'data', 'gita-theme-clusters.json');
const AUTHORED_PATH = path.join(__dirname, 'data', 'gita-theme-stories-authored.json');

function overlap(a, b) {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x)).length;
}

function migrateByOverlap(authored, newClusters) {
  if (!authored.stories) authored.stories = {};
  const oldSk = Object.entries(authored.stories).filter(([id]) => /^sk\d+_\d+$/.test(id));
  let moved = 0;

  for (const cluster of newClusters) {
    const targetId = cluster.id;
    if (authored.stories[targetId] && !isPlaceholderStory(authored.stories[targetId])) continue;

    let best = null;
    let bestScore = 0;
    for (const [oldId, story] of oldSk) {
      const oldSh = story._shlokas || [];
      const score = overlap(cluster.shlokas, oldSh);
      if (score > bestScore) {
        bestScore = score;
        best = { oldId, story };
      }
    }
    if (best && bestScore >= 2) {
      authored.stories[targetId] = {
        ...best.story,
        id: targetId,
        micro_theme: cluster.idea,
        micro_theme_te: cluster.ideaTe || best.story.micro_theme_te || '',
      };
      moved++;
    }
  }
  return moved;
}

/** Tag old stories with shlokas from previous clusters file if present */
function tagOldShlokas(authored, clusters) {
  for (const [ch, data] of Object.entries(clusters.gita || {})) {
    (data.seekers || []).forEach((c, i) => {
      const id = c.id || `sk${ch}_${String(i + 1).padStart(2, '0')}`;
      if (authored.stories[id] && !authored.stories[id]._shlokas) {
        authored.stories[id]._shlokas = c.shlokas;
      }
    });
  }
}

function main() {
  const curriculum = JSON.parse(fs.readFileSync(CURRICULUM_PATH, 'utf8'));
  const clusters = JSON.parse(fs.readFileSync(CLUSTERS_PATH, 'utf8'));
  const authored = fs.existsSync(AUTHORED_PATH)
    ? JSON.parse(fs.readFileSync(AUTHORED_PATH, 'utf8'))
    : { version: 1, stories: {} };

  tagOldShlokas(authored, clusters);

  const allNewSeekers = [];
  let seekersTotal = 0;

  for (const [ch, chData] of Object.entries(curriculum.chapters)) {
    const seekers = chData.themes.map((t, i) => {
      const shlokas = normalizeShlokas(t.shlokas);
      return {
        id: t.id,
        shlokas,
        idea: t.theme,
        ideaTe: t.theme_te || '',
        chapterTitle: chData.title,
        priority: i < Math.ceil(chData.themes.length / 2) ? 1 : 2,
      };
    });
    if (!clusters.gita[ch]) clusters.gita[ch] = { seeds: [], seekers: [] };
    clusters.gita[ch].seekers = seekers;
    clusters.meta.quotas[ch] = {
      seeds: clusters.meta.quotas?.[ch]?.seeds ?? (clusters.gita[ch].seeds || []).length,
      seekers: seekers.length,
    };
    seekersTotal += seekers.length;
    allNewSeekers.push(...seekers);
  }

  clusters.meta.seekersTotal = seekersTotal;
  clusters.meta.seekersCurriculumVersion = curriculum.meta.version;

  const moved = migrateByOverlap(authored, allNewSeekers);

  // Store shlokas on migrated entries for future syncs
  for (const c of allNewSeekers) {
    if (authored.stories[c.id]) authored.stories[c.id]._shlokas = c.shlokas;
  }

  fs.writeFileSync(CLUSTERS_PATH, JSON.stringify(clusters, null, 2), 'utf8');
  fs.writeFileSync(AUTHORED_PATH, JSON.stringify(authored, null, 2), 'utf8');

  console.log(`✅ Synced ${seekersTotal} seeker themes (sk*) into clusters`);
  console.log(`   Migrated ${moved} stories by shloka overlap`);
  console.log('Next: node scripts/fill-missing-authored-stories.js && npm run gita:build-themes');
}

main();
