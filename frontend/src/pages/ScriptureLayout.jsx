import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import VerseViewer from '../components/VerseViewer';
import ThemeViewer from '../components/ThemeViewer';
import KrishnaChat from '../components/KrishnaChat';
import SlokaQuiz from '../components/SlokaQuiz';
import LanguageToggle from '../components/LanguageToggle';
import { Lock, ChevronLeft, BookOpen, GraduationCap, Star, Target, CheckCircle, Menu, X } from 'lucide-react';

const ScriptureLayout = () => {
  const { scripture } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeChapter, setActiveChapter] = useState(1);
  const [verses, setVerses] = useState([]);
  const [themes, setThemes] = useState([]); // New state for themes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeVerseIndex, setActiveVerseIndex] = useState(0);
  const [activeThemeIndex, setActiveThemeIndex] = useState(0); // New state for active theme
  const [chapterMetadata, setChapterMetadata] = useState([]);
  const [masteredShlokas, setMasteredShlokas] = useState(new Set());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Generate chapters based on scripture
  const activeChapterData = scripture === 'gita' ? chapterMetadata.find(c => c.id === activeChapter) : null;
  const totalVersesInChapter = scripture === 'hanuman' ? 44 : (activeChapterData ? activeChapterData.count : 1);
  const chapterCount = scripture === 'gita' ? 18 : 1;
  const chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);

  useEffect(() => {
    // Fetch chapter metadata once
    api.get('/api/verses/chapters').then(res => {
      setChapterMetadata(res.data.chapters || []);
    }).catch(err => console.error('Failed to load metadata:', err));
  }, []);

  useEffect(() => {
    setShowQuiz(false);
    setMasteredShlokas(new Set());
    fetchVerses(activeChapter);
  }, [activeChapter, scripture]);

  const fetchVerses = async (chapterNum) => {
    setLoading(true);
    setError('');
    setThemes([]);
    try {
      // First try to fetch themes (Thematic Curriculum)
      try {
        const themeRes = await api.get(`/api/themes/${scripture}/${chapterNum}`);
        if (themeRes.data && themeRes.data.length > 0) {
          setThemes(themeRes.data);
          setActiveThemeIndex(0);
          setLoading(false);
          return; // Skip raw verses if themes exist
        }
      } catch (themeErr) {
        // If 404 or error, fallback to raw verses
        console.log("No themes found, falling back to verses.");
      }

      const res = await api.get(`/api/verses?scripture=${scripture}&age_level=8-10&chapter=${chapterNum}`);
      setVerses(Object.values(res.data)); // Since backend returns an object of shlokas
      setActiveVerseIndex(0); // Reset to first verse on chapter change
    } catch (err) {
      if (err.response?.status === 403) {
        setError(err.response.data.error);
        setVerses([]);
      } else {
        setError('Failed to load content.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChapterClick = (chapterNum) => {
    if (chapterNum >= 3 && (!user || (!user.is_premium && user.role !== 'admin'))) {
      navigate('/subscribe');
      return;
    }
    setActiveChapter(chapterNum);
  };

  // Guard: show Coming Soon for unavailable scriptures
  if (scripture === 'ramayana') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-lem-dark text-white">
        <Link to="/" className="absolute top-6 left-6 text-gray-400 hover:text-lem-accent transition-colors flex items-center gap-2 text-sm font-bold">
          <ChevronLeft size={18} /> Back Home
        </Link>
        <div className="text-center glass-card p-16 max-w-md mx-auto border border-lem-glass-border">
          <div className="text-6xl mb-6">📖</div>
          <h2 className="text-3xl font-black text-white mb-4">Ramayana</h2>
          <p className="text-gray-400 font-medium leading-relaxed mb-6">
            The Epic of Rama is coming soon to littleEpicMinds.<br />
            We're crafting a beautiful, child-friendly experience just for you!
          </p>
          <span className="bg-gray-700 text-gray-300 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-gray-600">
            🔒 Coming Soon
          </span>
        </div>
      </div>
    );
  }

  return (
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-lem-dark text-white overflow-hidden">
      
      {/* Mobile Header - Only on small screens */}
      <div className="md:hidden flex items-center justify-between p-4 bg-lem-sidebar border-b border-lem-glass-border z-30">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-lem-accent">
            <BookOpen size={24} />
          </Link>
          <span className="font-black text-white tracking-tight uppercase">LittleEpicMinds</span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-white bg-white/5 rounded-xl border border-white/10"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* SIDEBAR - Desktop: Sidebar, Mobile: Slide-out Drawer */}
      <div className={`
        fixed inset-0 z-50 md:relative md:inset-auto md:z-auto
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:w-64 bg-lem-sidebar border-r border-lem-glass-border flex-shrink-0 flex flex-col h-full md:h-screen shadow-2xl md:shadow-none
      `}>
        {/* Mobile Sidebar Header */}
        <div className="p-4 border-b border-lem-glass-border flex justify-between items-center bg-lem-dark/20">
          <div className="flex items-center">
            <Link to="/" className="text-gray-400 hover:text-lem-accent transition-colors p-2">
              <ChevronLeft size={24} />
            </Link>
            <h2 className="text-xl font-extrabold text-white ml-2 capitalize flex items-center tracking-wide">
               <BookOpen size={18} className="mr-2 text-lem-accent" />
               {scripture}
            </h2>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Render Chapters list */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar">
          {chapters.map(num => {
            const isLocked = num >= 3 && (!user || (!user.is_premium && user.role !== 'admin'));
            const isActive = activeChapter === num;
            const isFree = num < 3;
            
            return (
              <button
                key={num}
                onClick={() => { handleChapterClick(num); setIsMobileMenuOpen(false); }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${
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

        <div className="hidden md:block p-4 border-t border-lem-glass-border">
          <div className="flex justify-center">
            <LanguageToggle />
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative custom-scrollbar h-screen">
        <div className="max-w-4xl mx-auto pb-12">
          
          {/* Top Navigation for User Progress */}
          {user && (
            <div className="flex justify-end items-center mb-8 gap-4">
              <Link to={`/progress?scripture=${scripture}`} className="flex items-center gap-2 bg-lem-accent/10 border border-lem-accent/30 text-lem-accent px-4 py-2 rounded-xl text-sm font-black hover:bg-lem-accent hover:text-lem-dark transition-all">
                <Target size={16} />
                My Progress
              </Link>
              <Link to={`/journal?scripture=${scripture}`} className="flex items-center gap-2 bg-white/5 border border-lem-glass-border text-gray-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/10 hover:text-white transition-all">
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
          ) : themes.length > 0 ? (
            <div className="space-y-8">
              {/* Theme Navigation Dropdown */}
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-lem-glass-border">
                <span className="font-bold text-gray-300">
                  Select Theme:
                </span>
                <select
                  value={activeThemeIndex}
                  onChange={(e) => setActiveThemeIndex(Number(e.target.value))}
                  className="bg-lem-dark border border-lem-glass-border text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:border-lem-accent cursor-pointer shadow-inner max-w-[200px] md:max-w-md"
                >
                  {themes.map((theme, idx) => (
                    <option key={theme.id} value={idx}>
                      {idx + 1}. {theme.title}
                    </option>
                  ))}
                </select>
              </div>

              <ThemeViewer 
                theme={themes[activeThemeIndex]} 
                scripture={scripture} 
              />
            </div>
          ) : verses.length > 0 ? (
            <div className="space-y-8">
              <>
                  {/* Verse Navigation Dropdown */}
                  <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-lem-glass-border">
                    <span className="font-bold text-gray-300">
                      {scripture === 'hanuman' ? 'Select Verse:' : 'Select Shloka:'}
                    </span>
                    <select
                      value={activeVerseIndex}
                      onChange={(e) => { setActiveVerseIndex(Number(e.target.value)); setShowQuiz(false); }}
                      className="bg-lem-dark border border-lem-glass-border text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:border-lem-accent cursor-pointer shadow-inner"
                    >
                      {Array.from({ length: totalVersesInChapter }, (_, i) => i + 1).map((num) => {
                        let label;
                        if (scripture === 'hanuman') {
                          if (num <= 2) label = `Doha ${num}`;
                          else if (num <= 42) label = `Verse ${num - 2}`;
                          else label = `Doha ${num - 40}`; // Doha 3 and 4
                        } else {
                          label = `Shloka ${num}`;
                        }
                        return (
                          <option key={num} value={num - 1}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Render the active verse or a placeholder */}
                  {(() => {
                    const activeVerse = scripture === 'hanuman' 
                      ? verses[activeVerseIndex]
                      : verses.find(v => {
                          const vNum = v.verse || (typeof v.id === 'string' && v.id.includes('.') ? v.id.split('.')[1] : v.id);
                          return parseInt(vNum) === (activeVerseIndex + 1);
                        });
                    const verseNum = activeVerseIndex + 1;
                    const isMastered = masteredShlokas.has(verseNum);

                    if (activeVerse) {
                      return (
                        <div className="animate-fade-in">
                          <VerseViewer 
                            key={activeVerse.id || activeVerseIndex} 
                            verse={{ ...activeVerse, chapter_number: activeChapter, scripture: scripture }} 
                            scripture={scripture} 
                          />
                          {/* Per-Shloka Quiz */}
                          {showQuiz ? (
                            <div className="mt-6">
                              <SlokaQuiz
                                scripture={scripture}
                                chapter={activeChapter}
                                verse={verseNum}
                                onPass={(score) => {
                                  setMasteredShlokas(prev => new Set([...prev, verseNum]));
                                  setShowQuiz(false);
                                }}
                                onClose={() => setShowQuiz(false)}
                              />
                            </div>
                          ) : (
                            <div className="flex justify-center mt-8 mb-4">
                              {isMastered ? (
                                <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                                  <CheckCircle size={20} />
                                  {scripture === 'hanuman' ? 'Verse Mastered!' : `Shloka ${activeChapter}.${verseNum} Mastered!`}
                                </div>
                              ) : (
                                <button
                                  onClick={() => setShowQuiz(true)}
                                  className="flex items-center gap-2 bg-lem-sidebar border border-lem-accent text-lem-accent hover:bg-lem-accent hover:text-lem-dark font-black px-6 py-3 rounded-full shadow-lg transition-all hover:scale-105"
                                >
                                  <GraduationCap size={20} />
                                  {scripture === 'hanuman' ? 'Test This Verse' : `Test Shloka ${activeChapter}.${verseNum}`}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <div className="glass-card p-12 text-center border-dashed border-2 border-lem-glass-border opacity-60">
                           <BookOpen size={48} className="mx-auto text-gray-500 mb-4" />
                           <h3 className="text-2xl font-bold text-white mb-2">Wisdom Coming Soon</h3>
                           <p className="text-gray-400">Our AI engine is currently preparing the child-friendly explanation for Shloka {activeVerseIndex + 1}. Check back shortly!</p>
                        </div>
                      );
                    }
                  })()}
              </>
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
