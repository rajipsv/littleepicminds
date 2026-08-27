/** @deprecated Use scripts/lib/grove-kdp/render-book.js */
const { loadAdventure } = require('./grove-manuscript');
const { renderBookDocx, buildBodyPages, buildFrontMatter, buildAboutAuthor } = require('./grove-kdp/render-book');
const { bodyToPageLines } = require('./grove-kdp/render-blocks');

async function buildBookLayoutDocx(mdOrPath, options = {}) {
  const adventure = typeof mdOrPath === 'string' && mdOrPath.includes('\n')
    ? options.adventure
    : loadAdventure(mdOrPath, { storyPath: options.storyPath || options.pagesConfig });
  return renderBookDocx(adventure, options);
}

function parseBookMeta(md, options = {}) {
  return loadAdventure(options.mdPath || md, { storyPath: options.storyPath || options.pagesConfig });
}

module.exports = { parseBookMeta, bodyToPageLines, buildBookLayoutDocx };
