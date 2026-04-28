import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User } from 'lucide-react';

const scriptures = [
  { id: 'gita', title: 'Bhagavad Gita', color: 'bg-kid-primary', desc: 'The Song of God', isAvailable: true },
  { id: 'hanuman', title: 'Hanuman Chalisa', color: 'bg-kid-accent', desc: 'Hymn to Hanuman', isAvailable: true },
  { id: 'ramayana', title: 'Ramayana', color: 'bg-kid-secondary', desc: 'The Epic of Rama', isAvailable: false }
];

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen py-10 px-4 bg-lem-dark text-white relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lem-accent/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 flex items-center gap-3">
              <span className="text-3xl">🕉️</span> 
              <span>littleEpic<span className="text-gradient">Minds</span></span>
            </h1>
            <p className="text-xl text-gray-400 font-medium tracking-wide">Timeless Wisdom for Modern Minds</p>
          </div>
          
          <div className="flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-4 glass-card px-6 py-3 border border-lem-glass-border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-lem-accent/20 rounded-full flex items-center justify-center">
                    <User size={20} className="text-lem-accent" />
                  </div>
                  <div>
                    <span className="font-bold text-white block text-sm leading-tight">{user.username}</span>
                    {user.is_premium && (
                      <span className="text-[10px] bg-gradient-accent text-lem-dark px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(253,160,133,0.3)]">Premium Member</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4 border-l pl-4 border-lem-glass-border">
                  <Link to="/progress" className="text-lem-accent hover:text-white transition-colors font-bold text-sm">Progress</Link>
                  <Link to="/journal" className="text-gray-400 hover:text-lem-accent transition-colors font-bold text-sm">Journal</Link>
                  <Link to="/settings" className="text-gray-400 hover:text-lem-accent transition-colors font-bold text-sm">Settings</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="text-kid-yellow hover:text-white transition-colors font-bold text-sm border-l border-lem-glass-border pl-4 ml-4">Admin</Link>
                  )}
                  <button onClick={logout} className="text-gray-500 hover:text-red-400 transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="px-6 py-3 font-bold text-gray-300 hover:text-white transition-colors">Login</Link>
                <Link to="/register" className="px-8 py-3 bg-gradient-accent text-lem-dark font-black rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(253,160,133,0.3)] inline-block">Join littleEpicMinds</Link>
              </div>
            )}
          </div>
        </header>

        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-4">Start Your Learning Journey</h2>
            <p className="text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">Explore the depth of ancient scriptures with interactive AI-powered stories and activities designed for young minds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {scriptures.map(s => {
              if (!s.isAvailable) {
                return (
                  <div
                    key={s.id}
                    className="glass-card p-10 flex flex-col items-center text-center opacity-60 cursor-not-allowed relative"
                  >
                    <div className="absolute top-4 right-4 bg-gray-700 text-gray-300 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-gray-600 flex items-center gap-1">
                      🔒 Coming Soon
                    </div>
                    <div className="w-20 h-20 bg-lem-sidebar rounded-3xl mb-8 flex items-center justify-center text-gray-500 shadow-inner border border-lem-glass-border">
                      <BookOpen size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-400 mb-3 tracking-wide">{s.title}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">{s.desc}</p>
                    <p className="mt-6 text-xs text-gray-600 font-bold uppercase tracking-widest">Available Soon</p>
                  </div>
                );
              }
              return (
                <Link
                  key={s.id}
                  to={`/read/${s.id}`}
                  className="glass-card p-10 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center group"
                >
                  <div className="w-20 h-20 bg-lem-sidebar rounded-3xl mb-8 flex items-center justify-center text-lem-accent shadow-inner border border-lem-glass-border group-hover:rotate-6 transition-transform duration-500">
                    <BookOpen size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3 tracking-wide">{s.title}</h3>
                  <p className="text-gray-400 font-medium leading-relaxed">{s.desc}</p>
                  <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-lem-accent flex items-center">
                    Start Reading <span className="ml-2">→</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center">
            <Link to="/about" className="text-lem-accent font-bold hover:underline">Learn more about our mission and founder →</Link>
          </div>
        </section>

        {/* The Moat: WC-AI Section */}
        <section className="bg-lem-sidebar border border-lem-glass-border rounded-[3rem] p-16 text-white mb-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-lem-accent/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="bg-white/10 text-lem-accent text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6 inline-block border border-lem-accent/20">The littleEpicMinds Edge</span>
              <h2 className="text-4xl font-black mb-6 leading-tight">Wisdom-Contextual AI (WC-AI) Engine</h2>
              <p className="text-gray-300 text-lg font-medium leading-relaxed mb-8">
                Unlike generic AI, our proprietary engine combines 20 years of software engineering excellence with deep pedagogical insights from the Bhagavad Gita.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-lem-accent/20 rounded-full flex items-center justify-center text-lem-accent">
                    <span className="text-[10px] font-black">✓</span>
                  </div>
                  <span className="font-bold text-gray-200">Child-Safe Knowledge Retrieval</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-lem-accent/20 rounded-full flex items-center justify-center text-lem-accent">
                    <span className="text-[10px] font-black">✓</span>
                  </div>
                  <span className="font-bold text-gray-200">Personalized Virtue-Based Learning</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-lem-accent/20 rounded-full flex items-center justify-center text-lem-accent">
                    <span className="text-[10px] font-black">✓</span>
                  </div>
                  <span className="font-bold text-gray-200">Resilience &amp; Values Tracking</span>
                </li>
              </ul>
            </div>
            <div className="bg-white/5 p-8 rounded-[2rem] border border-lem-glass-border backdrop-blur-sm">
               <div className="flex justify-between items-center mb-8">
                  <span className="font-black text-gray-300">Moat Strength</span>
                  <span className="text-lem-accent font-black tracking-widest">SUPERIOR</span>
               </div>
               <div className="h-2 bg-white/10 rounded-full mb-8">
                  <div className="h-full bg-gradient-accent w-[92%] rounded-full shadow-[0_0_10px_rgba(253,160,133,0.5)]"></div>
               </div>
               <p className="text-sm text-gray-400 italic">Our unique insight: "Ancient wisdom + Silicon Valley tech = Future-proof children."</p>
            </div>
          </div>
        </section>

        {/* Traction & Social Proof */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-10 glass-card border border-lem-glass-border">
               <div className="text-5xl font-black text-white mb-2">100+</div>
               <p className="text-lem-accent font-bold uppercase tracking-widest text-xs">Active Learners</p>
            </div>
            <div className="text-center p-10 glass-card border border-lem-glass-border">
               <div className="text-5xl font-black text-white mb-2">500+</div>
               <p className="text-lem-accent font-bold uppercase tracking-widest text-xs">Shlokas Mastered</p>
            </div>
            <div className="text-center p-10 glass-card border border-lem-glass-border">
               <div className="text-5xl font-black text-white mb-2">4.9/5</div>
               <p className="text-lem-accent font-bold uppercase tracking-widest text-xs">Parent Rating</p>
            </div>
          </div>
        </section>

        <footer className="border-t border-lem-glass-border pt-12 pb-20 flex justify-between items-center text-gray-500 text-sm font-medium">
          <p>© 2026 littleEpicMinds. All rights reserved.</p>
          <div className="space-x-8">
            <Link to="/about" className="hover:text-lem-accent">About</Link>
            <Link to="/readiness" className="hover:text-lem-dark bg-lem-accent px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest transition-colors">Project Readiness</Link>
            <Link to="/settings" className="hover:text-lem-accent">Contact</Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
