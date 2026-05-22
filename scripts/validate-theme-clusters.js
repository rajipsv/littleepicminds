/**
 * Validate scripts/data/gita-theme-clusters.json
 * Run: node scripts/validate-theme-clusters.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CLUSTERS_PATH = path.join(__dirname, 'data', 'gita-theme-clusters.json');
const CHAPTERS_JSON = path.join(ROOT, 'backend', 'data', 'chapters.json');
const CHAPTERS_DIR = path.join(ROOT, 'backend', 'data', 'chapters');

function loadChapterVerseIds(ch) {
  const mod = require(path.join(CHAPTERS_DIR, `chapter${ch}.js`));
  const keys = Object.keys(mod);
  if (keys.some((k) => /^\d+\.\d+$/.test(k))) return new Set(keys);
  const wrap = mod[keys.find((k) => k.startsWith('CHAPTER_'))] || {};
  return new Set(Object.keys(wrap));
}

function main() {
  const clusters = JSON.parse(fs.readFileSync(CLUSTERS_PATH, 'utf8'));
  const chaptersConfig = JSON.parse(fs.readFileSync(CHAPTERS_JSON, 'utf8'));
  const errors = [];
  let seeds = 0;
  let seekers = 0;

  for (const chMeta of chaptersConfig.chapters) {
    const ch = String(chMeta.id);
    const data = clusters.gita[ch];
    const quota = clusters.meta.quotas[ch];
    if (!data) {
      errors.push(`Chapter ${ch}: missing in clusters.gita`);
      continue;
    }
    const verseIds = loadChapterVerseIds(chMeta.id);

    for (const level of ['seeds', 'seekers']) {
      const list = data[level] || [];
      const expected = quota[level];
      if (list.length !== expected) {
        errors.push(`Chapter ${ch} ${level}: count ${list.length}, expected ${expected}`);
      }
      list.forEach((cluster, i) => {
        const n = cluster.shlokas?.length || 0;
        if (level === 'seeds') {
          if (n !== 2) errors.push(`Chapter ${ch} seeds[${i}] (${cluster.id || i}): ${n} shlokas (need exactly 2)`);
        } else if (n < 1 || n > 3) {
          errors.push(`Chapter ${ch} seekers[${i}] (${cluster.id || i}): ${n} shlokas (need 1-3)`);
        }
        if (!cluster.idea) {
          errors.push(`Chapter ${ch} ${level}[${i}]: missing idea`);
        }
        for (const id of cluster.shlokas || []) {
          if (!verseIds.has(id)) {
            errors.push(`Chapter ${ch} ${level}[${i}]: unknown shloka ${id}`);
          }
        }
      });
      if (level === 'seeds') seeds += list.length;
      else seekers += list.length;
    }
  }

  const expectedSeeds = clusters.meta.seedsTotal ?? 100;
  if (seeds !== expectedSeeds) errors.push(`Global seeds: ${seeds}, expected ${expectedSeeds}`);
  const expectedSeekers = clusters.meta.seekersTotal ?? 200;
  if (seekers !== expectedSeekers) errors.push(`Global seekers: ${seekers}, expected ${expectedSeekers}`);

  if (errors.length) {
    console.error('❌ Cluster validation failed:\n' + errors.slice(0, 30).join('\n'));
    if (errors.length > 30) console.error(`... and ${errors.length - 30} more`);
    process.exit(1);
  }
  console.log(`✅ Clusters valid: ${seeds} seeds, ${seekers} seekers, verses present in chapter data`);
}

main();
