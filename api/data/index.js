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
const finalShlokas = gitaDataInline && gitaDataInline.shlokas 
  ? { ...gitaDataInline.shlokas, ...shlokasData }
  : shlokasData;

module.exports = {
  chapters: chaptersConfig.chapters,
  levels: chaptersConfig.levels,
  shlokas: finalShlokas,
  hanumanChalisa: hanumanData,
  evaluations: evaluationsData,
};
