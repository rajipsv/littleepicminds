/**
 * Detect line boundaries in verse chanting WAV via pauses between speech bursts.
 * Used offline by scripts/compute-gita-line-timings.js
 */
const fs = require('fs');

const DEFAULT_OPTS = {
  windowSec: 0.025,
  minSilenceSec: 0.12,
  minSegmentSec: 0.08,
  /** Gaps shorter than this are syllable breaths; longer gaps mark line ends. */
  minLinePauseSec: 0.38,
};

function readWavPcm(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.length < 44 || buf.toString('ascii', 0, 4) !== 'RIFF') {
    throw new Error(`Not a RIFF WAV: ${filePath}`);
  }

  let offset = 12;
  let sampleRate = 44100;
  let channels = 1;
  let bitsPerSample = 16;
  let audioFormat = 1;
  let dataStart = 0;
  let dataLen = 0;

  while (offset + 8 <= buf.length) {
    const id = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (id === 'fmt ') {
      audioFormat = buf.readUInt16LE(offset + 8);
      channels = buf.readUInt16LE(offset + 10);
      sampleRate = buf.readUInt32LE(offset + 12);
      bitsPerSample = buf.readUInt16LE(offset + 22);
    } else if (id === 'data') {
      dataStart = offset + 8;
      dataLen = size;
      break;
    }
    offset += 8 + size;
    if (size % 2) offset += 1;
  }

  if (!dataLen) throw new Error(`No data chunk: ${filePath}`);

  const bytesPerSample = bitsPerSample / 8;
  const frameCount = Math.floor(dataLen / (channels * bytesPerSample));
  const mono = new Float32Array(frameCount);
  let o = dataStart;

  for (let i = 0; i < frameCount; i++) {
    let sum = 0;
    for (let c = 0; c < channels; c++) {
      if (audioFormat === 3 && bitsPerSample === 32) {
        sum += buf.readFloatLE(o);
        o += 4;
      } else if (audioFormat === 1 && bitsPerSample === 16) {
        sum += buf.readInt16LE(o) / 32768;
        o += 2;
      } else {
        throw new Error(`Unsupported WAV fmt=${audioFormat} bits=${bitsPerSample}: ${filePath}`);
      }
    }
    mono[i] = sum / channels;
  }

  return {
    sampleRate,
    duration: frameCount / sampleRate,
    samples: mono,
  };
}

function rmsPerWindow(samples, sampleRate, windowSec = 0.025) {
  const win = Math.max(64, Math.floor(sampleRate * windowSec));
  const energies = [];
  for (let i = 0; i < samples.length; i += win) {
    let sum = 0;
    const end = Math.min(i + win, samples.length);
    for (let j = i; j < end; j++) sum += samples[j] * samples[j];
    energies.push(Math.sqrt(sum / (end - i)));
  }
  return { energies, win };
}

function energyThreshold(energies) {
  const sorted = [...energies].sort((a, b) => a - b);
  const p15 = sorted[Math.floor(sorted.length * 0.15)] || 0;
  const peak = Math.max(...energies, 0.0001);
  // Median*2.5 fails when speech fills most of the file; use a low percentile + peak ratio.
  return Math.max(p15 * 1.35, peak * 0.14, 0.006);
}

/** Short speech bursts separated by brief silence (syllable / word level). */
function detectSpeechSegments(samples, sampleRate, opts = {}) {
  const o = { ...DEFAULT_OPTS, ...opts };
  const { energies, win } = rmsPerWindow(samples, sampleRate, o.windowSec);
  if (!energies.length) return [{ start: 0, end: samples.length / sampleRate }];

  const threshold = energyThreshold(energies);
  const windowSec = win / sampleRate;
  const minSilenceWindows = Math.max(1, Math.ceil(o.minSilenceSec / windowSec));

  const segments = [];
  let segStart = null;
  let silenceRun = 0;

  for (let i = 0; i < energies.length; i++) {
    const loud = energies[i] >= threshold;
    if (loud) {
      if (segStart == null) segStart = i * windowSec;
      silenceRun = 0;
    } else if (segStart != null) {
      silenceRun += 1;
      if (silenceRun >= minSilenceWindows) {
        const end = Math.max(segStart, i * windowSec - o.minSilenceSec * 0.5);
        if (end - segStart >= o.minSegmentSec) segments.push({ start: segStart, end });
        segStart = null;
        silenceRun = 0;
      }
    }
  }
  const duration = samples.length / sampleRate;
  if (segStart != null) segments.push({ start: segStart, end: duration });

  return segments.filter((s) => s.end - s.start >= o.minSegmentSec);
}

function gapsBetweenSegments(segments) {
  const gaps = [];
  for (let i = 0; i < segments.length - 1; i++) {
    const start = segments[i].end;
    const end = segments[i + 1].start;
    const dur = end - start;
    if (dur > 0) {
      gaps.push({ index: i, start, end, dur, mid: (start + end) / 2 });
    }
  }
  return gaps;
}

/** Merge fine bursts; keep only pauses long enough to be a line break. */
function lineBreakGaps(segments, minLinePauseSec) {
  return gapsBetweenSegments(segments).filter((g) => g.dur >= minLinePauseSec);
}

function neighborGapProximity(sorted, index) {
  let d = Infinity;
  if (index > 0) d = Math.min(d, sorted[index].mid - sorted[index - 1].mid);
  if (index < sorted.length - 1) d = Math.min(d, sorted[index + 1].mid - sorted[index].mid);
  return Number.isFinite(d) ? d : 999;
}

