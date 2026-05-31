/**
 * Detect line boundaries in verse chanting WAV via silence / energy gaps.
 * Used offline by scripts/compute-gita-line-timings.js
 */
const fs = require('fs');

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

function detectSpeechSegments(samples, sampleRate, opts = {}) {
  const minSilenceSec = opts.minSilenceSec ?? 0.12;
  const thresholdRatio = opts.thresholdRatio ?? 0.08;
  const { energies, win } = rmsPerWindow(samples, sampleRate);
  if (!energies.length) return [{ start: 0, end: samples.length / sampleRate }];

  const sorted = [...energies].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] || 0;
  const peak = Math.max(...energies, 0.0001);
  const threshold = Math.max(median * 2.5, peak * thresholdRatio, 0.002);

  const windowSec = win / sampleRate;
  const minSilenceWindows = Math.max(1, Math.ceil(minSilenceSec / windowSec));

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
        const end = Math.max(segStart, i * windowSec - minSilenceSec * 0.5);
        if (end - segStart >= 0.08) segments.push({ start: segStart, end });
        segStart = null;
        silenceRun = 0;
      }
    }
  }
  const duration = samples.length / sampleRate;
  if (segStart != null) segments.push({ start: segStart, end: duration });

  return segments.filter((s) => s.end - s.start >= 0.06);
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

function segmentsToBounds(segments, duration) {
  const bounds = [0];
  for (const s of segments) bounds.push(Math.min(duration, s.end));
  if (bounds[bounds.length - 1] < duration - 0.01) bounds.push(duration);
  else bounds[bounds.length - 1] = duration;
  return bounds.map((t) => Math.round(t * 1000) / 1000);
}

/**
 * @returns {number[]} boundaries length lineCount+1
 */
function computeLineTimingsFromWav(filePath, lineCount, weights) {
  if (!lineCount || lineCount < 1) return [0];

  const { samples, sampleRate, duration } = readWavPcm(filePath);
  if (duration <= 0) throw new Error('Empty audio');

  const raw = detectSpeechSegments(samples, sampleRate);
  const aligned = mergeToCount(raw, lineCount, duration);
  let bounds = segmentsToBounds(aligned, duration);

  if (bounds.length !== lineCount + 1) {
    bounds = weightedBounds(duration, lineCount, weights);
  }

  for (let i = 1; i < bounds.length; i++) {
    if (bounds[i] <= bounds[i - 1]) {
      return weightedBounds(duration, lineCount, weights);
    }
  }

  return bounds;
}

module.exports = {
  readWavPcm,
  detectSpeechSegments,
  computeLineTimingsFromWav,
  weightedBounds,
};
