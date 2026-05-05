import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

const WisdomJournal = ({ verse, onComplete }) => {
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const { user, saveProgress, currentLang } = useAuth();
  
  const isTe = currentLang === 'te';

  // Determine the activity prompt based on language
  let activity = '';
  if (isTe) {
    activity = verse.te?.activity || verse.activity || '';
  } else {
    activity = verse.en?.activity || verse.activity || '';
  }

  // Fallback if still empty
  if (!activity) {
    activity = isTe ? 'ఈ శ్లోకం నుండి మీరు ఏమి నేర్చుకున్నారు?' : 'What did you learn from this shloka?';
  }

  // Replace drawing prompts with writing prompts for text input
  if (activity && typeof activity === 'string') {
    if (isTe) {
       activity = activity
        .replace(/చిత్రాన్ని గీయండి/gi, 'గురించి రాయండి')
        .replace(/గీయండి/gi, 'గురించి వివరించండి');
    } else {
      activity = activity
        .replace(/Draw a picture of /gi, 'Describe ')
        .replace(/Draw a /gi, 'Write about a ')
        .replace(/Draw /gi, 'Write about ');
    }
  }

  const prompt = activity;

  const handleSubmit = async () => {
    if (!response.trim()) {
      setError(isTe ? 'దయచేసి సేవ్ చేసే ముందు మీ ఆలోచనలను పంచుకోండి!' : 'Please share your thoughts before saving!');
      return;
    }
    if (!user) {
      setError(isTe ? 'మీ జర్నల్ ఎంట్రీని సేవ్ చేయడానికి దయచేసి లాగిన్ అవ్వండి.' : 'Please login to save your journal entry.');
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
      if (onComplete) {
        setTimeout(() => onComplete(), 1200);
      }
    } catch (err) {
      console.error('Journal save error:', err);
      const errorMsg = err.response?.data?.error || err.message;
      if (errorMsg?.includes('Unauthorized') || errorMsg?.includes('expired')) {
        setError(isTe ? 'మీ సెషన్ ముగిసింది. దయచేసి మళ్ళీ లాగిన్ అవ్వండి.' : 'Your session expired. Please login again.');
      } else {
        setError(isTe ? 'సేవ్ చేయడం విఫలమైంది. దయచేసి మీ కనెక్షన్‌ని తనిఖీ చేసి మళ్ళీ ప్రయత్నించండి.' : 'Failed to save. Please check your connection and try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-2xl mt-4 flex flex-col items-center gap-3 text-center animate-fade-in">
        <CheckCircle size={40} className="text-green-400" />
        <h4 className="text-green-400 font-bold text-lg">{isTe ? "జ్ఞానం సేవ్ చేయబడింది! 🏅" : "Wisdom Saved! 🏅"}</h4>
        <p className="text-gray-300 text-sm">{isTe ? "+20 XP మీ జర్నల్‌కు జోడించబడింది" : "+20 XP added to your journal"}</p>
      </div>
    );
  }

  return (
    <div className="bg-black/20 border border-lem-accent/40 border-dashed p-6 rounded-2xl mt-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-lem-accent/20 flex items-center justify-center text-lem-accent">
          <BookOpen size={20} />
        </div>
        <h4 className="text-lem-accent font-bold text-lg">{isTe ? "జ్ఞాన జర్నల్" : "Wisdom Journal"}</h4>
      </div>

      <p className="text-white font-medium mb-4 text-lg">{prompt}</p>

      <textarea
        className="w-full bg-[#0a0f1d] border border-lem-accent/30 rounded-xl p-4 text-[#f8fafc] placeholder-gray-500 focus:outline-none focus:border-lem-accent transition-colors resize-none shadow-inner"
        rows="4"
        placeholder={isTe ? "మీ ఆలోచనలను ఇక్కడ రాయండి..." : "Write your thoughts here..."}
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
          {saving ? (isTe ? 'సేవ్ అవుతోంది...' : 'Saving...') : (isTe ? 'జర్నల్‌లో సేవ్ చేయండి' : 'Save to Journal')}
        </button>
      </div>
    </div>
  );
};

export default WisdomJournal;

