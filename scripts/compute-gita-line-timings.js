/**
 * Compute per-line timestamps for Dhruv HF chanting WAVs (silence detection).
 * Requires local files: lib/data/gita_audio/{verseId}.wav
 *
 *   npm run gita:line-timings
 *   npm run gita:line-timings -- --chapter=1
 */
const fs = require('fs');
const path = require('path');

const { AUDIO_DIR, loadManifest, saveManifest, getAudioFilePath } = require('../lib/gita-audio');
const { computeLineTimingsFromWav } = require('../lib/gita-line-timings');

const CHAPTERS_DIR = path.join(__dirname, '..', 'backend', 'data', 'chapters');

function parseChapterArg() {
  const arg = process.argv.find((a) => a.startsWith('--chapter='));
  if (!arg) return null;
  return parseInt(arg.split('=')[1], 10);
}

function loadChapterShlokas(chapterNum) {
  const fp = path.join(CHAPTERS_DIR, `chapter${chapterNum}.js`);
  if (!fs.existsSync(fp)) return null;
  delete require.cache[require.resolve(fp)];
  return require(fp);
}

function lineCountForVerse(verse) {
  const b = verse?.lineBreakdown || verse?.word_by_word;
  return Array.isArray(b) ? b.length : 0;
}

function lineWeights(verse) {
  const b = verse?.lineBreakdown || verse?.word_by_word;
  if (!b?.length) return [];
  return b.map((row) => {
    const t = row.transliteration || row.word || row.sanskrit || '';
    return t.replace(/\s+/g, '').length || 1;
  });
}

async function main() {
  const chapterFilter = parseChapterArg();
  const manifest = loadManifest();
  if (!manifest.verses) manifest.verses = {};

  let computed = 0;
  let skipped = 0;
  let failed = 0;

  for (let ch = 1; ch <= 18; ch++) {
    if (chapterFilter && ch !== chapterFilter) continue;
    const shlokas = loadChapterShlokas(ch);
    if (!shlokas) continue;

    for (const [verseId, verse] of Object.entries(shlokas)) {
      const n = lineCountForVerse(verse);
      if (!n) {
        skipped++;
        continue;
      }

      const wavPath = getAudioFilePath(verseId);
      if (!wavPath || !fs.existsSync(wavPath)) {
        skipped++;
        continue;
      }

      try {
        const lineTimings = computeLineTimingsFromWav(wavPath, n, lineWeights(verse));
        const prev = manifest.verses[verseId];
        const url =
          typeof prev === 'object' && prev?.url
            ? prev.url
            : typeof prev === 'string'
              ? prev
              : undefined;
        manifest.verses[verseId] = {
          ...(typeof prev === 'object' ? prev : {}),
          ...(url ? { url } : {}),
          lineTimings,
          lineCount: n,
        };
        computed++;
        if (computed % 20 === 0) console.log(`  ${computed} timings (${verseId})`);
      } catch (e) {
        console.warn(`  failed ${verseId}: ${e.message}`);
        failed++;
      }
    }
  }

  manifest.lineTimingsNote =
    'Seconds per lineBreakdown row; from silence detection on local WAV. Re-run gita:line-timings after sync.';
  manifest.lineTimingsAt = new Date().toISOString();
  saveManifest(manifest);

  console.log(`Done. computed=${computed} skipped=${skipped} failed=${failed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
