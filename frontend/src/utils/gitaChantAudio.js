import api from '../api';
import {
  resolveIntroCutSec,
  buildPlayBounds,
  buildLineSegments,
} from '../../../lib/gita-chant-segments.js';

export { resolveIntroCutSec, buildPlayBounds, buildLineSegments };

/** Dataset URL (attribution on About / introduction only). */
export const CHANT_AUDIO_DATASET_URL =
  'https://huggingface.co/datasets/JDhruv14/Bhagavad-Gita_Audio';

let versesById = null;
let manifestPromise = null;

const durationByUrl = new Map();
/** @type {Map<string, { audio: HTMLAudioElement, ready?: boolean, promise?: Promise<HTMLAudioElement> }>} */
const preloadedByUrl = new Map();
let activeSegmentAudio = null;

/** Prefer lineEnds + introEnd; fall back to legacy lineTimings. */
export function getManifestTimingInput(verseId, manifestVerses = versesById, { hasChantIntro } = {}) {
  const entry = manifestVerses?.[verseId];
  if (!entry || typeof entry !== 'object') return null;

  let introEnd = getManifestIntroEnd(verseId, manifestVerses);
  let lineEnds = null;
  if (Array.isArray(entry.lineEnds) && entry.lineEnds.length >= 1) {
    lineEnds = entry.lineEnds.map((x) => Number(x)).filter((x) => Number.isFinite(x));
  } else {
    const legacy = getManifestLineTimings(verseId, manifestVerses);
    if (legacy?.length) lineEnds = legacy;
  }
  if (!lineEnds?.length) return null;

  if (!introEnd && hasChantIntro) {
    introEnd = resolveIntroCutSec({ hasChantIntro: true, lineEnds });
  }
  return { lineEnds, introEnd };
}

export async function ensureGitaChantManifest() {
  if (versesById) return versesById;
  if (!manifestPromise) {
    manifestPromise = api
      .get('/api/gita-audio/manifest')
      .then((res) => {
        versesById = res.data?.verses || {};
        versesById._audioBaseUrl = res.data?.audioBaseUrl || null;
        return versesById;
      })
      .catch((err) => {
        console.warn('Gita audio manifest unavailable:', err.message);
        versesById = {};
        return versesById;
      });
  }
  return manifestPromise;
}

/** Resolve play URL — R2/CDN only (requires GITA_AUDIO_BASE_URL / VITE_GITA_AUDIO_BASE_URL). */
export function resolveChantAudioUrl(verseId, manifestVerses = versesById) {
  if (!verseId || !/^\d+\.\d+$/.test(String(verseId))) return null;

  const base = (
    manifestVerses?._audioBaseUrl ||
    import.meta.env.VITE_GITA_AUDIO_BASE_URL ||
    ''
  )
    .trim()
    .replace(/\/$/, '');

  if (!base) return null;
  return `${base}/${verseId}.wav`;
}

/** @returns {number[]|null} legacy line end times (prefer getManifestTimingInput). */
export function getManifestLineTimings(verseId, manifestVerses = versesById) {
  const entry = manifestVerses?.[verseId];
  if (!entry || typeof entry !== 'object') return null;
  const t = entry.lineTimings;
  if (!Array.isArray(t) || t.length < 2) return null;
  const nums = t.map((x) => Number(x)).filter((x) => Number.isFinite(x));
  if (nums.length < 2) return null;
  const introEnd = Number(entry.introEnd);
  if (Number.isFinite(introEnd) && introEnd > 0) {
    if (nums[0] < 0.05) return nums.slice(1);
    if (Math.abs(nums[0] - introEnd) > 0.2) return [introEnd, ...nums];
  }
  return nums;
}

export function getManifestIntroEnd(verseId, manifestVerses = versesById) {
  const entry = manifestVerses?.[verseId];
  if (!entry || typeof entry !== 'object') return null;
  const v = Number(entry.introEnd);
  return Number.isFinite(v) && v > 0 ? v : null;
}

/** Duration from manifest when available — avoids a separate metadata fetch. */
export function getManifestDuration(verseId, manifestVerses = versesById) {
  const entry = manifestVerses?.[verseId];
  if (!entry || typeof entry !== 'object') return null;
  const d = Number(entry.duration);
  if (Number.isFinite(d) && d > 0) return d;
  const ends = entry.lineEnds || entry.lineTimings;
  if (Array.isArray(ends) && ends.length) {
    const max = Math.max(...ends.map((x) => Number(x)).filter((x) => Number.isFinite(x)));
    if (max > 0) return max + 0.5;
  }
  return null;
}

export function releasePreloadedChant(url) {
  if (!url) return;
  const slot = preloadedByUrl.get(url);
  if (slot?.audio) {
    slot.audio.pause();
    slot.audio.removeAttribute('src');
    slot.audio.load();
  }
  preloadedByUrl.delete(url);
}

