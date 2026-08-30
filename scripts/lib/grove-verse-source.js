/**
 * Load Bhagavad Gita verse text for Grove Remember (Skill 5).
 * Sources: littleepicminds lib/data/chapters (default) or Pipeworx mcp-bhagavad-gita.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const CHAPTERS_DIR = path.join(ROOT, 'lib', 'data', 'chapters');
const MCP_URL = 'https://gateway.pipeworx.io/bhagavad-gita/mcp';

function parseVerseId(verseId) {
  const m = String(verseId).trim().match(/^(\d+)\.(\d+)$/);
  if (!m) throw new Error(`Invalid verse id: ${verseId}`);
  return { chapter: Number(m[1]), verse: Number(m[2]), id: `${m[1]}.${m[2]}` };
}

function loadChapterModule(chapter) {
  const file = path.join(CHAPTERS_DIR, `chapter${chapter}.js`);
  if (!fs.existsSync(file)) return null;
  return require(file);
}

function normalizeTransliteration(text) {
  if (!text) return '';
  return text
    .replace(/\s*\.\s*/g, '\n')
    .replace(/\s+/g, ' ')
    .replace(/\n /g, '\n')
    .trim();
}

function formatDevanagari(sanskrit) {
  if (!sanskrit) return '';
  return sanskrit
    .replace(/\s*\|\s*/g, '\n')
    .replace(/\s+/g, ' ')
    .replace(/\n /g, '\n')
    .trim();
}

function seedsChildMeaning(verse) {
  const cm = verse.en?.childMeaning?.trim() || '';
  const meaning = verse.en?.meaning?.trim() || '';
  const generic = /Observing the Armies|Write or draw one way you can practice/i;
  if (cm && cm !== meaning && !generic.test(cm) && cm.length <= 320) return cm;
  return meaning;
}

function loadVerseFromRepo(verseId) {
  const { chapter, verse, id } = parseVerseId(verseId);
  const data = loadChapterModule(chapter);
  if (!data || !data[id]) return null;
  const row = data[id];
  return {
    id,
    chapter,
    verse,
    source: `lib/data/chapters/chapter${chapter}.js`,
    sanskrit: formatDevanagari(row.sanskrit || ''),
    transliteration: normalizeTransliteration(row.transliteration || ''),
    childMeaning: seedsChildMeaning(row),
    meaning: row.en?.meaning?.trim() || '',
    teluguScript: row.telugu_script || null,
  };
}

async function loadVerseFromMcp(verseId) {
  const { chapter, verse, id } = parseVerseId(verseId);
  const body = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'get_verse',
      arguments: { chapter, verse },
    },
  };

  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`MCP HTTP ${res.status} for ${id}`);

  const json = await res.json();
  const structured = json?.result?.structuredContent;
  if (!structured) throw new Error(`MCP empty response for ${id}`);

  const translation =
    structured.translations?.sivananda ||
    structured.translations?.adidevananda ||
    structured.translations?.purohit ||
    Object.values(structured.translations || {})[0] ||
    '';

  return {
    id,
    chapter,
    verse,
    source: 'mcp-bhagavad-gita (gateway.pipeworx.io)',
    sanskrit: formatDevanagari(structured.sanskrit || ''),
    transliteration: normalizeTransliteration(structured.transliteration || ''),
    childMeaning: translation.replace(/^\d+\.\d+\.?\s*/i, '').trim(),
    meaning: translation.replace(/^\d+\.\d+\.?\s*/i, '').trim(),
    teluguScript: null,
  };
}

/**
 * @param {string} verseId e.g. "1.28"
 * @param {{ prefer?: 'repo'|'mcp', fallback?: boolean }} options
 */
async function resolveVerse(verseId, options = {}) {
  const prefer = options.prefer || 'repo';
  const fallback = options.fallback !== false;
  const loaders = prefer === 'mcp' ? ['mcp', 'repo'] : ['repo', 'mcp'];

  for (const src of loaders) {
    try {
      const data = src === 'mcp' ? await loadVerseFromMcp(verseId) : loadVerseFromRepo(verseId);
      if (data?.transliteration) return { ...data, resolvedVia: src };
    } catch (err) {
      if (!fallback) throw err;
    }
  }
  throw new Error(`Could not resolve verse ${verseId} from repo or MCP`);
}

async function resolveVerses(verseIds, options = {}) {
  const out = [];
  for (const id of verseIds) {
    out.push(await resolveVerse(id, options));
  }
  return out;
}

module.exports = {
  parseVerseId,
  loadVerseFromRepo,
  loadVerseFromMcp,
  resolveVerse,
  resolveVerses,
  normalizeTransliteration,
  seedsChildMeaning,
  MCP_URL,
};
