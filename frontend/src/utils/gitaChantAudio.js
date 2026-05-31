import api, { API_URL } from '../api';

/** Credit line for Dhruv Jaradi / HF dataset (shown when chant audio plays). */
export const CHANT_AUDIO_CREDIT =
  'Śloka chanting audio by Dhruv Jaradi (JDhruv14/Bhagavad-Gita_Audio, Apache-2.0).';

export const CHANT_AUDIO_DATASET_URL =
  'https://huggingface.co/datasets/JDhruv14/Bhagavad-Gita_Audio';

let versesById = null;
let manifestPromise = null;

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

  return `${API_URL || ''}/api/gita-audio/${encodeURIComponent(verseId)}`;
}
