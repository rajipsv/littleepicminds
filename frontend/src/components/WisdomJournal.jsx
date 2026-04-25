import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen } from 'lucide-react';

const WisdomJournal = ({ verse, onComplete }) => {
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);
  const { user, saveProgress, currentLang } = useAuth();

  const isTe = currentLang === 'te';
  
  // Extract activity from verse data based on language
  let activity = isTe ? verse.te?.activity : verse.en?.activity;
  
  // Safety check: Replace any 'Draw' or 'Geyandi' (draw in Telugu) with 'Write' for text area
  if (activity) {
    activity = activity.replace(/Draw a picture of /gi, "Describe ")
                       .replace(/Draw a /gi, "Write about a ")
                       .replace(/Draw /gi, "Write about ")
                       .replace(/గీయండి/g, "రాయండి");
  }

  const prompt = activity || (isTe ? "ఈ శ్లోకం నుండి మీరు ఏమి నేర్చుకున్నారు?" : "What did you learn from this shloka?");

  const handleSubmit = async () => {
    if (!response.trim()) {
      alert(isTe ? "దయచేసి మీ ఆలోచనలను రాయండి!" : "Please share your thoughts!");
      return;
    }

    if (!user) {
      alert("Please login to save your journal entry.");
      return;
    }

    setSaving(true);
    try {
      // Assuming saveProgress can take extra params like question/response
      await saveProgress(
        verse.scripture || 'gita',
        verse.chapter_number || 1,
        verse.id || verse.verse,
        prompt,
        response
      );
      
      alert(isTe ? "మీ ఆలోచనలు జర్నల్‌లో సేవ్ చేయబడ్డాయి! 🏅 +20 XP" : "Wisdom saved to your journal! 🏅 +20 XP");
      onComplete();
    } catch (err) {
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white/5 border border-lem-accent border-dashed p-6 rounded-2xl mt-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-lem-accent/20 flex items-center justify-center text-lem-accent">
          <BookOpen size={20} />
        </div>
        <h4 className="text-lem-accent font-bold text-lg">{isTe ? "జ్ఞాన దినచర్య (జర్నల్)" : "Wisdom Journal"}</h4>
      </div>
      
      <p className="text-white font-medium mb-4 text-lg">{prompt}</p>
      
      <textarea
        className="w-full bg-lem-dark/50 border border-lem-glass-border rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-lem-accent transition-colors resize-none"
        rows="4"
        placeholder={isTe ? "మీ ఆలోచనలను ఇక్కడ రాయండి..." : "Write your thoughts here..."}
        value={response}
        onChange={(e) => setResponse(e.target.value)}
      />
      
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-gradient-to-r from-[#f6d365] to-[#fda085] text-lem-dark font-bold py-2 px-6 rounded-xl hover:scale-105 transition-transform shadow-lg"
        >
          {saving ? (isTe ? "సేవ్ అవుతోంది..." : "Saving...") : (isTe ? "జర్నల్‌లో సేవ్ చేయి" : "Save to Journal")}
        </button>
      </div>
    </div>
  );
};

export default WisdomJournal;
