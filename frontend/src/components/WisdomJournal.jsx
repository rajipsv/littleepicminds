import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

const WisdomJournal = ({ verse, onComplete }) => {
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const { user, saveProgress } = useAuth();

  // Always use English activity prompt
  let activity = verse.en?.activity || verse.activity || '';

  // Replace drawing prompts with writing prompts for text input
  if (activity) {
    activity = activity
      .replace(/Draw a picture of /gi, 'Describe ')
      .replace(/Draw a /gi, 'Write about a ')
      .replace(/Draw /gi, 'Write about ');
  }

  const prompt = activity || 'What did you learn from this shloka?';

  const handleSubmit = async () => {
    if (!response.trim()) {
      setError('Please share your thoughts before saving!');
      return;
    }
    if (!user) {
      setError('Please login to save your journal entry.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await saveProgress(
        verse.scripture || 'gita',
        verse.chapter_number || 1,
        verse.id || verse.verse,
        prompt,
        response
      );
      setSaved(true);
      setTimeout(() => onComplete(), 1200);
    } catch (err) {
      console.error('Journal save error:', err);
      setError('Failed to save. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-2xl mt-4 flex flex-col items-center gap-3 text-center animate-fade-in">
        <CheckCircle size={40} className="text-green-400" />
        <h4 className="text-green-400 font-bold text-lg">Wisdom Saved! 🏅</h4>
        <p className="text-gray-300 text-sm">+20 XP added to your journal</p>
      </div>
    );
  }

  return (
    <div className="bg-black/20 border border-lem-accent/40 border-dashed p-6 rounded-2xl mt-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-lem-accent/20 flex items-center justify-center text-lem-accent">
          <BookOpen size={20} />
        </div>
        <h4 className="text-lem-accent font-bold text-lg">Wisdom Journal</h4>
      </div>

      <p className="text-white font-medium mb-4 text-lg">{prompt}</p>

      <textarea
        className="w-full bg-[#0a0f1d] border border-lem-accent/30 rounded-xl p-4 text-[#f8fafc] placeholder-gray-500 focus:outline-none focus:border-lem-accent transition-colors resize-none shadow-inner"
        rows="4"
        placeholder="Write your thoughts here..."
        value={response}
        onChange={(e) => { setResponse(e.target.value); setError(''); }}
      />

      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-gradient-to-r from-[#f6d365] to-[#fda085] text-lem-dark font-bold py-2 px-6 rounded-xl hover:scale-105 transition-transform shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save to Journal'}
        </button>
      </div>
    </div>
  );
};

export default WisdomJournal;
