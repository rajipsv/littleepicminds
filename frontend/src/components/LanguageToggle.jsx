import React from 'react';
import { useAuth } from '../context/AuthContext';

const LanguageToggle = () => {
  const { currentLang, setCurrentLang } = useAuth();

  const btn = (code, label) => (
    <button
      onClick={() => setCurrentLang(code)}
      className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
        currentLang === code
          ? 'bg-lem-accent text-lem-dark shadow-[0_0_10px_rgba(253,160,133,0.3)]'
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center space-x-2 bg-lem-sidebar p-1 rounded-full border border-lem-glass-border shadow-sm">
      {btn('en', 'EN')}
      {btn('te', 'TE')}
    </div>
  );
};

export default LanguageToggle;
