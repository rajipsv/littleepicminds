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

/** IAST padas from HF / verse transliteration (dots or newlines between chunks). */
function splitTransliterationPadas(transliteration) {
  const raw = String(transliteration || '').trim();
  if (!raw) return [];
  if (raw.includes('\n')) {
    return raw
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);
  }
  return raw
    .split(/\s*\.\s*/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** uvāca / uvācha / uvacha (HF and chapter JSON variants). */
const UVACA_SUFFIX = /\s+uv[aā\u0101]ch?a[cḥ]?\s*$/i;

/** "sañjaya uvāca" / "dhṛtarāṣṭra uvāca" — narrator, not a pada of the shloka. */
function extractSpeakerPrefix(transliteration) {
  const padas = splitTransliterationPadas(transliteration);
  if (!padas.length) return { speaker: null, bodyPadas: [] };
  const first = padas[0];
  if (UVACA_SUFFIX.test(first)) {
    return { speaker: first.trim(), bodyPadas: padas.slice(1) };
  }
  return { speaker: null, bodyPadas: padas };
}

/** Four poetic lines from HF body padas (often 2 dotted halves → split each in two). */
function bodyPadasToFourLines(bodyPadas) {
  let lines = bodyPadas.map((p) => p.trim()).filter(Boolean);
  if (!lines.length) return Array.from({ length: LINES_PER_SHLOKA }, () => '');

  if (lines.length === LINES_PER_SHLOKA) return lines;

  if (lines.length === 2) {
    return twoDottedHalvesToFourLines(lines[0], lines[1]);
  }

  if (lines.length === 3) {
    const lens = lines.map((l) => l.split(/\s+/).length);
    const splitAt = lens.indexOf(Math.max(...lens));
    const split = splitIntoFixedLines(lines[splitAt], 2);
    lines = [...lines.slice(0, splitAt), ...split, ...lines.slice(splitAt + 1)];
  }

  if (lines.length > LINES_PER_SHLOKA) {
    const merged = [];
    const per = Math.ceil(lines.length / LINES_PER_SHLOKA);
    for (let i = 0; i < LINES_PER_SHLOKA; i++) {
      merged.push(lines.slice(i * per, (i + 1) * per).join(' ').trim());
    }
    return merged;
  }

  return splitIntoFixedLines(lines.join(' '), LINES_PER_SHLOKA);
}

/** Split sandhi tokens so pada breaks are visible (e.g. pāṇḍuputrāṇāmācārya → two words). */
function expandPadaTokens(text) {
  return (text || '')
    .split(/[\s-]+/)
    .filter(Boolean)
    .flatMap((token) => {
      const acarya = token.match(/^(.*?)(ācārya)$/i);
      if (acarya && acarya[1].length >= 4) {
        return [acarya[1], acarya[2]];
      }
      return [token];
    });
}

/** Where to end pada 1 / 3 inside each dotted half (matches Dhruv chanting). */
function splitIndexForHalf(tokens, isSecondHalf) {
  if (!tokens.length) return 0;
  if (!isSecondHalf) {
    const afterPandu = tokens.findIndex((t) =>
      /(?:pāṇḍavānīkaṃ|pāṇḍuputrāṇām|uputrāṇām)$/i.test(t)
    );
    if (afterPandu >= 0) return afterPandu + 1;
  } else {
    const afterDrupada = tokens.findIndex((t) => /putreṇa$/i.test(t));
    if (afterDrupada >= 0) return afterDrupada + 1;
    if (tokens.length >= 3 && (tokens[0]?.length ?? 0) >= 12) return 1;
  }
  return Math.ceil(tokens.length / 2);
}

/**
 * HF often has 2 dotted halves per shloka (4 padas). Split each half into 2 lines.
 * e.g. 1.2 "dṛṣṭvā tu pāṇḍavānīkaṃ | vyūḍhaṃ …" ; 1.3 "paśyaitāṃ pāṇḍuputrāṇām | ācārya …"
 */
function twoDottedHalvesToFourLines(firstHalf, secondHalf) {
  const splitHalf = (text, isSecondHalf) => {
    const tokens = expandPadaTokens(text);
    if (tokens.length <= 1) return [text.trim(), ''];
    const n = splitIndexForHalf(tokens, isSecondHalf);
    return [
      tokens.slice(0, n).join(' '),
      tokens.slice(n).join(' '),
    ].filter((l) => l.trim());
  };

  return [
    ...splitHalf(firstHalf, false),
    ...splitHalf(secondHalf, true),
  ].slice(0, LINES_PER_SHLOKA);
}

function extractSanskritSpeaker(sanskrit) {
  const cleaned = cleanSanskrit(sanskrit);
  let parts = cleaned
    .split(/[|]+/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (parts[0] && /उवाच/.test(parts[0])) {
    return { speaker: parts[0], bodyParts: parts.slice(1) };
  }
  return { speaker: null, bodyParts: parts.length ? parts : [cleaned.replace(/\|/g, ' ').trim()] };
}

function sanskritBodyToFourLines(bodyParts) {
  const joined = bodyParts.join(' ').trim();
  if (bodyParts.length === 2) {
    return twoDottedHalvesToFourLines(bodyParts[0], bodyParts[1]);
  }
  if (bodyParts.length === LINES_PER_SHLOKA) return bodyParts;
  return splitIntoFixedLines(joined, LINES_PER_SHLOKA);
}

function splitSanskritPadas(sanskrit) {
  const cleaned = cleanSanskrit(sanskrit);
  let lines = splitPoeticLines(cleaned);
  if (lines.length <= 1 && /[|]/.test(cleaned)) {
    lines = cleaned
      .split(/[|]+/)
      .map((l) => l.trim())
      .filter(Boolean);
  }
  return lines;
}

/** Every Gita shloka uses exactly 4 learn-step lines / audio segments. */
function lineCountForVerse() {
  return LINES_PER_SHLOKA;
}

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

  return splitTokensIntoLines(tokens, n);
}

/** Split tokens across n lines using pause-based segment weights from WAV. */
function splitIntoWeightedLines(text, n, weights) {
  if (!text?.trim()) return Array.from({ length: n }, () => '');
  const tokens = text
    .replace(/\s*\.\s*/g, ' ')
    .trim()
    .split(/[\s-]+/)
    .filter(Boolean);
  if (!tokens.length) return Array.from({ length: n }, () => '');
  return splitTokensIntoLines(tokens, n, weights);
}

function splitTokensIntoLines(tokens, n, weights) {
  const w = Array.isArray(weights) && weights.length === n
    ? weights.map((x) => Math.max(0.001, Number(x) || 1))
    : Array(n).fill(1);
  const sum = w.reduce((a, b) => a + b, 0);
  const sizes = w.map((x) => Math.max(1, Math.round((x / sum) * tokens.length)));
  let diff = tokens.length - sizes.reduce((a, b) => a + b, 0);
  for (let i = 0; diff > 0; i = (i + 1) % n, diff--) sizes[i] += 1;
  for (let i = 0; diff < 0; i = (i + 1) % n, diff++) {
    if (sizes[i] > 1) sizes[i] -= 1;
  }
  const out = [];
  let idx = 0;
  for (let i = 0; i < n; i++) {
    out.push(tokens.slice(idx, idx + sizes[i]).join(' '));
    idx += sizes[i];
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

/** Remove "Arjuna said," / "Krishna said," lead when uvācha is chantIntro. */
function stripNarratorLeadFromBody(text) {
  if (!text) return text;
  let t = String(text).trim();
  t = t.replace(/^[A-Za-z\u0900-\u097F]+\s+(?:said|spoke),?\s*/i, '');
  t = t.replace(/^["']?\s*/, '').trim();
  return t;
}

/** Remove vocative addressee from body gloss when narrator intro is a separate pada row. */
function stripAddresseeFromBody(text) {
  if (!text) return text;
  let t = String(text).trim();
  t = t.replace(/^O\s+Sanjaya,?\s*/i, '');
  t = t.replace(/^O\s+[A-Z][a-z]+,?\s*/, '');
  t = t.replace(/^ఓ\s+సంజయా,?\s*/, '');
  return t.trim();
}

/** BG verse glosses often use "Narrator said: clause, clause." — split to match IAST padas. */
function splitNarratorMeaning(text, n) {
  if (!text || n < 2) return null;
  const m = text.trim().match(/^([^:]+):\s+([\s\S]+)$/);
  if (!m) return null;
  const intro = m[1].trim();
  const body = m[2].trim().replace(/\.\s*$/, '');
  if (n === 2) return [intro, body];
  const commaParts = body
    .split(/,\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (commaParts.length < 2) return null;
  const parts = [intro, ...commaParts];
  if (parts.length === n) return parts;
  if (parts.length > n) {
    return [intro, commaParts[0], commaParts.slice(1).join(', ')];
  }
  return null;
}

/** Grow or shrink meaning clauses to exactly n lines (splits longest clause when short). */
function expandToLineCount(parts, n) {
  if (!parts?.length || !n) return null;
  let lines = parts.map((p) => p.trim()).filter(Boolean);
  while (lines.length < n) {
    let li = 0;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].length > lines[li].length) li = i;
    }
    const split = splitIntoFixedLines(lines[li], 2);
    if (split.length < 2 || split[0] === split[1]) break;
    lines = [...lines.slice(0, li), ...split, ...lines.slice(li + 1)];
  }
  while (lines.length > n) {
    let mergeAt = 0;
    let shortest = Infinity;
    for (let i = 0; i < lines.length - 1; i++) {
      const len = lines[i].length + lines[i + 1].length;
      if (len < shortest) {
        shortest = len;
        mergeAt = i;
      }
    }
    lines.splice(mergeAt, 2, `${lines[mergeAt]} ${lines[mergeAt + 1]}`.trim());
  }
  return lines.length === n ? lines : null;
}

function splitVerseMeaning(text, n) {
  if (!text || !n) return null;
  let narrator = splitNarratorMeaning(text, n);
  if (narrator?.length === n) return narrator;
  if (n > 2) {
    for (let tryN = n - 1; tryN >= 2; tryN--) {
      narrator = splitNarratorMeaning(text, tryN);
      if (narrator?.length) {
        const expanded = expandToLineCount(narrator, n);
        if (expanded) return expanded;
      }
    }
  }
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length === n) return sentences;
  const comma = text
    .split(/,\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (comma.length === n) return comma;
  if (comma.length >= 2 && comma.length < n) {
    const expanded = expandToLineCount(comma, n);
    if (expanded) return expanded;
  }
  const commaSemi = text
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (commaSemi.length === n) return commaSemi;
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
/** Draft lines from transliteration (used by gita:pada-lines:export). */
function inferPadaLinesFromTransliteration(transliteration) {
  const t = (transliteration || '').trim();
  if (!t) return null;
  const { speaker, bodyPadas } = extractSpeakerPrefix(t);
  const lines = bodyPadasToFourLines(bodyPadas);
  if (!lines.length) return null;
  return { ...(speaker ? { intro: speaker } : {}), lines };
}

function buildLineBreakdown(opts = {}) {
  const transliteration = (opts.transliteration || '').trim();
  if (!transliteration && !opts.padaOverride?.lines?.length) {
    return opts.existingBreakdown || [];
  }

  const sanskrit = cleanSanskrit(opts.sanskrit || '');
  const pada = opts.padaOverride;
  const n = pada?.lines?.length || LINES_PER_SHLOKA;

  const { speaker, bodyPadas } = extractSpeakerPrefix(transliteration);
  const { speaker: skSpeaker, bodyParts: skBody } = extractSanskritSpeaker(opts.sanskrit || sanskrit);
  const introIast = pada?.intro || speaker || '';

  const transLines =
    pada?.lines?.length ? pada.lines.map((l) => l.trim()).filter(Boolean) : bodyPadasToFourLines(bodyPadas);

  const skBodyText = skBody.join(' ').trim() || sanskrit.replace(/\|/g, ' ').trim();
  const skLines =
    transLines.length === LINES_PER_SHLOKA && skBody.length === 2
      ? sanskritBodyToFourLines(skBody)
      : splitIntoFixedLines(skBodyText, transLines.length);

  const teluguFull =
    opts.telugu_script || (sanskrit ? toTeluguScript(sanskrit) : '');
  const teSpeaker = skSpeaker ? toTeluguScript(skSpeaker) : '';
  const teBody = teSpeaker
    ? teluguFull.replace(teSpeaker, '').trim()
    : teluguFull;
  const teLines = splitIntoFixedLines(teBody, transLines.length);

  let introEn = '';
  let introTe = '';
  if (introIast) {
    const narrator = splitNarratorMeaning(opts.fallbackMeaning, 2);
    if (narrator?.length >= 1) introEn = capitalize(narrator[0]);
    const narratorTe = splitNarratorMeaning(opts.fallbackMeaningTe, 2);
    if (narratorTe?.length >= 1) introTe = capitalize(narratorTe[0]);
    if (!introEn) introEn = capitalize(introIast);
  }

  const fromSource = parseWordMeanings(opts.word_meanings);
  const fromExisting = (opts.existingBreakdown || []).map((item) => ({
    word: item.word || item.transliteration || item.sanskrit || '',
    en: item.en || item.meaning || '',
    te: item.te,
  }));
  const preferPada = Boolean(pada?.lines?.length);
  const wordItems = fromSource.length ? fromSource : preferPada ? [] : fromExisting;

  let meaningText = opts.fallbackMeaning;
  let meaningTeText = opts.fallbackMeaningTe;
  if (introIast && meaningText) {
    const colon = meaningText.indexOf(':');
    if (colon > 0) meaningText = meaningText.slice(colon + 1).trim();
    meaningText = stripNarratorLeadFromBody(meaningText);
    meaningText = stripAddresseeFromBody(meaningText);
  }
  if (introIast && meaningTeText && /ఇలా అన్నాడు|అన్నాడు:/.test(meaningTeText)) {
    const parts = meaningTeText.split(/ఇలా అన్నాడు[:\s]*/);
    if (parts.length > 1) meaningTeText = parts.slice(1).join('').trim();
  }
  if (introIast && meaningTeText) {
    meaningTeText = stripNarratorLeadFromBody(meaningTeText);
    meaningTeText = stripAddresseeFromBody(meaningTeText);
  }

  const lineCount = transLines.length;

  function looksLikeNarratorGloss(s) {
    const t = String(s || '').trim();
    if (!t) return false;
    return (
      /\bsaid\b/i.test(t) ||
      /\bspoke\b/i.test(t) ||
      /^"O [A-Za-z]/i.test(t) ||
      (t.length < 28 && /\b(uvāca|uvācha|uvacha)\b/i.test(t))
    );
  }

  let curatedEn = pada?.meaningsEn || pada?.en;
  let curatedTe = pada?.meaningsTe || pada?.te;
  if (introIast && Array.isArray(curatedEn) && curatedEn.length === lineCount) {
    if (looksLikeNarratorGloss(curatedEn[0])) {
      curatedEn = null;
      curatedTe = null;
    }
  }

  const fallbackParts =
    Array.isArray(curatedEn) && curatedEn.length === lineCount
      ? curatedEn.map((s) => String(s).trim())
      : splitVerseMeaning(meaningText, lineCount);
  const fallbackTeParts =
    Array.isArray(curatedTe) && curatedTe.length === lineCount
      ? curatedTe.map((s) => String(s).trim())
      : splitVerseMeaning(meaningTeText, lineCount);
  const teCache = opts.teCache;

  const rows = transLines.map((line, i) => {
    const tokens = line.split(/[\s-]+/).filter(Boolean);
    let matched = matchWordsInLineOrder(wordItems, line);
    if (!matched.length && wordItems.length === lineCount) {
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
    const useFallbackMeaning = fallbackParts?.length === lineCount && fallbackParts[i];

    if ((useFallbackMeaning || glossWeak) && fallbackParts && fallbackParts[i]) {
      en = capitalize(fallbackParts[i]);
    } else if (!en && fallbackParts && fallbackParts[i]) {
      en = capitalize(fallbackParts[i]);
    } else if (!en && opts.fallbackMeaning) {
      en = i === 0 ? capitalize(opts.fallbackMeaning) : line;
    }
    if (!en) en = line;

    if (
      (useFallbackMeaning || glossWeak) &&
      fallbackTeParts?.[i] &&
      hasTeluguScript(fallbackTeParts[i])
    ) {
      te = capitalize(fallbackTeParts[i]);
    } else if (fallbackTeParts && fallbackTeParts[i] && hasTeluguScript(fallbackTeParts[i])) {
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

  if (introIast) {
    rows.chantIntro = {
      transliteration: introIast,
      sanskrit: skSpeaker || introIast,
      en: introEn || capitalize(introIast),
      te: introTe || introEn,
    };
  }

  return rows;
}

module.exports = {
  buildLineBreakdown,
  inferPadaLinesFromTransliteration,
  cleanSanskrit,
  parseWordMeanings,
  splitPoeticLines,
  splitIntoFixedLines,
  splitIntoWeightedLines,
  splitTransliterationPadas,
  splitSanskritPadas,
  extractSpeakerPrefix,
  bodyPadasToFourLines,
  twoDottedHalvesToFourLines,
  expandPadaTokens,
  extractSanskritSpeaker,
  lineCountForVerse,
  LINES_PER_SHLOKA,
  wordMatchesLine,
  hasTeluguScript,
  splitVerseMeaning,
  splitNarratorMeaning,
  stripAddresseeFromBody,
  stripNarratorLeadFromBody,
  expandToLineCount,
};
