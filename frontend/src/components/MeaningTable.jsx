import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Volume2 } from 'lucide-react';
import { API_URL } from '../api';

const speakLine = (text, lang = 'en') => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang === 'te' ? 'te' : lang === 'hi' ? 'hi' : 'en';
  const preferred =
    voices.find((v) => v.lang.startsWith(prefix)) ||
    voices.find((v) => v.lang.startsWith('en')) ||
    voices[0];
  if (preferred) utterance.voice = preferred;
  utterance.lang = preferred?.lang || 'en-US';
  utterance.rate = 0.8;
  window.speechSynthesis.speak(utterance);
};

const hasTeluguText = (s) => Boolean(s && /[\u0C00-\u0C7F]/.test(s));

const lineMeaning = (item, isTe) => {
  if (!isTe) return item.en || item.meaning;
  if (hasTeluguText(item.te)) return item.te;
  return item.en || item.meaning;
};

/** Roman/Telugu line for TTS — Devanagari sounds unnatural on most TTS engines. */
const ttsLineText = (item, isTe) => {
  if (isTe && item.sanskrit_te) return item.sanskrit_te;
  return item.transliteration || item.word || item.sanskrit || '';
};

const MeaningTable = ({ wordByWord }) => {
  const { currentLang } = useAuth();
  const isTe = currentLang === 'te';
  const [playingIndex, setPlayingIndex] = useState(-1);

  if (!wordByWord || wordByWord.length === 0) return null;

  const handlePlay = async (item, meaning, index) => {
    const line = ttsLineText(item, isTe);
    // IAST line → hi-IN; Telugu script → te-IN (Devanagari to TTS sounds unnatural)
    const ttsLang = isTe ? 'te' : 'hi';
    const ttsText = `${line}, ${meaning}`;

    setPlayingIndex(index);
    try {
      const response = await fetch(`${API_URL || ''}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ttsText,
          target_language_code: ttsLang,
          speaker: 'roopa'
        })
      });

      if (!response.ok) throw new Error('TTS unavailable');

      const data = await response.json();
      if (data.audios && data.audios[0]) {
        const audio = new Audio(`data:audio/wav;base64,${data.audios[0]}`);
        audio.onended = () => setPlayingIndex(-1);
        audio.onerror = () => { setPlayingIndex(-1); speakLine(ttsText, ttsLang); };
        await audio.play();
      } else {
        speakLine(ttsText, ttsLang);
        setTimeout(() => setPlayingIndex(-1), 2000);
      }
    } catch (err) {
      speakLine(ttsText, ttsLang);
      setTimeout(() => setPlayingIndex(-1), 2000);
    }
  };

  return (
    <div className="mt-6">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-lem-glass-border shadow-sm">
        <table className="min-w-full divide-y divide-lem-glass-border">
          <thead className="bg-lem-sidebar">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-lem-accent uppercase tracking-wider w-10"></th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-lem-accent uppercase tracking-wider">
                {isTe ? "పంక్తి" : "Line"}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-lem-accent uppercase tracking-wider">
                {isTe ? "అర్థం" : "Meaning"}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/5 divide-y divide-white/5">
            {wordByWord.map((item, index) => {
              const displayWord = isTe && item.sanskrit_te ? item.sanskrit_te : (item.transliteration || item.word || item.sanskrit);
              const meaning = lineMeaning(item, isTe);
              const isPlaying = playingIndex === index;

              return (
                <tr key={index} className="hover:bg-white/10 transition-colors">
                  <td className="px-3 py-3">
                    <button
                      onClick={() => handlePlay(item, meaning, index)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
                        isPlaying
                          ? 'bg-lem-accent border-lem-accent text-lem-dark scale-110'
                          : 'border-lem-glass-border text-gray-400 hover:border-lem-accent hover:text-lem-accent'
                      }`}
                    >
                      <Volume2 size={14} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-white whitespace-nowrap">
                    {displayWord}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {meaning}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {wordByWord.map((item, index) => {
          const displayWord = isTe && item.sanskrit_te ? item.sanskrit_te : (item.transliteration || item.word || item.sanskrit);
          const meaning = lineMeaning(item, isTe);
          const isPlaying = playingIndex === index;

          return (
            <div key={index} className="glass-panel p-4 rounded-2xl border border-white/5 flex items-start gap-4">
              <button
                onClick={() => handlePlay(item, meaning, index)}
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                  isPlaying
                    ? 'bg-lem-accent border-lem-accent text-lem-dark shadow-lg'
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                <Volume2 size={18} />
              </button>
              <div className="flex-1">
                <div className="text-lem-accent font-bold text-base mb-1">{displayWord}</div>
                <div className="text-gray-300 text-sm leading-relaxed">{meaning}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MeaningTable;

