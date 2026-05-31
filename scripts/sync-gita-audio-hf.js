/**
 * Sync Bhagavad Gita from Hugging Face (Apache-2.0): audio + sanskrit + transliteration.
 *   npm run gita:sync-hf-audio
 *   npm run gita:sync-hf-audio -- --chapter=1
 *   npm run gita:sync-hf-audio -- --text-only
 *   npm run gita:sync-hf-audio -- --urls-only
 *   npm run gita:sync-hf-audio -- --urls-only --chapter=1
 *
 * With --chapter=N, only that chapter's HF row range is fetched (e.g. ch2 = rows 47–118),
 * not all 701 ślokas. The datasets-server API has no chapter filter, so we use row offsets.
 *
 * Dataset: https://huggingface.co/datasets/JDhruv14/Bhagavad-Gita_Audio (Dhruv Jaradi)
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const {
  AUDIO_DIR,
  loadManifest,
  saveManifest,
  setVerseManifestEntry,
  shlokaIdToVerseId,
} = require('../lib/gita-audio');
const { loadHfVerses, saveHfVerses, HF_DATASET, HF_LICENSE } = require('../lib/gita-hf');

const DATASET = 'JDhruv14/Bhagavad-Gita_Audio';
const ROWS_API = `https://datasets-server.huggingface.co/rows?dataset=${encodeURIComponent(DATASET)}&config=default&split=train`;
const CHAPTERS_JSON = path.join(__dirname, '..', 'backend', 'data', 'chapters.json');

/** Prefer manifest trainIndex (HF row order can differ slightly from chapters.json totals). */
function getChapterRowRange(chapterNum, manifest) {
  const prefix = `${chapterNum}.`;
  const trainIndices = [];
  for (const [verseId, entry] of Object.entries(manifest?.verses || {})) {
    if (!verseId.startsWith(prefix)) continue;
    const idx = typeof entry === 'object' ? entry.trainIndex : null;
    if (Number.isFinite(idx)) trainIndices.push(idx);
  }
  if (trainIndices.length > 0) {
    const start = Math.min(...trainIndices);
    const end = Math.max(...trainIndices) + 1;
    return { start, end, length: trainIndices.length, source: 'manifest' };
  }

  const cfg = JSON.parse(fs.readFileSync(CHAPTERS_JSON, 'utf8'));
  const chapters = cfg.chapters || [];
  const ch = chapters.find((c) => c.id === chapterNum);
  if (!ch) return null;
  let start = 0;
  for (const c of chapters) {
    if (c.id === chapterNum) {
      return { start, length: ch.count, end: start + ch.count, source: 'chapters.json' };
    }
    start += c.count;
  }
  return null;
}

/** HF datasets-server URLs are signed; re-run --urls-only yearly before they expire. */
function extractTrainIndex(audioUrl) {
  const m = String(audioUrl).match(/\/train\/(\d+)\/audio/);
  return m ? parseInt(m[1], 10) : null;
}

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

const textOnly = process.argv.includes('--text-only');
const audioOnly = process.argv.includes('--audio-only');
const urlsOnly = process.argv.includes('--urls-only');

