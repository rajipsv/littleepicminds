import React, { useState } from 'react';
import VoicePlayer from './VoicePlayer';
import WisdomJournal from './WisdomJournal';
import VerseViewer from './VerseViewer';
import MatchingGame from './MatchingGame';
import { BookOpen, Star, Volume2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ThemeViewer = ({ theme, scripture }) => {
  const [activeTab, setActiveTab] = useState('story'); // 'story', 'shlokas', 'activity'
  const { currentLang } = useAuth();
  const isTe = currentLang === 'te';

  if (!theme) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-lem-glass-border pb-4">
        <div>
          <span className="bg-lem-accent/20 text-lem-accent text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wide mb-3 inline-block">
            {isTe && theme.micro_theme_te ? theme.micro_theme_te : theme.micro_theme}
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-white flex items-center gap-3">
            <span>{theme.emoji}</span> {isTe && theme.title_te ? theme.title_te : theme.title}
          </h2>
        </div>
      </div>

      {/* Tabs - Scrollable on mobile */}
      <div className="flex gap-2 mb-8 bg-black/20 p-1 rounded-2xl w-full md:w-fit overflow-x-auto no-scrollbar scrollbar-hide">
        <button 
          onClick={() => setActiveTab('story')}
          className={`px-4 md:px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'story' ? 'bg-lem-accent text-lem-dark shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          <BookOpen size={18} /> {isTe ? "కథ" : "The Story"}
        </button>
        <button 
          onClick={() => setActiveTab('shlokas')}
          className={`px-4 md:px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'shlokas' ? 'bg-lem-accent text-lem-dark shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          <Volume2 size={18} /> {isTe ? "మూలం" : "The Source"}
        </button>
        <button 
          onClick={() => setActiveTab('activity')}
          className={`px-4 md:px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'activity' ? 'bg-lem-accent text-lem-dark shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          <Star size={18} /> {isTe ? "కార్యకలాపం" : "Activity"}
        </button>
      </div>

      {/* Tab Content */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-lem-glass-border relative overflow-hidden">
        
        {/* STORY TAB */}
        {activeTab === 'story' && (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-lem-accent/20 flex items-center justify-center text-lem-accent text-2xl shadow-[0_0_15px_rgba(253,160,133,0.3)]">
                📖
              </div>
              <h3 className="text-2xl font-bold text-white">{isTe && theme.story.title_te ? theme.story.title_te : theme.story.title}</h3>
            </div>
            <p className="text-lg text-gray-300 leading-relaxed font-medium">
              {isTe && theme.story.content_te ? theme.story.content_te : theme.story.content}
            </p>
            <div className="mt-8 bg-lem-dark p-6 rounded-xl border-l-4 border-lem-accent">
              <h4 className="text-lem-accent font-black uppercase tracking-widest text-sm mb-2">{isTe ? "నీతి" : "The Moral"}</h4>
              <p className="text-white font-bold text-lg">{isTe && theme.story.moral_te ? theme.story.moral_te : theme.story.moral}</p>
            </div>

            {/* Watch Video Section - Always Red-Styled, but disabled if no link */}
            <div className="mt-8 pt-8 border-t border-lem-glass-border">
              {theme.videoUrl ? (
                <a 
                  href={theme.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-gradient-to-r from-red-600/20 to-red-600/5 hover:from-red-600/30 hover:to-red-600/10 border border-red-500/30 p-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] group-hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] transition-all">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5.14v14l11-7-11-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-1">
                        {isTe ? "పాఠం వీడియో చూడండి" : "Watch Lesson Video"}
                      </h4>
                      <p className="text-gray-400 text-sm font-medium">
                        {isTe ? "యూట్యూబ్‌లో మా యానిమేటెడ్ పాఠాన్ని చూడండి" : "Watch our animated lesson on YouTube"}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-red-400 font-bold uppercase tracking-widest text-xs">
                    {isTe ? "ఇప్పుడే ప్లే చేయండి" : "Play Now"}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </a>
              ) : (
                <div 
                  className="flex items-center justify-between bg-white/5 border border-white/10 p-6 rounded-2xl opacity-60 cursor-not-allowed group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gray-600/30 rounded-full flex items-center justify-center text-gray-500">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-500 mb-1">
                        {isTe ? "వీడియో త్వరలో వస్తుంది" : "Video Coming Soon"}
                      </h4>
                      <p className="text-gray-500 text-sm font-medium italic">
                        {isTe ? "ఈ పాఠం కోసం మేము వీడియోని సిద్ధం చేస్తున్నాము" : "We are preparing the video for this lesson"}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-gray-600 font-bold uppercase tracking-widest text-xs">
                    {isTe ? "త్వరలో వస్తుంది" : "Coming Soon"}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SHLOKAS TAB */}
        {activeTab === 'shlokas' && (
          <div className="animate-fade-in space-y-12">
            {theme.shlokaData.map((shloka, index) => {
              // Ensure the shloka object has the necessary fields for VerseViewer
              const verseProp = {
                ...shloka,
                chapter_number: theme.id.split('_')[1] || 1,
                scripture: scripture,
                id: shloka.id || `${theme.id.split('_')[1]}.${index + 1}`
              };

              return (
                <div key={verseProp.id} className="relative mt-8">
                  <div className="absolute -top-3 -left-3 z-20 bg-lem-dark border border-lem-glass-border text-lem-accent h-8 px-3 rounded-full flex items-center justify-center font-black text-xs shadow-lg">
                    {verseProp.id}
                  </div>
                  {shloka.error ? (
                    <div className="glass-card p-8 border border-white/10 text-center rounded-2xl bg-white/5">
                      <p className="text-gray-400 font-bold mb-2">
                        {isTe ? "శ్లోకం మరియు ఆడియో త్వరలో అందుబాటులోకి వస్తాయి!" : "Shloka text and audio are currently being recorded!"}
                      </p>
                      <span className="bg-lem-dark text-lem-accent text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-lem-glass-border">
                        {isTe ? "త్వరలో" : "Coming Soon"}
                      </span>
                    </div>
                  ) : (
                    <VerseViewer 
                      verse={verseProp} 
                      scripture={scripture} 
                      isThemeMode={true}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <div className="animate-fade-in space-y-8">
            <div className="bg-lem-sidebar p-6 rounded-2xl border border-lem-accent/30 shadow-[0_0_20px_rgba(253,160,133,0.1)] mb-8">
              <h3 className="text-xl font-bold text-lem-accent mb-4 flex items-center gap-2">
                <Star className="text-lem-accent" /> 
                {isTe ? "మీ లక్ష్యం" : "Your Mission"}
              </h3>
              <p className="text-white text-lg">{isTe && theme.activity_te ? theme.activity_te : theme.activity}</p>
            </div>
            
            {/* Matching Games for the Theme's Shlokas */}
            <div className="space-y-8">
              {theme.shlokaData.map((shloka, index) => {
                if (shloka.error || (!shloka.lineBreakdown && !shloka.word_by_word)) return null;
                const shlokaId = shloka.id || `${theme.id.split('_')[1]}.${index + 1}`;
                return (
                  <div key={`match-${shlokaId}`} className="border border-lem-glass-border p-6 rounded-2xl bg-white/5">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
                      <span>{isTe ? "ఆట సమయం: జతపరుచు" : "Activity Time: Match Meaning"}</span>
                      <span className="text-xs bg-lem-dark px-3 py-1 rounded-full text-lem-accent border border-lem-glass-border">Shloka {shlokaId}</span>
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">{isTe ? "సంస్కృత పదాన్ని దానికి సరైన అర్థంతో జత చేయండి." : "Select a Sanskrit word, then select its matching meaning."}</p>
                    <MatchingGame breakdown={shloka.lineBreakdown || shloka.word_by_word} onComplete={() => {}} scripture={scripture} />
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-8 border-t border-lem-glass-border">
              {/* Pass the theme ID as the verse ID so progress is tracked per theme */}
              <WisdomJournal 
                verse={{
                  scripture: scripture,
                  chapter_number: theme.id.split('_')[1] || 1,
                  id: theme.id,
                  activity: isTe && theme.activity_te ? theme.activity_te : theme.activity
                }}
                onComplete={() => {}} 
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ThemeViewer;
