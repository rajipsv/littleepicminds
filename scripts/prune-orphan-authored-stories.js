/**
 * Remove authored stories whose IDs are not in gita-theme-clusters.json.
 * Run after curriculum shrink (e.g. 80→61 books).
 */
const fs = require('fs');
const path = require('path');

const CLUSTERS = path.join(__dirname, 'data', 'gita-theme-clusters.json');
const AUTHORED = path.join(__dirname, 'data', 'gita-theme-stories-authored.json');

function main() {
  const clusters = JSON.parse(fs.readFileSync(CLUSTERS, 'utf8'));
  const authored = JSON.parse(fs.readFileSync(AUTHORED, 'utf8'));
  if (!authored.stories) authored.stories = {};

  const valid = new Set();
  for (const data of Object.values(clusters.gita)) {
    for (const level of ['seeds', 'seekers']) {
      for (const t of data[level] || []) valid.add(t.id);
    }
  }

  const removed = [];
  for (const id of Object.keys(authored.stories)) {
    if (!valid.has(id)) {
      delete authored.stories[id];
      removed.push(id);
    }
  }

  fs.writeFileSync(AUTHORED, JSON.stringify(authored, null, 2), 'utf8');
  console.log(`Pruned ${removed.length} orphan stories (kept ${valid.size} curriculum IDs)`);
  if (removed.length) console.log(removed.slice(0, 20).join(', ') + (removed.length > 20 ? '...' : ''));
}

main();
