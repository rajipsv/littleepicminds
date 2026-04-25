import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Award, Target, HelpCircle, CheckCircle, XCircle } from 'lucide-react';

const EvaluationQuiz = ({ scripture, chapter, onComplete }) => {
  const { user, currentLang, token } = useAuth();
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [bestScore, setBestScore] = useState(null);
  
  const isTe = currentLang === 'te';

  useEffect(() => {
    fetchQuiz();
  }, [scripture, chapter]);

  const fetchQuiz = async () => {
    try {
      // 1. Get Quiz Questions
      const level = user?.level || 'seeds'; // default to seeds if not logged in
      const res = await api.get(`/api/verses/evaluations/${scripture}/${chapter}/${level}`);
      setQuizData(res.data);

      // 2. Get User's previous attempts if logged in
      if (user && token) {
        const progRes = await api.get(`/api/evaluations/progress/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const chapterProg = progRes.data.progress.find(
          p => p.scripture === scripture && p.chapter_number == chapter
        );
        if (chapterProg) {
          setAttempts(chapterProg.attempts);
          setBestScore(chapterProg.best_score);
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.error;
      const strError = typeof errMsg === 'string' ? errMsg : (errMsg?.message || (isTe ? "క్విజ్ లోడ్ చేయడంలో విఫలమైంది." : "Failed to load quiz."));
      setError(strError);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (optionIndex) => {
    setAnswers({ ...answers, [currentQ]: optionIndex });
  };

  const handleSubmit = async () => {
    // Basic calculation for MCQ
    let calculatedScore = 0;
    quizData.forEach((q, i) => {
      if (answers[i] === q.correct) {
        calculatedScore++;
      }
    });
    
    const percentage = Math.round((calculatedScore / quizData.length) * 100);
    setScore(percentage);

    if (user && token) {
      try {
        await api.post('/api/evaluations', {
          scripture,
          chapter_number: chapter,
          score: percentage
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Refresh attempts
        setAttempts(prev => prev + 1);
        if (bestScore === null || percentage > bestScore) {
          setBestScore(percentage);
        }
      } catch (err) {
        console.error("Failed to save score", err);
      }
    }

    if (onComplete) onComplete(percentage);
  };

  if (loading) return <div className="text-center p-8"><div className="animate-spin w-8 h-8 border-4 border-lem-accent border-t-transparent rounded-full mx-auto"></div></div>;
  if (error) return <div className="text-red-400 p-4">{error}</div>;
  if (!quizData || quizData.length === 0) return null;

  if (score !== null) {
    const isPass = score >= 70;
    return (
      <div className="glass-card p-8 text-center animate-bounce-in">
        <Award size={64} className={`mx-auto mb-4 ${isPass ? 'text-green-400' : 'text-lem-accent'}`} />
        <h2 className="text-3xl font-bold text-white mb-2">
          {isTe ? "మీ స్కోరు:" : "Your Score:"} {score}%
        </h2>
        <p className="text-lg text-gray-300 mb-6">
          {isPass 
            ? (isTe ? "అద్భుతం! మీరు ఈ అధ్యాయాన్ని పూర్తి చేశారు." : "Excellent! You have mastered this chapter.") 
            : (isTe ? "పర్వాలేదు, మళ్ళీ ప్రయత్నించండి!" : "Good effort! Review the verses and try again.")}
        </p>
        <div className="flex justify-center gap-4">
          {attempts < 3 && !isPass && (
            <button 
              onClick={() => { setScore(null); setAnswers({}); setCurrentQ(0); }}
              className="px-6 py-2 rounded-xl border border-lem-accent text-lem-accent hover:bg-lem-accent hover:text-lem-dark font-bold transition-colors"
            >
              {isTe ? "మళ్ళీ ప్రయత్నించండి" : "Try Again"}
            </button>
          )}
        </div>
      </div>
    );
  }

  const question = quizData[currentQ];

  return (
    <div className="glass-card p-6 md:p-8 relative">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-lem-accent font-bold">
          <Target size={20} />
          <span>{isTe ? "అధ్యాయ పరీక్ష" : "Chapter Mastery Check"}</span>
        </div>
        <div className="text-sm font-bold text-gray-400">
          {isTe ? "ప్రశ్న" : "Question"} {currentQ + 1} / {quizData.length}
        </div>
      </div>

      <div className="mb-8">
        <div className="w-full h-2 bg-lem-dark rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-lem-accent transition-all duration-300" 
            style={{ width: `${((currentQ) / quizData.length) * 100}%` }}
          />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-6 leading-relaxed">
          {isTe ? (question.question_te || question.question) : question.question}
        </h3>

        <div className="space-y-3">
          {question.options?.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                answers[currentQ] === i 
                  ? 'border-lem-accent bg-lem-accent/10 text-lem-accent shadow-[0_0_15px_rgba(253,160,133,0.2)] scale-[1.02]' 
                  : 'border-lem-glass-border bg-white/5 text-gray-200 hover:bg-white/10'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-8 border-t border-lem-glass-border pt-6">
        <button
          onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
          disabled={currentQ === 0}
          className="px-6 py-2 rounded-xl text-gray-400 hover:text-white disabled:opacity-30 transition-colors font-bold"
        >
          {isTe ? "వెనుకకు" : "Previous"}
        </button>
        
        {currentQ < quizData.length - 1 ? (
          <button
            onClick={() => setCurrentQ(prev => prev + 1)}
            disabled={answers[currentQ] === undefined}
            className="bg-lem-accent text-lem-dark font-bold px-8 py-2 rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-md"
          >
            {isTe ? "తరువాత" : "Next"}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={answers[currentQ] === undefined}
            className="bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold px-8 py-2 rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(74,222,128,0.3)]"
          >
            {isTe ? "పూర్తి చేయి" : "Submit"}
          </button>
        )}
      </div>
    </div>
  );
};

export default EvaluationQuiz;
