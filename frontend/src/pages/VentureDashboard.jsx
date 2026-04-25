import React from 'react';
import { TrendingUp, Target, Users, Zap, ShieldCheck, Activity } from 'lucide-react';

const VentureDashboard = () => {
  const metrics = [
    { label: 'Problem Clarity', score: '95', status: 'Exceptional', icon: <Target className="text-teal-400" /> },
    { label: 'Market Potential', score: '82', status: 'High', icon: <TrendingUp className="text-blue-400" /> },
    { label: 'Founder Fit', score: '98', status: 'Superior', icon: <ShieldCheck className="text-purple-400" /> },
    { label: 'Traction', score: '45', status: 'Early Stage', icon: <Activity className="text-orange-400" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-300 font-sans p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Venture <span className="text-teal-400">Readiness</span></h1>
            <p className="text-slate-500 font-medium">Real-time assessment of EpicMinds growth & YC potential.</p>
          </div>
          <div className="flex space-x-4">
             <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 flex items-center space-x-2">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Analysis</span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Score Card */}
          <div className="lg:col-span-2 bg-[#0f1218] rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Overall Grade</h2>
                <div className="flex items-baseline space-x-4">
                  <span className="text-8xl font-black text-white">B</span>
                  <span className="text-2xl font-bold text-teal-400">+</span>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Readiness Score</h2>
                <span className="text-5xl font-black text-white">78<span className="text-slate-700">/100</span></span>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-3 text-sm font-bold">
                  <span className="text-slate-400">Venture Viability Pipeline</span>
                  <span className="text-teal-400">78%</span>
                </div>
                <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-teal-600 to-teal-400 w-[78%] rounded-full relative">
                    <div className="absolute top-0 right-0 w-8 h-full bg-white/20 skew-x-12 translate-x-4"></div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                 <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Growth Vector</p>
                    <p className="text-xl font-black text-white">+12.4% <span className="text-xs text-slate-600 font-medium font-sans">vs last month</span></p>
                 </div>
                 <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Moat Strength</p>
                    <p className="text-xl font-black text-teal-400">Tier 1 <span className="text-xs text-slate-600 font-medium font-sans">Proprietary WC-AI</span></p>
                 </div>
              </div>
            </div>
          </div>

          {/* Side Feedback Card */}
          <div className="bg-[#0f1218] rounded-[2.5rem] p-8 border border-slate-800 flex flex-col">
            <h3 className="text-lg font-black text-white mb-6">Partner Analysis</h3>
            <div className="flex-1 space-y-6">
              <div className="bg-indigo-900/20 border border-indigo-500/20 p-6 rounded-2xl">
                <p className="text-indigo-400 text-xs font-black uppercase mb-3 flex items-center">
                  <Zap size={14} className="mr-2" /> Key Insight
                </p>
                <p className="text-sm leading-relaxed text-slate-400">
                  EpicMinds successfully combines 20 years of software engineering expertise with authentic spiritual pedagogy. This creates a high barrier to entry for generic LLM competitors.
                </p>
              </div>
              <div className="bg-orange-900/20 border border-orange-500/20 p-6 rounded-2xl">
                <p className="text-orange-400 text-xs font-black uppercase mb-3 flex items-center">
                   Critical Action
                </p>
                <p className="text-sm leading-relaxed text-slate-400">
                  Aggressive traction data collection is required. Focus on user retention and shloka mastery completion rates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <div key={i} className="bg-[#0f1218] p-8 rounded-[2rem] border border-slate-800 hover:border-teal-500/50 transition-colors group">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-slate-800 group-hover:scale-110 transition-transform">
                {m.icon}
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{m.label}</p>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-white">{m.score}%</span>
                <span className="text-[10px] font-bold text-teal-400 bg-teal-400/10 px-2 py-1 rounded-md uppercase tracking-wider">{m.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VentureDashboard;
