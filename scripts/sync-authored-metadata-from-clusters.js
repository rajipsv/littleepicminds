/**
 * Align authored story titles/shlokas with gita-theme-clusters.json.
 * Skips handcrafted complete stories (sd1_01, sd1_02, etc.).
 */
const fs = require('fs');
const path = require('path');
const { isCompleteStory } = require('./lib/story-quality');

const CLUSTERS = path.join(__dirname, 'data', 'gita-theme-clusters.json');
const AUTHORED = path.join(__dirname, 'data', 'gita-theme-stories-authored.json');

function main() {
  const clusters = JSON.parse(fs.readFileSync(CLUSTERS, 'utf8'));
  const authored = JSON.parse(fs.readFileSync(AUTHORED, 'utf8'));
  if (!authored.stories) authored.stories = {};

  let updated = 0;
  let skipped = 0;

  for (const [ch, data] of Object.entries(clusters.gita)) {
    for (const level of ['seeds', 'seekers']) {
      for (const cluster of data[level] || []) {
        const story = authored.stories[cluster.id];
        if (!story) continue;
        if (isCompleteStory(story)) {
          skipped++;
          story._shlokas = cluster.shlokas;
          continue;
        }
        story.title = cluster.idea;
        story.micro_theme = cluster.idea;
        story.micro_theme_te = cluster.ideaTe || '';
        story._shlokas = cluster.shlokas;
        updated++;
      }
    }
  }

  fs.writeFileSync(AUTHORED, JSON.stringify(authored, null, 2), 'utf8');
  console.log(`Synced metadata for ${updated} placeholder stories (skipped ${skipped} complete)`);
}

main();
