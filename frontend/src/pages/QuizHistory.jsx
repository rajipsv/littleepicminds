import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, CheckCircle, XCircle, Award, BarChart3 } from 'lucide-react';

const QuizHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialScripture = queryParams.get('scripture') || 'all';

  const [quizzes, setQuizzes] = useState([]);
  const [filter, setFilter] = useState(initialScripture);
  const [hanumanStats, setHanumanStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get(`/api/quiz-history/${user.id}`),
      api.get(`/api/evaluations/hanuman-overall/${user.id}`)
    ]).then(([quizRes, statsRes]) => {
      setQuizzes(quizRes.data || []);
      setHanumanStats(statsRes.data || null);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [user]);

  const filteredQuizzes = quizzes.filter(q => {
    if (filter === 'all') return true;
    return q.scripture === filter;
  });

  if (!user) return <div className="text-center p-20 text-white font-bold text-2xl">Please login to see quiz history.</div>;

  const getVerseLabel = (q) => {
    const v = parseInt(q.verse);
    if (q.scripture === 'hanuman') {
      if (v <= 2) return `Doha ${v}`;
      if (v <= 42) return `Verse ${v - 2}`;
      return `Doha ${v - 40}`;
    }
    return `Shloka ${q.chapter}.${q.verse}`;
  };

  const scoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-lem-accent border-white/10 border-solid"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-lem-dark text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/progress" className="text-gray-400 hover:text-lem-accent transition-colors">
            <ChevronLeft size={24} />
          </Link>
        </div>
        
        {/* Scripture Filter Tabs */}
        <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-xl border border-lem-glass-border w-fit">
          <button 
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-lem-accent text-lem-dark shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('gita')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'gita' ? 'bg-lem-accent text-lem-dark shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Gita
          </button>
          <button 
            onClick={() => setFilter('hanuman')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'hanuman' ? 'bg-lem-accent text-lem-dark shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Hanuman
          </button>
        </div>

        {/* Hanuman Overall Stats */}
        {hanumanStats && hanumanStats.total_verses_attempted > 0 && (
          <div className="glass-card p-6 mb-8 border-l-4 border-orange-500">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 size={24} className="text-orange-500" />
              <h2 className="text-xl font-bold">Hanuman Chalisa — Overall Score</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 p-4 rounded-xl text-center">
                <div className="text-xs font-bold text-gray-500 uppercase">Verses Attempted</div>
                <div className="text-2xl font-black text-orange-500">{hanumanStats.total_verses_attempted}/44</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl text-center">
                <div className="text-xs font-bold text-gray-500 uppercase">Average Score</div>
                <div className={`text-2xl font-black ${scoreColor(hanumanStats.average_score)}`}>{hanumanStats.average_score}%</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl text-center">
                <div className="text-xs font-bold text-gray-500 uppercase">Best Score</div>
                <div className="text-2xl font-black text-green-400">{hanumanStats.best_score}%</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl text-center">
                <div className="text-xs font-bold text-gray-500 uppercase">Need Practice</div>
                <div className="text-2xl font-black text-red-400">{hanumanStats.worst_score}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Quiz List */}
        {filteredQuizzes.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Award size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No {filter !== 'all' ? (filter === 'gita' ? 'Gita' : 'Hanuman') : ''} Quizzes Yet</h3>
            <p className="text-gray-400 mb-6">Take your first quiz to see your history here!</p>
            <button onClick={() => navigate(filter === 'hanuman' ? '/read/hanuman' : '/read/gita')} className="bg-lem-accent text-lem-dark font-bold px-6 py-3 rounded-xl hover:scale-105 transition-transform">
              Start Reading
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuizzes.map((q) => {
              let questions = [];
              try {
                questions = typeof q.questions === 'string' ? JSON.parse(q.questions) : (q.questions || []);
              } catch (e) {
                console.error("Error parsing quiz questions:", e);
                questions = [];
              }
              
              if (!Array.isArray(questions)) questions = [];
              
              const correct = questions.filter(a => a && a.chosen === a.correct).length;
              const total = questions.length;

              return (
                <details key={q.id} className="glass-card border border-lem-glass-border rounded-xl overflow-hidden group">
                  <summary className="p-4 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${q.score >= 90 ? 'bg-green-500/20 text-green-400' : q.score >= 70 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                        {q.score}%
                      </span>
                      <div>
                        <div className="font-bold text-white">{getVerseLabel(q)}</div>
                        <div className="text-xs text-gray-500">{q.scripture === 'hanuman' ? 'Hanuman Chalisa' : 'Bhagavad Gita'} • {new Date(q.completed_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <span className="text-gray-500 text-sm">{correct}/{total} correct</span>
                  </summary>

                  <div className="p-4 pt-0 space-y-3 border-t border-lem-glass-border">
                    {questions.map((qa, i) => {
                      const isRight = qa.chosen === qa.correct;
                      return (
                        <div key={i} className={`p-3 rounded-xl border text-sm ${isRight ? 'border-green-500/40 bg-green-500/10' : 'border-red-500/40 bg-red-500/10'}`}>
                          <div className="flex items-center gap-2 font-bold mb-2">
                            {isRight ? <CheckCircle size={14} className="text-green-400 flex-shrink-0" /> : <XCircle size={14} className="text-red-400 flex-shrink-0" />}
                            <span className="text-gray-300">{qa.question}</span>
                          </div>
                          <div className="ml-6 space-y-1 text-xs">
                            <div className={`flex items-center gap-1 ${isRight ? 'text-green-400' : 'text-red-400'}`}>
                              <span className="font-bold">Your answer:</span>
                              <span>{qa.options[qa.chosen]}</span>
                            </div>
                            {!isRight && (
                              <div className="flex items-center gap-1 text-green-400">
                                <span className="font-bold">Correct:</span>
                                <span>{qa.options[qa.correct]}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizHistory;
