const fs = require('fs');
const path = require('path');
const { storyJsonPath, legacyPagesJsonPath } = require('./schema');

function normalizeStoryData(raw, sourcePath) {
  const warnings = [];
  let pages = raw.pages || raw.storyPages || [];
  if (raw.storyPages && !raw.pages) {
    warnings.push(`Legacy field "storyPages" in ${sourcePath} — use "pages" instead`);
  }
  if (sourcePath.endsWith('.pages.json')) {
    warnings.push(`Legacy filename ${path.basename(sourcePath)} — rename to *.story.json`);
  }

  pages = pages.map((p, index) => ({
    beat: String(p.beat || `Page ${index + 1}`).trim(),
    text: p.text != null ? String(p.text) : '',
    imagePrompt: p.imagePrompt != null ? String(p.imagePrompt) : '',
  }));

  return {
    adventureId: raw.adventureId || null,
    defaults: raw.defaults || {},
    pages,
    sourcePath,
    warnings,
  };
}

function loadStoryJson(mdPath, explicitPath) {
  const candidates = [];
  if (explicitPath) candidates.push({ path: path.resolve(explicitPath), legacy: false });
  candidates.push({ path: storyJsonPath(mdPath), legacy: false });
  candidates.push({ path: legacyPagesJsonPath(mdPath), legacy: true });

  for (const { path: p, legacy } of candidates) {
    if (!fs.existsSync(p)) continue;
    const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
    const normalized = normalizeStoryData(raw, p);
    if (legacy) normalized.warnings.push(`Loaded legacy sidecar ${path.basename(p)}`);
    return normalized;
  }
  return null;
}

function appendStyleSuffix(prompt, suffix) {
  if (!prompt || !suffix) return prompt;
  if (prompt.toLowerCase().includes(suffix.toLowerCase().slice(0, 20))) return prompt;
  return `${prompt.replace(/\.\s*$/, '')}. ${suffix}`;
}

function storyPagesToModulePages(storyData) {
  const suffix = storyData?.defaults?.styleSuffix || '';
  return (storyData?.pages || []).map((page, docIndex) => ({
    docIndex,
    beat: page.beat,
    body: page.text,
    text: page.text,
    imagePrompt: appendStyleSuffix(page.imagePrompt, suffix),
    isStory: true,
    sectionKind: 'story',
    sectionName: 'Story',
  }));
}

module.exports = {
  loadStoryJson,
  normalizeStoryData,
  storyPagesToModulePages,
  appendStyleSuffix,
};
