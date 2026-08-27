const fs = require('fs');
const path = require('path');
const { WORD_BUDGET, countWords } = require('./schema');
const { loadAdventure } = require('./merge');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const CURRICULUM_PATH = path.join(ROOT, 'scripts', 'data', 'gita-grove-curriculum.json');

function loadCurriculumEntry(adventureId) {
  const data = JSON.parse(fs.readFileSync(CURRICULUM_PATH, 'utf8'));
  return (data.adventures || []).find((a) => a.adventureId === adventureId) || null;
}

function validateAdventure(adventureOrPath, options = {}) {
  const module =
    typeof adventureOrPath === 'string' ? loadAdventure(adventureOrPath, options) : adventureOrPath;

  const errors = [];
  const warnings = [...(module.warnings || [])];

  if (!module.storyPages.length) {
    errors.push('No story pages in *.story.json');
  }

  let totalWords = 0;
  module.storyPages.forEach((page, i) => {
    const words = countWords(page.text);
    totalWords += words;
    if (!page.text.trim()) {
      errors.push(`Story page ${i + 1} (${page.beat}): missing text`);
    }
    if (!page.imagePrompt.trim()) {
      warnings.push(`Story page ${i + 1} (${page.beat}): missing imagePrompt`);
    }
    if (words > 0 && (words < WORD_BUDGET.pageMin - 15 || words > WORD_BUDGET.pageMax + 15)) {
      warnings.push(`Story page ${i + 1} (${page.beat}): ${words} words (target ${WORD_BUDGET.pageMin}–${WORD_BUDGET.pageMax})`);
    }
  });

  if (totalWords > 0 && (totalWords < WORD_BUDGET.storyTotalMin || totalWords > WORD_BUDGET.storyTotalMax + 40)) {
    warnings.push(`Story total: ${totalWords} words (target ${WORD_BUDGET.storyTotalMin}–${WORD_BUDGET.storyTotalMax})`);
  }

  const { storyPageCount } = module.summary;
  if (storyPageCount < WORD_BUDGET.storyPageCountTypical.min || storyPageCount > WORD_BUDGET.storyPageCountTypical.max + 3) {
    warnings.push(`Story page count: ${storyPageCount} (typical ${WORD_BUDGET.storyPageCountTypical.min}–${WORD_BUDGET.storyPageCountTypical.max})`);
  }

  if (module.summary.backMatterPageCount === 0) {
    warnings.push('No back-matter ### blocks found in markdown (Moral, Remember, etc.)');
  }

  const curriculum = loadCurriculumEntry(module.adventureId);
  if (!curriculum) {
    warnings.push(`No curriculum entry for ${module.adventureId}`);
  } else if (curriculum.manuscript && !module.mdPath.endsWith(curriculum.manuscript.replace(/\//g, path.sep))) {
    warnings.push(`Manuscript path may not match curriculum.manuscript (${curriculum.manuscript})`);
  }

  return {
    ok: errors.length === 0,
    adventureId: module.adventureId,
    errors,
    warnings,
    summary: module.summary,
  };
}

function validateAllManuscripts() {
  const booksDir = path.join(ROOT, 'docs', 'books');
  const files = fs.readdirSync(booksDir).filter((f) => /^gv\d+_a\d+-.+\.md$/.test(f));
  return files.map((f) => validateAdventure(path.join(booksDir, f)));
}

module.exports = { validateAdventure, validateAllManuscripts, loadCurriculumEntry };
