/**
 * Pure line-segment math for Dhruv chant playback (shared: frontend + QA scripts).
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
  if (!hasChantIntro) return 0;
  const ie = Number(introEnd);
  if (Number.isFinite(ie) && ie > 0) return ie;
  if (!Array.isArray(lineEnds) || lineEnds.length < 2) return 0;
  const e0 = Number(lineEnds[0]);
  const e1 = Number(lineEnds[1]);
  if (Number.isFinite(e0) && e0 > 0.15 && e0 < 8 && Number.isFinite(e1) && e1 > e0 + 0.2) {
    return e0;
  }
  return 0;
}

function buildPlayBounds(raw, lineCount, { duration, introEnd, hasChantIntro } = {}) {
  const nums = (raw || []).map((x) => Number(x)).filter((x) => Number.isFinite(x));
  if (!lineCount || !Number.isFinite(duration) || duration <= 0 || nums.length < 1) {
    return null;
  }

  const ie = Number(introEnd);
  const intro = Number.isFinite(ie) && ie > 0 ? ie : null;

  if (hasChantIntro) {
    if (nums[0] < 0.12 && nums.length >= lineCount + 1) {
      let b = nums.slice(0, lineCount + 1);
      if (b.length >= 2 && b[1] > 0.08) {
        b = [b[1], ...b.slice(2)];
      }
      while (b.length < lineCount + 1) {
        b.push(duration);
      }
      return validatePlayBounds(b.slice(0, lineCount + 1), duration);
    }

    const ends = nums.slice(0, lineCount);
    if (ends.length < lineCount) return null;
    let b;
    if (intro != null) {
      b = [intro, ...ends];
      if (b.length > 1 && Math.abs(b[0] - b[1]) < 0.12) {
        b = [intro, ...ends.slice(1)];
      }
    } else {
      b = [...ends];
    }
    while (b.length < lineCount + 1) {
      b.push(duration);
    }
    return validatePlayBounds(b.slice(0, lineCount + 1), duration);
  }

  if (nums[0] < 0.12 && nums.length >= lineCount + 1) {
    let b = nums.slice(0, lineCount + 1);
    if (hasChantIntro && b.length >= 2 && b[1] > 0.08) {
      b = [b[1], ...b.slice(2)];
    }
    while (b.length < lineCount + 1) {
      const next = nums[b.length] ?? duration;
      b.push(next);
    }
    return validatePlayBounds(b.slice(0, lineCount + 1), duration);
  }

  const ends = nums.slice(0, lineCount);
  if (ends.length < lineCount) return null;

  const b = [0, ...ends];
  return validatePlayBounds(b.slice(0, lineCount + 1), duration);
}

function buildLineSegments(raw, lineCount, options = {}) {
  const lineEnds = (raw || []).map((x) => Number(x)).filter((x) => Number.isFinite(x));
  const introCut = resolveIntroCutSec({
    introEnd: options.introEnd,
    hasChantIntro: options.hasChantIntro,
    lineEnds,
  });
  const bounds = buildPlayBounds(raw, lineCount, {
    ...options,
    introEnd: introCut || options.introEnd,
    hasChantIntro: options.hasChantIntro || introCut > 0,
  });
  if (!bounds || bounds.length < lineCount + 1) return null;

  let chain = bounds.slice(0, lineCount + 1);
  if (introCut > 0 && chain[0] < introCut - 0.02) {
    const trimmed = chain.filter((t) => t >= introCut - 0.02);
    while (trimmed.length < lineCount + 1) {
      trimmed.push(options.duration ?? trimmed[trimmed.length - 1]);
    }
    chain = trimmed.slice(0, lineCount + 1);
  }

  const segments = Array.from({ length: lineCount }, (_, i) => ({
    start: chain[i],
    end: chain[i + 1],
  }));

  if (introCut > 0) {
    for (const seg of segments) {
      if (seg.start < introCut) seg.start = introCut;
    }
  }

  return segments.filter((seg) => seg.end > seg.start + 0.05);
}

export { validatePlayBounds, resolveIntroCutSec, buildPlayBounds, buildLineSegments };
