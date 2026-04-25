import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Award, Target, BookOpen, Star, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MasteryReport = () => {
  const { user, currentLang } = useAuth();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const isTe = currentLang === 'te';

  useEffect(() => {
    if (user) {
      api.get(`/api/evaluations/progress/${user.id}`)
        .then(res => {
          setProgress(res.data.progress || []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  if (!user) return <div className="text-center p-20 text-white font-bold text-2xl">Please login to see your mastery report.</div>;

  const totalMastered = progress.reduce((acc, curr) => acc + curr.verses_completed, 0);
  const totalShlokas = progress.reduce((acc, curr) => acc + curr.total_verses, 0);
  const chaptersWithQuiz = progress.filter(p => p.best_score !== null && p.best_score > 0);
  const avgScore = chaptersWithQuiz.length > 0 
    ? Math.round(chaptersWithQuiz.reduce((acc, curr) => acc + curr.best_score, 0) / chaptersWithQuiz.length)
    : 0;

  return (
    <div className="min-h-screen bg-lem-dark text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
              Mastery <span className="text-lem-accent">Report</span>
            </h1>
            <p className="text-gray-400 font-medium">{isTe ? "మీ ఆధ్యాత్మిక ప్రయాణ నివేదిక" : "Track your spiritual learning and growth."}</p>
          </div>
          <Link to="/" className="text-sm font-bold text-gray-500 hover:text-lem-accent transition-colors flex items-center gap-1 mb-2">
            {isTe ? "తిరిగి వెళ్ళు" : "Back to Home"} <ChevronRight size={16} />
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass-card p-8 border-l-4 border-l-lem-accent">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-lem-accent/20 rounded-2xl flex items-center justify-center text-lem-accent">
                <Target size={24} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">{isTe ? "పూర్తయిన శ్లోకాలు" : "Shlokas Mastered"}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white">{totalMastered}</span>
              <span className="text-xl text-gray-600 font-bold">/ {totalShlokas}</span>
            </div>
          </div>

          <div className="glass-card p-8 border-l-4 border-l-green-400">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-400/20 rounded-2xl flex items-center justify-center text-green-400">
                <TrendingUp size={24} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">{isTe ? "సగటు స్కోరు" : "Average Accuracy"}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white">{chaptersWithQuiz.length > 0 ? `${avgScore}%` : '—'}</span>
            </div>
          </div>

          <div className="glass-card p-8 border-l-4 border-l-blue-400">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-400/20 rounded-2xl flex items-center justify-center text-blue-400">
                <Award size={24} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">{isTe ? "ప్రస్తుత స్థాయి" : "Current Rank"}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white capitalize">{user.level || 'Seeds'}</span>
            </div>
          </div>
        </div>

        {/* Detailed Progress Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-lem-glass-border flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <BookOpen size={20} className="text-lem-accent" />
              {isTe ? "అధ్యాయాల వారీగా పురోగతి" : "Chapter Breakdown"}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">{isTe ? "అధ్యాయం" : "Chapter"}</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">{isTe ? "పురోగతి" : "Progress"}</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">{isTe ? "ఉత్తమ స్కోరు" : "Best Score"}</th>

                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lem-glass-border">
                {Array.from({ length: 18 }, (_, i) => i + 1).map(num => {
                  const chProg = progress.find(p => p.chapter_number == num);
                  const isCompleted = chProg && chProg.best_score >= 70;
                  
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
                            <span>{chProg?.verses_completed || 0} / {chProg?.total_verses || 47}</span>
                            <span>{Math.round(((chProg?.verses_completed || 0) / (chProg?.total_verses || 1)) * 100)}%</span>
                          </div>
                          <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-lem-accent'}`}
                              style={{ width: `${Math.round(((chProg?.verses_completed || 0) / (chProg?.total_verses || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-white">
                        {chProg && chProg.best_score > 0 ? `${chProg.best_score}%` : '—'}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link 
                          to={`/read/gita`} 
                          onClick={() => { /* In a real app we'd pass state to set the chapter */ }}
                          className="text-xs font-black uppercase tracking-tighter text-lem-accent hover:underline"
                        >
                          {chProg ? 'Review' : 'Start'}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasteryReport;
