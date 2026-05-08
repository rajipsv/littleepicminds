import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, X } from 'lucide-react';
import { getWisdom } from '../data/wisdom';
import api from '../api';
import { initGuru, getGuruResponse, isGuruReady } from '../utils/aiGuru';

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
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadText, setLoadText] = useState('');

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
    
    // 2. Initial greeting
    let greeting = '';
    if (isTe) {
      if (isHanuman) {
        greeting = `నమస్తే ${user?.username || 'మిత్రమా'}! నేను హనుమాన్ చాలీసా గురించి మీ ప్రశ్నలకు సమాధానం చెప్పడానికి సిద్ధంగా ఉన్నాను. దయచేసి మీ ప్రశ్నలను ఇంగ్లీష్‌లో అడగండి!`;
      } else {
        greeting = `నమస్తే ${user?.username || 'మిత్రమా'}! భగవద్గీతలోని జ్ఞానం గురించి మీరేమి తెలుసుకోవాలనుకుంటున్నారు? దయచేసి మీ ప్రశ్నలను ఇంగ్లీష్‌లో అడగండి!`;
      }
    } else {
      if (isHanuman) {
        greeting = `Namaste ${user?.username || 'friend'}! I'm here to answer your questions about the Hanuman Chalisa. Ask me anything!`;
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
      if (msg) setMessages(prev => [...prev, { id: Date.now(), text: msg, sender: 'guru' }]);
    };

    window.addEventListener('stepCompleted', handleStepComplete);
    return () => window.removeEventListener('stepCompleted', handleStepComplete);
  }, [isTe, user, isHanuman]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const text = input;
    setInput('');
    setIsTyping(true);

    // 1. Fast path: Check local rule-based wisdom
    const localResponse = getWisdom(isHanuman ? 'hanuman' : 'gita', text, false, dynamicLib);
    if (localResponse) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now(), text: localResponse, sender: 'guru' }]);
        setIsTyping(false);
      }, 600);
      return;
    }

    // 2. Slow path: Use Browser-based LLM (Qwen)
    try {
      if (!isGuruReady()) {
        await initGuru((progress, text) => {
          setLoadProgress(Math.floor(progress * 100));
          setLoadText(text);
        });
        setLoadProgress(0); // Reset after done
      }

      const chatHistory = messages.slice(-4).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const response = await getGuruResponse(text, isHanuman ? 'hanuman' : 'gita', chatHistory);
      setMessages(prev => [...prev, { id: Date.now(), text: response, sender: 'guru' }]);
    } catch (err) {
      console.error("Browser LLM Error:", err);
      const fallback = isTe 
        ? "క్షమించండి, నా దగ్గర ఇంకా సమాధానం లేదు. దయచేసి మీ ప్రశ్నను ఇంగ్లీష్‌లో అడగండి."
        : "I'm sorry, I'm having trouble thinking right now. Please try again in a moment.";
      setMessages(prev => [...prev, { id: Date.now(), text: fallback, sender: 'guru' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 transition-all z-50 flex items-center gap-2 group"
      >
        <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-medium">Talk to Guru</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-orange-100 overflow-hidden animate-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white flex justify-between items-center shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl shadow-inner">
            {avatarIcon}
          </div>
          <div>
            <h3 className="font-bold text-lg leading-none">{isTe ? guruNameTe : guruNameEn}</h3>
            <p className="text-xs text-orange-100 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              {isTe ? "సహాయం చేయడానికి సిద్ధం" : "Always here to guide you"}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-orange-50/30 min-h-[300px]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-orange-600 text-white rounded-br-none' 
                : 'bg-white text-gray-800 border border-orange-100 rounded-bl-none'
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}

        {/* Loading Progress for LLM */}
        {loadProgress > 0 && (
          <div className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-orange-200 shadow-sm animate-pulse">
            <div className="flex justify-between items-center text-[10px] font-bold text-orange-600 uppercase tracking-widest">
              <span>{isTe ? "జ్ఞానాన్ని పొందుతున్నాము..." : "Gathering Wisdom..."}</span>
              <span>{loadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-orange-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300" 
                style={{ width: `${loadProgress}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-400 italic truncate">{loadText}</p>
          </div>
        )}

        {isTyping && !loadProgress && (
          <div className="flex justify-start">
            <div className="bg-white border border-orange-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
              <div className="w-1.5 h-1.5 bg-orange-300 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-orange-100 bg-white shrink-0">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isTe ? "మీ ప్రశ్నను ఇంగ్లీష్‌లో అడగండి..." : "Ask your question in English..."}
              className="flex-1 p-3 bg-gray-50 border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm text-gray-900"
            />
            <button 
              onClick={handleSend}
              className="bg-orange-600 text-white p-3 rounded-xl hover:bg-orange-700 transition-all shadow-md active:scale-95"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KrishnaChat;
