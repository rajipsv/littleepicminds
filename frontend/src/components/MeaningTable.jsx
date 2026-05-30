import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Volume2 } from 'lucide-react';
import api, { API_URL } from '../api';
import { lineTextFromRow, fetchTtsAudio, playAudioBase64 } from '../utils/lineTts';
import { getLineScriptText, getLineMeaningText, ttsLangForUi } from '../utils/verseDisplay';

const speakLine = (text, lang = 'en') => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang === 'te' ? 'te' : lang === 'hi' ? 'hi' : 'en';
  const preferred =
    voices.find((v) => v.lang.startsWith(prefix)) ||
    voices.find((v) => v.lang.startsWith('en')) ||
    voices[0];
  if (preferred) utterance.voice = preferred;
  utterance.lang = preferred?.lang || (lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-US');
  utterance.rate = 0.8;
  window.speechSynthesis.speak(utterance);
};

const hasTeluguText = (s) => Boolean(s && /[\u0C00-\u0C7F]/.test(s));

const MeaningTable = ({ wordByWord }) => {
  const { currentLang } = useAuth();
  const lang = currentLang === 'te' || currentLang === 'hi' ? currentLang : 'en';
  const [playingIndex, setPlayingIndex] = useState(-1);
  const [teMeanings, setTeMeanings] = useState({});

  const rowsKey = useMemo(
    () => (wordByWord || []).map((item) => getLineMeaningText(item, 'en')).join('\n'),
    [wordByWord]
  );

  useEffect(() => {
    if (lang !== 'te' || !wordByWord?.length) {
      setTeMeanings({});
      return;
    }

    let cancelled = false;
    const next = {};

    (async () => {
      await Promise.all(
        wordByWord.map(async (item, index) => {
          if (hasTeluguText(item.te)) {
            next[index] = item.te;
            return;
          }
          const en = getLineMeaningText(item, 'en').trim();
          if (!en) return;
          try {
            const res = await fetch(`${API_URL || ''}/api/translate-meaning`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: en }),
            });
            if (!res.ok) return;
            const data = await res.json();
            if (data.te && hasTeluguText(data.te)) next[index] = data.te;
          } catch {
            /* keep English fallback */
          }
        })
      );
      if (!cancelled) setTeMeanings(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [lang, rowsKey, wordByWord]);

  if (!wordByWord || wordByWord.length === 0) return null;

  const displayMeaning = (item, index) => {
    if (lang === 'te') {
      if (hasTeluguText(item.te)) return item.te;
      if (teMeanings[index]) return teMeanings[index];
    }
    return getLineMeaningText(item, 'en');
  };

  const lineColumnLabel = lang === 'te' ? 'పంక్తి' : lang === 'hi' ? 'श्लोक पंक्ति' : 'Line (IAST)';
  const meaningLabel = lang === 'te' ? 'అర్థం' : lang === 'hi' ? 'अर्थ (EN)' : 'Meaning';

  const handlePlay = async (item, index) => {
    const line = lineTextFromRow(item, lang);
    const ttsLang = ttsLangForUi(lang);
    if (!line) return;

    setPlayingIndex(index);
    try {
      const { base64, encoding } = await fetchTtsAudio(line, ttsLang);
      await playAudioBase64(base64, encoding, 0.9);
      setPlayingIndex(-1);
    } catch {
      speakLine(line, ttsLang);
      setTimeout(() => setPlayingIndex(-1), 2000);
    }
  };

  return (
    <div className="mt-6">
      <div className="hidden md:block overflow-hidden rounded-xl border border-lem-glass-border shadow-sm">
        <table className="min-w-full divide-y divide-lem-glass-border">
          <thead className="bg-lem-sidebar">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-lem-accent uppercase tracking-wider w-10"></th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-lem-accent uppercase tracking-wider">
                {lineColumnLabel}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-lem-accent uppercase tracking-wider">
                {meaningLabel}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/5 divide-y divide-white/5">
            {wordByWord.map((item, index) => {
              const displayWord = getLineScriptText(item, lang);
              const meaning = displayMeaning(item, index);
              const isPlaying = playingIndex === index;

              return (
                <tr key={index} className="hover:bg-white/10 transition-colors">
                  <td className="px-3 py-3">
                    <button
                      onClick={() => handlePlay(item, index)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
                        isPlaying
                          ? 'bg-lem-accent border-lem-accent text-lem-dark scale-110'
                          : 'border-lem-glass-border text-gray-400 hover:border-lem-accent hover:text-lem-accent'
                      }`}
                    >
                      <Volume2 size={14} />
                    </button>
                  </td>
                  <td
                    className={`px-4 py-3 text-sm font-medium text-white whitespace-pre-wrap ${
                      lang === 'hi' ? 'devanagari-text' : ''
                    } ${lang === 'te' ? 'telugu-text' : ''}`}
                  >
                    {displayWord}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{meaning}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {wordByWord.map((item, index) => {
          const displayWord = getLineScriptText(item, lang);
          const meaning = displayMeaning(item, index);
          const isPlaying = playingIndex === index;

          return (
            <div key={index} className="glass-panel p-4 rounded-2xl border border-white/5 flex items-start gap-4">
              <button
                onClick={() => handlePlay(item, index)}
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                  isPlaying
                    ? 'bg-lem-accent border-lem-accent text-lem-dark shadow-lg'
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                <Volume2 size={18} />
              </button>
              <div className="flex-1">
                <div
                  className={`text-lem-accent font-bold text-base mb-1 whitespace-pre-wrap ${
                    lang === 'hi' ? 'devanagari-text' : ''
                  } ${lang === 'te' ? 'telugu-text' : ''}`}
                >
                  {displayWord}
                </div>
                <div className="text-gray-300 text-sm leading-relaxed">{meaning}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MeaningTable;
