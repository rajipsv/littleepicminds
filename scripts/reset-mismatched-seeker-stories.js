/**
 * Remove seeker stories whose shlokas no longer match the curriculum cluster.
 * Then run: node scripts/fill-missing-authored-stories.js
 */
const fs = require('fs');
const path = require('path');

const CLUSTERS_PATH = path.join(__dirname, 'data', 'gita-theme-clusters.json');
const AUTHORED_PATH = path.join(__dirname, 'data', 'gita-theme-stories-authored.json');

function overlap(a, b) {
  const setB = new Set(b || []);
  return (a || []).filter((x) => setB.has(x)).length;
}

function main() {
  const clusters = JSON.parse(fs.readFileSync(CLUSTERS_PATH, 'utf8'));
  const authored = JSON.parse(fs.readFileSync(AUTHORED_PATH, 'utf8'));
  let removed = 0;

  for (const [ch, data] of Object.entries(clusters.gita)) {
    for (const cluster of data.seekers || []) {
      const id = cluster.id;
      const story = authored.stories[id];
      if (!story) continue;
      const oldSh = story._shlokas || cluster.shlokas;
      if (overlap(oldSh, cluster.shlokas) < 2) {
        delete authored.stories[id];
        removed++;
      } else {
        authored.stories[id]._shlokas = cluster.shlokas;
        authored.stories[id].micro_theme = cluster.idea;
      }
    }
  }

  fs.writeFileSync(AUTHORED_PATH, JSON.stringify(authored, null, 2), 'utf8');
  console.log(`Removed ${removed} mismatched seeker stories. Run fill-missing-authored-stories.js next.`);
}

main();
