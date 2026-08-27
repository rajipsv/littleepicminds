/** Grove adventure module schema constants and helpers. */

const STORY_SECTION_START_PAGE = 3;

const BACK_MATTER_SECTION_ORDER = {
  moral: 10,
  remember: 20,
  practice: 30,
  celebrate: 40,
  grownups: 50,
  teaser: 60,
  other: 99,
};

const WORD_BUDGET = {
  storyTotalMin: 320,
  storyTotalMax: 480,
  pageMin: 40,
  pageMax: 60,
  storyPageCountTypical: { min: 10, max: 15 },
};

const PAGE_HEADING_RE = /^### (?:Page (\d+) — )?(.+?)(?:\r?\n|$)/;
const PAGE_SPLIT_RE = /\n(?=### (?:Page \d+ — )?.+)/;
const GENERATED_STORY_MARKER = /^<!-- generated from .+\.story\.json/m;

function sectionKind(sectionName) {
  const n = sectionName.toLowerCase();
  if (/^story$/i.test(n.replace(/\s*\(.+\)\s*$/, '').trim())) return 'story';
  if (/moral/i.test(n)) return 'moral';
  if (/practice/i.test(n)) return 'practice';
  if (/remember/i.test(n)) return 'remember';
  if (/celebrate/i.test(n)) return 'celebrate';
  if (/grown-up/i.test(n)) return 'grownups';
  if (/teaser|next adventure/i.test(n)) return 'teaser';
  return 'other';
}

function isStorySection(sectionName) {
  return sectionKind(sectionName) === 'story';
}

function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function storyJsonPath(mdPath) {
  return mdPath.replace(/\.md$/i, '.story.json');
}

function legacyPagesJsonPath(mdPath) {
  return mdPath.replace(/\.md$/i, '.pages.json');
}

module.exports = {
  STORY_SECTION_START_PAGE,
  BACK_MATTER_SECTION_ORDER,
  WORD_BUDGET,
  PAGE_HEADING_RE,
  PAGE_SPLIT_RE,
  GENERATED_STORY_MARKER,
  sectionKind,
  isStorySection,
  countWords,
  storyJsonPath,
  legacyPagesJsonPath,
};