/** Pick (lineCount - 1) pause midpoints; drop short / clustered breath gaps. */
function selectLineGapMids(lineGaps, lineCount, duration) {
  const need = lineCount - 1;
  if (!need || !lineGaps.length) return [];
  let sorted = [...lineGaps].sort((a, b) => a.mid - b.mid);

  while (sorted.length > need) {
    let removeAt = 0;
    let bestScore = Infinity;
    for (let i = 0; i < sorted.length; i++) {
      // Drop short breath pauses; prefer dropping tail pauses right before the last pada.
      const tail = duration > 0 && sorted[i].mid > duration * 0.72 ? -0.03 : 0;
      const score = sorted[i].dur - neighborGapProximity(sorted, i) * 0.02 + tail;
      if (score < bestScore) {
        bestScore = score;
        removeAt = i;
      }
    }
    sorted.splice(removeAt, 1);
  }

  return sorted.map((g) => g.mid);
}

function boundsFromBreakMids(mids, duration) {
  const bounds = [0, ...mids, duration];
  return bounds.map((t) => Math.round(t * 1000) / 1000);
}

function segmentsFromBounds(bounds) {
  const out = [];
  for (let i = 0; i < bounds.length - 1; i++) {
    out.push({ start: bounds[i], end: bounds[i + 1] });
  }
  return out;
}

function mergeToCount(segments, targetCount, duration) {
  let segs = segments.map((s) => ({ ...s }));
  if (!segs.length) return [{ start: 0, end: duration }];

  while (segs.length > targetCount && segs.length > 1) {
    let best = 0;
    let bestGap = Infinity;
    for (let i = 0; i < segs.length - 1; i++) {
      const gap = segs[i + 1].start - segs[i].end;
      if (gap < bestGap) {
        bestGap = gap;
        best = i;
      }
    }
    segs[best] = { start: segs[best].start, end: segs[best + 1].end };
    segs.splice(best + 1, 1);
  }

  while (segs.length < targetCount) {
    let longest = 0;
    for (let i = 1; i < segs.length; i++) {
      if (segs[i].end - segs[i].start > segs[longest].end - segs[longest].start) longest = i;
    }
    const s = segs[longest];
    const mid = (s.start + s.end) / 2;
    segs.splice(longest, 1, { start: s.start, end: mid }, { start: mid, end: s.end });
  }

  return segs;
}

function weightedBounds(duration, lineCount, weights) {
  const w =
    Array.isArray(weights) && weights.length === lineCount
      ? weights.map((x) => Math.max(1, Number(x) || 1))
      : Array(lineCount).fill(1);
  const sum = w.reduce((a, b) => a + b, 0);
  const bounds = [0];
  let acc = 0;
  for (let i = 0; i < lineCount; i++) {
    acc += (w[i] / sum) * duration;
    bounds.push(acc);
  }
  bounds[lineCount] = duration;
  return bounds.map((t) => Math.round(t * 1000) / 1000);
}

/**
 * Detect how many lines the WAV pauses imply (line-end gaps only).
 */
function detectLineCountFromWav(filePath, opts = {}) {
  const { samples, sampleRate } = readWavPcm(filePath);
  const fine = detectSpeechSegments(samples, sampleRate, opts);
  const gaps = lineBreakGaps(fine, opts.minLinePauseSec ?? DEFAULT_OPTS.minLinePauseSec);
  const count = gaps.length + 1;
  return Math.max(1, Math.min(count, 8));
}

/**
 * Boundaries at pause midpoints between speech blocks.
 * @param {string} filePath
 * @param {number|null} lineCount - when set, use the (lineCount-1) longest pauses as line ends
 * @param {number[]|null} weights - fallback only if pause detection fails
 * @returns {number[]} length lineCount+1
 */
function computeLineTimingsFromWav(filePath, lineCount = null, weights = null) {
  const o = { ...DEFAULT_OPTS };
  const { samples, sampleRate, duration } = readWavPcm(filePath);
  if (duration <= 0) throw new Error('Empty audio');

  const fine = detectSpeechSegments(samples, sampleRate, o);
  const lineGaps = lineBreakGaps(fine, o.minLinePauseSec);

  let bounds = null;

  if (lineCount != null && lineCount >= 1) {
    if (lineGaps.length >= lineCount - 1) {
      const mids = selectLineGapMids(lineGaps, lineCount, duration);
      if (mids.length === lineCount - 1) bounds = boundsFromBreakMids(mids, duration);
    }
    if (!bounds && fine.length >= 1) {
      const merged = mergeToCount(fine, lineCount, duration);
      const mids = [];
      for (let i = 0; i < merged.length - 1; i++) {
        const gap = merged[i + 1].start - merged[i].end;
        mids.push(
          gap > 0.02
            ? (merged[i].end + merged[i + 1].start) / 2
            : (merged[i].end + merged[i + 1].end) / 2
        );
      }
      bounds = boundsFromBreakMids(mids, duration);
    }
  } else {
    const natural = lineGaps.length + 1;
    if (lineGaps.length >= 1) {
      bounds = boundsFromBreakMids(
        lineGaps.map((g) => g.mid),
        duration
      );
    } else if (fine.length >= 1) {
      bounds = boundsFromBreakMids(
        gapsBetweenSegments(fine).map((g) => g.mid),
        duration
      );
    }
    lineCount = natural;
  }

  if (!bounds || bounds.length < 2) {
    const n = lineCount || 4;
    return weightedBounds(duration, n, weights);
  }

  for (let i = 1; i < bounds.length; i++) {
    if (bounds[i] <= bounds[i - 1]) {
      const n = lineCount || bounds.length - 1;
      return weightedBounds(duration, n, weights);
    }
  }

  return bounds;
}

module.exports = {
  readWavPcm,
  detectSpeechSegments,
  detectLineCountFromWav,
  computeLineTimingsFromWav,
  weightedBounds,
  gapsBetweenSegments,
  lineBreakGaps,
  selectLineGapMids,
  DEFAULT_OPTS,
};
