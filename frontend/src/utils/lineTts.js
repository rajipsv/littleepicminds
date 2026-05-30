import api, { API_URL } from '../api';
import { getLineScriptText } from './verseDisplay';

const DEFAULT_GAP_MS = 450;

/** Apache-2.0 HF chanting WAV when synced (npm run gita:sync-hf-audio). */
export function getChantAudioUrl(verseId) {
  if (!verseId || !/^\d+\.\d+$/.test(String(verseId))) return null;
  return `${API_URL || ''}/api/gita-audio/${encodeURIComponent(verseId)}`;
}

export function lineTextFromRow(item, lang) {
  return getLineScriptText(item, lang);
}

export function linesFromBreakdown(wordByWord, lang) {
  if (!wordByWord?.length) return [];
  return wordByWord.map((row) => lineTextFromRow(row, lang)).filter(Boolean);
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
    const { base64, encoding } = await fetchTtsAudio(line, targetLang);
    if (signal?.aborted) break;
    await playAudioBase64(base64, encoding, playbackRate);
    if (i < lines.length - 1 && !signal?.aborted) {
      await delay(gapMs);
    }
  }
}

export { DEFAULT_GAP_MS };
