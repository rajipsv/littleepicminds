import api, { API_URL } from '../api';

/** Credit line for Dhruv Jaradi / HF dataset (shown when chant audio plays). */
export const CHANT_AUDIO_CREDIT =
  'Śloka chanting audio by Dhruv Jaradi (JDhruv14/Bhagavad-Gita_Audio, Apache-2.0).';

export const CHANT_AUDIO_DATASET_URL =
  'https://huggingface.co/datasets/JDhruv14/Bhagavad-Gita_Audio';

let versesById = null;
let manifestPromise = null;

const durationByUrl = new Map();
let activeSegmentAudio = null;

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

/** Resolve play URL: CDN env → HF manifest → local API proxy. */
export function resolveChantAudioUrl(verseId, manifestVerses = versesById) {
  if (!verseId || !/^\d+\.\d+$/.test(String(verseId))) return null;

  const base = (import.meta.env.VITE_GITA_AUDIO_BASE_URL || '').trim().replace(/\/$/, '');
  if (base) return `${base}/${verseId}.wav`;

  const fromManifest = manifestVerses?.[verseId];
  if (typeof fromManifest === 'string' && fromManifest.startsWith('http')) {
    return fromManifest;
  }
  if (typeof fromManifest === 'object' && fromManifest?.url) {
    return fromManifest.url;
  }

  return `${API_URL || ''}/api/gita-audio/${encodeURIComponent(verseId)}`;
}

/** @returns {number[]|null} boundaries length lineCount+1 */
export function getManifestLineTimings(verseId, manifestVerses = versesById) {
  const entry = manifestVerses?.[verseId];
  if (!entry || typeof entry !== 'object') return null;
  const t = entry.lineTimings;
  if (!Array.isArray(t) || t.length < 2) return null;
  const nums = t.map((x) => Number(x)).filter((x) => Number.isFinite(x));
  return nums.length >= 2 ? nums : null;
}

export function stopChantSegment() {
  if (activeSegmentAudio) {
    activeSegmentAudio.pause();
    activeSegmentAudio.src = '';
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
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    activeSegmentAudio = audio;
    audio.playbackRate = playbackRate;

    const finish = () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onErr);
      if (activeSegmentAudio === audio) activeSegmentAudio = null;
      resolve();
    };

    const onTimeUpdate = () => {
      if (audio.currentTime >= endSec - 0.08) {
        audio.pause();
        finish();
      }
    };
    const onEnded = () => finish();
    const onErr = () => {
      if (activeSegmentAudio === audio) activeSegmentAudio = null;
      reject(new Error('Chant segment failed'));
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onErr);

    const start = () => {
      audio.currentTime = Math.max(0, startSec);
      audio.play().catch(onErr);
    };

    if (audio.readyState >= 1) start();
    else audio.addEventListener('loadedmetadata', start, { once: true });
  });
}
