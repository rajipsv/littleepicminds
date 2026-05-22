/**
 * Add _shlokas from gita-theme-clusters.json to import JSON stories (reference for authors).
 *
 *   node scripts/attach-shlokas-to-import.js --file=scripts/data/chatgpt-stories-import-ch2-all.json
 */
const fs = require('fs');
const path = require('path');

const CLUSTERS_PATH = path.join(__dirname, 'data', 'gita-theme-clusters.json');

function resolveFile() {
  const fileArg = process.argv.find((a) => a.startsWith('--file='));
  if (!fileArg) {
    console.error('Usage: node scripts/attach-shlokas-to-import.js --file=scripts/data/chatgpt-stories-import-ch2-all.json');
    process.exit(1);
  }
  return path.resolve(process.cwd(), fileArg.slice(7));
}

function shlokaById() {
  const clusters = JSON.parse(fs.readFileSync(CLUSTERS_PATH, 'utf8'));
  const map = {};
  for (const data of Object.values(clusters.gita)) {
    for (const level of ['seeds', 'seekers']) {
      for (const c of data[level] || []) {
        if (c.id && c.shlokas?.length) map[c.id] = c.shlokas;
      }
    }
  }
  return map;
}

function main() {
  const file = resolveFile();
  if (!fs.existsSync(file)) {
    console.error(`Missing ${file}`);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const stories = raw.stories || raw;
  const byId = shlokaById();
  let updated = 0;
  for (const [id, story] of Object.entries(stories)) {
    if (!byId[id]) {
      console.warn(`No cluster shlokas for ${id}`);
      continue;
    }
    story._shlokas = [...byId[id]];
    updated++;
  }
  fs.writeFileSync(file, JSON.stringify(raw, null, 2), 'utf8');
  console.log(`Attached _shlokas to ${updated} stories in ${file}`);
}

main();
