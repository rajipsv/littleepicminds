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

// Load modular chapter data
const loadChapter = (num) => {
  console.log(`[DEBUG] Loading Chapter ${num}...`);
  try {
    const ch = require(`./chapters/chapter${num}.js`);
    console.log(`[DEBUG] Chapter ${num} loaded.`);
    return ch;
  } catch (e) {
    console.warn(`[DEBUG] Could not load chapter${num}.js:`, e.message);
    return {};
  }
};

finalShlokas = {
  ...finalShlokas,
  ...loadChapter(1),
  ...loadChapter(2),
  ...loadChapter(15)
};

// Load modular prayer data
console.log('[DEBUG] Loading modular prayers...');
let finalHanuman = hanumanData;
try {
  finalHanuman = require('./prayers/hanuman_chalisa.js');
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
