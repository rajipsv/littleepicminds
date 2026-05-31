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
const { LINES_PER_SHLOKA, extractSpeakerPrefix } = require('./gita-line-breakdown');

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

function lineCountForVerse() {
  return LINES_PER_SHLOKA;
}

function lineWeights(verse) {
  const b = verse?.lineBreakdown || verse?.word_by_word;
  const weights = (b || []).map((row) => {
    const t = row.transliteration || row.word || row.sanskrit || '';
    return t.replace(/\s+/g, '').length || 1;
  });
  while (weights.length < LINES_PER_SHLOKA) weights.push(1);
  return weights.slice(0, LINES_PER_SHLOKA);
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
      const n = lineCountForVerse();
      const breakdown = verse?.lineBreakdown || verse?.word_by_word;
      if (!Array.isArray(breakdown) || breakdown.length < 1) {
        skipped++;
        continue;
      }

      const wavPath = getAudioFilePath(verseId);
      if (!wavPath || !fs.existsSync(wavPath)) {
        skipped++;
        continue;
      }

      try {
        const fullBounds = computeLineTimingsFromWav(wavPath, n, lineWeights(verse));
        const hasIntro = Boolean(
          extractSpeakerPrefix(verse.transliteration || '').speaker
        );
        let lineTimings = fullBounds;
        let introEnd;
        if (hasIntro && fullBounds.length >= n + 1) {
          introEnd = fullBounds[1];
          lineTimings = fullBounds.slice(1);
        }
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
          ...(introEnd != null ? { introEnd } : {}),
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
    'Line boundaries from pauses in local WAV (longest gaps = line ends). Re-run gita:line-timings after sync.';
  manifest.lineTimingsAt = new Date().toISOString();
  saveManifest(manifest);

  console.log(`Done. computed=${computed} skipped=${skipped} failed=${failed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
