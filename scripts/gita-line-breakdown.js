/**
 * Build line-by-line breakdown (one row per poetic line of the shloka, ~4 lines),
 * not per-word glosses.
 */
const Sanscript = require('@indic-transliteration/sanscript');

function cleanSanskrit(text) {
  if (!text) return '';
  return text
    .replace(/।।[\d.]+।।/g, '')
    .replace(/[।॥]/g, '|')
    .replace(/\s+/g, ' ')
    .replace(/\s*\|\s*/g, ' |\n')
    .trim();
}

function normalizeIast(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ḥ/g, 'h')
    .replace(/ś/g, 's')
    .replace(/ṣ/g, 's')
    .replace(/ṅ/g, 'n')
    .replace(/ṃ/g, 'm')
    .replace(/[^a-z]/g, '');
}

function tokenMatch(token, part) {
  const t = normalizeIast(token);
  const p = normalizeIast(part.replace(/ḥ$/i, 'h'));
  if (!t || !p) return false;
  if (t === p || t === p + 'h' || t + 'h' === p) return true;
  // Inflected forms (karmaṇy ~ karmaṇi, adhikāras ~ adhikāraḥ)
  if (t.length >= 4 && p.length >= 4) {
    const stem = Math.min(5, t.length, p.length);
    return t.slice(0, stem) === p.slice(0, stem);
  }
  return false;
}

/** Match gloss entries to a poetic line using token boundaries (not substrings). */
function wordMatchesLine(word, line) {
  if (!word || !line) return false;
  const tokens = line.split(/[\s-]+/).filter(Boolean);
  const parts = word.split(/[\s-]+/).filter(Boolean);
  if (parts.length === 0) return false;

  if (parts.length >= 2) {
    for (let i = 0; i <= tokens.length - parts.length; i++) {
      if (parts.every((p, j) => tokenMatch(tokens[i + j], p))) return true;
    }
    return false;
  }

  const p = parts[0];
  return tokens.some((t) => tokenMatch(t, p));
}

const LINES_PER_SHLOKA = 4;

function splitPoeticLines(text) {
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((l) => l.replace(/\|/g, '').trim())
    .filter(Boolean);
}

/** Every Gita shloka is shown as exactly 4 poetic lines (4 padas). */
function splitIntoFixedLines(text, n = LINES_PER_SHLOKA) {
  if (!text?.trim()) return Array.from({ length: n }, () => '');

  let lines = splitPoeticLines(text);
  if (lines.length === 1 && /[।॥|]/.test(text)) {
    lines = text
      .split(/[।॥|]+/)
      .map((l) => l.trim())
      .filter(Boolean);
  }

  if (lines.length === n) return lines;

  if (lines.length > n) {
    const merged = [];
    const per = Math.ceil(lines.length / n);
    for (let i = 0; i < n; i++) {
      merged.push(lines.slice(i * per, (i + 1) * per).join(' ').trim());
    }
    return merged;
  }

  const tokens = lines.join(' ').split(/[\s-]+/).filter(Boolean);
  if (!tokens.length) return Array.from({ length: n }, () => lines.join(' '));

  const out = [];
  const base = Math.floor(tokens.length / n);
  let extra = tokens.length % n;
  let idx = 0;
  for (let i = 0; i < n; i++) {
    const size = base + (extra > 0 ? 1 : 0);
    if (extra > 0) extra -= 1;
    out.push(tokens.slice(idx, idx + size).join(' '));
    idx += size;
  }
  return out;
}

function parseWordMeanings(wordMeanings) {
  if (!wordMeanings) return [];
  return wordMeanings
    .split(/[;\n]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const dash = part.indexOf('—');
      if (dash === -1) {
        const hyphen = part.indexOf('-');
        if (hyphen > 0) {
          return {
            word: part.slice(0, hyphen).trim(),
            en: part.slice(hyphen + 1).trim(),
          };
        }
        return { word: part, en: part };
      }
      return {
        word: part.slice(0, dash).trim(),
        en: part.slice(dash + 1).trim(),
      };
    });
}

function toTeluguScript(text) {
  try {
    return Sanscript.t(text, 'devanagari', 'telugu');
  } catch {
    return text;
  }
}

function toTeluguFromIast(word) {
  try {
    return Sanscript.t(word, 'iast', 'telugu');
  } catch {
    return word;
  }
}

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function hasTeluguScript(text) {
  return Boolean(text && /[\u0C00-\u0C7F]/.test(text));
}

function splitVerseMeaning(text, n) {
  if (!text || !n) return null;
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length === n) return sentences;
  const comma = text
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (comma.length === n) return comma;
  if (hasTeluguScript(text)) {
    const clauses = text
      .split(/(?<=[।:?,])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (clauses.length === n) return clauses;
    if (clauses.length > n) {
      const per = Math.ceil(clauses.length / n);
      const merged = [];
      for (let i = 0; i < n; i++) {
        merged.push(clauses.slice(i * per, (i + 1) * per).join(' '));
      }
      return merged;
    }
  }
  if (text?.trim() && n > 0) {
    return splitIntoFixedLines(text, n);
  }
  return null;
}

function joinMeanings(items) {
  return capitalize(items.map((i) => i.en).join(' ').replace(/\s+/g, ' ').trim());
}

