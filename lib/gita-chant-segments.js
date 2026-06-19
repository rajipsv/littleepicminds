/**
 * Pure line-segment math for Dhruv chant playback (shared: frontend + QA scripts).
 * Speaker tags (sañjaya / dhṛtarāṣṭra / arjuna uvāca) play with the adjacent UI line.
 */

function validatePlayBounds(bounds, duration) {
  if (!bounds || bounds.length < 2) return null;
  const b = bounds.map((x) => Number(x)).filter((x) => Number.isFinite(x));
  if (b.length < 2) return null;
  for (let i = 1; i < b.length; i++) {
    if (b[i] <= b[i - 1]) return null;
  }
  if (Number.isFinite(duration) && duration > 0 && b[b.length - 1] > duration) {
    b[b.length - 1] = duration;
  }
  return b;
}

function resolveIntroCutSec({ introEnd, hasChantIntro, lineEnds } = {}) {
  const ie = Number(introEnd);
  if (Number.isFinite(ie) && ie > 0) return ie;
  if (!hasChantIntro) return 0;
  if (!Array.isArray(lineEnds) || lineEnds.length < 2) return 0;
  const e0 = Number(lineEnds[0]);
  const e1 = Number(lineEnds[1]);
  if (Number.isFinite(e0) && e0 > 0.15 && e0 < 8 && Number.isFinite(e1) && e1 > e0 + 0.2) {
    return e0;
  }
  return 0;
}

function buildPlayBounds(raw, lineCount, opts = {}) {
  const { duration, introEnd, introStart, hasChantIntro, speechStart } = opts;
  const nums = (raw || []).map((x) => Number(x)).filter((x) => Number.isFinite(x));
  if (!lineCount || !Number.isFinite(duration) || duration <= 0 || nums.length < 1) {
    return null;
  }

  const ie = Number(introEnd);
  const introEndSec = Number.isFinite(ie) && ie > 0 ? ie : null;
  const iss = Number(introStart);
  const ss = Number(speechStart);
  const prefixStart =
    hasChantIntro && introEndSec != null
      ? Number.isFinite(iss) && iss >= 0
        ? iss
        : Number.isFinite(ss) && ss >= 0
          ? ss
          : 0
      : null;

  if (hasChantIntro) {
    const ends = nums.slice(0, lineCount);
    if (ends.length < lineCount) return null;
    const b = [prefixStart ?? 0, ...ends];
    while (b.length < lineCount + 1) b.push(duration);
    return validatePlayBounds(b.slice(0, lineCount + 1), duration);
  }

  if (nums[0] < 0.12 && nums.length >= lineCount + 1) {
    const b = nums.slice(0, lineCount + 1);
    while (b.length < lineCount + 1) {
      b.push(nums[b.length] ?? duration);
    }
    return validatePlayBounds(b.slice(0, lineCount + 1), duration);
  }

  const ends = nums.slice(0, lineCount);
  if (ends.length < lineCount) return null;

  if (introEndSec != null && introEndSec < 1.2) {
    const b = [introEndSec, ...ends];
    while (b.length < lineCount + 1) b.push(duration);
    return validatePlayBounds(b.slice(0, lineCount + 1), duration);
  }

  const b = [0, ...ends];
  return validatePlayBounds(b.slice(0, lineCount + 1), duration);
}

function buildLineSegments(raw, lineCount, options = {}) {
  const manifestIntro = Number(options.introEnd);
  const speechStart =
    Number.isFinite(Number(options.speechStart)) && options.speechStart >= 0
      ? Number(options.speechStart)
      : Number.isFinite(manifestIntro) && manifestIntro > 0 && manifestIntro < 1.2
        ? manifestIntro
        : undefined;

  const bounds = buildPlayBounds(raw, lineCount, {
    ...options,
    speechStart,
    introStart: options.introStart,
    hasChantIntro: Boolean(options.hasChantIntro),
  });
  if (!bounds || bounds.length < lineCount + 1) return null;

  const segments = Array.from({ length: lineCount }, (_, i) => ({
    start: bounds[i],
    end: bounds[i + 1],
  }));

  return segments.filter((seg) => seg.end > seg.start + 0.05);
}

export {
  validatePlayBounds,
  resolveIntroCutSec,
  buildPlayBounds,
  buildLineSegments,
};
