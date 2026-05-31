/**
 * Build themes_seeds.json / themes_seekers.json from clusters + authored stories.
 * Run: node scripts/validate-theme-clusters.js && node scripts/build-themes-from-clusters.js
 */
const fs = require('fs');
const path = require('path');

const { DATA_DIR } = require('./lib/data-dir');
const CLUSTERS_PATH = path.join(__dirname, 'data', 'gita-theme-clusters.json');
const AUTHORED_PATH = path.join(__dirname, 'data', 'gita-theme-stories-authored.json');

function main() {
  const clusters = JSON.parse(fs.readFileSync(CLUSTERS_PATH, 'utf8'));
  const authored = JSON.parse(fs.readFileSync(AUTHORED_PATH, 'utf8'));
  const themesSeeds = { gita: {} };
  const themesSeekers = { gita: {} };
  const missing = [];

  for (const [ch, data] of Object.entries(clusters.gita)) {
    themesSeeds.gita[ch] = [];
    themesSeekers.gita[ch] = [];

    for (const level of ['seeds', 'seekers']) {
      const out = level === 'seeds' ? themesSeeds.gita[ch] : themesSeekers.gita[ch];
      const prefix = level === 'seeds' ? 'sd' : 'sk';
      (data[level] || []).forEach((cluster, i) => {
        const id =
          cluster.id || `${prefix}${ch}_${String(i + 1).padStart(2, '0')}`;
        const story = authored.stories[id];
        if (!story) {
          missing.push(id);
          return;
        }
        const themeNum = id.split('_')[1];
        out.push({
          id: `theme_${prefix}${ch}_${themeNum}`,
          title: story.title,
          title_te: story.title_te,
          emoji: story.emoji,
          micro_theme: story.micro_theme,
          micro_theme_te: story.micro_theme_te,
          shlokas: cluster.shlokas,
          story: {
            title: story.storyTitle,
            title_te: story.storyTitle_te,
            content: story.content,
            content_te: story.content_te,
            moral: story.moral,
            moral_te: story.moral_te,
          },
          activity: story.activity,
          activity_te: story.activity_te,
          videoUrl: '',
        });
      });
    }
  }

  if (missing.length) {
    console.error(`Missing ${missing.length} authored stories. Run: node scripts/seed-authored-stories.js`);
    console.error(missing.slice(0, 15).join(', '));
    process.exit(1);
  }

  fs.writeFileSync(path.join(DATA_DIR, 'themes_seeds.json'), JSON.stringify(themesSeeds, null, 2), 'utf8');
  fs.writeFileSync(path.join(DATA_DIR, 'themes_seekers.json'), JSON.stringify(themesSeekers, null, 2), 'utf8');

  let s = 0;
  let k = 0;
  for (const d of Object.values(themesSeeds.gita)) s += d.length;
  for (const d of Object.values(themesSeekers.gita)) k += d.length;
  console.log(`✅ themes_seeds: ${s} themes, themes_seekers: ${k} themes`);
}

main();
