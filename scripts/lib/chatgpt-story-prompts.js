/**
 * Prompt builders for ChatGPT / OpenAI theme story generation.
 */
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..', '..');
const CLUSTERS_PATH = path.join(__dirname, '..', 'data', 'gita-theme-clusters.json');
const CHAPTERS_DIR = path.join(ROOT, 'lib', 'data', 'chapters');

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
    en: (useChild ? v.en?.childMeaning : v.en?.meaning) || v.en?.meaning || '',
    te: (useChild ? v.te?.childMeaning : v.te?.meaning) || v.te?.meaning || '',
  };
}

function storyId(ch, level, index, cluster) {
  if (cluster?.id) return cluster.id;
  const prefix = level === 'seeds' ? 'sd' : 'sk';
  return `${prefix}${ch}_${String(index + 1).padStart(2, '0')}`;
}

function ageHint(level) {
  return level === 'seeds'
    ? '5-7 years (simple school/home analogies; avoid heavy war detail)'
    : '8-10 years (deeper; may name Arjuna and Krishna; link gently to verses)';
}

function buildChapterRows(ch) {
  const clusters = JSON.parse(fs.readFileSync(CLUSTERS_PATH, 'utf8'));
  const data = clusters.gita[String(ch)];
  if (!data) return [];

  const rows = [];
  for (const level of ['seeds', 'seekers']) {
    (data[level] || []).forEach((cluster, i) => {
      const id = storyId(ch, level, i, cluster);
      const summaries = cluster.shlokas.map((sid) => {
        const s = verseSummary(ch, sid, level);
        return `${sid}: ${s.en}`;
      });
      rows.push({
        id,
        level,
        idea: cluster.idea,
        shlokas: cluster.shlokas.join(', '),
        age_hint: ageHint(level),
        verse_summaries_en: summaries.join(' | '),
      });
    });
  }
  return rows;
}

const SYSTEM_PROMPT = `You write moral stories for Little Epic Minds, a kids Bhagavad Gita app.

Rules:
- Return ONLY valid JSON: { "stories": { "s1_01": { ... }, "sk1_01": { ... } } }
- Each story MUST include: id, title, title_te, emoji, micro_theme, micro_theme_te, storyTitle, storyTitle_te, content, content_te, moral, moral_te, activity, activity_te
- Keep micro_theme exactly as given in the request (English idea text)
- Seeds: warm modern child (name + situation), ~80-120 words content EN
- Seekers: slightly deeper, may mention Arjuna/Krishna, ~120-180 words content EN
- Telugu must be natural child-friendly Telugu, not word-for-word English
- One emoji per story
- No markdown, no commentary outside JSON`;

function buildChapterUserPrompt(ch, rows) {
  const lines = rows.map(
    (r) =>
      `- ${r.id} (${r.level}, ${r.age_hint}): idea="${r.idea}"; shlokas=${r.shlokas}; verses: ${r.verse_summaries_en}`
  );
  return `Write handcrafted moral stories for Gita Chapter ${ch} only.

${lines.join('\n')}

Quality bar: unique child name per story where possible, one clear modern analogy, one gentle Gita link, practical moral, short activity. Do not reuse the same plot across stories.`;
}

module.exports = {
  SYSTEM_PROMPT,
  buildChapterRows,
  buildChapterUserPrompt,
  storyId,
  CLUSTERS_PATH,
};
