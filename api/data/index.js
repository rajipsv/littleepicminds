/**
 * Data Loader for littleEpicMinds (Unified JSON version)
 * Loads all static content as pure JSON to ensure stability on Vercel.
 */
console.log('[DEBUG] Loading static data files...');
const chaptersConfig = require('./chapters.json');
const shlokasData = require('./shlokas.json');
const hanumanData = require('./hanuman_chalisa.json');
const evaluationsData = require('./evaluations.json');
const gitaDataInline = require('./gita_data.json');

let themesData = { gita: {} };
try {
  const seedsThemes = require('./themes_seeds.json');
  const seekersThemes = require('./themes_seekers.json');
  
  // Merge Seeds
  if (seedsThemes.gita) {
    Object.keys(seedsThemes.gita).forEach(ch => {
      if (!themesData.gita[ch]) themesData.gita[ch] = {};
      themesData.gita[ch].seeds = seedsThemes.gita[ch];
    });
  }
  
  // Merge Seekers
  if (seekersThemes.gita) {
    Object.keys(seekersThemes.gita).forEach(ch => {
      if (!themesData.gita[ch]) themesData.gita[ch] = {};
      themesData.gita[ch].seekers = seekersThemes.gita[ch];
    });
  }
} catch (e) {
  console.warn('Could not load themes_seeds or themes_seekers:', e.message);
}
console.log('[DEBUG] Static files loaded.');

// Merge inline shlokas if they exist
let finalShlokas = gitaDataInline && gitaDataInline.shlokas 
  ? { ...gitaDataInline.shlokas, ...shlokasData }
  : shlokasData;

// Static Chapter Imports (Vercel doesn't support dynamic require)
const chapter1 = require('./chapters/chapter1.js');
const chapter2 = require('./chapters/chapter2.js');
const chapter15 = require('./chapters/chapter15.js');

const chapterMap = {
  1: chapter1,
  2: chapter2,
  15: chapter15
};

// Merge shlokas from modular files
finalShlokas = {
  ...finalShlokas,
  ...chapter1,
  ...chapter2,
  ...chapter15
};

// Load modular prayer data
console.log('[DEBUG] Loading modular prayers...');
let finalHanuman = hanumanData;
try {
  const hanumanModule = require('./prayers/hanuman_chalisa.js');
  finalHanuman = hanumanModule;
  console.log('[DEBUG] hanuman_chalisa.js loaded.');
} catch (e) {
  console.warn('Could not load hanuman_chalisa.js:', e.message);
}

module.exports = {
  chapters: chaptersConfig.chapters,
  levels: chaptersConfig.levels,
  shlokas: finalShlokas,
  hanumanChalisa: finalHanuman,
  evaluations: evaluationsData,
  themes: themesData,
};
