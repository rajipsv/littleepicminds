/**
 * Build scripts/data/gita-theme-stories-authored.json from clusters + gold sources.
 * Run: node scripts/seed-authored-stories.js
 */
const fs = require('fs');
const path = require('path');
const { buildAuthoredEntry, shlokaKey } = require('./lib/theme-story-builder');

const ROOT = path.join(__dirname, '..');
const CLUSTERS = path.join(__dirname, 'data', 'gita-theme-clusters.json');
const OUT = path.join(__dirname, 'data', 'gita-theme-stories-authored.json');

/** Ch1 + Ch15 micro-stories from update_themes.js (parsed once at build time) */
function loadUpdateThemes() {
  const updatePath = path.join(ROOT, 'update_themes.js');
  const src = fs.readFileSync(updatePath, 'utf8');
  const updateByKey = {};
  const extractArray = (name) => {
    const start = src.indexOf(`const ${name} = [`);
    if (start < 0) return [];
    let depth = 0;
    let i = src.indexOf('[', start);
    const begin = i;
    for (; i < src.length; i++) {
      if (src[i] === '[') depth++;
      else if (src[i] === ']') {
        depth--;
        if (depth === 0) {
          return Function(`"use strict"; return (${src.slice(begin, i + 1)})`)();
        }
      }
    }
    return [];
  };
  for (const arr of [extractArray('ch1Themes'), extractArray('ch15Themes')]) {
    for (const ut of arr) {
      if (ut.shlokas?.length) updateByKey[shlokaKey(ut.shlokas)] = ut;
    }
  }
  return updateByKey;
}

function main() {
  const clusters = JSON.parse(fs.readFileSync(CLUSTERS, 'utf8'));
  const themes = {
    seeds: { gita: require(path.join(ROOT, 'backend', 'data', 'themes_seeds.json')).gita },
    seekers: { gita: require(path.join(ROOT, 'backend', 'data', 'themes_seekers.json')).gita },
  };
  const { getMoralStory } = require('./gita-theme-stories');
  const sources = { themes, updateByKey: loadUpdateThemes(), getMoralStory };
  const stories = {};

  for (const [ch, data] of Object.entries(clusters.gita)) {
    for (const level of ['seeds', 'seekers']) {
      (data[level] || []).forEach((cluster, i) => {
        const prefix = level === 'seeds' ? 's' : 'sk';
        const id = `${prefix}${ch}_${String(i + 1).padStart(2, '0')}`;
        stories[id] = buildAuthoredEntry(id, cluster, Number(ch), level, i, sources);
      });
    }
  }

  fs.writeFileSync(OUT, JSON.stringify({ version: 1, stories }, null, 2), 'utf8');
  console.log(`Wrote ${OUT} with ${Object.keys(stories).length} stories`);
}

main();
