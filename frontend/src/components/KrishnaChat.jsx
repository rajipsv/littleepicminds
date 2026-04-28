import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, X } from 'lucide-react';
import { getWisdom } from '../data/wisdom';

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
  const [dynamicLib, setDynamicLib] = useState([]);

  useEffect(() => {
    // 1. Fetch dynamic wisdom from DB
    const fetchWisdom = async () => {
      try {
        const res = await api.get('/api/chat/wisdom');
        setDynamicLib(res.data);
      } catch (err) {
        console.warn("Could not fetch dynamic wisdom:", err.message);
      }
    };
    fetchWisdom();

    // 2. Initial greeting based on scripture
    let greeting = '';
    if (isTe) {
      if (isHanuman) {
        greeting = `నమస్తే ${user?.username || 'మిత్రమా'}! నేను హనుమాన్ చాలీసా మరియు రామాయణం గురించి మీ ప్రశ్నలకు సమాధానం చెప్పడానికి సిద్ధంగా ఉన్నాను. దయచేసి అడగండి!`;
      } else {
        greeting = `నమస్తే ${user?.username || 'మిత్రమా'}! భగవద్గీతలోని అద్భుతమైన జ్ఞానం గురించి మీరేమి తెలుసుకోవాలనుకుంటున్నారు? దయచేసి అడగండి!`;
      }
    } else {
      if (isHanuman) {
        greeting = `Namaste ${user?.username || 'friend'}! I'm here to answer your questions about the Hanuman Chalisa and Ramayana. What would you like to know?`;
      } else {
        greeting = `Namaste ${user?.username || 'friend'}! I'm ready to discuss the wisdom of the Bhagavad Gita with you. Ask me anything!`;
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
    const text = input;
    setInput('');
    setIsTyping(true);

    // Simulate Guru response using external library + dynamic DB wisdom
    setTimeout(() => {
      const response = getWisdom(isHanuman ? 'hanuman' : 'gita', text, isTe, dynamicLib);

      if (response) {
        setMessages(prev => [...prev, { id: Date.now(), text: response, sender: 'guru' }]);
      } else {
        // LOG MISSED QUESTION TO DB FOR SELF-LEARNING
        api.post('/api/chat/missed', { question: text, scripture: isHanuman ? 'hanuman' : 'gita' })
          .catch(e => console.warn("Failed to log missed question"));

        let fallback = '';
        if (isTe) {
          fallback = isHanuman 
            ? "క్షమించండి, దీని గురించి నాకు ఇంకా తెలియదు. నేను త్వరలోనే నేర్చుకుంటాను! దయచేసి హనుమంతుడు లేదా రాముని గురించి అడగండి." 
            : "క్షమించండి, దీని గురించి నాకు ఇంకా తెలియదు. నేను త్వరలోనే నేర్చుకుంటాను! దయచేసి శ్రీకృష్ణుడు లేదా గీత గురించి అడగండి.";
        } else {
          fallback = isHanuman
            ? "I'm sorry, I haven't learned about that yet, but I will soon! Please ask me about Lord Hanuman or Rama."
            : "I'm sorry, I haven't learned about that yet, but I will soon! Please ask me about Sri Krishna or the Bhagavad Gita.";
        }
        setMessages(prev => [...prev, { id: Date.now(), text: fallback, sender: 'guru' }]);
      }
      setIsTyping(false);
    }, 800);
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
