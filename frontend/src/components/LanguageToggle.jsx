import React from 'react';
import { useAuth } from '../context/AuthContext';

const LanguageToggle = () => {
  const { currentLang, setCurrentLang } = useAuth();

  return (
    <div className="flex items-center space-x-2 bg-lem-sidebar p-1 rounded-full border border-lem-glass-border shadow-sm">
      <button
        onClick={() => setCurrentLang('en')}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
          currentLang === 'en' 
            ? 'bg-lem-accent text-lem-dark shadow-[0_0_10px_rgba(253,160,133,0.3)]' 
            : 'text-gray-400 hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setCurrentLang('te')}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
          currentLang === 'te' 
            ? 'bg-lem-accent text-lem-dark shadow-[0_0_10px_rgba(253,160,133,0.3)]' 
            : 'text-gray-400 hover:text-white'
        }`}
      >
        TE
      </button>
    </div>
  );
};

export default LanguageToggle;
