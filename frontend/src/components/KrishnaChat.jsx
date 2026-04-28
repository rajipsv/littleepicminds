import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, X } from 'lucide-react';
import { getWisdom } from '../data/wisdom';
import api from '../api';

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
  const [isTransliterating, setIsTransliterating] = useState(isTe);

  // Transliteration logic: Type in English, press Space, get Telugu
  useEffect(() => {
    if (isTransliterating && input.endsWith(' ')) {
      const words = input.trim().split(' ');
      const lastWord = words[words.length - 1];
      
      // Only transliterate if it looks like an English word
      if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
        fetch(`https://inputtools.google.com/request?text=${lastWord}&itc=te-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=test`)
          .then(res => res.json())
          .then(data => {
            if (data[0] === 'SUCCESS') {
              const transliterated = data[1][0][1][0];
              const newText = input.replace(new RegExp(lastWord + ' $'), transliterated + ' ');
              setInput(newText);
            }
          })
          .catch(err => console.warn("Transliteration failed:", err));
      }
    }
  }, [input, isTransliterating]);

  useEffect(() => {
    const fetchWisdom = async () => {
      try {
        const res = await api.get('/api/chat/wisdom');
        setDynamicLib(res.data);
      } catch (err) {
        console.warn("Could not fetch dynamic wisdom:", err.message);
      }
    };
    fetchWisdom();
    
    setIsTransliterating(isTe);

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
      if (msg) setMessages(prev => [...prev, { id: Date.now(), text: msg, sender: 'guru' }]);
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

    setTimeout(() => {
      const response = getWisdom(isHanuman ? 'hanuman' : 'gita', text, isTe, dynamicLib);

      if (response) {
        setMessages(prev => [...prev, { id: Date.now(), text: response, sender: 'guru' }]);
      } else {
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
        {isTyping && (
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
          {/* Transliteration Toggle */}
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
              {isTransliterating ? (isTe ? 'తెలుగు టైపింగ్' : 'Telugu Typing') : (isTe ? 'ఇంగ్లీష్ టైపింగ్' : 'English Typing')}
            </span>
            <button 
              onClick={() => setIsTransliterating(!isTransliterating)}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                isTransliterating 
                  ? 'bg-orange-100 border-orange-200 text-orange-600 font-bold' 
                  : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}
            >
              {isTe ? 'మార్చు' : 'SWITCH'}
            </button>
          </div>

          <div className="flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isTe ? "మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి..." : "Type your question here..."}
              className="flex-1 p-3 bg-gray-50 border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm"
            />
            <button 
              onClick={handleSend}
              className="bg-orange-600 text-white p-3 rounded-xl hover:bg-orange-700 transition-all shadow-md active:scale-95"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
          {isTransliterating && (
            <p className="text-[10px] text-gray-400 italic px-1">
              {isTe ? "* ఇంగ్లీష్‌లో టైప్ చేసి స్పేస్ నొక్కండి (ఉదా: 'amma')" : "* Type in English and press Space (e.g., 'amma')"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KrishnaChat;
