/**
 * One-time / maintenance: derive lineEnds + introEnd from legacy lineTimings in manifest.
 *   node scripts/normalize-manifest-line-ends.js
 */
const { loadManifest, saveManifest } = require('../lib/gita-audio');

function normalizeEntry(entry) {
  const t = entry?.lineTimings;
  if (!Array.isArray(t) || t.length < 2) return null;
  const nums = t.map((x) => Number(x)).filter((x) => Number.isFinite(x));
  if (nums.length < 2) return null;
  const n = Number.isInteger(entry.lineCount) ? entry.lineCount : 4;

  if (nums[0] < 0.05 && nums.length >= n + 2) {
    return {
      lineEnds: nums.slice(2, 2 + n),
      introEnd: nums[1],
    };
  }
  if (nums[0] < 0.05 && nums.length === n + 1) {
    return {
      lineEnds: nums.slice(1, 1 + n),
      introEnd: nums[1],
    };
  }
  if (nums[0] < 0.05 && nums.length >= n + 1) {
    return {
      lineEnds: nums.slice(1, 1 + n),
      introEnd: entry.introEnd ?? nums[1],
    };
  }
  if (nums.length >= n) {
    const lineEnds = nums.slice(0, n);
    const e0 = lineEnds[0];
    const e1 = lineEnds[1];
    if (e0 > 0.15 && e0 < 8 && e1 > e0 + 0.2) {
      return { lineEnds, introEnd: e0 };
    }
    return { lineEnds };
  }
  return { lineEnds: nums };
}

function main() {
  const manifest = loadManifest();
  let updated = 0;
  for (const [id, entry] of Object.entries(manifest.verses || {})) {
    if (!entry || typeof entry !== 'object') continue;
    const norm = normalizeEntry(entry);
    if (!norm?.lineEnds?.length) continue;
    manifest.verses[id] = {
      ...entry,
      lineEnds: norm.lineEnds,
      lineTimings: norm.lineEnds,
      ...(norm.introEnd != null ? { introEnd: norm.introEnd } : {}),
    };
    updated++;
  }
  manifest.lineEndsNote =
    'Pada end times (seconds); use with introEnd for narrator offset. See buildPlayBounds in frontend.';
  saveManifest(manifest);
  console.log(`Normalized lineEnds for ${updated} verses.`);
}

main();
