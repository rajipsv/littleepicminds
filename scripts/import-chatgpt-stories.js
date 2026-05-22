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
 *      node scripts/import-chatgpt-stories.js --only-placeholders
 *      npm run gita:import-chatgpt-stories
 */
const fs = require('fs');
const path = require('path');
const { isPlaceholderStory } = require('./lib/story-quality');

const DEFAULT_IMPORT = path.join(__dirname, 'data', 'chatgpt-stories-import.json');

function resolveImportPath() {
  const fileArg = process.argv.find((a) => a.startsWith('--file='));
  if (fileArg) return path.resolve(process.cwd(), fileArg.slice(7));
  return DEFAULT_IMPORT;
}
const AUTHORED_PATH = path.join(__dirname, 'data', 'gita-theme-stories-authored.json');
const CLUSTERS_PATH = path.join(__dirname, 'data', 'gita-theme-clusters.json');

const REQUIRED = ['title', 'content', 'moral', 'activity'];

function allStoryIds() {
  const clusters = JSON.parse(fs.readFileSync(CLUSTERS_PATH, 'utf8'));
  const ids = [];
  for (const [ch, data] of Object.entries(clusters.gita)) {
    for (const level of ['seeds', 'seekers']) {
      const prefix = level === 'seeds' ? 'sd' : 'sk';
      (data[level] || []).forEach((cluster, i) => {
        ids.push(cluster.id || `${prefix}${ch}_${String(i + 1).padStart(2, '0')}`);
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

function parseArgs() {
  return { onlyPlaceholders: process.argv.includes('--only-placeholders') };
}

function main() {
  const { onlyPlaceholders } = parseArgs();
  const IMPORT_PATH = resolveImportPath();
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

  let skippedComplete = 0;

  for (const id of expectedIds) {
    if (incoming[id]) {
      const existing = authored.stories[id];
      if (onlyPlaceholders && existing && !isPlaceholderStory(existing)) {
        skippedComplete++;
        continue;
      }
      const entry = incoming[id];
      const missing = REQUIRED.filter((f) => !entry[f] || !String(entry[f]).trim());
      if (missing.length) warnings.push(`${id}: missing ${missing.join(', ')}`);
      authored.stories[id] = mergeEntry(existing, entry, id);
      merged++;
    }
  }

  const extra = Object.keys(incoming).filter((k) => !expectedIds.includes(k));
  fs.writeFileSync(AUTHORED_PATH, JSON.stringify(authored, null, 2), 'utf8');

  console.log(`Merged ${merged} / ${expectedIds.length} stories into ${AUTHORED_PATH}`);
  if (skippedComplete) console.log(`Skipped ${skippedComplete} already-complete stories (--only-placeholders).`);
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
