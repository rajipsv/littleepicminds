import React, { useState, useMemo, useEffect } from 'react';
import VoicePlayer from './VoicePlayer';
import MeaningTable from './MeaningTable';
import { linesFromBreakdown } from '../utils/lineTts';
import { getVerseDisplayText, ttsLangForUi } from '../utils/verseDisplay';
import MatchingGame from './MatchingGame';
import WisdomJournal from './WisdomJournal';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, PlayCircle, Repeat, Puzzle, Edit3 } from 'lucide-react';

const VerseViewer = ({ verse, scripture, isThemeMode }) => {
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [currentStep, setCurrentStep] = useState(isThemeMode ? 5 : 1);
  const { user, currentLang } = useAuth();

  const lang = currentLang === 'te' || currentLang === 'hi' ? currentLang : 'en';
  const display = useMemo(() => getVerseDisplayText(verse, lang), [verse, lang]);

  const shlokaTtsLines = useMemo(
    () => linesFromBreakdown(verse?.lineBreakdown || verse?.word_by_word, lang),
    [verse, lang]
  );

  const lineWordStarts = useMemo(() => {
    if (lang !== 'en' || !display.highlightWords?.length) return [];
    const breakdown = verse?.lineBreakdown || verse?.word_by_word;
    if (!breakdown?.length) return [];
    let offset = 0;
    return breakdown.map((row) => {
      const start = offset;
      const line = (row.transliteration || row.word || '').replace(/\s*\.\s*/g, ' ');
      offset += line.split(/\s+/).filter(Boolean).length;
      return start;
    });
  }, [verse, lang, display.highlightWords]);

  useEffect(() => {
    setCurrentStep(isThemeMode ? 5 : 1);
    setActiveWordIndex(-1);
  }, [verse?.id, isThemeMode]);

  if (!verse) return null;

  const t = (en, hi, te) => (lang === 'te' ? te : lang === 'hi' ? hi : en);

  const handleWordBoundary = (index) => {
    setActiveWordIndex(index);
  };

  const handleAudioEnd = () => {
    setActiveWordIndex(-1);
    if (currentStep === 1) {
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
      setCurrentStep(5);
    }
  };

  const StepMarker = ({ step, icon: Icon, title, isCompleted, isActive }) => (
    <button
      onClick={() => setCurrentStep(step)}
      className={`flex flex-col items-center gap-2 z-10 transition-all hover:scale-110 cursor-pointer focus:outline-none ${isActive ? 'scale-110' : ''} ${isCompleted ? 'opacity-100' : isActive ? 'opacity-100' : 'opacity-60'}`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg transition-colors ${
          isCompleted
            ? 'bg-green-500 border-green-400 text-white'
            : isActive
              ? 'bg-lem-sidebar border-lem-accent text-lem-accent'
              : 'bg-lem-dark border-lem-glass-border text-gray-500 hover:border-gray-400 hover:text-gray-400'
        }`}
      >
        {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
      </div>
      <span className={`text-xs font-bold uppercase tracking-wider ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`}>
        {title}
      </span>
    </button>
  );

  const renderListenText = () => {
    if (lang === 'en' && display.highlightWords.length > 0) {
      return display.highlightWords.map((word, index) => (
        <span
          key={index}
          className={`transition-colors duration-200 rounded px-1 ${
            index === activeWordIndex ? 'bg-lem-accent text-lem-dark font-black' : ''
          }`}
        >
          {word}
        </span>
      ));
    }
    return <span className="w-full whitespace-pre-wrap">{display.text}</span>;
  };

  return (
    <div className="glass-card p-6 md:p-8 relative group">
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-lem-accent/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

      <div className="flex justify-between items-center mb-8 border-b border-lem-glass-border pb-4">
        <div className="inline-flex items-center space-x-2">
          <span className="bg-lem-accent/20 text-lem-accent text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wide">
            {scripture === 'hanuman' ? t('HANUMAN CHALISA', 'హనుమాన్ చాలీసా', 'హనుమాన్ చాలీసా') : t('BHAGAVAD GITA', 'भगवद्गीता', 'భగవద్గీత')}
          </span>
          {verse.age_level && (
            <>
              <span className="text-lem-glass-border text-sm font-medium">|</span>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                {t('LEVEL:', 'स्तर:', 'స్థాయి:')} {verse.age_level}
              </span>
            </>
          )}
        </div>
      </div>

      {!isThemeMode && (
        <div className="flex justify-between relative max-w-lg mx-auto mb-12">
          <div className="absolute top-6 left-6 right-6 h-1 bg-lem-glass-border rounded-full -z-10">
            <div
              className="h-full bg-lem-accent rounded-full transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(253,160,133,0.5)]"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>
          </div>

          <StepMarker step={1} icon={PlayCircle} title={t('Listen', 'सुनें', 'వినండి')} isCompleted={currentStep > 1} isActive={currentStep === 1} />
          <StepMarker step={2} icon={Repeat} title={t('Learn', 'सीखें', 'అర్థం')} isCompleted={currentStep > 2} isActive={currentStep === 2} />
          <StepMarker step={3} icon={Puzzle} title={t('Match', 'मिलान', 'ఆట')} isCompleted={currentStep > 3} isActive={currentStep === 3} />
          <StepMarker step={4} icon={Edit3} title={t('Reflect', 'चिंतन', 'జర్నల్')} isCompleted={currentStep > 4} isActive={currentStep === 4} />
        </div>
      )}

      <div className="transition-all duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-6 md:p-8 rounded-3xl shadow-xl border-l-4 border-l-lem-accent relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          <div className="flex-1 z-10">
            <p
              className={`text-3xl md:text-4xl text-white leading-relaxed flex flex-wrap gap-x-2 drop-shadow-sm font-quicksand font-bold tracking-wide ${
                lang === 'hi' ? 'devanagari-text' : ''
              } ${lang === 'te' ? 'telugu-text' : ''}`}
            >
              {renderListenText()}
            </p>
          </div>

          <div className="flex-shrink-0 z-10">
            <VoicePlayer
              verseId={scripture === 'gita' ? verse.id : undefined}
              lines={shlokaTtsLines.length > 0 ? shlokaTtsLines : undefined}
              text={display.text}
              targetLang={ttsLangForUi(lang)}
              onLineStart={(lineIndex) => {
                if (lang === 'en' && lineWordStarts[lineIndex] != null) {
                  setActiveWordIndex(lineWordStarts[lineIndex]);
                }
              }}
              onWordBoundary={handleWordBoundary}
              onEnd={handleAudioEnd}
            />
          </div>
        </div>

        <div className={`transition-all duration-700 mt-6 ${currentStep >= 2 ? 'opacity-100 translate-y-0 h-auto' : 'opacity-0 translate-y-10 h-0 overflow-hidden'}`}>
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">{t('Line by Line', 'पंक्ति वार', 'పంక్తి వారీ అర్థాలు')}</h3>
            {currentStep === 2 && (
              <button
                onClick={handleRepeatComplete}
                className="text-xs bg-lem-glass-border px-3 py-1 rounded-full text-white hover:bg-lem-accent hover:text-lem-dark transition-colors"
              >
                {t('Mark Done', 'पूर्ण', 'పూర్తయింది')}
              </button>
            )}
          </div>
          {currentStep >= 2 && (
            <MeaningTable
              wordByWord={verse.lineBreakdown || verse.word_by_word}
              verseId={scripture === 'gita' ? verse.id : undefined}
              chantIntro={verse.chantIntro}
            />
          )}
        </div>

        <div className={`transition-all duration-700 ${currentStep >= 3 ? 'opacity-100 translate-y-0 mt-6 h-auto' : 'opacity-0 translate-y-10 h-0 overflow-hidden'}`}>
          <div className="bg-lem-sidebar border border-lem-glass-border text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
            <h3 className="text-xs font-bold text-lem-accent uppercase tracking-widest mb-3 opacity-80">
              {t('Meaning', 'अर्थ', 'తాత్పర్యం')}
            </h3>
            <p className="text-lg font-medium leading-relaxed">
              {lang === 'te' && verse.te ? verse.te.meaning : verse.en?.meaning || verse.full_meaning}
            </p>
            {((lang === 'te' && verse.te?.childMeaning) || (lang !== 'te' && verse.en?.childMeaning)) && (
              <div className="mt-4 p-4 bg-lem-accent/10 rounded-xl border border-lem-accent/20">
                <span className="text-lem-accent font-bold mr-2">
                  👦 {t('For Kids:', 'बच्चों के लिए:', 'పిల్లలకు:')}
                </span>
                <span className="text-sm">{lang === 'te' ? verse.te.childMeaning : verse.en.childMeaning}</span>
              </div>
            )}
          </div>
          {!isThemeMode && (
            <div className="border-t border-lem-glass-border pt-8 mt-8">
              <h3 className="text-xl font-bold text-white mb-2">
                {t('Activity Time: Match Meaning', 'मिलान खेल', 'ఆట సమయం: జతపరుచు')}
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                {t(
                  'Select a word, then select its matching meaning.',
                  'शब्द चुनें, फिर उसका अर्थ चुनें।',
                  'సంస్కృత పదాన్ని దానికి సరైన అర్థంతో జత చేయండి.'
                )}
              </p>
              <MatchingGame
                breakdown={verse.lineBreakdown || verse.word_by_word}
                onComplete={handleMatchComplete}
                scripture={scripture}
              />
            </div>
          )}
        </div>

        {!isThemeMode && (
          <div className={`transition-all duration-700 ${currentStep >= 4 ? 'opacity-100 translate-y-0 mt-10 h-auto' : 'opacity-0 translate-y-10 h-0 overflow-hidden'}`}>
            <WisdomJournal verse={verse} scripture={scripture} onComplete={handleJournalComplete} />
          </div>
        )}

        {!isThemeMode && currentStep >= 5 && (
          <div className="mt-8 text-center animate-bounce-in">
            <div className="inline-block bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black text-xl px-8 py-4 rounded-full shadow-[0_0_30px_rgba(74,222,128,0.4)]">
              🎉 {t('Mastery Achieved!', 'मastery!', 'అద్భుతం! శ్లోకం పూర్తయింది!')} 🎉
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerseViewer;
