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

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Initial greeting based on scripture
    let greeting = '';
    if (isTe) {
      if (isHanuman) {
        greeting = `నమస్తే ${user?.username || 'మిత్రమా'}! నేను హనుమాన్ చాలీసా గురించి మీ ప్రశ్నలకు సమాధానం చెప్పడానికి సిద్ధంగా ఉన్నాను. దయచేసి హనుమంతుని గురించి లేదా ఈ చాలీసా గురించి అడగండి!`;
      } else {
        greeting = `నమస్తే ${user?.username || 'మిత్రమా'}! భగవద్గీతలోని అద్భుతమైన జ్ఞానం గురించి మీరేమి తెలుసుకోవాలనుకుంటున్నారు? దయచేసి గీత గురించి అడగండి!`;
      }
    } else {
      if (isHanuman) {
        greeting = `Namaste ${user?.username || 'friend'}! I'm here to answer your questions about the Hanuman Chalisa. Please ask me anything about Lord Hanuman or this prayer!`;
      } else {
        greeting = `Namaste ${user?.username || 'friend'}! I'm ready to discuss the wisdom of the Bhagavad Gita with you. Please ask your questions about the Gita or Sri Krishna!`;
      }
    }
      
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
        setMessages(prev => [...prev, { id: Date.now(), text: msg, sender: 'guru' }]);
      }
    };

    window.addEventListener('stepCompleted', handleStepComplete);
    return () => window.removeEventListener('stepCompleted', handleStepComplete);
  }, [isTe, user, isHanuman]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate Guru response
    setTimeout(() => {
      let response = '';
      const text = input.toLowerCase();

      if (isTe) {
        if (isHanuman) {
          if (text.includes('హనుమంతుడు') || text.includes('హనుమాన్') || text.includes('శ్లోకం') || text.includes('పద్యం') || text.includes('అర్థం')) {
            response = "హనుమంతుడు గొప్ప శక్తిశాలి మరియు రాముని పరమ భక్తుడు. ఆయన ప్రతి శ్లోకం మనకు ధైర్యాన్ని ఇస్తుంది. మీకు ఏ పద్యం గురించి వివరణ కావాలి?";
          } else if (text.includes('రాముడు') || text.includes('రామ')) {
            response = "హనుమంతుని ప్రతి శ్వాస రాముడి కోసమే. ఆయన భక్తి అసమానమైనది.";
          } else {
            response = "దయచేసి హనుమాన్ చాలీసా లేదా హనుమంతుని గురించి అడగండి. ఇతర విషయాల కంటే మన ప్రస్తుత పాఠం మీద దృష్టి పెడదాం.";
          }
        } else {
          if (text.includes('కృష్ణుడు') || text.includes('గీత') || text.includes('అర్జునుడు') || text.includes('శ్లోకం') || text.includes('అర్థం')) {
            response = "భగవద్గీత మనకు సరైన మార్గాన్ని చూపిస్తుంది. కృష్ణుడు చెప్పిన ప్రతి మాట మనకు ధైర్యాన్నిస్తుంది. మీకు ఏ శ్లోకం గురించి వివరణ కావాలి?";
          } else {
            response = "దయచేసి భగవద్గీత లేదా శ్రీకృష్ణుని బోధనల గురించి అడగండి. ప్రస్తుతానికి గీత జ్ఞానాన్ని పంచుకుందాం.";
          }
        }
      } else {
        if (isHanuman) {
          if (text.includes('hanuman') || text.includes('monkey') || text.includes('bajrangbali') || text.includes('verse') || text.includes('meaning') || text.includes('explain')) {
            response = "Hanuman is the embodiment of courage and devotion. Every verse in the Chalisa tells a story of his greatness. Which verse would you like me to explain?";
          } else if (text.includes('rama') || text.includes('ram')) {
            response = "Lord Rama is everything to Hanuman. Their bond is the perfect example of love and service.";
          } else {
            response = "Please focus your questions on the Hanuman Chalisa or Lord Hanuman for now. Let's learn this wisdom first!";
          }
        } else {
          if (text.includes('krishna') || text.includes('gita') || text.includes('arjuna') || text.includes('shloka') || text.includes('verse') || text.includes('meaning') || text.includes('explain')) {
            response = "The Gita teaches us how to live with joy and fulfill our duty. Every shloka is a treasure. Which one should we talk about?";
          } else {
            response = "Please keep your questions related to the Bhagavad Gita or Sri Krishna. Let's dive deeper into this sacred wisdom!";
          }
        }
      }

      setMessages(prev => [...prev, { id: Date.now(), text: response, sender: 'guru' }]);
      setIsTyping(false);
    }, 1000);
  };

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
      <div className="bg-gradient-accent p-4 flex justify-between items-center text-lem-dark shadow-md shrink-0">
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
      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-96 min-h-[200px] custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 items-end animate-fade-in ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${msg.sender === 'user' ? 'bg-lem-accent/40' : 'bg-lem-accent/20'}`}>
              {msg.sender === 'user' ? '🧒' : avatarIcon}
            </div>
            <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-lem-accent text-lem-dark rounded-br-none' 
                : 'bg-lem-sidebar border border-lem-glass-border text-white rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3 items-end animate-pulse">
            <div className="w-8 h-8 rounded-full bg-lem-accent/20 flex items-center justify-center text-sm">
              {avatarIcon}
            </div>
            <div className="bg-lem-sidebar border border-lem-glass-border text-white p-3 rounded-2xl rounded-bl-none text-xs">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-lem-glass-border bg-lem-dark/50">
        <div className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isTe ? "ప్రశ్న అడగండి..." : "Ask a question..."}
            className="flex-1 bg-lem-sidebar border border-lem-glass-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-lem-accent"
          />
          <button 
            onClick={handleSend}
            className="bg-lem-accent text-lem-dark px-3 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default KrishnaChat;
