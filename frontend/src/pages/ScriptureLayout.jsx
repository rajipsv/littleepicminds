import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import VerseViewer from '../components/VerseViewer';
import KrishnaChat from '../components/KrishnaChat';
import EvaluationQuiz from '../components/EvaluationQuiz';
import LanguageToggle from '../components/LanguageToggle';
import { Lock, ChevronLeft, BookOpen, GraduationCap, Star, Target } from 'lucide-react';

const ScriptureLayout = () => {
  const { scripture } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeChapter, setActiveChapter] = useState(1);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeVerseIndex, setActiveVerseIndex] = useState(0);

  // Generate chapters based on scripture
  const chapterCount = scripture === 'gita' ? 18 : 1;
  const chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);

  useEffect(() => {
    setShowQuiz(false);
    fetchVerses(activeChapter);
  }, [activeChapter, scripture]);

  const fetchVerses = async (chapterNum) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/verses?scripture=${scripture}&age_level=8-10&chapter=${chapterNum}`);
      setVerses(Object.values(res.data)); // Since backend returns an object of shlokas
      setActiveVerseIndex(0); // Reset to first verse on chapter change
    } catch (err) {
      if (err.response?.status === 403) {
        setError(err.response.data.error);
        setVerses([]);
      } else {
        setError('Failed to load verses.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChapterClick = (chapterNum) => {
    if (chapterNum >= 3 && (!user || !user.is_premium)) {
      navigate('/subscribe');
      return;
    }
    setActiveChapter(chapterNum);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-lem-dark text-white">
      
      {/* Mobile Header / Desktop Sidebar */}
      <div className="md:w-64 bg-lem-sidebar border-r border-lem-glass-border flex-shrink-0 flex flex-col h-auto md:h-screen sticky top-0 z-10 shadow-lg">
        <div className="p-4 border-b border-lem-glass-border flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-gray-400 hover:text-lem-accent transition-colors p-2">
              <ChevronLeft size={24} />
            </Link>
            <h2 className="text-xl font-extrabold text-white ml-2 capitalize flex items-center tracking-wide">
               <BookOpen size={18} className="mr-2 text-lem-accent" />
               {scripture}
            </h2>
          </div>
          <div className="md:hidden">
            <LanguageToggle />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-hidden whitespace-nowrap md:whitespace-normal scrollbar-hide">
          {chapters.map(num => {
            const isLocked = num >= 3 && (!user || !user.is_premium);
            const isActive = activeChapter === num;
            const isFree = num < 3;
            
            return (
              <button
                key={num}
                onClick={() => handleChapterClick(num)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all flex-shrink-0 md:flex-shrink-none ${
                  isActive 
                    ? 'bg-lem-accent text-lem-dark shadow-[0_0_15px_rgba(253,160,133,0.3)]' 
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-lem-accent'
                }`}
              >
                <span>{scripture === 'hanuman' ? 'Complete Chalisa' : `Chapter ${num}`}</span>
                {isLocked && <Lock size={16} className={isActive ? 'text-lem-dark' : 'text-gray-500'} />}
                {!isLocked && isFree && (
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${isActive ? 'bg-lem-dark/20 text-lem-dark' : 'bg-green-500/20 text-green-400'}`}>
                    Free
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-lem-glass-border space-y-3">
           <div className="grid grid-cols-2 gap-2">
              <Link to="/progress" className="bg-lem-dark border border-lem-glass-border text-lem-accent text-[10px] font-black uppercase tracking-widest p-2 rounded-lg flex flex-col items-center gap-1 hover:bg-lem-accent hover:text-lem-dark transition-all">
                <Target size={14} />
                Progress
              </Link>
              <Link to="/journal" className="bg-lem-dark border border-lem-glass-border text-gray-400 text-[10px] font-black uppercase tracking-widest p-2 rounded-lg flex flex-col items-center gap-1 hover:bg-white/10 hover:text-white transition-all">
                <Star size={14} />
                Journal
              </Link>
           </div>
           <div className="flex justify-center">
             <LanguageToggle />
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <div className="max-w-4xl mx-auto">
          
          {/* Top Navigation for User Progress */}
          {user && (
            <div className="flex justify-end items-center mb-8 gap-4">
              <Link to="/progress" className="flex items-center gap-2 bg-lem-accent/10 border border-lem-accent/30 text-lem-accent px-4 py-2 rounded-xl text-sm font-black hover:bg-lem-accent hover:text-lem-dark transition-all">
                <Target size={16} />
                My Progress
              </Link>
              <Link to="/journal" className="flex items-center gap-2 bg-white/5 border border-lem-glass-border text-gray-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/10 hover:text-white transition-all">
                <Star size={16} />
                My Journal
              </Link>
            </div>
          )}

          {error ? (
            <div className={`glass-card p-8 text-center border-l-4 ${error.includes('Premium') ? 'border-red-500' : 'border-lem-accent'}`}>
              <Lock size={48} className={`mx-auto mb-4 ${error.includes('Premium') ? 'text-red-400' : 'text-lem-accent'}`} />
              <h3 className="text-2xl font-bold text-white mb-2">
                {error.includes('Premium') ? 'Premium Content' : 'Oops!'}
              </h3>
              <p className="text-gray-300 mb-6">{error}</p>
              {error.includes('Premium') && (
                <button onClick={() => navigate('/subscribe')} className="bg-gradient-accent text-lem-dark font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105">
                  Unlock Now
                </button>
              )}
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-lem-accent border-white/10 border-solid"></div>
            </div>
          ) : verses.length > 0 ? (
            <div className="space-y-8">
              {!showQuiz ? (
                <>
                  {/* Verse Navigation Dropdown */}
                  <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-lem-glass-border">
                    <span className="font-bold text-gray-300">
                      {scripture === 'hanuman' ? 'Select Verse:' : 'Select Shloka:'}
                    </span>
                    <select
                      value={activeVerseIndex}
                      onChange={(e) => setActiveVerseIndex(Number(e.target.value))}
                      className="bg-lem-dark border border-lem-glass-border text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:border-lem-accent cursor-pointer shadow-inner"
                    >
                      {verses.map((verse, index) => {
                        const verseNum = verse.verse || verse.id || index + 1;
                        return (
                          <option key={verse.id || index} value={index}>
                            {scripture === 'hanuman' ? 'Verse' : 'Shloka'} {verseNum}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Render ONLY the active verse */}
                  {verses[activeVerseIndex] && (
                    <div className="animate-fade-in">
                      <VerseViewer key={verses[activeVerseIndex].id || activeVerseIndex} verse={verses[activeVerseIndex]} scripture={scripture} />
                    </div>
                  )}
                  
                  <div className="flex justify-center mt-12 mb-8 border-t border-lem-glass-border pt-8">
                    <button 
                      onClick={() => setShowQuiz(true)}
                      className="flex items-center gap-2 bg-lem-sidebar border border-lem-accent text-lem-accent hover:bg-lem-accent hover:text-lem-dark font-black px-8 py-4 rounded-full shadow-lg transition-all hover:scale-105"
                    >
                      <GraduationCap size={24} />
                      Take Chapter Evaluation
                    </button>
                  </div>
                </>
              ) : (
                <div className="animate-fade-in">
                  <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">
                      {scripture === 'hanuman' ? 'Hanuman Chalisa Mastery' : `Chapter ${activeChapter} Mastery`}
                    </h2>
                    <button onClick={() => setShowQuiz(false)} className="text-lem-accent hover:underline text-sm font-bold">
                      Back to Verses
                    </button>
                  </div>
                  <EvaluationQuiz scripture={scripture} chapter={activeChapter} onComplete={(score) => {
                    console.log("Quiz completed with score:", score);
                  }} />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 p-8 glass-card">No verses found for this chapter yet.</div>
          )}
        </div>
        
        {/* Guru Chat Assistant */}
        <KrishnaChat scripture={scripture} />
      </div>
      
    </div>
  );
};

export default ScriptureLayout;
