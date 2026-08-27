/** @deprecated Use scripts/lib/grove-manuscript/load-story.js */
const { loadStoryJson, storyPagesToModulePages, appendStyleSuffix } = require('./grove-manuscript/load-story');
const { storyJsonPath, legacyPagesJsonPath } = require('./grove-manuscript/schema');

function pagesConfigPath(mdPath) {
  return storyJsonPath(mdPath);
}

function loadStoryPagesConfig(mdPath, explicitPath) {
  return loadStoryJson(mdPath, explicitPath);
}

function enrichPageContent(pages, configWrapper) {
  if (!configWrapper?.data) return pages;
  const { storyPagesToModulePages: toMod } = require('./grove-manuscript/load-story');
  const storyOnly = toMod(configWrapper.data);
  const back = pages.filter((p) => !p.isStory);
  const { resolveModulePages } = require('./grove-manuscript/resolve-pages');
  return resolveModulePages([...storyOnly, ...back]);
}

module.exports = {
  loadStoryPagesConfig,
  pagesConfigPath,
  enrichPageContent,
  parsePageContent: () => ({ imagePrompt: '', textBody: '' }),
};
