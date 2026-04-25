import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, X } from 'lucide-react';

const KrishnaChat = ({ scripture }) => {
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const { currentLang, user } = useAuth();
  
  const isTe = currentLang === 'te';
  const isHanuman = scripture === 'hanuman';
  const avatarIcon = isHanuman ? '🐒' : '🦚';
  const guruNameTe = isHanuman ? "శ్రీ హనుమాన్" : "శ్రీ కృష్ణుడు";
  const guruNameEn = isHanuman ? "Lord Hanuman" : "Sri Krishna";

  useEffect(() => {
    // Initial greeting
    const greeting = isTe 
      ? `నమస్తే ${user?.username || 'మిత్రమా'}! నేడు మనం ఏ అద్భుతమైన జ్ఞానాన్ని నేర్చుకుందాం?`
      : `Namaste ${user?.username || 'friend'}! Ready to discover some epic wisdom today?`;
      
    setMessages([{ id: Date.now(), text: greeting, sender: 'guru' }]);

    const handleStepComplete = (e) => {
      const step = e.detail.step;
      let msg = '';
      
      if (isTe) {
        if (step === 1) msg = "చాలా చక్కగా విన్నారు! ఇప్పుడు నాతో పాటు పలకడానికి ప్రయత్నించండి.";
        else if (step === 2) msg = "అద్భుతం! శ్లోకాన్ని స్పష్టంగా పలికారు. ఇప్పుడు దాని అర్థాన్ని ఆడుతూ నేర్చుకుందాం!";
        else if (step === 3) msg = "సరిగ్గా జత చేశారు! మీరు ఈ శ్లోకం అర్థాన్ని పట్టుకున్నారు. మీ జర్నల్ లో రాస్తారా?";
        else if (step === 4) msg = "మీ ఆలోచనలు చాలా బాగున్నాయి! ఇలాగే ప్రతిరోజూ కొత్త విషయాలు నేర్చుకుంటూ ఉండండి. 🌟";
      } else {
        if (step === 1) msg = "Great listening! Now, try repeating the verse out loud with me.";
        else if (step === 2) msg = "Wonderful pronunciation! You're a natural. Now let's play a matching game to understand the meaning.";
        else if (step === 3) msg = "Perfect match! You really understand this verse now. Want to write down your thoughts?";
        else if (step === 4) msg = "Beautiful thoughts! You are growing wiser every day. I'm so proud of you! 🌟";
      }
      
      if (msg) {
        setTimeout(() => {
          setMessages(prev => [...prev, { id: Date.now(), text: msg, sender: 'guru' }]);
          setIsOpen(true);
        }, 500);
      }
    };

    window.addEventListener('stepCompleted', handleStepComplete);
    return () => window.removeEventListener('stepCompleted', handleStepComplete);
  }, [isTe, user]);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-lem-accent to-orange-400 p-4 rounded-full shadow-[0_0_20px_rgba(253,160,133,0.4)] hover:scale-110 transition-transform z-50 group"
      >
        <Sparkles className="text-white w-6 h-6 animate-pulse" />
        <span className="absolute right-full mr-4 bg-lem-dark text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {isTe ? "గురువు గారితో మాట్లాడండి" : "Talk to Guru"}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-lem-dark/95 backdrop-blur-xl border border-lem-glass-border rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-slide-up flex flex-col max-h-[80vh]">
      {/* Header */}
      <div className="bg-gradient-accent p-4 flex justify-between items-center text-lem-dark shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-lg">{avatarIcon}</span>
          </div>
          <h3 className="font-bold">{isTe ? guruNameTe : guruNameEn}</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-96 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3 items-end animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-lem-accent/20 flex items-center justify-center text-sm flex-shrink-0">
              {avatarIcon}
            </div>
            <div className="bg-lem-sidebar border border-lem-glass-border text-white p-3 rounded-2xl rounded-bl-none text-sm leading-relaxed shadow-sm">
              {msg.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KrishnaChat;
