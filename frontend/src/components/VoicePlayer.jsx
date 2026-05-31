import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Settings2, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  playLineSequence,
  fetchTtsAudio,
  stopMeaningAudio,
  ensureGitaChantManifest,
  resolveChantAudioUrl,
  DEFAULT_GAP_MS,
} from '../utils/lineTts';
import { stopChantSegment } from '../utils/gitaChantAudio';

const VoicePlayer = ({
  text,
  lines,
  verseId,
  lineGapMs = DEFAULT_GAP_MS,
  onWordBoundary,
  onLineStart,
  onEnd,
  targetLang,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [lastPlayUsedBrowser, setLastPlayUsedBrowser] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [rate, setRate] = useState(1);
  const [voiceMode, setVoiceMode] = useState('divine');

  const audioRef = useRef(null);
  const utteranceRef = useRef(null);
  const abortRef = useRef(null);
  const { currentLang } = useAuth();

  const [chantUrl, setChantUrl] = useState(null);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (audioRef.current) audioRef.current.pause();
      stopChantSegment();
      stopMeaningAudio();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!verseId) {
      setChantUrl(null);
      return undefined;
    }
    (async () => {
      const manifest = await ensureGitaChantManifest();
      if (!cancelled) setChantUrl(resolveChantAudioUrl(verseId, manifest));
    })();
    return () => {
      cancelled = true;
    };
  }, [verseId]);

  const effectiveLang = targetLang || currentLang || 'hi';
  const playbackRate = voiceMode === 'divine' ? 0.85 : rate;
  const shlokaLines = Array.isArray(lines) ? lines.filter((l) => l?.trim()) : [];

  const playChantWav = (url) =>
    new Promise((resolve, reject) => {
      if (!url) return reject(new Error('No chant URL'));
      const audio = new Audio();
      audioRef.current = audio;
      audio.preload = 'auto';
      audio.playbackRate = playbackRate;

      const cleanup = () => {
        audio.removeEventListener('canplay', onCanPlay);
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onErr);
      };

      const onEnded = () => {
        cleanup();
        resolve();
      };
      const onErr = () => {
        cleanup();
        if (audioRef.current === audio) audioRef.current = null;
        reject(new Error('Chant audio failed'));
      };
      const onCanPlay = () => {
        audio.playbackRate = playbackRate;
        audio.play().catch(onErr);
      };

      audio.addEventListener('canplay', onCanPlay, { once: true });
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onErr);
      audio.src = url;
    });

  const playAiVoice = async () => {
    stopMeaningAudio();
    stopChantSegment();
    setIsAiLoading(true);
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    try {
      let resolvedChantUrl = chantUrl;
      if (verseId) {
        const manifest = await ensureGitaChantManifest();
        resolvedChantUrl = resolveChantAudioUrl(verseId, manifest);
      }
      if (resolvedChantUrl) {
        try {
          await playChantWav(resolvedChantUrl);
          if (!signal.aborted) {
            setIsPlaying(false);
            setLastPlayUsedBrowser(false);
            if (onEnd) onEnd();
          }
          return;
        } catch (chantErr) {
          console.warn('Chant WAV unavailable, falling back to TTS:', chantErr.message);
        }
      }

      if (shlokaLines.length > 0) {
        await playLineSequence(shlokaLines, {
          targetLang: effectiveLang,
          gapMs: lineGapMs,
          playbackRate,
          signal,
          onLineStart: (index) => {
            if (onLineStart) onLineStart(index);
            if (onWordBoundary) onWordBoundary(index);
          },
        });
        if (!signal.aborted) {
          setIsPlaying(false);
          setLastPlayUsedBrowser(false);
          if (onEnd) onEnd();
        }
        return;
      }

      const { base64, encoding } = await fetchTtsAudio(text, effectiveLang);
      const audioSrc = `data:audio/${encoding};base64,${base64}`;
      const audio = new Audio(audioSrc);
      audioRef.current = audio;
      audio.playbackRate = playbackRate;

      audio.onended = () => {
        setIsPlaying(false);
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setLastPlayUsedBrowser(true);
        playBrowserVoice();
      };

      await audio.play();
      setIsPlaying(true);
      setLastPlayUsedBrowser(false);
    } catch (err) {
      if (signal.aborted) return;
      console.warn('TTS failed, using browser voice:', err.message);
      setLastPlayUsedBrowser(true);
      if (shlokaLines.length > 0) {
        playBrowserLines();
      } else {
        playBrowserVoice();
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const playBrowserLines = () => {
    if (!('speechSynthesis' in window) || !shlokaLines.length) return;
    window.speechSynthesis.cancel();
    let i = 0;
    const speakNext = () => {
      if (i >= shlokaLines.length) {
        setIsPlaying(false);
        if (onEnd) onEnd();
        return;
      }
      if (onLineStart) onLineStart(i);
      if (onWordBoundary) onWordBoundary(i);
      const utterance = new SpeechSynthesisUtterance(shlokaLines[i]);
      utterance.rate = voiceMode === 'divine' ? 0.8 : rate;
      utterance.onend = () => {
        i += 1;
        setTimeout(speakNext, lineGapMs);
      };
      window.speechSynthesis.speak(utterance);
    };
    setIsPlaying(true);
    speakNext();
  };

  const playBrowserVoice = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    const voices = window.speechSynthesis.getVoices();
    const langPrefix =
      effectiveLang === 'te' ? 'te' : effectiveLang === 'hi' ? 'hi' : 'en';
    const preferred =
      voices.find((v) => v.lang.startsWith(langPrefix)) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];

    if (preferred) utterance.voice = preferred;
    utterance.lang = preferred?.lang || (langPrefix === 'te' ? 'te-IN' : langPrefix === 'hi' ? 'hi-IN' : 'en-US');
    utterance.rate = voiceMode === 'divine' ? 0.8 : rate;
    utterance.pitch = voiceMode === 'divine' ? 0.9 : 1;

    utterance.onboundary = (event) => {
      if (event.name === 'word' && onWordBoundary) {
        const textUntilBoundary = text.substring(0, event.charIndex);
        const wordIndex = textUntilBoundary.split(/\s+/).length - 1;
        onWordBoundary(wordIndex);
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (abortRef.current) abortRef.current.abort();
      if (audioRef.current) audioRef.current.pause();
      stopChantSegment();
      stopMeaningAudio();
      setIsPlaying(false);
      if (onEnd) onEnd();
    } else {
      setIsPlaying(true);
      playAiVoice();
    }
  };

  return (
    <div className="flex items-center space-x-3 bg-lem-dark/50 p-2 rounded-full border border-lem-glass-border shadow-md">
      <button
        onClick={togglePlay}
        disabled={isAiLoading}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-sm relative ${
          isPlaying
            ? 'bg-red-500 text-white hover:bg-red-600'
            : isAiLoading
              ? 'bg-lem-sidebar text-gray-400'
              : 'bg-gradient-accent text-lem-dark hover:scale-105 shadow-[0_0_15px_rgba(253,160,133,0.3)]'
        }`}
        aria-label={isPlaying ? 'Pause voice' : 'Play voice'}
      >
        {isAiLoading ? (
          <div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-lem-accent rounded-full"></div>
        ) : isPlaying ? (
          <Pause size={24} className="fill-current" />
        ) : (
          <Play size={24} className="fill-current ml-1" />
        )}

        {!lastPlayUsedBrowser && !isPlaying && !isAiLoading && (
          <Sparkles className="absolute -top-1 -right-1 text-white drop-shadow-md w-5 h-5 animate-pulse" />
        )}
      </button>

      <div className="relative">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-lem-accent transition-colors rounded-full hover:bg-white/5"
          aria-label="Voice settings"
        >
          <Settings2 size={20} />
        </button>

        {showSettings && (
          <div className="absolute top-full mt-3 right-0 md:left-1/2 md:-translate-x-1/2 bg-lem-sidebar border border-lem-glass-border rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] p-5 w-64 z-50 flex flex-col space-y-5 animate-slide-up">

            {lastPlayUsedBrowser && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs p-3 rounded-xl flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p>Last play used browser voice. Set GOOGLE_TTS_API_KEY or SARVAM_API_KEY on server, then press play again.</p>
              </div>
            )}

            <div className="flex flex-col space-y-2">
              <label className="text-xs font-bold text-lem-accent uppercase tracking-widest">Voice Style</label>
              <div className="flex bg-lem-dark/80 rounded-lg p-1 border border-lem-glass-border">
                <button
                  onClick={() => setVoiceMode('divine')}
                  className={`flex-1 text-xs py-2 rounded-md font-bold transition-all ${voiceMode === 'divine' ? 'bg-lem-accent text-lem-dark shadow-sm' : 'text-gray-300 hover:text-white'}`}
                >
                  Divine (Slow)
                </button>
                <button
                  onClick={() => setVoiceMode('normal')}
                  className={`flex-1 text-xs py-2 rounded-md font-bold transition-all ${voiceMode === 'normal' ? 'bg-lem-accent text-lem-dark shadow-sm' : 'text-gray-300 hover:text-white'}`}
                >
                  Normal
                </button>
              </div>
            </div>

            {voiceMode === 'normal' && (
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold text-white uppercase tracking-widest flex justify-between">
                  <span>Reading Speed</span>
                  <span className="text-lem-accent">{rate}x</span>
                </label>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.25"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full accent-lem-accent h-2 bg-lem-dark rounded-full appearance-none outline-none"
                />
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default VoicePlayer;
