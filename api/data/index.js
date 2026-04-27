/**
 * Data Loader for littleEpicMinds (Unified JSON version)
 * Loads all static content as pure JSON to ensure stability on Vercel.
 */
const chaptersConfig = require('./chapters.json');
const shlokasData = require('./shlokas.json');
const hanumanData = require('./hanuman_chalisa.json');
const evaluationsData = require('./evaluations.json');
const gitaDataInline = require('./gita_data.json');

// Merge inline shlokas if they exist
let finalShlokas = gitaDataInline && gitaDataInline.shlokas 
  ? { ...gitaDataInline.shlokas, ...shlokasData }
  : shlokasData;

// Load modular chapter data
try {
  const chapter15Data = require('./chapters/chapter15.js');
  finalShlokas = { ...finalShlokas, ...chapter15Data };
} catch (e) {
  console.warn('Could not load chapter15 data:', e.message);
}

module.exports = {
  chapters: chaptersConfig.chapters,
  levels: chaptersConfig.levels,
  shlokas: finalShlokas,
  hanumanChalisa: hanumanData,
  evaluations: evaluationsData,
};
