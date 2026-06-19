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
const { LINES_PER_SHLOKA, extractSpeakerPrefix, extractEmbeddedSpeaker, linesBeforeEmbeddedSpeaker } = require('./gita-line-breakdown');

const { DATA_DIR } = require('./lib/data-dir');
const CHAPTERS_DIR = path.join(DATA_DIR, 'chapters');

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

function hasChantIntro(verse) {
  if (verse?.chantIntro) return true;
  return Boolean(extractSpeakerPrefix(verse?.transliteration || '').speaker);
}

function lineWeights(verse, withIntro = false, embedded = null) {
  const b = verse?.lineBreakdown || verse?.word_by_word;
  const weights = (b || []).map((row) => {
    const t = row.transliteration || row.word || row.sanskrit || '';
    return t.replace(/\s+/g, '').length || 1;
  });
  while (weights.length < LINES_PER_SHLOKA) weights.push(1);
  const w = weights.slice(0, LINES_PER_SHLOKA);
  if (withIntro) {
    const intro =
      verse?.chantIntro?.transliteration ||
      extractSpeakerPrefix(verse?.transliteration || '').speaker ||
      '';
    w.unshift(intro.replace(/\s+/g, '').length || 10);
  }
  if (embedded?.speaker) {
    const linesBefore = linesBeforeEmbeddedSpeaker(verse, embedded);
    const speakerLen = embedded.speaker.replace(/\s+/g, '').length || 10;
    w.splice(linesBefore, 0, speakerLen);
  }
  return w;
}

function hasInternalIntroBreath(fullBounds) {
  return (
    fullBounds.length >= 3 &&
    fullBounds[1] < 1.2 &&
    fullBounds[2] - fullBounds[1] > 0.35
  );
}

function introLineEndsFromBounds(fullBounds, lineCount) {
  const duration = fullBounds[fullBounds.length - 1];
  let introIdx = 1;
  while (
    introIdx < fullBounds.length - lineCount - 1 &&
    fullBounds[introIdx] < 1.2 &&
    fullBounds[introIdx + 1] - fullBounds[introIdx] > 0.35
  ) {
    introIdx += 1;
  }
  const introEnd = fullBounds[introIdx];
  const leadZero = fullBounds[0] < 0.15;
  const introStart = leadZero
    ? fullBounds[Math.max(1, introIdx - 1)]
    : introIdx > 0
      ? fullBounds[introIdx - 1]
      : 0;
  const lineEnds = fullBounds.slice(introIdx + 1, introIdx + 1 + lineCount);
  while (lineEnds.length < lineCount) lineEnds.push(duration);
  return { introStart, introEnd, lineEnds: lineEnds.slice(0, lineCount), duration };
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
        const hasIntro = hasChantIntro(verse);
        const embedded = extractEmbeddedSpeaker(verse?.transliteration || '');
        const weights = lineWeights(verse, hasIntro, embedded);
        const n = lineCountForVerse();
        const segmentCount = embedded ? n + 2 + (hasIntro ? 1 : 0) : hasIntro ? n + 1 : n;
        let fullBounds = computeLineTimingsFromWav(
          wavPath,
          segmentCount,
          weights
        );
        if (hasIntro && hasInternalIntroBreath(fullBounds)) {
          fullBounds = computeLineTimingsFromWav(wavPath, n + 2, weights);
        }

        let lineEnds;
        let introEnd;
        let introStart;
        let midSpeakerGap;
        const duration = fullBounds[fullBounds.length - 1];

        if (embedded && fullBounds.length >= n + 2) {
          const leadZero = fullBounds[0] < 0.15;
          const off = leadZero ? 1 : 0;
          const speechStart = fullBounds[off];
          introEnd = speechStart > 0.05 && speechStart < 1.5 ? speechStart : undefined;
          const linesBefore = linesBeforeEmbeddedSpeaker(verse, embedded);
          const gapStart = fullBounds[off + linesBefore];
          const gapEnd = fullBounds[off + linesBefore + 1];
          lineEnds = [];
          for (let li = 0; li < n; li++) {
            const audioIdx = off + li + (li < linesBefore ? 1 : 2);
            lineEnds.push(fullBounds[audioIdx] ?? duration);
          }
          if (Number.isFinite(gapStart) && Number.isFinite(gapEnd) && gapEnd > gapStart) {
            midSpeakerGap = { start: gapStart, end: gapEnd, label: embedded.speaker };
          }
        } else if (hasIntro && fullBounds.length >= n + 2) {
          ({ introStart, introEnd, lineEnds } = introLineEndsFromBounds(fullBounds, n));
        } else if (hasIntro && fullBounds.length >= n + 1) {
          introStart = fullBounds[0] < 0.15 ? fullBounds[0] : 0;
          introEnd = fullBounds[1];
          lineEnds = fullBounds.slice(2, n + 2);
        } else {
          lineEnds = fullBounds.slice(1, n + 1);
          if (lineEnds[0] < 1.2 && fullBounds.length >= n + 2) {
            introEnd = lineEnds[0];
            lineEnds = fullBounds.slice(2, n + 2);
          }
        }
        const prev = manifest.verses[verseId];
        const url =
          typeof prev === 'object' && prev?.url
            ? prev.url
            : typeof prev === 'string'
              ? prev
              : undefined;
        const entry = {
          ...(typeof prev === 'object' ? prev : {}),
          ...(url ? { url } : {}),
          lineEnds,
          lineTimings: lineEnds,
          lineCount: n,
          ...(Number.isFinite(duration) ? { duration } : {}),
        };
        if (introEnd != null) entry.introEnd = introEnd;
        else delete entry.introEnd;
        if (introStart != null) entry.introStart = introStart;
        else delete entry.introStart;
        if (midSpeakerGap) entry.midSpeakerGap = midSpeakerGap;
        else delete entry.midSpeakerGap;
        manifest.verses[verseId] = entry;
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
