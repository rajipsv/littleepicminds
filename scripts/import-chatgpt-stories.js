/**
 * Merge ChatGPT-authored stories into gita-theme-stories-authored.json.
 *
 * Place your filled file at:
 *   scripts/data/chatgpt-stories-import.json
 *
 * Accepts:
 *   { "stories": { "s1_01": { ... }, ... } }
 *   or [ { "id": "s1_01", ... }, ... ]
 *
 * Run: node scripts/import-chatgpt-stories.js
 *      npm run gita:import-chatgpt-stories
 */
const fs = require('fs');
const path = require('path');

const IMPORT_PATH = path.join(__dirname, 'data', 'chatgpt-stories-import.json');
const AUTHORED_PATH = path.join(__dirname, 'data', 'gita-theme-stories-authored.json');
const CLUSTERS_PATH = path.join(__dirname, 'data', 'gita-theme-clusters.json');

const REQUIRED = ['title', 'content', 'moral', 'activity'];

function allStoryIds() {
  const clusters = JSON.parse(fs.readFileSync(CLUSTERS_PATH, 'utf8'));
  const ids = [];
  for (const [ch, data] of Object.entries(clusters.gita)) {
    for (const level of ['seeds', 'seekers']) {
      const prefix = level === 'seeds' ? 's' : 'sk';
      (data[level] || []).forEach((_, i) => {
        ids.push(`${prefix}${ch}_${String(i + 1).padStart(2, '0')}`);
      });
    }
  }
  return ids;
}

function normalizeImport(raw) {
  if (Array.isArray(raw)) {
    const stories = {};
    raw.forEach((item) => {
      const id = item.id || item.story_id;
      if (id) stories[id] = item;
    });
    return stories;
  }
  if (raw.stories) return raw.stories;
  return raw;
}

function mergeEntry(existing, incoming, id) {
  const out = { ...existing, ...incoming, id };
  if (!out.micro_theme && existing?.micro_theme) out.micro_theme = existing.micro_theme;
  if (!out.storyTitle && out.title) out.storyTitle = out.title;
  if (!out.storyTitle_te && out.title_te) out.storyTitle_te = out.title_te;
  return out;
}

function main() {
  if (!fs.existsSync(IMPORT_PATH)) {
    console.error(`Missing ${IMPORT_PATH}`);
    console.error('Copy chatgpt-stories-template.json, fill stories, save as chatgpt-stories-import.json');
    process.exit(1);
  }

  const incoming = normalizeImport(JSON.parse(fs.readFileSync(IMPORT_PATH, 'utf8')));
  const authored = fs.existsSync(AUTHORED_PATH)
    ? JSON.parse(fs.readFileSync(AUTHORED_PATH, 'utf8'))
    : { version: 1, stories: {} };
  if (!authored.stories) authored.stories = {};

  const expectedIds = allStoryIds();
  let merged = 0;
  const warnings = [];

  for (const id of expectedIds) {
    if (incoming[id]) {
      const entry = incoming[id];
      const missing = REQUIRED.filter((f) => !entry[f] || !String(entry[f]).trim());
      if (missing.length) warnings.push(`${id}: missing ${missing.join(', ')}`);
      authored.stories[id] = mergeEntry(authored.stories[id], entry, id);
      merged++;
    }
  }

  const extra = Object.keys(incoming).filter((k) => !expectedIds.includes(k));
  fs.writeFileSync(AUTHORED_PATH, JSON.stringify(authored, null, 2), 'utf8');

  console.log(`Merged ${merged} / ${expectedIds.length} stories into ${AUTHORED_PATH}`);
  if (extra.length) console.log(`Ignored ${extra.length} unknown ids: ${extra.slice(0, 5).join(', ')}...`);
  if (warnings.length) {
    console.warn(`Warnings (${warnings.length}):`);
    warnings.slice(0, 10).forEach((w) => console.warn(`  ${w}`));
  }
  if (merged < expectedIds.length) {
    console.warn(`Still missing ${expectedIds.length - merged} stories.`);
  }
}

main();
