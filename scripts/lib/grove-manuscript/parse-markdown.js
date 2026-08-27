const {
  PAGE_HEADING_RE,
  PAGE_SPLIT_RE,
  sectionKind,
  isStorySection,
} = require('./schema');

function parseManuscriptMarkdown(md) {
  const titleMatch = md.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : 'Gita Grove Manuscript';
  const idMatch = md.match(/`?(gv\d+_a\d+)`?/i);
  const adventureId = idMatch ? idMatch[1].toLowerCase() : 'gv00_a0';

  const parts = md.split(/\n(?=## )/);
  const sections = [];
  for (const part of parts) {
    const head = part.match(/^## (.+?)(?:\r?\n|$)/);
    if (!head) continue;
    const name = head[1].trim();
    const body = part.replace(/^## .+?\r?\n?/, '').trim();
    if (body) sections.push({ name, body });
  }
  return { title, adventureId, sections };
}

function parseMetadata(md) {
  const titleMatch = md.match(/^#\s+gv\d+_a\d+\s*·\s*(.+)$/m);
  const adventureTitle = titleMatch ? titleMatch[1].trim() : '';

  const pick = (re) => {
    const m = md.match(re);
    return m ? m[1].trim() : '';
  };

  return {
    adventureTitle,
    bookLine: pick(/\*\*Book:\*\*\s*(.+)/),
    grovePower: pick(/\*\*Grove Power:\*\*\s*(.+)/),
    subSkill: pick(/\*\*Sub-skill:\*\*\s*(.+)/),
    location: pick(/\*\*Location:\*\*\s*(.+)/),
    lead: pick(/\*\*Lead:\*\*\s*(.+)/),
    audience: pick(/\*\*Audience:\*\*\s*(.+)/),
    cast: pick(/\|\s*Cast\s*\|\s*(.+?)\s*\|/),
  };
}

/** Parse back-matter ### blocks only (skips ## Story). */
function parseBackMatterPages(md) {
  const pages = [];
  let docIndex = 1000;
  const sections = md.split(/\n(?=## )/);
  for (const section of sections) {
    const sectionHead = section.match(/^## (.+?)(?:\r?\n|$)/);
    if (!sectionHead) continue;
    const sectionName = sectionHead[1].trim();
    if (isStorySection(sectionName)) continue;

    const kind = sectionKind(sectionName);
    const parts = section.split(PAGE_SPLIT_RE);
    for (const part of parts) {
      const head = part.match(PAGE_HEADING_RE);
      if (!head) continue;
      let body = part.replace(PAGE_HEADING_RE, '');
      body = body.split(/\n---\n/)[0];
      body = body.replace(/\n\*Full Book[\s\S]*$/m, '').trim();
      pages.push({
        docIndex: docIndex++,
        explicitPage: head[1] ? parseInt(head[1], 10) : null,
        beat: head[2].trim(),
        body,
        isStory: false,
        sectionKind: kind,
        sectionName,
      });
    }
  }
  return pages;
}

module.exports = {
  parseManuscriptMarkdown,
  parseMetadata,
  parseBackMatterPages,
  PAGE_HEADING_RE,
};
