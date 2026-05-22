/**
 * Export flat cluster list for ChatGPT story writing.
 * Outputs JSON + CSV with story_id, idea, shlokas, and verse summaries.
 *
 * Run: node scripts/export-clusters-for-chatgpt.js
 *      npm run gita:export-for-chatgpt
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CLUSTERS_PATH = path.join(__dirname, 'data', 'gita-theme-clusters.json');
const OUT_DIR = path.join(__dirname, 'data');
const CHAPTERS_DIR = path.join(ROOT, 'backend', 'data', 'chapters');

function loadChapter(ch) {
  const mod = require(path.join(CHAPTERS_DIR, `chapter${ch}.js`));
  const keys = Object.keys(mod);
  if (keys.some((k) => /^\d+\.\d+$/.test(k))) return mod;
  const wrap = keys.find((k) => k.startsWith('CHAPTER_'));
  return mod[wrap] || mod;
}

function verseSummary(ch, shlokaId, level) {
  const data = loadChapter(ch);
  const v = data[shlokaId];
  if (!v) return { en: '(verse not found)', te: '' };
  const useChild = level === 'seeds';
  return {
    en: (useChild ? v.en?.childMeaning : v.en?.meaning) || v.en?.childMeaning || v.en?.meaning || '',
    te: (useChild ? v.te?.childMeaning : v.te?.meaning) || v.te?.childMeaning || v.te?.meaning || '',
    transliteration: v.transliteration || '',
  };
}

function storyId(ch, level, index) {
  const prefix = level === 'seeds' ? 's' : 'sk';
  return `${prefix}${ch}_${String(index + 1).padStart(2, '0')}`;
}

function ageHint(level) {
  return level === 'seeds' ? '5-7 years (simple school/home analogies)' : '8-10 years (deeper, can mention Arjuna/Krishna)';
}

function main() {
  const clusters = JSON.parse(fs.readFileSync(CLUSTERS_PATH, 'utf8'));
  const rows = [];
  const templates = { version: 1, instructions: 'Fill content fields. Keep story_id and micro_theme unchanged. Return JSON array or stories object.', stories: {} };

  for (const [ch, data] of Object.entries(clusters.gita)) {
    for (const level of ['seeds', 'seekers']) {
      (data[level] || []).forEach((cluster, i) => {
        const id = storyId(ch, level, i);
        const summaries = cluster.shlokas.map((sid) => {
          const s = verseSummary(Number(ch), sid, level);
          return { shloka: sid, en: s.en, te: s.te };
        });
        rows.push({
          story_id: id,
          level,
          chapter: Number(ch),
          theme_index: i + 1,
          idea: cluster.idea,
          shlokas: cluster.shlokas.join(', '),
          age_hint: ageHint(level),
          verse_summaries_en: summaries.map((x) => `${x.shloka}: ${x.en}`).join(' | '),
          verse_summaries_te: summaries.map((x) => `${x.shloka}: ${x.te}`).join(' | '),
        });
        templates.stories[id] = {
          id,
          title: '',
          title_te: '',
          emoji: '',
          micro_theme: cluster.idea,
          micro_theme_te: '',
          storyTitle: '',
          storyTitle_te: '',
          content: '',
          content_te: '',
          moral: '',
          moral_te: '',
          activity: '',
          activity_te: '',
        };
      });
    }
  }

  const jsonPath = path.join(OUT_DIR, 'chatgpt-clusters-export.json');
  const csvPath = path.join(OUT_DIR, 'chatgpt-clusters-export.csv');
  const templatePath = path.join(OUT_DIR, 'chatgpt-stories-template.json');

  fs.writeFileSync(jsonPath, JSON.stringify({ meta: clusters.meta, rows }, null, 2), 'utf8');
  fs.writeFileSync(templatePath, JSON.stringify(templates, null, 2), 'utf8');

  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
  fs.writeFileSync(csvPath, csv, 'utf8');

  console.log(`Exported ${rows.length} themes:`);
  console.log(`  ${jsonPath}`);
  console.log(`  ${csvPath}`);
  console.log(`  ${templatePath} (empty story fields — fill and save as chatgpt-stories-import.json)`);
}

main();
