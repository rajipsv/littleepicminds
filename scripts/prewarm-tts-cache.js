/**
 * Pre-generate TTS audio into lib/data/audio_cache (or TTS_CACHE_DIR).
 * Each unique phrase is synthesized once; the app reuses cache (zero repeat Sarvam credits).
 * Uses same provider chain as production (TTS_PROVIDER, default auto).
 *
 *   node scripts/prewarm-tts-cache.js
 *   node scripts/prewarm-tts-cache.js --chapter=1
 *   npm run gita:prewarm-tts
 */
const fs = require('fs');
const path = require('path');

const { DATA_DIR } = require('./lib/data-dir');
const { loadEnv, ENV_PATH } = require('./lib/load-env');

const { lineTextFromRow } = require('../lib/tts/shloka-line');
const { hasTeluguScript } = require('../lib/translate/line-meaning');

function samplesFromRow(row) {
  const out = [];
  const hi = lineTextFromRow(row, 'hi');
  const teScript = lineTextFromRow(row, 'te');
  if (hi) out.push({ text: hi, lang: 'hi' });
  if (teScript) out.push({ text: teScript, lang: 'te' });
  const en = String(row.en || row.meaning || '').trim();
  if (en) out.push({ text: en, lang: 'en' });
  const teMeaning = String(row.te || '').trim();
  if (teMeaning && hasTeluguScript(teMeaning)) out.push({ text: teMeaning, lang: 'te' });
  return out;
}

function collectSamples() {
  const samples = [];
  const chaptersConfig = require(path.join(DATA_DIR, 'chapters.json'));

  for (const chMeta of chaptersConfig.chapters) {
    const chapter = require(path.join(DATA_DIR, 'chapters', `chapter${chMeta.id}.js`));
    for (const key of Object.keys(chapter)) {
      if (!/^\d+\.\d+$/.test(key)) continue;
      const verse = chapter[key];
      for (const row of verse.lineBreakdown || verse.word_by_word || []) {
        samples.push(...samplesFromRow(row));
      }
      const intro = verse.chantIntro;
      if (intro?.en) samples.push({ text: String(intro.en).trim(), lang: 'en' });
      if (intro?.te && hasTeluguScript(intro.te)) {
        samples.push({ text: String(intro.te).trim(), lang: 'te' });
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
    const chaptersConfig = require(path.join(DATA_DIR, 'chapters.json'));
    const ch = chaptersConfig.chapters.find((c) => c.id === chapterFilter);
    if (!ch) {
      console.error(`Unknown chapter ${chapterFilter}`);
      process.exit(1);
    }
    const chapter = require(path.join(DATA_DIR, 'chapters', `chapter${chapterFilter}.js`));
    samples = [];
    for (const key of Object.keys(chapter)) {
      if (!/^\d+\.\d+$/.test(key)) continue;
      const verse = chapter[key];
      for (const row of verse.lineBreakdown || verse.word_by_word || []) {
        samples.push(...samplesFromRow(row));
      }
      const intro = verse.chantIntro;
      if (intro?.en) samples.push({ text: String(intro.en).trim(), lang: 'en' });
      if (intro?.te && hasTeluguScript(intro.te)) {
        samples.push({ text: String(intro.te).trim(), lang: 'te' });
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
    console.error(`Set GOOGLE_TTS_API_KEY or SARVAM_API_KEY in ${ENV_PATH}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
