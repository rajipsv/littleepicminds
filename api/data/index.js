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
const loadChapter = (num) => {
  try {
    return require(`./chapters/chapter${num}.js`);
  } catch (e) {
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
let finalHanuman = hanumanData;
try {
  finalHanuman = require('./prayers/hanuman_chalisa.js');
} catch (e) {
  console.warn('Could not load hanuman_chalisa.js:', e.message);
}

module.exports = {
  chapters: chaptersConfig.chapters,
  levels: chaptersConfig.levels,
  shlokas: finalShlokas,
  hanumanChalisa: finalHanuman,
  evaluations: evaluationsData,
};
