/**
 * Download per-śloka chanting WAV from Hugging Face (Apache-2.0).
 *   npm run gita:sync-hf-audio
 *   npm run gita:sync-hf-audio -- --chapter=1
 *
 * Dataset: https://huggingface.co/datasets/JDhruv14/Bhagavad-Gita_Audio
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const {
  AUDIO_DIR,
  shlokaIdToVerseId,
  loadManifest,
  saveManifest,
  HF_DATASET,
  HF_LICENSE,
} = require('../lib/gita-audio');

const DATASET = 'JDhruv14/Bhagavad-Gita_Audio';
const ROWS_API = `https://datasets-server.huggingface.co/rows?dataset=${encodeURIComponent(DATASET)}&config=default&split=train`;

function getAudioUrl(audioField) {
  if (!audioField) return null;
  if (Array.isArray(audioField)) {
    const first = audioField[0];
    return first?.src || first?.url || null;
  }
  if (typeof audioField === 'object') {
    return audioField.src || audioField.url || null;
  }
  return null;
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    client
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlinkSync(dest);
          return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', (err) => {
        file.close();
        try {
          fs.unlinkSync(dest);
        } catch (_) {
          /* ignore */
        }
        reject(err);
      });
  });
}

async function fetchRows(offset, length, retries = 4) {
  const url = `${ROWS_API}&offset=${offset}&length=${length}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res.json();
    const body = await res.text();
    if (attempt < retries && (res.status >= 500 || res.status === 429)) {
      const wait = 2000 * (attempt + 1);
      console.warn(`  HF API ${res.status}, retry in ${wait}ms...`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    throw new Error(`HF rows API ${res.status}: ${body.slice(0, 200)}`);
  }
}

function parseChapterArg() {
  const arg = process.argv.find((a) => a.startsWith('--chapter='));
  if (!arg) return null;
  return parseInt(arg.split('=')[1], 10);
}

async function main() {
  const chapterFilter = parseChapterArg();
  fs.mkdirSync(AUDIO_DIR, { recursive: true });

  const manifest = loadManifest();
  manifest.source = HF_DATASET;
  manifest.license = HF_LICENSE;
  manifest.syncedAt = new Date().toISOString();
  if (!manifest.verses) manifest.verses = {};

  let offset = 0;
  const pageSize = 50;
  let total = 701;
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  console.log(
    `Syncing Gita chant audio from ${HF_DATASET}${chapterFilter ? ` (chapter ${chapterFilter} only)` : ''}...`
  );
  console.log('Output:', AUDIO_DIR);

  while (offset < total) {
    const page = await fetchRows(offset, pageSize);
    total = page.num_rows_total ?? total;
    const rows = page.rows || [];

    for (const { row } of rows) {
      const verseId = shlokaIdToVerseId(row.shloka_id);
      if (!verseId) continue;
      if (chapterFilter && parseInt(verseId.split('.')[0], 10) !== chapterFilter) continue;

      const dest = path.join(AUDIO_DIR, `${verseId}.wav`);
      if (fs.existsSync(dest)) {
        manifest.verses[verseId] = true;
        skipped++;
        continue;
      }

      const audioUrl = getAudioUrl(row.audio);
      if (!audioUrl) {
        console.warn(`  no audio URL for ${row.shloka_id}`);
        failed++;
        continue;
      }

      try {
        await downloadFile(audioUrl, dest);
        manifest.verses[verseId] = true;
        downloaded++;
        if (downloaded % 10 === 0) console.log(`  downloaded ${downloaded} (${verseId})`);
      } catch (e) {
        console.warn(`  failed ${verseId}: ${e.message}`);
        failed++;
      }
    }

    offset += rows.length;
    if (!rows.length) break;
  }

  saveManifest(manifest);
  console.log(`Done. new=${downloaded} skipped=${skipped} failed=${failed} total in manifest=${Object.keys(manifest.verses).length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
