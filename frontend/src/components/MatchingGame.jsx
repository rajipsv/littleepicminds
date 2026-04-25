import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const MatchingGame = ({ breakdown, onComplete, scripture }) => {
  const [selectedWord, setSelectedWord] = useState(null);
  const [matches, setMatches] = useState({});
  const { currentLang } = useAuth(); // Assume we have this in auth context or pass as prop
  
  // Scramble meanings on mount
  const [scrambledMeanings, setScrambledMeanings] = useState([]);
  
  useEffect(() => {
    if (!breakdown) return;
    const meanings = breakdown.map(item => ({
      id: item.sanskrit,
      text: currentLang === 'te' ? item.te : item.en
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
    if (matches[wordSanskrit]) return; // Already matched
    setSelectedWord(wordSanskrit);
  };

  const handleMeaningSelect = (meaningId) => {
    if (!selectedWord) {
      alert(isTe ? "ముందుగా సంస్కృత పదాన్ని ఎంచుకోండి!" : "Select a Sanskrit word first!");
      return;
    }

    if (selectedWord === meaningId) {
      // Match found!
      const newMatches = { ...matches, [selectedWord]: true };
      setMatches(newMatches);
      setSelectedWord(null);
      
      // Check if all matched
      if (Object.keys(newMatches).length === breakdown.length) {
        setTimeout(() => {
          onComplete();
        }, 800);
      }
    } else {
      // Wrong match
      const isHanuman = scripture === 'hanuman';
      const tryAgainTe = isHanuman 
        ? "మళ్ళీ ప్రయత్నించండి! హనుమంతుడు చెబుతున్నాడు: పదాలను నిశితంగా గమనించండి." 
        : "మళ్ళీ ప్రయత్నించండి! కృష్ణుడు చెబుతున్నాడు: పదాలను నిశితంగా గమనించండి.";
      const tryAgainEn = isHanuman 
        ? "Try again! Hanuman says: Look closely at the words." 
        : "Try again! Krishna says: Look closely at the words.";
      
      alert(isTe ? tryAgainTe : tryAgainEn);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-8 mt-6">
      {/* Sanskrit Words */}
      <div>
        <h4 className="text-lem-accent text-sm font-bold mb-4 uppercase tracking-wider">
          {isTe ? "సంస్కృత పదాలు" : "Sanskrit Words"}
        </h4>
        <div className="space-y-3">
          {breakdown.map((item, i) => {
            const wordStr = item.sanskrit;
            const displayStr = isTe ? item.sanskrit_te : item.sanskrit;
            const isMatched = matches[wordStr];
            const isSelected = selectedWord === wordStr;
            
            return (
              <button
                key={`word-${i}`}
                onClick={() => handleWordSelect(wordStr)}
                disabled={isMatched}
                className={`w-full text-left match-item transition-all ${
                  isMatched ? 'correct' : isSelected ? 'selected' : ''
                }`}
              >
                <span className="devanagari-text text-lg">{displayStr}</span>
                {isMatched && <span>✅</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Meanings */}
      <div>
        <h4 className="text-lem-accent text-sm font-bold mb-4 uppercase tracking-wider">
          {isTe ? "అర్థాలు" : "Meanings"}
        </h4>
        <div className="space-y-3">
          {scrambledMeanings.map((meaning, i) => {
            const isMatched = matches[meaning.id];
            
            return (
              <button
                key={`meaning-${i}`}
                onClick={() => handleMeaningSelect(meaning.id)}
                disabled={isMatched}
                className={`w-full text-left match-item transition-all ${
                  isMatched ? 'correct' : ''
                }`}
              >
                <span className="text-sm font-medium">{isMatched ? `✅ ${meaning.text}` : meaning.text}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MatchingGame;
