import api from '../api';

const DEFAULT_GAP_MS = 450;

export function lineTextFromRow(item, isTe) {
  if (!item) return '';
  if (isTe && item.sanskrit_te) return String(item.sanskrit_te).trim();
  return String(item.transliteration || item.word || item.sanskrit || '').trim();
}

export function linesFromBreakdown(wordByWord, isTe) {
  if (!wordByWord?.length) return [];
  const lang = isTe ? 'te' : 'hi';
  return wordByWord.map((row) => lineTextFromRow(row, isTe)).filter(Boolean);
}

export async function fetchTtsAudio(text, targetLang) {
  const res = await api.post('/api/tts', {
    text,
    target_language_code: targetLang,
    speaker: 'priya',
  });
  if (!res.data?.audios?.[0]) throw new Error('No audio');
  return {
    base64: res.data.audios[0],
    encoding: res.data.audioEncoding === 'MP3' ? 'mpeg' : 'wav',
  };
}

export function playAudioBase64(base64, encoding, playbackRate = 1) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(`data:audio/${encoding};base64,${base64}`);
    audio.playbackRate = playbackRate;
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('Audio playback failed'));
    audio.play().catch(reject);
  });
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Play cached per-line TTS in order (full śloka = same clips as MeaningTable rows).
 */
export async function playLineSequence(lines, {
  targetLang,
  gapMs = DEFAULT_GAP_MS,
  playbackRate = 1,
  onLineStart,
  signal,
} = {}) {
  for (let i = 0; i < lines.length; i++) {
    if (signal?.aborted) break;
    const line = lines[i];
    if (!line?.trim()) continue;
    onLineStart?.(i);
    try {
      const { base64, encoding } = await fetchTtsAudio(line, targetLang);
      if (signal?.aborted) break;
      await playAudioBase64(base64, encoding, playbackRate);
    } catch (err) {
      throw err;
    }
    if (i < lines.length - 1 && !signal?.aborted) {
      await delay(gapMs);
    }
  }
}

export { DEFAULT_GAP_MS };