/** Match glosses in the order they appear on the poetic line (greedy, longest first). */
function matchWordsInLineOrder(wordItems, line) {
  const tokens = line.split(/[\s-]+/).filter(Boolean);
  const result = [];
  let ti = 0;
  while (ti < tokens.length) {
    let best = null;
    let bestLen = 0;
    for (const item of wordItems) {
      const parts = item.word.split(/[\s-]+/).filter(Boolean);
      if (!parts.length) continue;
      if (ti + parts.length > tokens.length) continue;
      if (parts.every((p, j) => tokenMatch(tokens[ti + j], p))) {
        if (parts.length > bestLen) {
          best = item;
          bestLen = parts.length;
        }
      }
    }
    if (best) {
      result.push(best);
      ti += bestLen;
    } else {
      // Sandhi: gloss stem embedded in a combined transliteration token (e.g. pāṇḍavāśhchaiva)
      let sandhi = null;
      for (const item of wordItems) {
        const part = item.word.split(/[\s-]+/)[0];
        if (part.length >= 3 && tokenMatch(tokens[ti], part)) {
          sandhi = item;
          break;
        }
        const np = normalizeIast(part);
        const nt = normalizeIast(tokens[ti]);
        if (np.length >= 4 && nt.includes(np)) {
          sandhi = item;
          break;
        }
      }
      if (sandhi) result.push(sandhi);
      ti += 1;
    }
  }
  return result;
}

/**
 * @param {object} opts
 * @param {string} [opts.transliteration]
 * @param {string} [opts.sanskrit]
 * @param {string} [opts.telugu_script]
 * @param {string} [opts.word_meanings] - gita-data word_meanings string
 * @param {Array} [opts.existingBreakdown] - prior lineBreakdown or word-level rows
 * @param {string} [opts.fallbackMeaning] - full verse English meaning
 * @param {string} [opts.fallbackMeaningTe] - full verse Telugu meaning (split per line when possible)
 * @param {Map<string,string>} [opts.teCache] - en line meaning → Telugu (from translate script)
 */
function buildLineBreakdown(opts = {}) {
  const transliteration = (opts.transliteration || '').trim();
  if (!transliteration) return opts.existingBreakdown || [];

  const transLines = splitIntoFixedLines(transliteration, LINES_PER_SHLOKA);

  const sanskrit = cleanSanskrit(opts.sanskrit || '');
  const skLines = splitIntoFixedLines(sanskrit, LINES_PER_SHLOKA);
  const teluguFull =
    opts.telugu_script || (sanskrit ? toTeluguScript(sanskrit) : '');
  const teLines = splitIntoFixedLines(teluguFull, LINES_PER_SHLOKA);

  const fromSource = parseWordMeanings(opts.word_meanings);
  const fromExisting = (opts.existingBreakdown || []).map((item) => ({
    word: item.word || item.transliteration || item.sanskrit || '',
    en: item.en || item.meaning || '',
    te: item.te,
  }));
  const wordItems = fromSource.length ? fromSource : fromExisting;

  const fallbackParts = splitVerseMeaning(opts.fallbackMeaning, LINES_PER_SHLOKA);
  const fallbackTeParts = splitVerseMeaning(opts.fallbackMeaningTe, LINES_PER_SHLOKA);
  const teCache = opts.teCache;

  return transLines.map((line, i) => {
    const tokens = line.split(/[\s-]+/).filter(Boolean);
    let matched = matchWordsInLineOrder(wordItems, line);
    if (!matched.length && wordItems.length === LINES_PER_SHLOKA) {
      matched = [wordItems[i]];
    }

    let en = joinMeanings(matched);
    let te =
      matched.length && matched.some((m) => m.te && hasTeluguScript(m.te))
        ? joinMeanings(matched.map((m) => ({ en: m.te })))
        : '';

    const glossWeak =
      !matched.length ||
      matched.length < Math.max(2, Math.floor(tokens.length * 0.35));

    if (glossWeak && fallbackParts && fallbackParts[i]) {
      en = capitalize(fallbackParts[i]);
    } else if (!en && fallbackParts && fallbackParts[i]) {
      en = capitalize(fallbackParts[i]);
    } else if (!en && opts.fallbackMeaning) {
      en = i === 0 ? capitalize(opts.fallbackMeaning) : line;
    }
    if (!en) en = line;

    if (fallbackTeParts && fallbackTeParts[i] && hasTeluguScript(fallbackTeParts[i])) {
      te = capitalize(fallbackTeParts[i]);
    } else if (teCache && en && teCache.has(en)) {
      te = teCache.get(en);
    } else if (teCache && en && teCache.has(en.toLowerCase())) {
      te = teCache.get(en.toLowerCase());
    } else if (hasTeluguScript(te)) {
      // keep gloss-based te
    } else if (teCache && opts.fallbackMeaning && teCache.has(opts.fallbackMeaning)) {
      te = teCache.get(opts.fallbackMeaning);
    } else {
      te = teCache?.get(en) || teCache?.get(en?.toLowerCase()) || '';
    }

    const skLine = skLines[i] || skLines[skLines.length - 1] || line;
    const teLine = teLines[i] || teLines[teLines.length - 1] || toTeluguFromIast(line);

    return {
      sanskrit: skLine,
      word: line,
      transliteration: line,
      sanskrit_te: teLine,
      en,
      te: te || en,
    };
  });
}

module.exports = {
  buildLineBreakdown,
  cleanSanskrit,
  parseWordMeanings,
  splitPoeticLines,
  splitIntoFixedLines,
  LINES_PER_SHLOKA,
  wordMatchesLine,
  hasTeluguScript,
  splitVerseMeaning,
};
