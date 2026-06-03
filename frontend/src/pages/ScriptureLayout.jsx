import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import VerseViewer from '../components/VerseViewer';
import ThemeViewer from '../components/ThemeViewer';
import KrishnaChat from '../components/KrishnaChat';
import SlokaQuiz from '../components/SlokaQuiz';
import LanguageToggle from '../components/LanguageToggle';
import { Lock, ChevronLeft, BookOpen, GraduationCap, Star, Target, CheckCircle, Menu, X, User, LogOut, Settings, Sparkles } from 'lucide-react';
import { GITA_FREE_CHAPTER_MAX, hasPremiumGitaAccess, isGitaChapterLocked } from '../utils/gitaAccess';

const ScriptureLayout = () => {
  const { scripture } = useParams();
  const navigate = useNavigate();
  const { user, logout, currentLang, setCurrentLang, refreshUser } = useAuth();
  const isTe = currentLang === 'te';
  
  const toggleLanguage = () => {
    setCurrentLang(isTe ? 'en' : 'te');
  };
  
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
    refreshUser?.();
    api.get('/api/verses/chapters').then(res => {
      setChapterMetadata(res.data.chapters || []);
    }).catch(err => console.error('Failed to load metadata:', err));
  }, [refreshUser]);

  useEffect(() => {
    if (scripture === 'gita' && isGitaChapterLocked(activeChapter, user, scripture)) {
      setActiveChapter(GITA_FREE_CHAPTER_MAX);
      setError('');
    }
  }, [user, scripture, activeChapter]);

  useEffect(() => {
    setShowQuiz(false);
    setMasteredShlokas(new Set());
    fetchVerses(activeChapter);
  }, [activeChapter, scripture]);

  const fetchVerses = async (chapterNum) => {
    setLoading(true);
    setError('');
    setThemes([]);
    setVerses([]);
    
    let fetchedThemes = [];
    let fetchedVerses = [];
    
    try {
      // 1. Fetch themes (Thematic Curriculum)
      try {
        const themeRes = await api.get(`/api/themes/${scripture}/${chapterNum}?level=${user?.level || 'seekers'}`);
        if (themeRes.data && themeRes.data.length > 0) {
          fetchedThemes = themeRes.data;
          setThemes(fetchedThemes);
          setActiveThemeIndex(0);
        }
      } catch (themeErr) {
        console.log("No themes found for this chapter.");
      }

      // 2. Fetch raw verses (Sloka based)
      try {
        const res = await api.get(`/api/verses?scripture=${scripture}&age_level=8-10&chapter=${chapterNum}`);
        fetchedVerses = Object.values(res.data);
        setVerses(fetchedVerses);
        setActiveVerseIndex(0);
      } catch (verseErr) {
        console.log("No verses found for this chapter.");
      }

      if (fetchedThemes.length === 0 && fetchedVerses.length === 0) {
        setError('No content available for this chapter yet.');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        const msg = err.response.data?.error || '';
        setError(msg);
        if (msg.includes('Premium') && scripture === 'gita') {
          setActiveChapter(GITA_FREE_CHAPTER_MAX);
        }
      } else {
        setError('Failed to load content.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChapterClick = (chapterNum) => {
    if (isGitaChapterLocked(chapterNum, user, scripture)) {
      navigate(user ? '/subscribe' : '/login');
      return;
    }
    setActiveChapter(chapterNum);
    setError('');
  };

  // Guard: show Coming Soon for unavailable scriptures
  const comingSoonScriptures = {
    ramayana: {
      emoji: '📖',
      title: 'Ramayana',
      message: (
        <>
          The Epic of Rama is coming soon to littleEpicMinds.<br />
          We're crafting a beautiful, child-friendly experience just for you!
        </>
      ),
    },
    hanuman: {
      emoji: '🐒',
      title: 'Hanuman Chalisa',
      message: (
        <>
          Hanuman Chalisa is coming soon to littleEpicMinds.<br />
          We're finding the perfect voice to bring this sacred hymn to life for young minds!
        </>
      ),
    },
  };

  const comingSoon = comingSoonScriptures[scripture];
  if (comingSoon) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-lem-dark text-white">
        <Link to="/" className="absolute top-6 left-6 text-gray-400 hover:text-lem-accent transition-colors flex items-center gap-2 text-sm font-bold">
          <ChevronLeft size={18} /> Back Home
        </Link>
        <div className="text-center glass-card p-16 max-w-md mx-auto border border-lem-glass-border">
          <div className="text-6xl mb-6">{comingSoon.emoji}</div>
          <h2 className="text-3xl font-black text-white mb-4">{comingSoon.title}</h2>
          <p className="text-gray-400 font-medium leading-relaxed mb-6">
            {comingSoon.message}
          </p>
          <span className="bg-gray-700 text-gray-300 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-gray-600">
            🔒 Coming Soon
          </span>
        </div>
      </div>
    );
  }

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
          {user ? (
            <Link to="/settings" className="p-2 text-white bg-white/5 rounded-xl border border-white/10">
              <User size={20} />
            </Link>
          ) : (
            <Link to="/login" className="p-2 text-white bg-white/5 rounded-xl border border-white/10">
              <User size={20} />
            </Link>
          )}
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
               {isTe ? (scripture === 'gita' ? 'గీత' : (scripture === 'hanuman' ? 'హనుమాన్' : scripture)) : scripture}
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
            const isLocked = isGitaChapterLocked(num, user, scripture);
            const isActive = activeChapter === num;
            const isFree = scripture === 'gita' && num <= GITA_FREE_CHAPTER_MAX;
            const premiumUnlocked = scripture === 'gita' && hasPremiumGitaAccess(user);

            return (
              <button
                key={num}
                onClick={() => { handleChapterClick(num); setIsMobileMenuOpen(false); }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive 
                    ? 'bg-lem-accent text-lem-dark shadow-[0_0_15px_rgba(253,160,133,0.3)]' 
                    : isLocked
                      ? 'bg-white/5 text-gray-500 hover:bg-white/10'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-lem-accent'
                }`}
              >
                <span>{scripture === 'hanuman' ? (isTe ? 'హనుమాన్ చాలీసా' : 'Complete Chalisa') : (isTe ? `అధ్యాయం ${num}` : `Chapter ${num}`)}</span>
                {isLocked && <Lock size={16} className={isActive ? 'text-lem-dark' : 'text-gray-500'} />}
                {!isLocked && isFree && (
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${isActive ? 'bg-lem-dark/20 text-lem-dark' : 'bg-green-500/20 text-green-400'}`}>
                    {isTe ? 'ఉచితం' : 'Free'}
                  </span>
                )}
                {!isLocked && !isFree && premiumUnlocked && (
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${isActive ? 'bg-lem-dark/20 text-lem-dark' : 'bg-lem-accent/20 text-lem-accent'}`}>
                    {isTe ? 'ప్రీమియం' : 'Premium'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-lem-glass-border bg-lem-dark/40">
          {user ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-full bg-lem-accent/20 flex items-center justify-center border border-lem-accent/30">
                  <User size={20} className="text-lem-accent" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <span className="font-bold text-white block truncate text-sm">{user.username}</span>
                  {user.level && <span className="text-[10px] text-lem-accent font-black uppercase block">{user.level}</span>}
                  {user.is_premium && <span className="text-[10px] text-lem-accent font-black uppercase">Premium Member</span>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/settings" className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-colors">
                  <Settings size={14} /> Settings
                </Link>
                <button 
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-gradient-accent text-lem-dark font-black text-center shadow-lg"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-white/5 text-white font-bold text-center border border-white/10"
              >
                Join Now
              </Link>
            </div>
          )}
          <div className="hidden md:flex justify-center mt-6">
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
                {isTe ? "నా పురోగతి" : "My Progress"}
              </Link>
              <Link to={`/progress?tab=journal&scripture=${scripture}`} className="flex items-center gap-2 bg-white/5 border border-lem-glass-border text-gray-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/10 hover:text-white transition-all">
                <Star size={16} />
                {isTe ? "నా జర్నల్" : "My Journal"}
              </Link>
            </div>
          )}

          {error ? (
            <div className={`glass-card p-8 text-center border-l-4 ${error.includes('Premium') ? 'border-red-500' : 'border-lem-accent'}`}>
              <Lock size={48} className={`mx-auto mb-4 ${error.includes('Premium') ? 'text-red-400' : 'text-lem-accent'}`} />
              <h3 className="text-2xl font-bold text-white mb-2">
                {error.includes('Premium') ? (isTe ? 'ప్రీమియం కంటెంట్' : 'Premium Content') : (isTe ? 'ఓప్స్!' : 'Oops!')}
              </h3>
              <p className="text-gray-300 mb-6">{error}</p>
              {error.includes('Premium') && (
                <button onClick={() => navigate('/subscribe')} className="bg-gradient-accent text-lem-dark font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105">
                  {isTe ? "ఇప్పుడే అన్‌లాక్ చేయండి" : "Unlock Now"}
                </button>
              )}
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-lem-accent border-white/10 border-solid"></div>
            </div>
          ) : (user?.level === 'warriors' && verses.length > 0) || (themes.length === 0 && verses.length > 0) ? (
            <div className="space-y-8">
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="text-lem-accent animate-pulse" size={24} />
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                    {isTe ? "శ్లోక సాధన" : "Scripture Mastery"}
                  </h1>
                </div>
                <p className="text-gray-400 text-lg font-medium flex items-center gap-2">
                  <span className="w-12 h-[2px] bg-lem-accent/30"></span>
                  {isTe ? "మూల శ్లోకాలు" : "Divine Verses"}
                </p>
              </div>

              {/* Verse Navigation Dropdown */}
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-lem-glass-border">
                <span className="font-bold text-gray-300">
                  {scripture === 'hanuman' ? (isTe ? 'శ్లోకాన్ని ఎంచుకోండి:' : 'Select Verse:') : (isTe ? 'శ్లోకాన్ని ఎంచుకోండి:' : 'Select Shloka:')}
                </span>
                <div className="flex items-center gap-3">
                  <select
                    value={activeVerseIndex}
                    onChange={(e) => { setActiveVerseIndex(Number(e.target.value)); setShowQuiz(false); }}
                    className="bg-lem-dark border border-lem-glass-border text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:border-lem-accent cursor-pointer shadow-inner"
                  >
                    {Array.from({ length: totalVersesInChapter }, (_, i) => i + 1).map((num) => {
                      let label;
                      if (scripture === 'hanuman') {
                        if (num <= 2) label = isTe ? `దోహా ${num}` : `Doha ${num}`;
                        else if (num <= 42) label = isTe ? `శ్లోకం ${num - 2}` : `Verse ${num - 2}`;
                        else label = isTe ? `దోహా ${num - 40}` : `Doha ${num - 40}`; // Doha 3 and 4
                      } else {
                        label = isTe ? `శ్లోకం ${num}` : `Shloka ${num}`;
                      }
                      return (
                        <option key={num} value={num - 1}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                  <button 
                    onClick={() => setShowQuiz(true)}
                    className="flex items-center gap-2 bg-lem-accent/10 border border-lem-accent/40 text-lem-accent px-4 py-2 rounded-xl text-sm font-black hover:bg-lem-accent hover:text-lem-dark transition-all"
                  >
                    <Star size={16} />
                    {isTe ? "పరీక్ష" : "Test Sloka"}
                  </button>
                </div>
              </div>

              {/* Render the active verse or Quiz */}
              {showQuiz ? (
                <div className="animate-fade-in">
                  <SlokaQuiz 
                    scripture={scripture}
                    chapter={activeChapter}
                    verse={activeVerseIndex + 1}
                    onClose={() => setShowQuiz(false)}
                    onPass={() => {
                      // Optional: handle pass
                      setShowQuiz(false);
                    }}
                  />
                </div>
              ) : (() => {
                const activeVerse = scripture === 'hanuman' 
                  ? verses[activeVerseIndex]
                  : verses.find(v => {
                      const vNum = v.verse || (typeof v.id === 'string' && v.id.includes('.') ? v.id.split('.')[1] : v.id);
                      return parseInt(vNum) === activeVerseIndex + 1;
                    });

                if (!activeVerse) {
                  return (
                    <div className="glass-card p-12 text-center border border-white/5">
                      <p className="text-gray-400 font-bold">
                        {isTe ? "ఈ శ్లోకం త్వరలో అందుబాటులోకి వస్తుంది!" : "This verse is coming soon!"}
                      </p>
                    </div>
                  );
                }

                return (
                  <VerseViewer 
                    verse={activeVerse} 
                    scripture={scripture} 
                    isThemeMode={false} 
                  />
                );
              })()}
            </div>
          ) : themes.length > 0 ? (
            <div className="space-y-8">
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="text-lem-accent animate-pulse" size={24} />
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                    {isTe ? "మీ ఇతివృత్తాన్ని ఎంచుకోండి" : "Choose Your Theme"}
                  </h1>
                </div>
                  <p className="text-gray-400 text-lg font-medium flex items-center gap-2">
                    <span className="w-12 h-[2px] bg-lem-accent/30"></span>
                    <span className="capitalize text-lem-accent font-bold">{user?.level || 'seekers'}</span>
                    {isTe ? " ప్రయాణ మార్గం" : " Journey Path"}
                  </p>
              </div>

              {/* Theme navigation: cards + prev/next */}
              <div className="bg-white/5 p-4 rounded-2xl border border-lem-glass-border space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-bold text-gray-300">
                    {isTe ? "ఇతివృత్తాన్ని ఎంచుకోండి" : "Choose a theme"}
                    <span className="text-lem-accent ml-2">
                      ({activeThemeIndex + 1} / {themes.length})
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={activeThemeIndex <= 0}
                      onClick={() => { setActiveThemeIndex((i) => Math.max(0, i - 1)); setShowQuiz(false); }}
                      className="px-3 py-2 rounded-xl border border-lem-glass-border text-white font-bold disabled:opacity-30 hover:border-lem-accent"
                    >
                      {isTe ? "← మునుపటి" : "← Prev"}
                    </button>
                    <button
                      type="button"
                      disabled={activeThemeIndex >= themes.length - 1}
                      onClick={() => { setActiveThemeIndex((i) => Math.min(themes.length - 1, i + 1)); setShowQuiz(false); }}
                      className="px-3 py-2 rounded-xl border border-lem-glass-border text-white font-bold disabled:opacity-30 hover:border-lem-accent"
                    >
                      {isTe ? "తర్వాత →" : "Next →"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQuiz(true)}
                      className="flex items-center gap-2 bg-lem-accent/10 border border-lem-accent/40 text-lem-accent px-4 py-2 rounded-xl text-sm font-black hover:bg-lem-accent hover:text-lem-dark transition-all"
                    >
                      <Star size={16} />
                      {isTe ? "పరీక్ష" : "Test Theme"}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[280px] overflow-y-auto pr-1">
                  {themes.map((theme, idx) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => { setActiveThemeIndex(idx); setShowQuiz(false); }}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        idx === activeThemeIndex
                          ? 'border-lem-accent bg-lem-accent/15 shadow-[0_0_12px_rgba(253,160,133,0.25)]'
                          : 'border-lem-glass-border bg-lem-dark/40 hover:border-lem-accent/50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xl">{theme.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-white text-sm leading-snug truncate">
                            {idx + 1}. {isTe && theme.title_te ? theme.title_te : theme.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {theme.shlokas?.length || 0} {isTe ? 'శ్లోకాలు' : 'shlokas'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {showQuiz ? (
                <div className="animate-fade-in">
                  <SlokaQuiz 
                    scripture={scripture}
                    chapter={activeChapter}
                    verse={themes[activeThemeIndex].id}
                    onClose={() => setShowQuiz(false)}
                    onPass={() => {
                      setShowQuiz(false);
                    }}
                  />
                </div>
              ) : (
                <ThemeViewer 
                  theme={themes[activeThemeIndex]} 
                  scripture={scripture} 
                />
              )}
            </div>
          ) : (
            <div className="glass-card p-12 text-center border border-white/5">
              <p className="text-gray-400 font-bold">
                {isTe ? "సమాచారం త్వరలో అందుబాటులోకి వస్తుంది!" : "Content coming soon!"}
              </p>
            </div>
          )}
        </div>
        
        {/* Guru Chat Assistant */}
        <KrishnaChat scripture={scripture} />
      </div>
    </div>
  );
};

export default ScriptureLayout;
