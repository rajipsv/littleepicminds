/** @deprecated Use scripts/lib/grove-kdp and scripts/lib/grove-manuscript */
const { parseManuscriptMarkdown } = require('./grove-manuscript/parse-markdown');
const { KDP } = require('./grove-kdp/constants');
const { renderDraftDocx } = require('./grove-kdp/render-draft');
const { loadAdventure } = require('./grove-manuscript');

async function buildKdpDocx(parsed, options = {}) {
  const adventure = options.adventure || loadAdventure(options.mdPath, { storyPath: options.storyPath || options.pagesConfig });
  return renderDraftDocx(adventure, { layout: options.layout });
}

module.exports = { parseManuscriptMarkdown, buildKdpDocx, KDP };
