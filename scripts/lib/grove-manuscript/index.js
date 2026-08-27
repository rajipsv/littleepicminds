const { loadAdventure, findManuscriptById, resolveMdPath } = require('./merge');
const { loadStoryJson, storyPagesToModulePages, normalizeStoryData } = require('./load-story');
const { parseManuscriptMarkdown, parseMetadata, parseBackMatterPages } = require('./parse-markdown');
const { resolveModulePages, modulePageSummary } = require('./resolve-pages');
const { validateAdventure, validateAllManuscripts, loadCurriculumEntry } = require('./validate');
const { compileManuscript, renderStorySection } = require('./serialize-markdown');
const { buildStoryGenerationPrompt, scaffoldStoryJson } = require('./prompts');
const {
  STORY_SECTION_START_PAGE,
  BACK_MATTER_SECTION_ORDER,
  WORD_BUDGET,
  PAGE_HEADING_RE,
  PAGE_SPLIT_RE,
  sectionKind,
  isStorySection,
  countWords,
  storyJsonPath,
  legacyPagesJsonPath,
} = require('./schema');

module.exports = {
  loadAdventure,
  findManuscriptById,
  resolveMdPath,
  loadStoryJson,
  storyPagesToModulePages,
  normalizeStoryData,
  parseManuscriptMarkdown,
  parseMetadata,
  parseBackMatterPages,
  resolveModulePages,
  modulePageSummary,
  validateAdventure,
  validateAllManuscripts,
  loadCurriculumEntry,
  compileManuscript,
  renderStorySection,
  buildStoryGenerationPrompt,
  scaffoldStoryJson,
  STORY_SECTION_START_PAGE,
  BACK_MATTER_SECTION_ORDER,
  WORD_BUDGET,
  PAGE_HEADING_RE,
  PAGE_SPLIT_RE,
  sectionKind,
  isStorySection,
  countWords,
  storyJsonPath,
  legacyPagesJsonPath,
};
