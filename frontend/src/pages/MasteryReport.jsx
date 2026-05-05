import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Award, Target, BookOpen, Star, TrendingUp, ChevronRight, ClipboardList } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const MasteryReport = () => {
  const { user, currentLang } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const scriptureFilter = queryParams.get('scripture');
  
  const [progress, setProgress] = useState({ gita: [], hanuman: { verses_completed: 0, total_verses: 44 } });
  const [hanumanStats, setHanumanStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);
  const [totalUsers, setTotalUsers] = useState(null);
  const isTe = currentLang === 'te';

  useEffect(() => {
    if (user) {
      Promise.all([
        api.get(`/api/evaluations/progress/${user.id}`),
        api.get(`/api/evaluations/hanuman-overall/${user.id}`)
      ]).then(([progressRes, statsRes]) => {
        setProgress(progressRes.data || { gita: [], hanuman: { verses_completed: 0, total_verses: 44 } });
        setHanumanStats(statsRes.data || null);
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

  if (!user) return <div className="text-center p-20 text-white font-bold text-2xl">Please login to see your mastery report.</div>;

  const gitaMastered = progress.gita?.reduce((acc, curr) => acc + curr.verses_completed, 0) || 0;
  const hanumanMastered = progress.hanuman?.verses_completed || 0;
  
  const totalGitaShlokas = progress.gita?.reduce((acc, curr) => acc + curr.total_verses, 0) || 0;
  const totalHanumanVerses = progress.hanuman?.total_verses || 44;

  // Filter based on scripture
  let totalMastered = gitaMastered + hanumanMastered;
  let totalWisdom = totalGitaShlokas + totalHanumanVerses;
  
  if (scriptureFilter === 'gita') {
    totalMastered = gitaMastered;
    totalWisdom = totalGitaShlokas;
  } else if (scriptureFilter === 'hanuman') {
    totalMastered = hanumanMastered;
    totalWisdom = totalHanumanVerses;
  }

  return (
    <div className="min-h-screen bg-lem-dark text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
              {scriptureFilter ? (scriptureFilter === 'gita' ? 'Gita' : 'Hanuman') : 'Mastery'} <span className="text-lem-accent">Report</span>
            </h1>
            <p className="text-gray-400 font-medium">{isTe ? "మీ ఆధ్యాత్మిక ప్రయాణ నివేదిక" : "Track your spiritual learning and growth."}</p>
          </div>
          <Link to={scriptureFilter ? `/read/${scriptureFilter}` : "/"} className="text-sm font-bold text-gray-500 hover:text-lem-accent transition-colors flex items-center gap-1 mb-2">
            {isTe ? "తిరిగి వెళ్ళు" : `Back to ${scriptureFilter ? (scriptureFilter === 'gita' ? 'Gita' : 'Hanuman') : 'Home'}`} <ChevronRight size={16} />
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="glass-card p-8 border-l-4 border-l-lem-accent">
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

          <div className="glass-card p-8 border-l-4 border-l-blue-400">
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
          <div className="glass-card overflow-hidden mb-12 border-l-4 border-orange-500">
            <div className="p-6 border-b border-lem-glass-border flex justify-between items-center bg-orange-500/5">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Star size={20} className="text-orange-500" />
                Hanuman Chalisa
              </h3>
              <div className="flex gap-2">
                <Link to="/quiz-history" className="text-xs font-black bg-white/10 text-gray-300 px-4 py-2 rounded-lg hover:bg-white/20 transition-all flex items-center gap-1">
                  <ClipboardList size={14} /> Quiz History
                </Link>
                <Link to="/read/hanuman" className="text-xs font-black bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all">
                  Continue
                </Link>
              </div>
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
                  <p className="text-gray-400 text-sm mb-4">You have mastered {hanumanMastered} out of 44 verses of the Hanuman Chalisa. Keep going to earn the "Bala Hanuman" badge!</p>
                  <div className="flex gap-4">
                     <div className="bg-white/5 p-4 rounded-xl flex-1 border border-lem-glass-border">
                        <div className="text-xs font-bold text-gray-500 uppercase mb-1">Verses Mastered</div>
                        <div className="text-2xl font-black text-orange-500">{hanumanMastered}</div>
                     </div>
                     <div className="bg-white/5 p-4 rounded-xl flex-1 border border-lem-glass-border">
                        <div className="text-xs font-bold text-gray-500 uppercase mb-1">Status</div>
                        <div className="text-sm font-black text-white">{hanumanMastered >= 44 ? '🏅 COMPLETE' : '⏳ IN PROGRESS'}</div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Overall Quiz Score */}
            {hanumanStats && hanumanStats.total_verses_attempted > 0 && (
              <div className="p-8 pt-0">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Overall Quiz Performance</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl text-center border border-lem-glass-border">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Attempted</div>
                    <div className="text-xl font-black text-orange-500">{hanumanStats.total_verses_attempted}/44</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl text-center border border-lem-glass-border">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Average</div>
                    <div className={`text-xl font-black ${hanumanStats.average_score >= 90 ? 'text-green-400' : hanumanStats.average_score >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>{hanumanStats.average_score}%</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl text-center border border-lem-glass-border">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Best</div>
                    <div className="text-xl font-black text-green-400">{hanumanStats.best_score}%</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl text-center border border-lem-glass-border">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Need Practice</div>
                    <div className="text-xl font-black text-red-400">{hanumanStats.worst_score}%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bhagavad Gita Progress Table */}
        {(!scriptureFilter || scriptureFilter === 'gita') && (
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-lem-glass-border flex justify-between items-center bg-lem-accent/5">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BookOpen size={20} className="text-lem-accent" />
                Bhagavad Gita Breakdown
              </h3>
              <Link to="/quiz-history" className="text-xs font-black bg-white/10 text-gray-300 px-4 py-2 rounded-lg hover:bg-white/20 transition-all flex items-center gap-1">
                <ClipboardList size={14} /> Quiz History
              </Link>
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
                            <span className="font-bold">Chapter {num}</span>
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
                          <Link 
                            to={`/read/gita`} 
                            className="text-xs font-black uppercase tracking-tighter text-lem-accent hover:underline"
                          >
                            {ch.verses_completed > 0 ? 'Review' : 'Start'}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {(!progress.gita || progress.gita.length === 0) && (
                    <tr>
                        <td colSpan="3" className="p-12 text-center text-gray-500 italic font-medium">
                          No Gita progress recorded yet. Start your journey!
                        </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MasteryReport;
