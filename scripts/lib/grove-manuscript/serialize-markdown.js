const fs = require('fs');
const path = require('path');
const { storyJsonPath } = require('./schema');
const { loadAdventure } = require('./merge');

const STORY_SECTION_RE = /^## Story\r?\n[\s\S]*?(?=\n## |\n---\n## |$)/m;

function renderStorySection(adventure) {
  const storyFile = path.basename(adventure.storyPath || storyJsonPath(adventure.mdPath));
  const lines = [
    '## Story',
    '',
    `<!-- generated from ${storyFile} — run npm run grove:compile -->`,
    '',
  ];

  adventure.pageSections
    .filter((p) => p.isStory)
    .forEach((page) => {
      lines.push(`### Page ${page.pageNumber} — ${page.beat}`);
      lines.push('');
      if (page.imagePrompt) {
        lines.push(`**Image prompt:** ${page.imagePrompt.replace(/\.\s+Children's book.*$/, '')}`);
        lines.push('');
      }
      if (page.body || page.text) {
        lines.push(page.body || page.text);
        lines.push('');
      }
    });

  return `${lines.join('\n').trim()}\n`;
}

function compileManuscript(adventureOrPath, options = {}) {
  const adventure =
    typeof adventureOrPath === 'string' ? loadAdventure(adventureOrPath, options) : adventureOrPath;

  let md = fs.readFileSync(adventure.mdPath, 'utf8');
  const storyBlock = renderStorySection(adventure);

  if (STORY_SECTION_RE.test(md)) {
    md = md.replace(STORY_SECTION_RE, storyBlock.trim());
  } else if (/^## Story\r?\n/m.test(md)) {
    md = md.replace(/^## Story\r?\n[\s\S]*?(?=\n## )/m, storyBlock.trim());
  } else {
    const insertAt = md.search(/\n## Moral\r?\n/);
    if (insertAt >= 0) {
      md = `${md.slice(0, insertAt)}\n\n${storyBlock.trim()}\n${md.slice(insertAt)}`;
    } else {
      md = `${md.trim()}\n\n${storyBlock.trim()}\n`;
    }
  }

  if (options.write !== false) {
    fs.writeFileSync(adventure.mdPath, md, 'utf8');
  }

  return { mdPath: adventure.mdPath, md };
}

module.exports = { compileManuscript, renderStorySection };
