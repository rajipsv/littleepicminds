/**
 * QA line segment builder against manifest fixtures (no browser).
 *   npm run gita:qa-segments
 */
const assert = require('assert');
const path = require('path');
const { loadManifest } = require('../lib/gita-audio');


function segmentForRow(segments, index) {
  return segments?.[index] || null;
}

function testVerse11() {
  const entry = loadManifest().verses['1.1'];
  const lineEnds = entry.lineEnds;
  const introEnd = entry.introEnd;
  const duration = entry.duration;
  const lineCount = 4;
  const hasChantIntro = true;

  const segments = buildLineSegments(lineEnds, lineCount, {
    duration,
    introEnd,
    hasChantIntro,
  });
  assert(segments && segments.length === lineCount, '1.1: four segments');

  const row0 = segmentForRow(segments, 0);
  assert(row0.start >= introEnd - 0.05, `1.1 row0 start ${row0.start} >= intro ${introEnd}`);
  assert(row0.end > row0.start + 0.2, '1.1 row0 has duration');
  assert(row0.start < 4, '1.1 row0 not stuck at 0 narrator');
  assert(row0.end <= duration + 0.1, '1.1 row0 within file');

  for (let i = 1; i < lineCount; i++) {
    const a = segments[i - 1];
    const b = segments[i];
    assert(b.start >= a.end - 0.15, `1.1 rows ${i - 1}-${i} monotonic`);
  }
  console.log('  OK 1.1 (chantIntro, skip narrator)');
}

function testVerse110() {
  const entry = loadManifest().verses['1.10'];
  const segments = buildLineSegments(entry.lineEnds, 4, {
    duration: entry.duration,
    introEnd: entry.introEnd,
    hasChantIntro: false,
  });
  assert(segments?.length === 4, '1.10: four segments');
  const row0 = segmentForRow(segments, 0);
  assert(row0.start < 1.5, '1.10 row0 starts near beginning (no UI intro)');
  console.log('  OK 1.10 (no chantIntro)');
}

function testDistinctRows() {
  const samples = ['2.47', '3.1', '15.1', '10.12'];
  const manifest = loadManifest();
  for (const id of samples) {
    const entry = manifest.verses[id];
    if (!entry?.lineEnds?.length) {
      console.warn(`  skip ${id} (no lineEnds)`);
      continue;
    }
    const segments = buildLineSegments(entry.lineEnds, entry.lineCount || 4, {
      duration: entry.duration,
      introEnd: entry.introEnd,
      hasChantIntro: false,
    });
    assert(segments?.length >= 2, `${id}: segments`);
    for (let i = 1; i < segments.length; i++) {
      assert(
        segments[i].start >= segments[i - 1].start + 0.05,
        `${id}: row ${i} start after prev`
      );
    }
    console.log(`  OK ${id}`);
  }
}

function testCoverage() {
  const manifest = loadManifest();
  const verses = Object.values(manifest.verses || {});
  const withEnds = verses.filter((e) => e?.lineEnds?.length >= 2).length;
  const withDur = verses.filter((e) => e?.duration > 0).length;
  assert(withEnds >= 680, `expected ~700 lineEnds, got ${withEnds}`);
  assert(withDur >= 680, `expected ~700 duration, got ${withDur}`);
  console.log(`  OK manifest coverage: lineEnds=${withEnds} duration=${withDur}`);
}

async function main() {
  const { buildLineSegments } = await import('../lib/gita-chant-segments.js');
  global.__buildLineSegments = buildLineSegments;

  console.log('gita:qa-segments');
  testCoverage();
  testVerse11();
  testVerse110();
  testDistinctRows();
  console.log('All segment QA checks passed.');
}

function buildLineSegments(...args) {
  return global.__buildLineSegments(...args);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
