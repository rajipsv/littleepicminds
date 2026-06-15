import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { getLevelFromUser } from '../utils/gradeLevel';
import { Award, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

const SlokaQuiz = ({ scripture, chapter, verse, onPass, onClose }) => {
  const { user, token, currentLang } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const isTe = currentLang === 'te';
  const isHanuman = scripture === 'hanuman';

  const isTheme = typeof verse === 'string' && verse.includes('theme');
  const themeNum = isTheme ? verse.split('_')[2] : null;

  const verseLabel = isHanuman ? (() => {
    if (verse <= 2) return `Doha ${verse}`;
    if (verse <= 42) return `Verse ${verse - 2}`;
    return `Doha ${verse - 40}`;
  })() : isTheme ? (isTe ? `ఇతివృత్తం ${themeNum} పరీక్ష` : `Theme ${themeNum} Quiz`) : `Shloka ${chapter}.${verse}`;

  const scriptureName = isHanuman ? (isTe ? 'హనుమాన్ చాలీసా' : 'Hanuman Chalisa') : (isTe ? 'భగవద్గీత' : 'Bhagavad Gita');

  const verseId = isHanuman ? String(verse) : `${chapter}.${verse}`;

  useEffect(() => {
    const level = getLevelFromUser(user);
    api.get(`/api/verses/quiz/${scripture}/${chapter}/${verse}?level=${level}`)
      .then(res => {
        setQuestions(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(isTe ? 'ప్రశ్నలు లోడ్ చేయడంలో విఫలమైంది.' : 'Failed to load questions.');
        setLoading(false);
      });
  }, [scripture, chapter, verse]);

  const handleSelect = (optionIndex) => {
    if (submitted) return;
    setAnswers({ ...answers, [currentQ]: optionIndex });
  };

  const handleSubmit = async () => {
    let correct = 0;
    const quizDetails = questions.map((q, i) => ({
      question: q.question,
      options: q.options,
      correct: q.correct,
      chosen: answers[i]
    }));
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    const pct = Math.round((correct / questions.length) * 100);
    setScore(pct);
    setSubmitted(true);

    // Save quiz score to evaluations + progress + quiz_results if passed
    if (user && token && pct >= 70) {
      try {
        await api.post('/api/evaluations', {
          scripture,
          chapter_number: chapter,
          verse,
          score: pct,
          quiz_details: quizDetails
        }, { headers: { Authorization: `Bearer ${token}` } });
        setSaveError(null);
        if (onPass) onPass(pct);
      } catch (e) {
        console.error('Failed to save quiz score', e);
        setSaveError(e.response?.data?.error || e.message);
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center p-8">
      <div className="animate-spin w-8 h-8 border-4 border-lem-accent border-t-transparent rounded-full" />
    </div>
  );

  if (error) return <div className="text-red-400 p-4 text-center">{error}</div>;
  if (!questions.length) return null;

  if (submitted) {
    const isPass = score >= 70;
    return (
      <div className="glass-card p-8 text-center animate-fade-in">
        <Award size={56} className={`mx-auto mb-4 ${isPass ? 'text-green-400' : 'text-lem-accent'}`} />
        <h3 className="text-3xl font-black text-white mb-2">
          {score}%
        </h3>
          <p className={`text-lg font-bold mb-2 ${isPass ? 'text-green-400' : 'text-yellow-400'}`}>
          {isPass
            ? (isTe ? '🎉 అద్భుతం! ఈ శ్లోకం మాస్టర్ చేశారు!' : `🎉 ${verseLabel} Mastered!`)
            : (isTe ? 'మళ్ళీ ప్రయత్నించండి!' : `Keep practicing! You need 70% to master this ${isHanuman ? 'verse' : 'shloka'}.`)}
          </p>
          {saveError && (
            <p className="text-red-400 text-xs mb-4">{isTe ? `సేవ్ చేయడంలో లోపం: ${saveError}` : `Save error: ${saveError}`}</p>
          )}
        {/* Show answer review */}
        <div className="space-y-3 text-left mb-6">
          {questions.map((q, i) => {
            const chosen = answers[i];
            const correct = q.correct;
            const isRight = chosen === correct;
            return (
              <div key={i} className={`p-3 rounded-xl border text-sm ${isRight ? 'border-green-500/40 bg-green-500/10' : 'border-red-500/40 bg-red-500/10'}`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {isRight ? <CheckCircle size={16} className="text-green-400 flex-shrink-0" /> : <XCircle size={16} className="text-red-400 flex-shrink-0" />}
                  <span className="text-gray-300">{isTe && q.question_te ? q.question_te : q.question}</span>
                </div>
                {!isRight && (
                  <p className="text-green-300 text-xs ml-6">✓ Correct: {q.options[correct]}</p>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-4">
          {!isPass && (
            <button
              onClick={() => { setAnswers({}); setCurrentQ(0); setSubmitted(false); setScore(null); }}
              className="px-6 py-2 rounded-xl border border-lem-accent text-lem-accent hover:bg-lem-accent hover:text-lem-dark font-bold transition-colors"
            >
              {isTe ? 'మళ్ళీ ప్రయత్నించండి' : 'Try Again'}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 font-bold transition-colors"
          >
            {isTe ? 'మూసివేయి' : 'Close'}
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const sectionLabel = isTe
    ? (q.sectionLabel_te || q.sectionLabel)
    : q.sectionLabel;
  const showSection = isTheme && sectionLabel && (
    currentQ === 0 || questions[currentQ - 1]?.section !== q.section
      || questions[currentQ - 1]?.sectionId !== q.sectionId
  );

  return (
    <div className="glass-card p-6 md:p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-lem-accent/20 flex items-center justify-center text-lem-accent">
            <Award size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-white leading-none mb-1">{scriptureName}</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{verseLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-gray-400">{currentQ + 1} / {questions.length}</span>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 font-bold text-[10px] uppercase tracking-wider">
            {isTe ? 'దాటవేయి' : 'Skip'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-lem-accent transition-all duration-300" style={{ width: `${(currentQ / questions.length) * 100}%` }} />
      </div>

      {showSection && (
        <p className="text-[10px] font-black uppercase tracking-widest text-lem-accent mb-3">
          {sectionLabel}
        </p>
      )}

      <h3 className="text-xl font-bold text-white mb-6 leading-relaxed">{isTe && q.question_te ? q.question_te : q.question}</h3>

      <div className="space-y-3 mb-8">
        {q.options?.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={`w-full text-left p-4 rounded-xl border transition-all font-medium ${
              answers[currentQ] === i
                ? 'border-lem-accent bg-lem-accent/10 text-lem-accent shadow-[0_0_15px_rgba(253,160,133,0.2)] scale-[1.02]'
                : 'border-lem-glass-border bg-white/5 text-gray-200 hover:bg-white/10 hover:border-gray-400'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="flex justify-between border-t border-lem-glass-border pt-4">
        <button
          onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
          disabled={currentQ === 0}
          className="px-5 py-2 rounded-xl text-gray-400 hover:text-white disabled:opacity-30 font-bold transition-colors"
        >
          {isTe ? 'వెనుకకు' : 'Back'}
        </button>
        {currentQ < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ(prev => prev + 1)}
            disabled={answers[currentQ] === undefined}
            className="bg-lem-accent text-lem-dark font-bold px-8 py-2 rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {isTe ? 'తరువాత' : 'Next'}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={answers[currentQ] === undefined}
            className="bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold px-8 py-2 rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(74,222,128,0.3)]"
          >
            {isTe ? 'సమర్పించు' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
};

export default SlokaQuiz;
