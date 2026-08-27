const { BACK_MATTER_SECTION_ORDER, STORY_SECTION_START_PAGE } = require('./schema');

function resolveModulePages(rawPages) {
  const story = rawPages.filter((p) => p.isStory).sort((a, b) => a.docIndex - b.docIndex);
  const back = rawPages.filter((p) => !p.isStory).sort((a, b) => {
    const sa = BACK_MATTER_SECTION_ORDER[a.sectionKind] ?? BACK_MATTER_SECTION_ORDER.other;
    const sb = BACK_MATTER_SECTION_ORDER[b.sectionKind] ?? BACK_MATTER_SECTION_ORDER.other;
    if (sa !== sb) return sa - sb;
    return a.docIndex - b.docIndex;
  });

  let pageNumber = STORY_SECTION_START_PAGE;
  const resolved = [];
  for (const page of story) {
    resolved.push({ ...page, pageNumber: pageNumber++ });
  }
  for (const page of back) {
    resolved.push({ ...page, pageNumber: pageNumber++ });
  }
  return resolved;
}

function modulePageSummary(pages) {
  const story = pages.filter((p) => p.isStory);
  const lastStory = story.length ? story[story.length - 1].pageNumber : STORY_SECTION_START_PAGE - 1;
  const lastPage = pages.length ? pages[pages.length - 1].pageNumber : 2;
  return {
    storyPageCount: story.length,
    storyFirstPage: story.length ? story[0].pageNumber : null,
    storyLastPage: story.length ? lastStory : null,
    backMatterFirstPage: story.length ? lastStory + 1 : STORY_SECTION_START_PAGE,
    modulePageCount: lastPage,
    backMatterPageCount: pages.filter((p) => !p.isStory).length,
  };
}

module.exports = { resolveModulePages, modulePageSummary };
