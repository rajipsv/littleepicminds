import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Star, Award } from 'lucide-react';

const Journal = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.get(`/api/journal/${user.username}`)
        .then(res => {
          setEntries(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  if (!user) return <div className="text-center p-10 text-white">Please login to view your journal.</div>;

  return (
    <div className="min-h-screen py-12 px-4 max-w-4xl mx-auto text-white">
      <header className="flex items-center justify-center mb-10 space-x-3">
        <Award size={40} className="text-lem-accent" />
        <h1 className="text-4xl font-extrabold text-white">My Wisdom Journal</h1>
      </header>

      {loading ? (
        <div className="text-center text-gray-400">Loading your wisdom...</div>
      ) : entries.length === 0 ? (
        <div className="glass-card p-12 text-center border-lem-glass-border">
          <BookOpen size={48} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No entries yet!</h3>
          <p className="text-gray-400">Complete the Wisdom Path in any chapter to see your thoughts here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map(entry => (
            <div key={entry.id} className="bg-lem-sidebar rounded-3xl p-6 md:p-8 shadow-lg border border-lem-glass-border hover:border-lem-accent/50 transition-colors group">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-lem-accent/20 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                    <Star size={28} className="text-lem-accent" fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white capitalize">{entry.scripture} - Chapter {entry.chapter_number}</h3>
                    <p className="text-sm font-medium text-lem-accent tracking-wider uppercase mt-1">Verse {entry.verse_id}</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  {new Date(entry.completed_at).toLocaleDateString()}
                </div>
              </div>
              
              {entry.question && entry.response && (
                <div className="bg-lem-dark/50 rounded-2xl p-5 border border-lem-glass-border">
                  <div className="mb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Prompt</span>
                    <p className="text-gray-300 font-medium">{entry.question}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-lem-accent uppercase tracking-widest block mb-1">Your Thoughts</span>
                    <p className="text-white text-lg leading-relaxed italic border-l-2 border-lem-accent pl-3">"{entry.response}"</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Journal;
