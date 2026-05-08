import React, { useState, useMemo, useEffect } from 'react';
import VoicePlayer from './VoicePlayer';
import MeaningTable from './MeaningTable';
import MatchingGame from './MatchingGame';
import WisdomJournal from './WisdomJournal';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, PlayCircle, Repeat, Puzzle, Edit3 } from 'lucide-react';

const VerseViewer = ({ verse, scripture, isThemeMode }) => {
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [currentStep, setCurrentStep] = useState(isThemeMode ? 5 : 1);
  const { user, currentLang } = useAuth();

  const isTe = currentLang === 'te';

  // Split transliteration text into words for highlighting
  const sanskritWords = useMemo(() => {
    if (!verse?.transliteration) return [];
    return verse.transliteration.split(/\s+/);
  }, [verse]);

  // Reset steps when verse changes
  useEffect(() => {
    setCurrentStep(isThemeMode ? 5 : 1);
    setActiveWordIndex(-1);
  }, [verse?.id, isThemeMode]);

  if (!verse) return null;

  const handleWordBoundary = (index) => {
    setActiveWordIndex(index);
  };

  const handleAudioEnd = () => {
    setActiveWordIndex(-1);
    if (currentStep === 1) {
      // Trigger global event for Krishna Chat to respond
      window.dispatchEvent(new CustomEvent('stepCompleted', { detail: { step: 1 } }));
      setCurrentStep(2);
    }
  };

  const handleRepeatComplete = () => {
    if (currentStep === 2) {
      window.dispatchEvent(new CustomEvent('stepCompleted', { detail: { step: 2 } }));
      setCurrentStep(3);
    }
  };

  const handleMatchComplete = () => {
    if (currentStep === 3) {
      window.dispatchEvent(new CustomEvent('stepCompleted', { detail: { step: 3 } }));
      setCurrentStep(4);
    }
  };

  const handleJournalComplete = () => {
    if (currentStep === 4) {
      window.dispatchEvent(new CustomEvent('stepCompleted', { detail: { step: 4 } }));
      setCurrentStep(5); // 5 means all done
    }
  };

  const StepMarker = ({ step, icon: Icon, title, isCompleted, isActive }) => (
    <button 
      onClick={() => setCurrentStep(step)}
      className={`flex flex-col items-center gap-2 z-10 transition-all hover:scale-110 cursor-pointer focus:outline-none ${isActive ? 'scale-110' : ''} ${isCompleted ? 'opacity-100' : isActive ? 'opacity-100' : 'opacity-60'}`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg transition-colors ${
        isCompleted ? 'bg-green-500 border-green-400 text-white' : 
        isActive ? 'bg-lem-sidebar border-lem-accent text-lem-accent' : 
        'bg-lem-dark border-lem-glass-border text-gray-500 hover:border-gray-400 hover:text-gray-400'
      }`}>
        {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
      </div>
      <span className={`text-xs font-bold uppercase tracking-wider ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`}>{title}</span>
    </button>
  );

  return (
    <div className="glass-card p-6 md:p-8 relative group">
      {/* Decorative background blob */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-lem-accent/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

      <div className="flex justify-between items-center mb-8 border-b border-lem-glass-border pb-4">
        <div className="inline-flex items-center space-x-2">
          <span className="bg-lem-accent/20 text-lem-accent text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wide">
            {scripture === 'hanuman' ? (isTe ? 'హనుమాన్ చాలీసా' : 'HANUMAN CHALISA') : (isTe ? 'భగవద్గీత' : 'BHAGAVAD GITA')}
          </span>
          {verse.age_level && (
            <>
              <span className="text-lem-glass-border text-sm font-medium">|</span>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                {isTe ? 'స్థాయి:' : 'LEVEL:'} {verse.age_level}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Step Indicators - Hide in theme mode */}
      {!isThemeMode && (
        <div className="flex justify-between relative max-w-lg mx-auto mb-12">
          {/* Connecting lines */}
          <div className="absolute top-6 left-6 right-6 h-1 bg-lem-glass-border rounded-full -z-10">
            <div 
              className="h-full bg-lem-accent rounded-full transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(253,160,133,0.5)]"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>
          </div>

          <StepMarker step={1} icon={PlayCircle} title={isTe ? "వినండి" : "Listen"} isCompleted={currentStep > 1} isActive={currentStep === 1} />
          <StepMarker step={2} icon={Repeat} title={isTe ? "అర్థం" : "Learn"} isCompleted={currentStep > 2} isActive={currentStep === 2} />
          <StepMarker step={3} icon={Puzzle} title={isTe ? "ఆట" : "Match"} isCompleted={currentStep > 3} isActive={currentStep === 3} />
          <StepMarker step={4} icon={Edit3} title={isTe ? "జర్నల్" : "Reflect"} isCompleted={currentStep > 4} isActive={currentStep === 4} />
        </div>
      )}

      {/* Step 1: Listen (Main Verse Area) */}
      <div className="transition-all duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-6 md:p-8 rounded-3xl shadow-xl border-l-4 border-l-lem-accent relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          <div className="flex-1 z-10">
            <p className={`text-3xl md:text-4xl text-white leading-relaxed flex flex-wrap gap-x-2 drop-shadow-sm font-quicksand font-bold tracking-wide ${isTe ? 'telugu-text' : ''}`}>
              {isTe && verse.telugu_script ? (
                <span className="w-full whitespace-pre-wrap">{verse.telugu_script}</span>
              ) : (
                sanskritWords.map((word, index) => (
                  <span 
                    key={index} 
                    className={`transition-colors duration-200 rounded px-1 ${
                      index === activeWordIndex ? 'bg-lem-accent text-lem-dark font-black' : ''
                    }`}
                  >
                    {word}
                  </span>
                ))
              )}
            </p>
          </div>
          
          <div className="flex-shrink-0 z-10">
            <VoicePlayer 
              text={isTe && verse.telugu_script ? verse.telugu_script : verse.sanskrit} 
              targetLang={isTe ? 'te' : 'hi'} // Force hi-IN accent for Sanskrit shlokas
              onWordBoundary={handleWordBoundary}
              onEnd={handleAudioEnd}
            />
          </div>
        </div>

        {/* Step 2: Word by Word — shown immediately after sloka */}
        <div className={`transition-all duration-700 mt-6 ${currentStep >= 2 ? 'opacity-100 translate-y-0 h-auto' : 'opacity-0 translate-y-10 h-0 overflow-hidden'}`}>
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">{isTe ? "పదాల అర్థాలు" : "Word by Word"}</h3>
            {currentStep === 2 && (
              <button onClick={handleRepeatComplete} className="text-xs bg-lem-glass-border px-3 py-1 rounded-full text-white hover:bg-lem-accent hover:text-lem-dark transition-colors">
                {isTe ? "పూర్తయింది" : "Mark Done"}
              </button>
            )}
          </div>
          <MeaningTable wordByWord={verse.lineBreakdown || verse.word_by_word} />
        </div>

        {/* Step 3: Meaning + Child Meaning — shown after Word by Word */}
        <div className={`transition-all duration-700 ${currentStep >= 3 ? 'opacity-100 translate-y-0 mt-6 h-auto' : 'opacity-0 translate-y-10 h-0 overflow-hidden'}`}>
          <div className="bg-lem-sidebar border border-lem-glass-border text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
            <h3 className="text-xs font-bold text-lem-accent uppercase tracking-widest mb-3 opacity-80">{isTe ? "తాత్పర్యం" : "Meaning"}</h3>
            <p className="text-lg font-medium leading-relaxed">
              {isTe && verse.te ? verse.te.meaning : (verse.en?.meaning || verse.full_meaning)}
            </p>
            {((isTe && verse.te?.childMeaning) || (!isTe && verse.en?.childMeaning)) && (
              <div className="mt-4 p-4 bg-lem-accent/10 rounded-xl border border-lem-accent/20">
                <span className="text-lem-accent font-bold mr-2">👦 {isTe ? "పిల్లలకు:" : "For Kids:"}</span>
                <span className="text-sm">{isTe ? verse.te.childMeaning : verse.en.childMeaning}</span>
              </div>
            )}
          </div>
          {/* Matching Game - Hide in theme mode */}
          {!isThemeMode && (
            <div className="border-t border-lem-glass-border pt-8 mt-8">
              <h3 className="text-xl font-bold text-white mb-2">{isTe ? "ఆట సమయం: జతపరుచు" : "Activity Time: Match Meaning"}</h3>
              <p className="text-gray-400 text-sm mb-6">{isTe ? "సంస్కృత పదాన్ని దానికి సరైన అర్థంతో జత చేయండి." : "Select a Sanskrit word, then select its matching meaning."}</p>
              <MatchingGame breakdown={verse.lineBreakdown || verse.word_by_word} onComplete={handleMatchComplete} scripture={scripture} />
            </div>
          )}
        </div>

        {/* Step 4: Wisdom Journal - Hide in theme mode */}
        {!isThemeMode && (
          <div className={`transition-all duration-700 ${currentStep >= 4 ? 'opacity-100 translate-y-0 mt-10 h-auto' : 'opacity-0 translate-y-10 h-0 overflow-hidden'}`}>
            <WisdomJournal verse={verse} scripture={scripture} onComplete={handleJournalComplete} />
          </div>
        )}
        
        {/* Step 5: All Done - Hide in theme mode */}
        {!isThemeMode && currentStep >= 5 && (
          <div className="mt-8 text-center animate-bounce-in">
             <div className="inline-block bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black text-xl px-8 py-4 rounded-full shadow-[0_0_30px_rgba(74,222,128,0.4)]">
               🎉 {isTe ? "అద్భుతం! శ్లోకం పూర్తయింది!" : "Mastery Achieved!"} 🎉
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerseViewer;
