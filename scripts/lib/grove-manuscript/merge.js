const fs = require('fs');
const path = require('path');
const { loadStoryJson, storyPagesToModulePages } = require('./load-story');
const { parseManuscriptMarkdown, parseMetadata, parseBackMatterPages } = require('./parse-markdown');
const { resolveModulePages, modulePageSummary } = require('./resolve-pages');

const ROOT = path.resolve(__dirname, '..', '..', '..');

function findManuscriptById(adventureId) {
  const booksDir = path.join(ROOT, 'docs', 'books');
  const id = adventureId.toLowerCase();
  const files = fs.readdirSync(booksDir).filter((f) => f.startsWith(`${id}-`) && f.endsWith('.md'));
  if (files.length === 0) return null;
  return path.join(booksDir, files[0]);
}

function resolveMdPath(input) {
  if (!input) return null;
  const p = path.resolve(input);
  if (fs.existsSync(p)) return p;
  const byId = findManuscriptById(input);
  if (byId) return byId;
  return p;
}

/**
 * Load a complete adventure module from hybrid sources.
 * @param {string} mdPathOrId - path to .md or adventure id (gv01_a1)
 * @param {{ storyPath?: string }} options
 */
function loadAdventure(mdPathOrId, options = {}) {
  const mdPath = resolveMdPath(mdPathOrId);
  if (!mdPath || !fs.existsSync(mdPath)) {
    throw new Error(`Manuscript not found: ${mdPathOrId}`);
  }

  const md = fs.readFileSync(mdPath, 'utf8');
  const parsed = parseManuscriptMarkdown(md);
  const metadata = parseMetadata(md);
  const storyData = loadStoryJson(mdPath, options.storyPath);

  const warnings = [...(storyData?.warnings || [])];
  if (!storyData?.pages?.length) {
    warnings.push(`No *.story.json found for ${path.basename(mdPath)} — story pages will be empty`);
  }

  const storyPages = storyPagesToModulePages(storyData);
  const backPages = parseBackMatterPages(md);
  const pageSections = resolveModulePages([...storyPages, ...backPages]);

  return {
    mdPath,
    storyPath: storyData?.sourcePath || null,
    adventureId: storyData?.adventureId || parsed.adventureId,
    title: parsed.title,
    ...metadata,
    storyDefaults: storyData?.defaults || {},
    storyPages: storyData?.pages || [],
    pageSections,
    summary: modulePageSummary(pageSections),
    sections: parsed.sections,
    warnings,
  };
}

module.exports = {
  loadAdventure,
  findManuscriptById,
  resolveMdPath,
};
