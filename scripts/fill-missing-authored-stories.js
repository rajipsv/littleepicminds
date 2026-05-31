/**
 * Add template stories only for missing cluster IDs (keeps handcrafted entries).
 * Run after sync-seeds-curriculum when ChatGPT stories are not all ready yet.
 */
const fs = require('fs');
const path = require('path');
const { buildAuthoredEntry } = require('./lib/theme-story-builder');

const CLUSTERS = path.join(__dirname, 'data', 'gita-theme-clusters.json');
const OUT = path.join(__dirname, 'data', 'gita-theme-stories-authored.json');
const ROOT = path.join(__dirname, '..');

function main() {
  const clusters = JSON.parse(fs.readFileSync(CLUSTERS, 'utf8'));
  const authored = fs.existsSync(OUT)
    ? JSON.parse(fs.readFileSync(OUT, 'utf8'))
    : { version: 1, stories: {} };
  if (!authored.stories) authored.stories = {};

  const themes = {
    seeds: { gita: require(path.join(ROOT, 'lib', 'data', 'themes_seeds.json')).gita },
    seekers: { gita: require(path.join(ROOT, 'lib', 'data', 'themes_seekers.json')).gita },
  };
  const { getMoralStory } = require('./gita-theme-stories');
  const sources = { themes, updateByKey: {}, getMoralStory };

  let added = 0;
  for (const [ch, data] of Object.entries(clusters.gita)) {
    for (const level of ['seeds', 'seekers']) {
      (data[level] || []).forEach((cluster, i) => {
        const prefix = level === 'seeds' ? 'sd' : 'sk';
        const id = cluster.id || `${prefix}${ch}_${String(i + 1).padStart(2, '0')}`;
        if (authored.stories[id]) return;
        authored.stories[id] = buildAuthoredEntry(id, cluster, Number(ch), level, i, sources);
        added++;
      });
    }
  }

  fs.writeFileSync(OUT, JSON.stringify(authored, null, 2), 'utf8');
  console.log(`Added ${added} missing stories to ${OUT}`);
}

main();
