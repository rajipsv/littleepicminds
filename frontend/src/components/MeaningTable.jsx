import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Volume2 } from 'lucide-react';

const speakWord = (text) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  // Prefer a Sanskrit/Hindi/Indian voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    v.lang.includes('hi') || v.lang.includes('sa') || v.lang.includes('IN')
  );
  if (preferred) utterance.voice = preferred;
  utterance.rate = 0.8;
  window.speechSynthesis.speak(utterance);
};

const MeaningTable = ({ wordByWord }) => {
  const { currentLang } = useAuth();
  const isTe = currentLang === 'te';
  const [playingIndex, setPlayingIndex] = useState(-1);

  if (!wordByWord || wordByWord.length === 0) return null;

  const handlePlay = (word, index) => {
    setPlayingIndex(index);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang.includes('hi') || v.lang.includes('sa') || v.lang.includes('IN')
    );
    if (preferred) utterance.voice = preferred;
    utterance.rate = 0.8;
    utterance.onend = () => setPlayingIndex(-1);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-lem-glass-border shadow-sm mt-6">
      <table className="min-w-full divide-y divide-lem-glass-border">
        <thead className="bg-lem-sidebar">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-lem-accent uppercase tracking-wider w-10"></th>
            <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-lem-accent uppercase tracking-wider">
              {isTe ? "పదం" : "Word"}
            </th>
            <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-lem-accent uppercase tracking-wider">
              {isTe ? "అర్థం" : "Meaning"}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white/5 divide-y divide-white/5">
          {wordByWord.map((item, index) => {
            const word = isTe && item.sanskrit_te ? item.sanskrit_te : item.sanskrit || item.word;
            const meaning = isTe && item.te ? item.te : item.en || item.meaning;
            const isPlaying = playingIndex === index;

            return (
              <tr key={index} className="hover:bg-white/10 transition-colors">
                <td className="px-3 py-3">
                  <button
                    onClick={() => handlePlay(word, index)}
                    title={`Hear "${word}"`}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
                      isPlaying
                        ? 'bg-lem-accent border-lem-accent text-lem-dark scale-110 shadow-[0_0_10px_rgba(253,160,133,0.4)]'
                        : 'border-lem-glass-border text-gray-400 hover:border-lem-accent hover:text-lem-accent hover:scale-105'
                    }`}
                  >
                    <Volume2 size={14} />
                  </button>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-white whitespace-nowrap">
                  {word}
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
  );
};

export default MeaningTable;

