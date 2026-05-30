/**
 * Translate line-by-line English meanings to Telugu (Sarvam API).
 * Writes scripts/data/line-te-cache.json and applies to all chapter files.
 *
 * Requires SARVAM_API_KEY in backend/.env or environment.
 * Run: npm run gita:translate-lines
 * Production API serves cache only unless TRANSLATE_LIVE=true (see backend/.env.template).
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');

const ROOT = path.join(__dirname, '..');
const BACKEND_DATA = path.join(ROOT, 'backend', 'data');
const LIB_DATA = path.join(ROOT, 'lib', 'data');
const CACHE_FILE = path.join(__dirname, 'data', 'line-te-cache.json');
const chaptersConfig = require(path.join(BACKEND_DATA, 'chapters.json'));
const { buildLineBreakdown, hasTeluguScript } = require('./gita-line-breakdown');

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

function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    return new Map(Object.entries(JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))));
  }
  return new Map();
}

function saveCache(map) {
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  const obj = {};
  for (const [k, v] of map.entries()) obj[k] = v;
  fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2), 'utf8');
  const libCache = path.join(LIB_DATA, 'line-te-cache.json');
  if (fs.existsSync(LIB_DATA)) {
    fs.writeFileSync(libCache, JSON.stringify(obj, null, 2), 'utf8');
  }
}

async function translateEnToTe(text, apiKey) {
  const res = await axios.post(
    'https://api.sarvam.ai/translate',
    {
      input: text,
      source_language_code: 'en-IN',
      target_language_code: 'te-IN',
      model: 'mayura:v1',
      mode: 'formal',
    },
    {
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );
  const out = res.data?.translated_text || res.data?.translation;
  if (!out) throw new Error('No translated_text in response');
  return out.trim();
}

function collectUniqueEnLines() {
  const unique = new Set();
  for (const chMeta of chaptersConfig.chapters) {
    const chapter = require(path.join(BACKEND_DATA, 'chapters', `chapter${chMeta.id}.js`));
    for (const key of Object.keys(chapter)) {
      if (!/^\d+\.\d+$/.test(key)) continue;
      for (const row of chapter[key].lineBreakdown || []) {
        const en = (row.en || row.meaning || '').trim();
        if (!en || hasTeluguScript(en)) continue;
        if (!hasTeluguScript(row.te)) unique.add(en);
      }
    }
  }
  return [...unique];
}

function loadChapter(ch) {
  return require(path.join(BACKEND_DATA, 'chapters', `chapter${ch}.js`));
}

function writeChapterFile(ch, shlokas) {
  const sorted = {};
  Object.keys(shlokas)
    .sort((a, b) => parseInt(a.split('.')[1], 10) - parseInt(b.split('.')[1], 10))
    .forEach((k) => {
      sorted[k] = shlokas[k];
    });
  const filePath = path.join(BACKEND_DATA, 'chapters', `chapter${ch}.js`);
  fs.writeFileSync(
    filePath,
    `const CHAPTER_${ch}_SHLOKAS = ${JSON.stringify(sorted, null, 4)};\n\nmodule.exports = CHAPTER_${ch}_SHLOKAS;\n`,
    'utf8'
  );
  if (fs.existsSync(LIB_DATA)) {
    fs.copyFileSync(filePath, path.join(LIB_DATA, 'chapters', `chapter${ch}.js`));
  }
}

function applyCacheToChapters(teCache) {
  let updated = 0;
  for (const chMeta of chaptersConfig.chapters) {
    const ch = chMeta.id;
    const chapter = loadChapter(ch);
    const out = { ...chapter };
    for (const key of Object.keys(out)) {
      if (!/^\d+\.\d+$/.test(key)) continue;
      const shloka = out[key];
      if (!shloka.lineBreakdown) continue;
      shloka.lineBreakdown = shloka.lineBreakdown.map((row) => {
        const en = (row.en || '').trim();
        if (hasTeluguScript(row.te)) return row;
        const te =
          teCache.get(en) ||
          teCache.get(en.toLowerCase()) ||
          (hasTeluguScript(shloka.te?.meaning) ? null : null);
        if (te && hasTeluguScript(te)) {
          updated++;
          return { ...row, te };
        }
        return row;
      });
    }
    writeChapterFile(ch, out);
  }
  return updated;
}

async function main() {
  loadEnv();
  const apiKey = process.env.SARVAM_API_KEY;
  const teCache = loadCache();
  const needed = collectUniqueEnLines().filter((en) => !teCache.has(en));

  console.log(`Cache: ${teCache.size} entries, ${needed.length} lines need translation`);

  if (needed.length && !apiKey) {
    console.error('SARVAM_API_KEY missing. Set it in backend/.env to translate line meanings.');
    if (teCache.size === 0) process.exit(1);
    console.log('Applying existing cache only...');
  } else if (needed.length && apiKey) {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    const concurrency = 4;
    let done = 0;
    for (let i = 0; i < needed.length; i += concurrency) {
      const batch = needed.slice(i, i + concurrency);
      await Promise.all(
        batch.map(async (en) => {
          try {
            const te = await translateEnToTe(en, apiKey);
            if (te && hasTeluguScript(te)) teCache.set(en, te);
          } catch (err) {
            console.warn(`  skip "${en.slice(0, 40)}...": ${err.message}`);
          }
        })
      );
      done += batch.length;
      if (done % 50 === 0 || done >= needed.length) {
        saveCache(teCache);
        console.log(`  ${done}/${needed.length} translated (cache: ${teCache.size})...`);
      }
      await delay(300);
    }
    saveCache(teCache);
    console.log(`✅ Cache saved: ${teCache.size} entries`);
  }

  const rows = applyCacheToChapters(teCache);
  console.log(`\n🚀 Applied Telugu to ${rows} line rows across chapter files.`);

  // Rebuild so line rows pick up teCache via buildLineBreakdown
  console.log('Rebuilding line breakdown with Telugu cache...');
  require('child_process').execSync('node scripts/rebuild-line-breakdown.js', {
    cwd: ROOT,
    stdio: 'inherit',
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
