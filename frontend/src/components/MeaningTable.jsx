import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Volume2 } from 'lucide-react';
import api, { API_URL } from '../api';
import {
  playMeaningAudio,
  playTtsOrBrowser,
  warmMeaningTtsCache,
  stopMeaningAudio,
  DEFAULT_GAP_MS,
} from '../utils/lineTts';
import {
  ensureGitaChantManifest,
  resolveChantAudioUrl,
  getVerseLineBoundaries,
  getManifestTimingInput,
  getManifestDuration,
  buildLineSegments,
  loadChantDuration,
  prefetchVerseChant,
  releasePreloadedChant,
  playChantSegment,
  stopChantSegment,
} from '../utils/gitaChantAudio';
import {
  getLineScriptText,
  getLineMeaningText,
  hasTeluguScript,
} from '../utils/verseDisplay';

function introLabel(chantIntro, lang) {
  if (!chantIntro) return '';
  if (lang === 'te' && chantIntro.te) return chantIntro.te;
  return chantIntro.en || '';
}

const MeaningTable = ({ wordByWord, verseId, chantIntro }) => {
  const { currentLang } = useAuth();
  const lang = currentLang === 'te' || currentLang === 'hi' ? currentLang : 'en';
  const [playing, setPlaying] = useState(null);
  const [chantFallbackMsg, setChantFallbackMsg] = useState(null);
  const [teMeanings, setTeMeanings] = useState({});
  const segmentsRef = useRef(null);
  const chantUrlRef = useRef(null);
  const abortRef = useRef(false);

  const rowsKey = useMemo(
    () => (wordByWord || []).map((item) => getLineMeaningText(item, 'en')).join('\n'),
    [wordByWord]
  );

  const displayMeaning = useCallback(
    (item, index) => {
      if (lang === 'te') {
        if (hasTeluguScript(item.te)) return item.te;
        if (teMeanings[index]) return teMeanings[index];
      }
      return getLineMeaningText(item, 'en');
    },
    [lang, teMeanings]
  );

  useEffect(() => {
    return () => {
      abortRef.current = true;
      stopChantSegment();
      stopMeaningAudio();
    };
  }, []);

  useEffect(() => {
    abortRef.current = false;
    const prevUrl = chantUrlRef.current;
    segmentsRef.current = null;
    chantUrlRef.current = null;
    setChantFallbackMsg(null);
    if (prevUrl) releasePreloadedChant(prevUrl);
  }, [verseId, wordByWord]);

  /** Preload Dhruv WAV + bounds while the line table is visible. */
  useEffect(() => {
    if (!verseId || !wordByWord?.length) return undefined;
    let cancelled = false;
    (async () => {
      const warmed = await prefetchVerseChant(verseId, {
        lineCount: wordByWord.length,
        hasChantIntro: Boolean(chantIntro),
      });
      if (cancelled || !warmed) return;
      if (warmed.segments?.length) segmentsRef.current = warmed.segments;
      chantUrlRef.current = warmed.url;
    })();
    return () => {
      cancelled = true;
    };
  }, [verseId, wordByWord?.length, chantIntro]);

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
          if (hasTeluguScript(item.te)) {
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
            if (data.te && hasTeluguScript(data.te)) next[index] = data.te;
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

  /** Warm server TTS cache when Learn step is open — Telugu script only when UI is te. */
  useEffect(() => {
    if (!wordByWord?.length) return;
    let cancelled = false;
    const seen = new Set();
    const texts = [];
    wordByWord.forEach((item, index) => {
      const text = displayMeaning(item, index)?.trim();
      if (!text || seen.has(text)) return;
      if (lang === 'te' && !hasTeluguScript(text)) return;
      seen.add(text);
      texts.push(text);
    });
    (async () => {
      for (const text of texts) {
        if (cancelled) break;
        await warmMeaningTtsCache(text, lang);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wordByWord, lang, displayMeaning, rowsKey, teMeanings]);

  const resolveMeaningForTts = async (item, index) => {
    if (lang === 'te') {
      if (hasTeluguScript(item.te)) return String(item.te).trim();
      if (teMeanings[index]) return String(teMeanings[index]).trim();
      const en = getLineMeaningText(item, 'en').trim();
      if (!en) return '';
      try {
        const res = await fetch(`${API_URL || ''}/api/translate-meaning`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: en }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.te && hasTeluguScript(data.te)) {
            setTeMeanings((prev) => ({ ...prev, [index]: data.te }));
            return data.te.trim();
          }
        }
      } catch {
        /* fall through */
      }
    }
    return displayMeaning(item, index)?.trim() || '';
  };

  const ensureLineSegments = async () => {
    if (!verseId || !wordByWord?.length) return null;
    const manifest = await ensureGitaChantManifest();
    const url = chantUrlRef.current || resolveChantAudioUrl(verseId, manifest);
    if (!url) return null;

    const hasIntro = Boolean(chantIntro);
    const timing = getManifestTimingInput(verseId, manifest, { hasChantIntro: hasIntro });
    const lineCount = wordByWord.length;
    const segmentOpts = {
      introEnd: timing?.introEnd,
      hasChantIntro: hasIntro,
    };
    let duration = getManifestDuration(verseId, manifest);
    if (!duration) {
      try {
        duration = await loadChantDuration(url);
      } catch {
        duration = null;
      }
    }
    segmentOpts.duration = duration;

    let segments = null;

    if (timing?.lineEnds?.length && duration) {
      segments = buildLineSegments(timing.lineEnds, lineCount, segmentOpts);
    }

    if (!segments && duration) {
      const weights = wordByWord.map((row) => {
        const t = getLineScriptText(row, lang) || row.transliteration || row.word || '';
        return t.replace(/\s+/g, '').length || 1;
      });
      const guessed = await getVerseLineBoundaries(url, lineCount, weights);
      segments = buildLineSegments(guessed, lineCount, segmentOpts);
    }

    const introCut =
      timing?.introEnd ??
      (hasIntro && timing?.lineEnds?.[0] > 0.15 ? timing.lineEnds[0] : 0);

    segmentsRef.current = segments;
    chantUrlRef.current = url;
    return { segments, url, introCut };
  };

  const playMeaningTts = async (item, index) => {
    const meaning = await resolveMeaningForTts(item, index);
    if (!meaning) return;
    await playMeaningAudio(meaning, lang, 0.9);
  };

  const playLineChant = async (index) => {
    const chant = await ensureLineSegments();
    if (!chant?.segments?.length) throw new Error('No chant audio');
    const segment = chant.segments[index];
    if (!segment || segment.end <= segment.start) {
      throw new Error('No segment for this row');
    }
    if (index === 0 && chant.introCut > 0 && segment.start < chant.introCut) {
      segment.start = chant.introCut;
    }
    await playChantSegment(chant.url, segment.start, segment.end, 0.9, chant.introCut || 0);
  };

  const runPlay = async (index, part) => {
    const item = wordByWord[index];
    if (!item) return;

    stopChantSegment();
    stopMeaningAudio();
    abortRef.current = false;
    setPlaying({ index, part });

    try {
      if (part === 'line' || part === 'row') {
        try {
          await playLineChant(index);
        } catch (chantErr) {
          console.warn('Dhruv line chant unavailable:', chantErr.message);
          setChantFallbackMsg(
            lang === 'te'
              ? 'ధ్రువ గాయనం లేదు — సింథెసైజ్ చేసిన వాయిస్ వినండి.'
              : lang === 'hi'
                ? 'ध्रुव का चंत उपलब्ध नहीं — संश्लेषित आवाज़।'
                : 'Dhruv chant unavailable — playing synthesized voice for this line.'
          );
          const fallback = getLineScriptText(item, lang);
          if (fallback) await playTtsOrBrowser(fallback, lang, 0.9);
        }
      }

      if (abortRef.current) return;

      if (part === 'row') {
        await new Promise((r) => setTimeout(r, DEFAULT_GAP_MS));
        if (abortRef.current) return;
      }

      if (part === 'meaning' || part === 'row') {
        await playMeaningTts(item, index);
      }
    } finally {
      if (!abortRef.current) setPlaying(null);
    }
  };

  const handlePlayLine = (index) => runPlay(index, 'line');
  const handlePlayMeaning = (index) => runPlay(index, 'meaning');
  const handlePlayRow = (index) => runPlay(index, 'row');

  if (!wordByWord || wordByWord.length === 0) return null;

  const lineColumnLabel = lang === 'te' ? 'పంక్తి' : lang === 'hi' ? 'श्लोक पंक्ति' : 'Line (IAST)';
  const meaningLabel = lang === 'te' ? 'అర్థం' : lang === 'hi' ? 'अर्थ (EN)' : 'Meaning';

  const playBtnClass = (active) =>
    `w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
      active
        ? 'bg-lem-accent border-lem-accent text-lem-dark scale-110'
        : 'border-lem-glass-border text-gray-400 hover:border-lem-accent hover:text-lem-accent'
    }`;

  const isActive = (index, part) =>
    playing?.index === index && (playing.part === part || (part === 'line' && playing.part === 'row'));

  return (
    <div className="mt-6">
      {chantFallbackMsg && (
        <p className="text-xs text-yellow-400/90 mb-3 px-3 py-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10">
          {chantFallbackMsg}
        </p>
      )}
      {chantIntro && (
        <p className="text-sm text-lem-accent/90 mb-3 italic border-l-2 border-lem-accent/40 pl-3">
          {getLineScriptText(chantIntro, lang) || chantIntro.transliteration}
          {introLabel(chantIntro, lang) && (
            <span className="block text-xs text-gray-400 mt-1 not-italic">
              {introLabel(chantIntro, lang)}
            </span>
          )}
        </p>
      )}

      <div className="hidden md:block overflow-hidden rounded-xl border border-lem-glass-border shadow-sm">
        <table className="min-w-full divide-y divide-lem-glass-border">
          <thead className="bg-lem-sidebar">
            <tr>
              <th scope="col" className="px-2 py-3 text-left text-sm font-bold text-lem-accent uppercase tracking-wider w-24">
                {lang === 'te' ? 'విను' : lang === 'hi' ? 'सुनें' : 'Play'}
              </th>
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

              return (
                <tr key={index} className="hover:bg-white/10 transition-colors">
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title={lang === 'te' ? 'పంక్తి' : 'Line chant'}
                        onClick={() => handlePlayLine(index)}
                        className={playBtnClass(isActive(index, 'line'))}
                      >
                        <Volume2 size={14} />
                      </button>
                      <button
                        type="button"
                        title={lang === 'te' ? 'అర్థం' : 'Meaning (cached TTS)'}
                        onClick={() => handlePlayMeaning(index)}
                        className={playBtnClass(isActive(index, 'meaning'))}
                      >
                        <span className="text-[10px] font-bold">M</span>
                      </button>
                      {verseId && (
                        <button
                          type="button"
                          title="Line + meaning"
                          onClick={() => handlePlayRow(index)}
                          className={`text-[10px] px-1.5 py-0.5 rounded border border-lem-glass-border text-gray-400 hover:text-lem-accent ${
                            playing?.index === index && playing.part === 'row' ? 'text-lem-accent border-lem-accent' : ''
                          }`}
                        >
                          +
                        </button>
                      )}
                    </div>
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

          return (
            <div key={index} className="glass-panel p-4 rounded-2xl border border-white/5">
              <div className="flex items-start gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => handlePlayLine(index)}
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${
                    isActive(index, 'line') ? 'bg-lem-accent border-lem-accent text-lem-dark' : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  <Volume2 size={18} />
                </button>
                <div
                  className={`flex-1 text-lem-accent font-bold text-base whitespace-pre-wrap ${
                    lang === 'hi' ? 'devanagari-text' : ''
                  } ${lang === 'te' ? 'telugu-text' : ''}`}
                >
                  {displayWord}
                </div>
              </div>
              <div className="flex items-start gap-3 pl-1">
                <button
                  type="button"
                  onClick={() => handlePlayMeaning(index)}
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                    isActive(index, 'meaning') ? 'bg-lem-accent border-lem-accent text-lem-dark' : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  <Volume2 size={14} />
                </button>
                <div className="text-gray-300 text-sm leading-relaxed flex-1">{meaning}</div>
              </div>
              {verseId && (
                <button
                  type="button"
                  onClick={() => handlePlayRow(index)}
                  className="mt-2 text-xs text-lem-accent underline"
                >
                  {lang === 'te' ? 'పంక్తి + అర్థం' : lang === 'hi' ? 'पंक्ति + अर्थ' : 'Play line + meaning'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MeaningTable;
