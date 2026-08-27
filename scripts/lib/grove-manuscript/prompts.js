const fs = require('fs');
const path = require('path');
const { loadCurriculumEntry } = require('./validate');
const { storyJsonPath } = require('./schema');

const ROOT = path.resolve(__dirname, '..', '..', '..');

function buildStoryGenerationPrompt(adventureId) {
  const entry = loadCurriculumEntry(adventureId);
  if (!entry) {
    throw new Error(`No curriculum entry for ${adventureId}`);
  }

  return `# Gita Grove story generation — ${adventureId}

## Adventure brief
- **Title:** ${entry.title}
- **Grove Power:** ${entry.power}
- **Sub-skill:** ${entry.subSkill}
- **Location:** ${entry.location}
- **Lead:** ${entry.lead}
- **Story feeling:** ${entry.storyFeeling || '(from curriculum)'}
- **Synopsis:** ${entry.synopsis}

## Output format
Write a \`*.story.json\` file with this shape (no page numbers in source):

\`\`\`json
{
  "adventureId": "${adventureId}",
  "defaults": {
    "styleSuffix": "Children's book B&W line art, 1:1 square composition, Gita Grove Seeds, ${entry.location} palette"
  },
  "pages": [
    {
      "beat": "Opens",
      "text": "40–60 words of story prose…",
      "imagePrompt": "Scene description for 1:1 B&W line art…"
    }
  ]
}
\`\`\`

## Rules (Seeds 5–7)
- ~10–13 pages, ~320–480 words total, ~40–60 words per page
- Grove friends only in story body — no Guru Ma lecture, no Mahabharata names
- Show ${entry.subSkill} through action, not preaching
- One \`pages[]\` entry per printed spread
- Do NOT write Moral, Remember, or Practice — those stay in the markdown manuscript

## Reference docs
- docs/gita-grove-capabilities.md
- docs/character-bible.md
- docs/book-format-spec.md
- Prior adventure in same book for continuity
`;
}

function scaffoldStoryJson(adventureId, mdPath) {
  const entry = loadCurriculumEntry(adventureId);
  const outPath = storyJsonPath(mdPath);
  const scaffold = {
    adventureId,
    defaults: {
      styleSuffix: `Children's book B&W line art, 1:1 square composition, Gita Grove Seeds, ${entry?.location || 'Gita Grove'} palette`,
    },
    pages: [
      { beat: 'Opens', text: '', imagePrompt: '' },
    ],
  };
  return { outPath, scaffold, prompt: buildStoryGenerationPrompt(adventureId) };
}

module.exports = { buildStoryGenerationPrompt, scaffoldStoryJson };
