/**
 * Generate theme stories via OpenAI API (ChatGPT-compatible) for all chapters.
 * Skips stories that already pass quality check unless --force.
 *
 * Requires OPENAI_API_KEY in backend/.env or environment.
 *
 * Run:
 *   node scripts/generate-chatgpt-stories.js
 *   node scripts/generate-chatgpt-stories.js --chapter=2
 *   node scripts/generate-chatgpt-stories.js --force
 *   npm run gita:generate-chatgpt-stories
 */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const {
  SYSTEM_PROMPT,
  buildChapterRows,
  buildChapterUserPrompt,
  CLUSTERS_PATH,
} = require('./lib/chatgpt-story-prompts');
const { isPlaceholderStory } = require('./lib/story-quality');

const ROOT = path.join(__dirname, '..');
const ENV_PATH = path.join(ROOT, 'backend', '.env');
const AUTHORED_PATH = path.join(__dirname, 'data', 'gita-theme-stories-authored.json');
const IMPORT_PATH = path.join(__dirname, 'data', 'chatgpt-stories-import.json');
const PROGRESS_PATH = path.join(__dirname, 'data', 'chatgpt-generation-progress.json');

function loadEnv() {
  if (fs.existsSync(ENV_PATH)) {
    fs.readFileSync(ENV_PATH, 'utf8')
      .split('\n')
      .forEach((line) => {
        const m = line.match(/^([^#=]+)=(.*)$/);
        if (m && !process.env[m[1].trim()]) {
          process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
        }
      });
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { force: false, chapter: null, delayMs: 2000 };
  for (const a of args) {
    if (a === '--force') out.force = true;
    else if (a.startsWith('--chapter=')) out.chapter = Number(a.split('=')[1]);
    else if (a.startsWith('--delay=')) out.delayMs = Number(a.split('=')[1]) || 2000;
  }
  return out;
}

function loadAuthored() {
  if (!fs.existsSync(AUTHORED_PATH)) return { version: 1, stories: {} };
  const data = JSON.parse(fs.readFileSync(AUTHORED_PATH, 'utf8'));
  if (!data.stories) data.stories = {};
  return data;
}

function chaptersToProcess(chapterFilter) {
  const clusters = JSON.parse(fs.readFileSync(CLUSTERS_PATH, 'utf8'));
  const chs = Object.keys(clusters.gita)
    .map(Number)
    .sort((a, b) => a - b);
  if (chapterFilter) return chs.filter((c) => c === chapterFilter);
  return chs;
}

function rowsNeedingGeneration(ch, authored, force) {
  const rows = buildChapterRows(ch);
  return rows.filter((r) => {
    const existing = authored.stories[r.id];
    if (!existing) return true;
    if (force) return true;
    return isPlaceholderStory(existing);
  });
}

async function callOpenAI(userPrompt, apiKey, model) {
  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 120000,
    }
  );
  const text = res.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty OpenAI response');
  return JSON.parse(text);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function mergeStories(authored, incoming) {
  const stories = incoming.stories || incoming;
  let n = 0;
  for (const [id, entry] of Object.entries(stories)) {
    if (!entry?.id) entry.id = id;
    authored.stories[id] = { ...authored.stories[id], ...entry, id };
    n++;
  }
  return n;
}

async function main() {
  loadEnv();
  const { force, chapter: chapterFilter, delayMs } = parseArgs();
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    console.error('Missing OPENAI_API_KEY — use agent-authored stories instead (no API):');
    console.error('  1. Cursor agent writes scripts/data/chatgpt-stories-import-ch{N}.json');
    console.error('  2. npm run gita:import-chatgpt-stories-safe');
    console.error('  3. npm run gita:build-themes');
    console.error('See .cursor/rules/gita-chatgpt-theme-stories.mdc');
    process.exit(1);
  }

  const authored = loadAuthored();
  const progress = fs.existsSync(PROGRESS_PATH)
    ? JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf8'))
    : { completedChapters: [], errors: [] };

  const chapters = chaptersToProcess(chapterFilter);
  let totalGenerated = 0;

  for (const ch of chapters) {
    const need = rowsNeedingGeneration(ch, authored, force);
    if (need.length === 0) {
      console.log(`Chapter ${ch}: skip (all stories complete)`);
      continue;
    }

    console.log(`Chapter ${ch}: generating ${need.length} stories via ${model}...`);
    const userPrompt = buildChapterUserPrompt(ch, need);

    try {
      const parsed = await callOpenAI(userPrompt, apiKey, model);
      const merged = mergeStories(authored, parsed);
      totalGenerated += merged;
      fs.writeFileSync(AUTHORED_PATH, JSON.stringify(authored, null, 2), 'utf8');

      const importSlice = {};
      for (const r of need) {
        if (authored.stories[r.id]) importSlice[r.id] = authored.stories[r.id];
      }
      const existingImport = fs.existsSync(IMPORT_PATH)
        ? JSON.parse(fs.readFileSync(IMPORT_PATH, 'utf8'))
        : { stories: {} };
      if (!existingImport.stories) existingImport.stories = {};
      Object.assign(existingImport.stories, importSlice);
      fs.writeFileSync(IMPORT_PATH, JSON.stringify(existingImport, null, 2), 'utf8');

      if (!progress.completedChapters.includes(ch)) progress.completedChapters.push(ch);
      console.log(`  ✅ merged ${merged} stories`);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      console.error(`  ❌ Chapter ${ch} failed: ${msg}`);
      progress.errors.push({ chapter: ch, at: new Date().toISOString(), error: msg });
    }

    fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf8');
    if (delayMs > 0) await sleep(delayMs);
  }

  console.log(`\nDone. Generated/updated ${totalGenerated} story entries in ${AUTHORED_PATH}`);
  console.log('Run: npm run gita:build-themes');
  if (progress.errors.length) {
    console.warn(`Errors on chapters: ${progress.errors.map((e) => e.chapter).join(', ')}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