/** Buffer full verse WAV once; reuse for line segments. */
export function preloadChantAudio(url) {
  if (!url) return Promise.reject(new Error('No chant URL'));
  const slot = preloadedByUrl.get(url);
  if (slot?.ready && slot.audio) return Promise.resolve(slot.audio);
  if (slot?.promise) return slot.promise;

  const audio = new Audio();
  audio.preload = 'auto';

  const promise = new Promise((resolve, reject) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      preloadedByUrl.set(url, { audio, ready: true });
      resolve(audio);
    };
    const onErr = () => {
      if (settled) return;
      settled = true;
      preloadedByUrl.delete(url);
      reject(new Error('Chant preload failed'));
    };
    audio.addEventListener('loadeddata', finish, { once: true });
    audio.addEventListener('error', onErr, { once: true });
    audio.src = url;
  });

  preloadedByUrl.set(url, { audio, promise });
  return promise;
}

/**
 * Warm manifest, bounds, and audio buffer for a verse (call when Learn table mounts).
 */
export async function prefetchVerseChant(verseId, { lineCount, hasChantIntro } = {}) {
  if (!verseId || !lineCount) return null;
  const manifest = await ensureGitaChantManifest();
  const url = resolveChantAudioUrl(verseId, manifest);
  if (!url) return null;

  const timing = getManifestTimingInput(verseId, manifest, { hasChantIntro });
  let duration = getManifestDuration(verseId, manifest);
  if (!duration) {
    try {
      duration = await loadChantDuration(url);
    } catch {
      duration = null;
    }
  }

  const opts = {
    duration,
    introEnd: timing?.introEnd,
    hasChantIntro,
  };
  let segments = null;
  if (timing?.lineEnds?.length && duration) {
    segments = buildLineSegments(timing.lineEnds, lineCount, opts);
  }

  preloadChantAudio(url).catch(() => {});

  return {
    url,
    bounds: segments?.map((s) => s.start).concat(segments[segments.length - 1]?.end ?? duration),
    segments,
    duration,
    timing,
  };
}

export function stopChantSegment() {
  if (activeSegmentAudio) {
    activeSegmentAudio.pause();
    activeSegmentAudio = null;
  }
}

export function loadChantDuration(url) {
  if (durationByUrl.has(url)) return Promise.resolve(durationByUrl.get(url));
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      const d = audio.duration;
      if (Number.isFinite(d) && d > 0) {
        durationByUrl.set(url, d);
        resolve(d);
      } else {
        reject(new Error('Invalid duration'));
      }
    };
    audio.onerror = () => reject(new Error('Failed to load chant metadata'));
    audio.src = url;
  });
}

/** Segment boundaries [0, t1, t2, …, duration] for N lines. */
export function computeLineBoundaries(duration, lineCount, weights) {
  if (!lineCount || duration <= 0) return [0, duration];
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
  return bounds;
}

export async function getVerseLineBoundaries(url, lineCount, weights) {
  const duration = await loadChantDuration(url);
  return computeLineBoundaries(duration, lineCount, weights);
}

export function playChantSegment(url, startSec, endSec, playbackRate = 0.9, minStartSec = 0) {
  stopChantSegment();
  const start = Math.max(startSec, minStartSec);
  return preloadChantAudio(url).then((audio) => {
    activeSegmentAudio = audio;
    audio.playbackRate = playbackRate;

    return new Promise((resolve, reject) => {
      let seekVerified = start <= 0.05;

      const cleanup = () => {
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onErr);
      };

      const finish = () => {
        cleanup();
        if (activeSegmentAudio === audio) activeSegmentAudio = null;
        resolve();
      };

      const onTimeUpdate = () => {
        if (minStartSec > 0 && audio.currentTime < minStartSec - 0.05) {
          audio.currentTime = start;
        }
        if (audio.currentTime >= endSec - 0.08) {
          audio.pause();
          finish();
        }
      };

      const onEnded = () => finish();
      const onErr = () => {
        cleanup();
        if (activeSegmentAudio === audio) activeSegmentAudio = null;
        reject(new Error('Chant segment failed'));
      };

      const failSeek = () => {
        cleanup();
        if (activeSegmentAudio === audio) activeSegmentAudio = null;
        reject(new Error('Chant seek failed'));
      };

      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onErr);

      const beginPlay = () => {
        const target = Math.max(minStartSec, start);
        audio.pause();

        const playAtTarget = () => {
          if (Math.abs(audio.currentTime - target) > 0.25) {
            failSeek();
            return;
          }
          seekVerified = true;
          audio.playbackRate = playbackRate;
          audio.play().catch(onErr);
        };

        if (Math.abs(audio.currentTime - target) <= 0.12) {
          playAtTarget();
          return;
        }

        const onSeekedPlay = () => {
          audio.removeEventListener('seeked', onSeekedPlay);
          playAtTarget();
        };
        audio.addEventListener('seeked', onSeekedPlay);
        audio.currentTime = target;

        setTimeout(() => {
          if (seekVerified) return;
          if (Math.abs(audio.currentTime - target) <= 0.25) {
            audio.removeEventListener('seeked', onSeekedPlay);
            playAtTarget();
          } else {
            failSeek();
          }
        }, 400);
      };

      if (audio.readyState >= 2) beginPlay();
      else audio.addEventListener('loadeddata', beginPlay, { once: true });
    });
  });
}
