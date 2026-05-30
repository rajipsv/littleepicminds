/** Display + TTS language modes: en = IAST only, hi = Devanagari, te = Telugu */

export function formatSanskritBlock(sanskrit) {
  return String(sanskrit || '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
    .join('\n');
}

export function formatTransliterationBlock(transliteration) {
  return String(transliteration || '')
    .split(/\s*\.\s*/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join('\n');
}

/** Main śloka text shown in Listen step — one script only. */
export function getVerseDisplayText(verse, lang) {
  if (!verse) return { text: '', mode: 'empty', highlightWords: [] };

  if (lang === 'te') {
    const text = verse.telugu_script || formatSanskritBlock(verse.sanskrit);
    return { text, mode: 'te', highlightWords: [] };
  }

  if (lang === 'hi') {
    const text = formatSanskritBlock(verse.sanskrit) || verse.sanskrit || '';
    return { text, mode: 'hi', highlightWords: [] };
  }

  const transliteration = verse.transliteration || '';
  const flat = transliteration.replace(/\s*\.\s*/g, ' ').replace(/\n/g, ' ');
  return {
    text: formatTransliterationBlock(transliteration) || transliteration,
    mode: 'en',
    highlightWords: flat.split(/\s+/).filter(Boolean),
  };
}

/** Line column in MeaningTable — never mix scripts. */
export function getLineScriptText(row, lang) {
  if (!row) return '';
  if (lang === 'te') return row.sanskrit_te || '';
  if (lang === 'hi') return row.sanskrit || '';
  return row.transliteration || row.word || '';
}

export function getLineMeaningText(row, lang) {
  if (!row) return '';
  if (lang === 'te') return row.te || row.meaning || '';
  return row.en || row.meaning || '';
}

export function ttsLangForUi(lang) {
  if (lang === 'te') return 'te';
  if (lang === 'hi') return 'hi';
  return 'hi';
}
