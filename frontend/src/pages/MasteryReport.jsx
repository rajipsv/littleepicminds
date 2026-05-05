import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Award, Target, BookOpen, Star, TrendingUp, ChevronRight, 
  ClipboardList, CheckCircle, XCircle, HelpCircle, BarChart3, 
  LayoutDashboard, History, ScrollText 
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const MasteryReport = () => {
  const { user, currentLang } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const scriptureFilter = queryParams.get('scripture');
  const initialTab = queryParams.get('tab') || 'overview';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [progress, setProgress] = useState({ gita: [], hanuman: { verses_completed: 0, total_verses: 44 } });
  const [hanumanStats, setHanumanStats] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);
  const [totalUsers, setTotalUsers] = useState(null);
  const isTe = currentLang === 'te';

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        api.get(`/api/evaluations/progress/${user.id}`),
        api.get(`/api/evaluations/hanuman-overall/${user.id}`),
        api.get(`/api/quiz-history/${user.id}`),
        api.get(`/api/journal/${user.username}`)
      ]).then(([progressRes, statsRes, quizRes, journalRes]) => {
        setProgress(progressRes.data || { gita: [], hanuman: { verses_completed: 0, total_verses: 44 } });
        setHanumanStats(statsRes.data || null);
        setQuizzes(quizRes.data || []);
        setEntries(journalRes.data || []);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });

      api.get('/api/leaderboard')
        .then(res => {
          const lb = res.data.leaderboard || [];
          const me = lb.find(r => r.id == user.id);
          if (me) setUserRank(me.rank);
          setTotalUsers(res.data.total_users);
        })
        .catch(err => console.error('Leaderboard fetch error:', err));
    }
  }, [user]);

  // Sync tab with URL
  useEffect(() => {
    const tab = queryParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  if (!user) return <div className="text-center p-20 text-white font-bold text-2xl bg-lem-dark min-h-screen">Please login to see your mastery report.</div>;

  const gitaMastered = progress.gita?.reduce((acc, curr) => acc + curr.verses_completed, 0) || 0;
  const hanumanMastered = progress.hanuman?.verses_completed || 0;
  
  const totalGitaShlokas = progress.gita?.reduce((acc, curr) => acc + curr.total_verses, 0) || 0;
  const totalHanumanVerses = progress.hanuman?.total_verses || 44;

  let totalMastered = gitaMastered + hanumanMastered;
  let totalWisdom = totalGitaShlokas + totalHanumanVerses;
  
  if (scriptureFilter === 'gita') {
    totalMastered = gitaMastered;
    totalWisdom = totalGitaShlokas;
  } else if (scriptureFilter === 'hanuman') {
    totalMastered = hanumanMastered;
    totalWisdom = totalHanumanVerses;
  }

  // Helper functions for Quiz History rendering
  const getVerseLabel = (q) => {
    if (q.scripture === 'hanuman') {
      const v = parseInt(q.verse);
      if (v <= 2) return `Doha ${v}`;
      if (v <= 42) return `Verse ${v - 2}`;
      return `Doha ${v - 40}`;
    }
    if (typeof q.verse === 'string' && q.verse.includes('theme')) {
      const num = q.verse.split('_')[2];
      return `Theme ${num} Quiz`;
    }
    return `Chapter ${q.chapter} Shloka ${q.verse}`;
  };

  const scoreColor = (s) => {
    if (s >= 90) return 'text-green-400';
    if (s >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Filter Quizzes
  const filteredQuizzes = quizzes.filter(q => {
    if (!scriptureFilter) return true;
    return q.scripture === scriptureFilter;
  });

  // Filter Journal
  const filteredEntries = entries.filter(e => {
    if (!scriptureFilter) return true;
    return e.scripture === scriptureFilter;
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/progress?tab=${tab}${scriptureFilter ? `&scripture=${scriptureFilter}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-lem-dark text-white p-6 md:p-12 relative">
       {/* Background Decoration */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-lem-accent/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <Award className="text-lem-accent" size={32} />
               <h1 className="text-4xl md:text-5xl font-black text-white">
                {scriptureFilter ? (scriptureFilter === 'gita' ? 'Gita' : 'Hanuman') : 'Mastery'} <span className="text-lem-accent">Report</span>
              </h1>
            </div>
            <p className="text-gray-400 font-medium">{isTe ? "మీ ఆధ్యాత్మిక ప్రయాణ నివేదిక" : "Track your spiritual learning and growth."}</p>
          </div>
          <Link to={scriptureFilter ? `/read/${scriptureFilter}` : "/"} className="text-sm font-bold text-gray-500 hover:text-lem-accent transition-colors flex items-center gap-1 mb-2 group">
             <ChevronRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> 
            {isTe ? "తిరిగి వెళ్ళు" : `Back to ${scriptureFilter ? (scriptureFilter === 'gita' ? 'Gita' : 'Hanuman') : 'Home'}`}
          </Link>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-2xl w-full md:w-fit overflow-x-auto no-scrollbar">
          <button 
            onClick={() => handleTabChange('overview')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'overview' ? 'bg-lem-accent text-lem-dark shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            <LayoutDashboard size={18} /> {isTe ? "అవలోకనం" : "Overview"}
          </button>
          <button 
            onClick={() => handleTabChange('history')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'history' ? 'bg-lem-accent text-lem-dark shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            <History size={18} /> {isTe ? "క్విజ్ చరిత్ర" : "Quiz History"}
          </button>
          <button 
            onClick={() => handleTabChange('journal')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'journal' ? 'bg-lem-accent text-lem-dark shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            <ScrollText size={18} /> {isTe ? "నా జర్నల్" : "Wisdom Journal"}
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="w-12 h-12 border-4 border-lem-accent/20 border-t-lem-accent rounded-full animate-spin mb-4"></div>
            <p className="font-bold animate-pulse">Loading Report...</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-12 animate-fade-in">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card p-8 border-l-4 border-l-lem-accent shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-lem-accent/20 rounded-2xl flex items-center justify-center text-lem-accent">
                        <Target size={24} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-gray-500">{isTe ? "మొత్తం మాస్టర్ చేసినవి" : "Total Wisdom Mastered"}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-white">{totalMastered}</span>
                      <span className="text-xl text-gray-600 font-bold">/ {totalWisdom}</span>
                    </div>
                  </div>

                  <div className="glass-card p-8 border-l-4 border-l-blue-400 shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-400/20 rounded-2xl flex items-center justify-center text-blue-400">
                        <Award size={24} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-gray-500">{isTe ? "ప్రస్తుత ర్యాంకు" : "Your Rank"}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      {userRank ? (
                        <>
                          <span className="text-5xl font-black text-white">{userRank}</span>
                          <span className="text-xl text-gray-600 font-bold">/ {totalUsers}</span>
                        </>
                      ) : (
                        <span className="text-3xl font-black text-gray-500">—</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hanuman Chalisa Progress Section */}
                {(!scriptureFilter || scriptureFilter === 'hanuman') && (
                  <div className="glass-card overflow-hidden border-l-4 border-orange-500 shadow-xl">
                    <div className="p-6 border-b border-lem-glass-border flex justify-between items-center bg-orange-500/5">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                        <Star size={20} className="text-orange-500" />
                        Hanuman Chalisa
                      </h3>
                      <button 
                        onClick={() => handleTabChange('history')}
                        className="text-xs font-black bg-white/10 text-gray-300 px-4 py-2 rounded-lg hover:bg-white/20 transition-all flex items-center gap-1"
                      >
                        <ClipboardList size={14} /> View Quizzes
                      </button>
                    </div>
                    <div className="p-8 flex flex-col md:flex-row items-center gap-8">
                      <div className="relative w-32 h-32 flex-shrink-0">
                          <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path className="text-white/5 stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-orange-500 stroke-current transition-all duration-1000" strokeWidth="3" strokeDasharray={`${Math.round((hanumanMastered / totalHanumanVerses) * 100)}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-2xl font-black">{Math.round((hanumanMastered / totalHanumanVerses) * 100)}%</span>
                          </div>
                      </div>
                      <div className="flex-1">
                          <h4 className="text-lg font-bold mb-2">Dedication to Hanuman</h4>
                          <p className="text-gray-400 text-sm mb-4">You have mastered {hanumanMastered} out of 44 verses. Keep going to earn the "Bala Hanuman" badge!</p>
                          <div className="flex gap-4">
                            <div className="bg-white/5 p-4 rounded-xl flex-1 border border-lem-glass-border">
                                <div className="text-xs font-bold text-gray-500 uppercase mb-1">Verses</div>
                                <div className="text-2xl font-black text-orange-500">{hanumanMastered}</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl flex-1 border border-lem-glass-border text-center">
                                <div className="text-xs font-bold text-gray-500 uppercase mb-1">Badge</div>
                                <div className="text-2xl">🏆</div>
                            </div>
                          </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bhagavad Gita Progress Section */}
                {(!scriptureFilter || scriptureFilter === 'gita') && (
                  <div className="glass-card overflow-hidden shadow-xl border-l-4 border-lem-accent">
                    <div className="p-6 border-b border-lem-glass-border flex justify-between items-center bg-lem-accent/5">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                        <BookOpen size={20} className="text-lem-accent" />
                        Bhagavad Gita Breakdown
                      </h3>
                      <button 
                        onClick={() => handleTabChange('history')}
                        className="text-xs font-black bg-white/10 text-gray-300 px-4 py-2 rounded-lg hover:bg-white/20 transition-all flex items-center gap-1"
                      >
                        <ClipboardList size={14} /> View Quizzes
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/5">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">{isTe ? "అధ్యాయం" : "Chapter"}</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">{isTe ? "పురోగతి" : "Progress"}</th>
                            <th className="px-6 py-4 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-lem-glass-border">
                          {(progress.gita || []).map(ch => {
                            const isCompleted = ch.verses_completed >= (ch.total_verses || 47);
                            const num = ch.chapter_number;
                            return (
                              <tr key={num} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'}`}>
                                      {num}
                                    </span>
                                    <span className="font-bold text-white">Chapter {num}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                                      <span>{ch.verses_completed || 0} / {ch.total_verses || 47}</span>
                                      <span>{Math.round(((ch.verses_completed || 0) / (ch.total_verses || 1)) * 100)}%</span>
                                    </div>
                                    <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-lem-accent'}`}
                                        style={{ width: `${Math.round(((ch.verses_completed || 0) / (ch.total_verses || 1)) * 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <Link to={`/read/gita`} className="text-xs font-black uppercase tracking-widest text-lem-accent hover:underline">
                                    {ch.verses_completed > 0 ? 'Review' : 'Start'}
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* QUIZ HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="space-y-8 animate-fade-in">
                {/* Stats Summary for History */}
                {scriptureFilter === 'hanuman' && hanumanStats && (
                  <div className="glass-card p-6 border-l-4 border-orange-500">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                       <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Attempted</p>
                          <p className="text-2xl font-black text-orange-500">{hanumanStats.total_verses_attempted}/44</p>
                       </div>
                       <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Avg Score</p>
                          <p className={`text-2xl font-black ${scoreColor(hanumanStats.average_score)}`}>{hanumanStats.average_score}%</p>
                       </div>
                       <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Best</p>
                          <p className="text-2xl font-black text-green-400">{hanumanStats.best_score}%</p>
                       </div>
                       <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Worst</p>
                          <p className="text-2xl font-black text-red-400">{hanumanStats.worst_score}%</p>
                       </div>
                    </div>
                  </div>
                )}

                {filteredQuizzes.length === 0 ? (
                  <div className="glass-card p-16 text-center">
                    <Award size={48} className="mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Quizzes Recorded</h3>
                    <p className="text-gray-400">Complete an assessment in the learning module to see it here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredQuizzes.map((q) => {
                      let quizQuestions = [];
                      try {
                        quizQuestions = typeof q.questions === 'string' ? JSON.parse(q.questions) : (q.questions || []);
                      } catch (e) { quizQuestions = []; }
                      
                      const correct = quizQuestions.filter(a => a && a.chosen === a.correct).length;
                      const total = quizQuestions.length;

                      return (
                        <details key={q.id} className="glass-card border border-lem-glass-border rounded-2xl overflow-hidden group">
                          <summary className="p-6 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between">
                            <div className="flex items-center gap-5">
                              <span className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-xl ${q.score >= 90 ? 'bg-green-500/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : q.score >= 70 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                {q.score}%
                              </span>
                              <div>
                                <div className="font-bold text-lg text-white">{getVerseLabel(q)}</div>
                                <div className="text-sm text-gray-500 capitalize">{q.scripture === 'hanuman' ? 'Hanuman Chalisa' : 'Bhagavad Gita'} • {new Date(q.completed_at).toLocaleDateString()}</div>
                              </div>
                            </div>
                            <span className="hidden md:block text-gray-400 font-bold bg-white/5 px-4 py-1.5 rounded-full border border-lem-glass-border">{correct} / {total} Correct</span>
                          </summary>
                          <div className="p-6 pt-0 space-y-4 border-t border-lem-glass-border bg-black/20">
                            {quizQuestions.map((qa, i) => {
                              const isRight = qa.chosen === qa.correct;
                              return (
                                <div key={i} className={`p-4 rounded-xl border ${isRight ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                                  <div className="flex items-start gap-3">
                                    {isRight ? <CheckCircle size={18} className="text-green-400 mt-1" /> : <XCircle size={18} className="text-red-400 mt-1" />}
                                    <div>
                                      <p className="font-bold text-white mb-2">{qa.question}</p>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div className={isRight ? 'text-green-400' : 'text-red-400'}>
                                          <span className="text-xs font-black uppercase tracking-widest opacity-50 block">Your Answer</span>
                                          {qa.options?.[qa.chosen] || 'None'}
                                        </div>
                                        {!isRight && (
                                          <div className="text-green-400">
                                            <span className="text-xs font-black uppercase tracking-widest opacity-50 block">Correct Answer</span>
                                            {qa.options?.[qa.correct]}
                                          </div>
                                        )}
                                      </div>
                                    </div>
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
            )}

            {/* WISDOM JOURNAL TAB */}
            {activeTab === 'journal' && (
              <div className="space-y-6 animate-fade-in">
                {filteredEntries.length === 0 ? (
                  <div className="glass-card p-16 text-center">
                    <ScrollText size={48} className="mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Your Journal is Empty</h3>
                    <p className="text-gray-400">Complete a shloka reflection to see your insights here.</p>
                  </div>
                ) : (
                  filteredEntries.map(entry => (
                    <div key={entry.id} className="glass-card p-8 hover:border-lem-accent/50 transition-all group">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                           <div className="bg-lem-accent/20 w-12 h-12 rounded-2xl flex items-center justify-center text-lem-accent shadow-lg group-hover:scale-110 transition-transform">
                              <Star size={24} fill="currentColor" />
                           </div>
                           <div>
                              <h3 className="font-bold text-xl text-white capitalize">{entry.scripture} • Chapter {entry.chapter_number}</h3>
                              <p className="text-xs font-black text-lem-accent uppercase tracking-[0.2em]">Verse {entry.verse_id}</p>
                           </div>
                        </div>
                        <div className="text-xs font-bold text-gray-500 bg-white/5 px-4 py-2 rounded-full border border-lem-glass-border">
                          {new Date(entry.completed_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="bg-black/30 rounded-2xl p-6 border border-lem-glass-border">
                        <div className="mb-4">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">The Question</span>
                          <p className="text-gray-300 font-medium">{entry.question}</p>
                        </div>
                        <div className="border-t border-white/5 pt-4">
                          <span className="text-[10px] font-black text-lem-accent uppercase tracking-widest block mb-1">Your Wisdom</span>
                          <p className="text-white text-lg leading-relaxed italic border-l-2 border-lem-accent pl-4">"{entry.response}"</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MasteryReport;
