/**
 * Pre-generate TTS audio into backend/data/audio_cache (or TTS_CACHE_DIR).
 * Each unique phrase is synthesized once; the app reuses cache (zero repeat Sarvam credits).
 * Uses same provider chain as production (TTS_PROVIDER, default auto).
 *
 *   node scripts/prewarm-tts-cache.js
 *   node scripts/prewarm-tts-cache.js --chapter=1
 *   npm run gita:prewarm-tts
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BACKEND_DATA = path.join(ROOT, 'backend', 'data');

function loadEnv() {
  const envPath = path.join(ROOT, 'backend', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  }
}

const { lineTextFromRow } = require('../lib/tts/shloka-line');

function collectSamples() {
  const samples = [];
  const chaptersConfig = require(path.join(BACKEND_DATA, 'chapters.json'));

  for (const chMeta of chaptersConfig.chapters) {
    const chapter = require(path.join(BACKEND_DATA, 'chapters', `chapter${chMeta.id}.js`));
    for (const key of Object.keys(chapter)) {
      if (!/^\d+\.\d+$/.test(key)) continue;
      const verse = chapter[key];
      for (const row of verse.lineBreakdown || []) {
        const hi = lineTextFromRow(row, 'hi');
        const te = lineTextFromRow(row, 'te');
        if (hi) samples.push({ text: hi, lang: 'hi' });
        if (te) samples.push({ text: te, lang: 'te' });
      }
    }
  }

  const themesPath = path.join(ROOT, 'scripts', 'data', 'gita-theme-stories-authored.json');
  if (fs.existsSync(themesPath)) {
    const { stories } = JSON.parse(fs.readFileSync(themesPath, 'utf8'));
    for (const story of Object.values(stories || {})) {
      if (story.content) samples.push({ text: story.content.slice(0, 500), lang: 'en' });
      if (story.content_te) samples.push({ text: story.content_te.slice(0, 500), lang: 'te' });
      if (story.moral) samples.push({ text: story.moral, lang: 'en' });
    }
  }

  const seen = new Set();
  return samples.filter((s) => {
    const k = `${s.lang}:${s.text}`;
    if (seen.has(k) || !s.text.trim()) return false;
    seen.add(k);
    return true;
  });
}

async function main() {
  loadEnv();
  const { synthesizeSpeech } = require('../lib/tts');
  const chArg = process.argv.find((a) => a.startsWith('--chapter='));
  const chapterFilter = chArg ? parseInt(chArg.split('=')[1], 10) : null;

  let samples = collectSamples();
  if (chapterFilter) {
    const chaptersConfig = require(path.join(BACKEND_DATA, 'chapters.json'));
    const ch = chaptersConfig.chapters.find((c) => c.id === chapterFilter);
    if (!ch) {
      console.error(`Unknown chapter ${chapterFilter}`);
      process.exit(1);
    }
    const chapter = require(path.join(BACKEND_DATA, 'chapters', `chapter${chapterFilter}.js`));
    samples = [];
    for (const key of Object.keys(chapter)) {
      if (!/^\d+\.\d+$/.test(key)) continue;
      const verse = chapter[key];
      for (const row of verse.lineBreakdown || []) {
        const hi = lineTextFromRow(row, 'hi');
        const te = lineTextFromRow(row, 'te');
        if (hi) samples.push({ text: hi, lang: 'hi' });
        if (te) samples.push({ text: te, lang: 'te' });
      }
    }
  }

  console.log(`Prewarming ${samples.length} TTS samples (TTS_PROVIDER=${process.env.TTS_PROVIDER || 'auto'})...`);
  console.log('Cache dir:', require('../lib/tts/cache').resolveCacheDir());
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < samples.length; i++) {
    const { text, lang } = samples[i];
    try {
      await synthesizeSpeech({ text, targetLanguageCode: lang });
      ok++;
      if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${samples.length} done`);
    } catch (e) {
      fail++;
      console.warn(`  skip: ${e.message}`);
    }
  }

  console.log(`Done. success=${ok} failed=${fail}`);
  if (fail && !process.env.GOOGLE_TTS_API_KEY && !process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.SARVAM_API_KEY) {
    console.error('Set GOOGLE_TTS_API_KEY or SARVAM_API_KEY in backend/.env');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
