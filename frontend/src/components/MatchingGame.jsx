import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const MatchingGame = ({ breakdown, onComplete, scripture }) => {
  const [selectedWord, setSelectedWord] = useState(null);
  const [matches, setMatches] = useState({});
  const [wrongFlash, setWrongFlash] = useState(null);
  const { currentLang } = useAuth();

  const [scrambledMeanings, setScrambledMeanings] = useState([]);

  useEffect(() => {
    if (!breakdown) return;
    const isTe = currentLang === 'te';
    const meanings = breakdown.map(item => ({
      id: item.sanskrit,
      text: isTe && item.te ? item.te : item.en
    }));

    // Fisher-Yates shuffle
    for (let i = meanings.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [meanings[i], meanings[j]] = [meanings[j], meanings[i]];
    }
    setScrambledMeanings(meanings);
    setMatches({});
    setSelectedWord(null);
  }, [breakdown, currentLang]);

  if (!breakdown || breakdown.length === 0) return null;

  const isTe = currentLang === 'te';

  const handleWordSelect = (wordSanskrit) => {
    if (matches[wordSanskrit]) return;
    setSelectedWord(wordSanskrit);
  };

  const handleMeaningSelect = (meaningId) => {
    if (!selectedWord) return; // Do nothing, just wait for word selection

    if (selectedWord === meaningId) {
      // Correct match!
      const newMatches = { ...matches, [selectedWord]: true };
      setMatches(newMatches);
      setSelectedWord(null);
      if (Object.keys(newMatches).length === breakdown.length) {
        setTimeout(() => onComplete(), 800);
      }
    } else {
      // Wrong match — flash red briefly
      setWrongFlash(meaningId);
      setTimeout(() => setWrongFlash(null), 700);
    }
  };

  return (
    <div className="space-y-3 mt-4">
      {!selectedWord && (
        <p className="text-xs text-gray-400 text-center italic">
          {isTe 
            ? "👆 ఎడమవైపున ఉన్న పదాన్ని ఎంచుకుని, ఆపై కుడివైపున ఉన్న దాని అర్థాన్ని నొక్కండి" 
            : "👆 Select a word on the left, then tap its meaning on the right"}
        </p>
      )}
      {selectedWord && (
        <p className="text-xs text-lem-accent text-center font-bold animate-pulse">
          {isTe ? "ఇప్పుడు దానికి సరిపోయే అర్థాన్ని ఎంచుకోండి →" : "Now pick the matching meaning →"}
        </p>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Transliteration column */}
        <div>
          <h4 className="text-lem-accent text-xs font-bold mb-3 uppercase tracking-wider">
            {isTe ? "ఉచ్చారణ (Transliteration)" : "Transliteration"}
          </h4>
          <div className="space-y-2">
            {breakdown.map((item, i) => {
              const wordStr = item.sanskrit;
              // If Telugu mode, prioritize sanskrit_te
              const displayStr = isTe && item.sanskrit_te 
                ? item.sanskrit_te 
                : (item.word || item.transliteration || item.sanskrit);
              
              const isMatched = matches[wordStr];
              const isSelected = selectedWord === wordStr;

              return (
                <button
                  key={`word-${i}`}
                  onClick={() => handleWordSelect(wordStr)}
                  disabled={isMatched}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-semibold transition-all ${
                    isMatched
                      ? 'bg-green-500/20 border-green-500/40 text-green-400 cursor-default'
                      : isSelected
                        ? 'bg-lem-accent/20 border-lem-accent text-lem-accent scale-105 shadow-md'
                        : 'bg-lem-dark/60 border-lem-glass-border text-gray-200 hover:border-lem-accent hover:text-white'
                  }`}
                >
                  {displayStr} {isMatched && '✅'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meanings column */}
        <div>
          <h4 className="text-lem-accent text-xs font-bold mb-3 uppercase tracking-wider">
            {isTe ? "అర్థాలు (Meanings)" : "Meanings"}
          </h4>
          <div className="space-y-2">
            {scrambledMeanings.map((meaning, i) => {
              const isMatched = matches[meaning.id];
              const isWrong = wrongFlash === meaning.id;

              return (
                <button
                  key={`meaning-${i}`}
                  onClick={() => handleMeaningSelect(meaning.id)}
                  disabled={isMatched}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                    isMatched
                      ? 'bg-green-500/20 border-green-500/40 text-green-400 cursor-default'
                      : isWrong
                        ? 'bg-red-500/20 border-red-500/60 text-red-400 scale-95'
                        : selectedWord
                          ? 'bg-lem-dark/60 border-lem-glass-border text-gray-200 hover:border-blue-400 hover:text-white cursor-pointer'
                          : 'bg-lem-dark/60 border-lem-glass-border text-gray-400'
                  }`}
                >
                  {isMatched ? `✅ ${meaning.text}` : meaning.text}
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
