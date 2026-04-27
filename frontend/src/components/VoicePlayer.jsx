import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Settings2, Sparkles, AlertCircle } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const VoicePlayer = ({ text, onWordBoundary, onEnd, targetLang }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [rate, setRate] = useState(1);
  const [voiceMode, setVoiceMode] = useState('divine'); // 'divine' or 'normal'
  
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);
  const { currentLang } = useAuth();
  const isTe = currentLang === 'te';

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const playAiVoice = async () => {
    setIsAiLoading(true);
    try {
      console.log("Attempting to fetch AI voice from our central API...");
      // Use relative path - api instance already has baseURL configured correctly
      const res = await api.post('/api/tts', {
        text: text,
        target_language_code: targetLang || currentLang || 'hi', 
        speaker: 'roopa' 
      });

      if (res.data.audios && res.data.audios.length > 0 && res.data.audios[0]) {
        const audioLen = res.data.audios[0].length;
        console.log("Audio received from Sarvam! Length:", audioLen);
        // alert("Audio received! Length: " + audioLen);
        
        // 2. Play the base64 audio
        const audioSrc = `data:audio/wav;base64,${res.data.audios[0]}`;
        const audio = new Audio(audioSrc);
        audioRef.current = audio;
        
        audio.playbackRate = voiceMode === 'divine' ? 0.85 : rate;

        audio.onended = () => {
          setIsPlaying(false);
          if (onEnd) onEnd();
        };

        audio.onerror = (e) => {
          console.error("Audio Playback Error:", e);
          alert("Audio playback error: " + (audio.error ? audio.error.message : "Unknown error"));
          setIsPlaying(false);
        };

        await audio.play();
        setIsPlaying(true);
      } else {
        throw new Error("No audio content received from server.");
      }
    } catch (err) {
      console.error("AI TTS failed:", err);
      alert("AI Voice Error: " + err.message);
      setUseFallback(true);
      playBrowserVoice();
    } finally {
      setIsAiLoading(false);
    }
  };

  const playBrowserVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    // Pick a Hindi/Indian voice if available
    const voices = window.speechSynthesis.getVoices();
    const hiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
    if (hiVoice) utterance.voice = hiVoice;
    
    utterance.rate = voiceMode === 'divine' ? 0.75 : rate;
    
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

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      if (onEnd) onEnd();
    } else {
      if (!useFallback) {
        playAiVoice();
      } else {
        playBrowserVoice();
      }
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
        aria-label={isPlaying ? "Pause voice" : "Play voice"}
      >
        {isAiLoading ? (
          <div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-lem-accent rounded-full"></div>
        ) : isPlaying ? (
          <Pause size={24} className="fill-current" />
        ) : (
          <Play size={24} className="fill-current ml-1" />
        )}
        
        {/* Sparkle indicator for AI voice */}
        {!useFallback && !isPlaying && !isAiLoading && (
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
            
            {useFallback && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p>High-quality AI voice unavailable. Using browser fallback.</p>
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
