import api, { API_URL } from '../api';

/** Dataset URL (attribution on About / introduction only). */
export const CHANT_AUDIO_DATASET_URL =
  'https://huggingface.co/datasets/JDhruv14/Bhagavad-Gita_Audio';

const CHANT_URL_CACHE_BUST = 'v=2';

let versesById = null;
let manifestPromise = null;

const durationByUrl = new Map();
/** @type {Map<string, { audio: HTMLAudioElement, ready?: boolean, promise?: Promise<HTMLAudioElement> }>} */
const preloadedByUrl = new Map();
let activeSegmentAudio = null;

function appendCacheBust(url) {
  if (!url || url.startsWith('data:')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${CHANT_URL_CACHE_BUST}`;
}

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

/**
 * Build segment start times for row play: length lineCount+1.
 * Segment i plays [bounds[i], bounds[i+1]].
 */
export function buildPlayBounds(raw, lineCount, { duration, introEnd, hasChantIntro } = {}) {
  const nums = (raw || []).map((x) => Number(x)).filter((x) => Number.isFinite(x));
  if (!lineCount || !Number.isFinite(duration) || duration <= 0 || nums.length < 1) {
    return null;
  }

  const ie = Number(introEnd);
  const intro = Number.isFinite(ie) && ie > 0 ? ie : null;

  // Speaker intro (e.g. "dhṛtarāṣṭra uvāca") is in the WAV but not a table row.
  // lineEnds are pada boundaries; first end is where pada 1 starts (not 0).
  if (hasChantIntro) {
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

  // Full chain from offline script: [0, t1, …, tN] (may include duration as last)
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

/** Prefer lineEnds + introEnd; fall back to legacy lineTimings. */
export function getManifestTimingInput(verseId, manifestVerses = versesById) {
  const entry = manifestVerses?.[verseId];
  if (!entry || typeof entry !== 'object') return null;

  const introEnd = getManifestIntroEnd(verseId, manifestVerses);
  if (Array.isArray(entry.lineEnds) && entry.lineEnds.length >= 1) {
    return {
      lineEnds: entry.lineEnds.map((x) => Number(x)).filter((x) => Number.isFinite(x)),
      introEnd,
    };
  }

  const legacy = getManifestLineTimings(verseId, manifestVerses);
  if (legacy?.length) return { lineEnds: legacy, introEnd };
  return null;
}

export async function ensureGitaChantManifest() {
  if (versesById) return versesById;
  if (!manifestPromise) {
    manifestPromise = api
      .get('/api/gita-audio/manifest')
      .then((res) => {
        versesById = res.data?.verses || {};
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

/** Resolve play URL — prefer manifest (API proxy); VITE CDN only as fallback. */
export function resolveChantAudioUrl(verseId, manifestVerses = versesById) {
  if (!verseId || !/^\d+\.\d+$/.test(String(verseId))) return null;

  const fromManifest = manifestVerses?.[verseId];
  let url = null;
  if (typeof fromManifest === 'string' && fromManifest.startsWith('http')) {
    url = fromManifest;
  } else if (typeof fromManifest === 'object' && fromManifest?.url) {
    url = fromManifest.url;
  }

  if (!url) {
    const base = (import.meta.env.VITE_GITA_AUDIO_BASE_URL || '').trim().replace(/\/$/, '');
    if (base) url = `${base}/${verseId}.wav`;
    else url = `${API_URL || ''}/api/gita-audio/${encodeURIComponent(verseId)}`;
  }

  if (url && (url.startsWith('/') || url.includes('/api/gita-audio/'))) {
    return appendCacheBust(url);
  }
  return url;
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

  const timing = getManifestTimingInput(verseId, manifest);
  let duration = getManifestDuration(verseId, manifest);
  if (!duration) {
    try {
      duration = await loadChantDuration(url);
    } catch {
      duration = null;
    }
  }

  let bounds = null;
  if (timing?.lineEnds?.length && duration) {
    bounds = buildPlayBounds(timing.lineEnds, lineCount, {
      duration,
      introEnd: timing.introEnd,
      hasChantIntro,
    });
  }

  preloadChantAudio(url).catch(() => {});

  return { url, bounds, duration, timing };
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

export function playChantSegment(url, startSec, endSec, playbackRate = 0.9) {
  stopChantSegment();
  return preloadChantAudio(url).then((audio) => {
    activeSegmentAudio = audio;
    audio.playbackRate = playbackRate;

    return new Promise((resolve, reject) => {
      let seekVerified = startSec <= 0.05;

      const cleanup = () => {
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('seeked', onSeeked);
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onErr);
      };

      const finish = () => {
        cleanup();
        if (activeSegmentAudio === audio) activeSegmentAudio = null;
        resolve();
      };

      const onTimeUpdate = () => {
        if (audio.currentTime >= endSec - 0.08) {
          audio.pause();
          finish();
        }
      };

      const onSeeked = () => {
        seekVerified = true;
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
        const target = Math.max(0, startSec);
        if (Math.abs(audio.currentTime - target) > 0.15) {
          audio.addEventListener('seeked', onSeeked, { once: true });
          audio.currentTime = target;
        } else {
          seekVerified = true;
        }
        audio
          .play()
          .then(() => {
            if (seekVerified) return;
            setTimeout(() => {
              if (!seekVerified && Math.abs(audio.currentTime - target) >= 0.25) {
                failSeek();
              } else {
                seekVerified = true;
              }
            }, 120);
          })
          .catch(onErr);
      };

      if (audio.readyState >= 2) beginPlay();
      else audio.addEventListener('loadeddata', beginPlay, { once: true });
    });
  });
}