async function main() {
  const chapterFilter = parseChapterArg();
  if (!textOnly && !urlsOnly) fs.mkdirSync(AUDIO_DIR, { recursive: true });

  const hfData = loadHfVerses();
  hfData.source = HF_DATASET;
  hfData.license = HF_LICENSE;
  hfData.syncedAt = new Date().toISOString();
  if (!hfData.verses) hfData.verses = {};

  const audioManifest = loadManifest();
  audioManifest.source = HF_DATASET;
  audioManifest.license = HF_LICENSE;
  audioManifest.syncedAt = new Date().toISOString();
  audioManifest.urlNote =
    'Signed HF CDN URLs expire; re-run npm run gita:sync-hf-audio -- --urls-only before playback fails.';
  if (!audioManifest.verses) audioManifest.verses = {};

  const chapterRange = chapterFilter ? getChapterRowRange(chapterFilter, audioManifest) : null;
  if (chapterFilter && !chapterRange) {
    throw new Error(`Unknown chapter ${chapterFilter} (see backend/data/chapters.json)`);
  }

  let offset = chapterRange ? chapterRange.start : 0;
  const endOffset = chapterRange ? chapterRange.end : null;
  const pageSize = 50;
  let total = 701;
  let downloaded = 0;
  let skippedAudio = 0;
  let failedAudio = 0;
  let urlsSaved = 0;
  let textUpdated = 0;

  const modeLabel = textOnly
    ? ' (text only)'
    : urlsOnly
      ? ' (urls only)'
      : audioOnly
        ? ' (audio only)'
        : '';
  console.log(
    `Syncing from ${HF_DATASET}${chapterFilter ? ` chapter ${chapterFilter}` : ''}${modeLabel}...`
  );
  if (chapterRange) {
    console.log(
      `  HF rows ${chapterRange.start}–${chapterRange.end - 1} (${chapterRange.length} ślokas via ${chapterRange.source}, not all ${total})`
    );
  }

  while (offset < total && (endOffset == null || offset < endOffset)) {
    const fetchLen = endOffset != null ? Math.min(pageSize, endOffset - offset) : pageSize;
    const page = await fetchRows(offset, fetchLen);
    total = page.num_rows_total ?? total;
    const rows = page.rows || [];

    for (const { row } of rows) {
      const verseId = shlokaIdToVerseId(row.shloka_id);
      if (!verseId) continue;
      if (chapterFilter && parseInt(verseId.split('.')[0], 10) !== chapterFilter) continue;

      if (!audioOnly && (row.sanskrit || row.transliteration)) {
        hfData.verses[verseId] = {
          ...(hfData.verses[verseId] || {}),
          sanskrit: String(row.sanskrit || '').trim(),
          transliteration: String(row.transliteration || '').trim(),
        };
        textUpdated++;
      }

      if (!textOnly) {
        const audioUrl = getAudioUrl(row.audio);
        if (audioUrl) {
          setVerseManifestEntry(audioManifest, verseId, {
            url: audioUrl,
            trainIndex: extractTrainIndex(audioUrl),
          });
          urlsSaved++;
          if (hfData.verses[verseId]) hfData.verses[verseId].audio = true;
        } else if (!urlsOnly) {
          console.warn(`  no audio URL for ${row.shloka_id}`);
          failedAudio++;
        }

        if (!urlsOnly) {
          const dest = path.join(AUDIO_DIR, `${verseId}.wav`);
          if (fs.existsSync(dest)) {
            setVerseManifestEntry(audioManifest, verseId, {
              url: audioUrl || audioManifest.verses[verseId]?.url,
              local: true,
            });
            skippedAudio++;
          } else if (audioUrl) {
            try {
              await downloadFile(audioUrl, dest);
              setVerseManifestEntry(audioManifest, verseId, { url: audioUrl, local: true });
              downloaded++;
              if (downloaded % 10 === 0) console.log(`  audio ${downloaded} (${verseId})`);
            } catch (e) {
              console.warn(`  audio failed ${verseId}: ${e.message}`);
              failedAudio++;
            }
          }
        }
      }
    }

    offset += rows.length;
    if (!rows.length) break;
    if (endOffset != null && offset >= endOffset) break;
    if (urlsOnly) {
      const progressEnd = endOffset ?? total;
      const progressStart = chapterRange?.start ?? 0;
      if (offset === progressStart || offset >= progressEnd || offset % 50 === 0) {
        console.log(`  urls ${urlsSaved} (${offset - progressStart}/${progressEnd - progressStart} rows for this chapter)`);
      }
    }
  }

  saveHfVerses(hfData);
  if (!textOnly) saveManifest(audioManifest);

  console.log(
    `Done. text=${textUpdated} urls=${urlsSaved} audio_new=${downloaded} audio_skip=${skippedAudio} audio_fail=${failedAudio} manifest_verses=${Object.keys(audioManifest.verses).length}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
