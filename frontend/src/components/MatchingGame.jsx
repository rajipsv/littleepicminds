import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const MatchingGame = ({ breakdown, onComplete, scripture }) => {
  const [selectedWordIdx, setSelectedWordIdx] = useState(null);
  const [matches, setMatches] = useState({});
  const [wrongFlash, setWrongFlash] = useState(null);
  const { currentLang } = useAuth();

  const [scrambledMeanings, setScrambledMeanings] = useState([]);

  const isTe = currentLang === 'te';

  useEffect(() => {
    if (!breakdown || !Array.isArray(breakdown)) return;
    
    // Create meanings with their original index for matching
    const meanings = breakdown.map((item, index) => ({
      originalIndex: index,
      text: isTe && item.te ? item.te : (item.en || item.meaning || "")
    }));

    // Fisher-Yates shuffle
    const shuffled = [...meanings];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setScrambledMeanings(shuffled);
    setMatches({});
    setSelectedWordIdx(null);
    setWrongFlash(null);
  }, [breakdown, currentLang, isTe]);

  if (!breakdown || !Array.isArray(breakdown) || breakdown.length === 0) return null;

  const handleWordSelect = (index) => {
    if (matches[index]) return;
    setSelectedWordIdx(index);
  };

  const handleMeaningSelect = (originalIndex) => {
    if (selectedWordIdx === null) return; 

    if (selectedWordIdx === originalIndex) {
      // Correct match!
      const newMatches = { ...matches, [selectedWordIdx]: true };
      setMatches(newMatches);
      setSelectedWordIdx(null);
      
      if (Object.keys(newMatches).length === breakdown.length) {
        if (onComplete) {
          setTimeout(() => onComplete(), 800);
        }
      }
    } else {
      // Wrong match — flash red briefly
      setWrongFlash(originalIndex);
      setTimeout(() => setWrongFlash(null), 700);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Instruction Message */}
      <div className="h-6 flex items-center justify-center">
        {selectedWordIdx === null ? (
          <p className="text-xs text-gray-400 italic animate-fade-in">
            {isTe 
              ? "👆 ఎడమవైపున ఉన్న పదాన్ని ఎంచుకుని, ఆపై కుడివైపున ఉన్న దాని అర్థాన్ని నొక్కండి" 
              : "👆 Select a word on the left, then tap its matching meaning on the right"}
          </p>
        ) : (
          <p className="text-xs text-lem-accent font-bold animate-pulse">
            {isTe ? "ఇప్పుడు దానికి సరిపోయే అర్థాన్ని ఎంచుకోండి →" : "Now pick the matching meaning →"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-8">
        {/* Sanskrit/Transliteration Column */}
        <div className="space-y-3">
          <h4 className="text-lem-accent text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-4 text-center opacity-80">
            {isTe ? "శ్లోక పంక్తి (Line)" : "Verse Line"}
          </h4>
          <div className="space-y-2">
            {breakdown.map((item, i) => {
              const isMatched = matches[i];
              const isSelected = selectedWordIdx === i;
              
              // Determine display text
              const displayStr = isTe && item.sanskrit_te 
                ? item.sanskrit_te 
                : (item.word || item.transliteration || item.sanskrit);

              return (
                <button
                  key={`word-${i}`}
                  onClick={() => handleWordSelect(i)}
                  disabled={isMatched}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm md:text-base font-bold transition-all duration-300 transform ${
                    isMatched
                      ? 'bg-green-500/10 border-green-500/30 text-green-400 opacity-60 cursor-default'
                      : isSelected
                        ? 'bg-lem-accent/20 border-lem-accent text-lem-accent scale-[1.02] shadow-[0_0_15px_rgba(253,160,133,0.3)] z-10'
                        : 'bg-white/5 border-white/10 text-gray-200 hover:border-lem-accent/50 hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={isTe ? 'font-medium' : 'font-semibold'}>{displayStr}</span>
                    {isMatched && <span className="text-xs">✅</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Meanings Column */}
        <div className="space-y-3">
          <h4 className="text-lem-accent text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-4 text-center opacity-80">
            {isTe ? "అర్థం (Meaning)" : "Meaning"}
          </h4>
          <div className="space-y-2">
            {scrambledMeanings.map((meaning, i) => {
              const isMatched = matches[meaning.originalIndex];
              const isWrong = wrongFlash === meaning.originalIndex;

              return (
                <button
                  key={`meaning-${i}`}
                  onClick={() => handleMeaningSelect(meaning.originalIndex)}
                  disabled={isMatched}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-300 transform ${
                    isMatched
                      ? 'bg-green-500/10 border-green-500/30 text-green-400 opacity-60 cursor-default'
                      : isWrong
                        ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-shake'
                        : selectedWordIdx !== null
                          ? 'bg-white/5 border-white/10 text-gray-200 hover:border-blue-400 hover:bg-white/10 cursor-pointer'
                          : 'bg-white/5 border-white/5 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={isTe ? 'leading-relaxed' : 'font-medium'}>
                      {meaning.text}
                    </span>
                    {isMatched && <span className="text-xs">✅</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchingGame;

