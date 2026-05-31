import api from '../api';
import { getLineScriptText, ttsLangForMeaningText } from './verseDisplay';
import {
  ensureGitaChantManifest,
  resolveChantAudioUrl,
} from './gitaChantAudio';

const DEFAULT_GAP_MS = 450;

export {
  ensureGitaChantManifest,
  resolveChantAudioUrl,
};

/** Sync resolve after ensureGitaChantManifest() has run. */
export function getChantAudioUrl(verseId) {
  return resolveChantAudioUrl(verseId);
}

export function lineTextFromRow(item, lang) {
  return getLineScriptText(item, lang);
}

export function linesFromBreakdown(wordByWord, lang) {
  if (!wordByWord?.length) return [];
  return wordByWord.map((row) => lineTextFromRow(row, lang)).filter(Boolean);
}

const browserTtsOnly = () =>
  import.meta.env.VITE_TTS_BROWSER_ONLY === 'true' ||
  import.meta.env.VITE_TTS_BROWSER_ONLY === '1';

export async function fetchTtsAudio(text, targetLang) {
  if (browserTtsOnly()) {
    const err = new Error('Browser-only TTS mode');
    err.useBrowser = true;
    throw err;
  }
  const lang = ttsLangForMeaningText(text, targetLang);
  try {
    const res = await api.post('/api/tts', {
      text,
      target_language_code: lang,
      speaker: 'priya',
    });
    if (!res.data?.audios?.[0]) throw new Error('No audio');
    return {
      base64: res.data.audios[0],
      encoding: res.data.audioEncoding === 'MP3' ? 'mpeg' : 'wav',
    };
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.error || err.message || 'TTS failed';
    const e = new Error(msg);
    e.useBrowser = err.response?.data?.useBrowser ?? status !== 400;
    throw e;
  }
}

/** Free browser voice when Sarvam/Google TTS is unavailable (common for te-IN cache misses). */
export function speakWithBrowser(text, uiLang = 'en') {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }
    const ttsLang = ttsLangForMeaningText(text, uiLang);
    const bcp47 =
      ttsLang === 'te' ? 'te-IN' : ttsLang === 'hi' ? 'hi-IN' : 'en-IN';

    const run = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => v.lang === bcp47) ||
        voices.find((v) => v.lang.replace(/_/g, '-') === bcp47) ||
        voices.find((v) => v.lang.startsWith(ttsLang)) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0];

      const utterance = new SpeechSynthesisUtterance(text);
      if (preferred) utterance.voice = preferred;
      utterance.lang = preferred?.lang || bcp47;
      utterance.rate = 0.85;
      utterance.onend = () => resolve();
      utterance.onerror = () => reject(new Error('Browser speech failed'));

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length) run();
    else {
      const onVoices = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
        run();
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoices);
      setTimeout(() => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
        run();
      }, 400);
    }
  });
}

/** Server TTS (Sarvam/Google/cache); always falls back to browser voice on failure. */
export async function playTtsOrBrowser(text, uiLang, playbackRate = 0.9) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return;
  if (browserTtsOnly()) {
    await speakWithBrowser(trimmed, uiLang);
    return;
  }
  try {
    const { base64, encoding } = await fetchTtsAudio(trimmed, uiLang);
    await playAudioBase64(base64, encoding, playbackRate);
  } catch (err) {
    console.warn('[TTS] Using browser voice:', err.message);
    await speakWithBrowser(trimmed, uiLang);
  }
}

export async function playMeaningAudio(text, uiLang, playbackRate = 0.9) {
  return playTtsOrBrowser(text, uiLang, playbackRate);
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
    if (signal?.aborted) break;
    try {
      const { base64, encoding } = await fetchTtsAudio(line, targetLang);
      await playAudioBase64(base64, encoding, playbackRate);
    } catch {
      await speakWithBrowser(line, targetLang);
    }
    if (signal?.aborted) break;
    if (i < lines.length - 1 && !signal?.aborted) {
      await delay(gapMs);
    }
  }
}

export { DEFAULT_GAP_MS };
