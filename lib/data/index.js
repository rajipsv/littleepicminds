/**
 * Static Gita / Hanuman content loader (outside /api so Vercel counts one function).
 */
const fs = require('fs');
const path = require('path');

const chaptersConfig = require('./chapters.json');
const evaluationsData = require('./evaluations.json');

let themesData = { gita: {} };
try {
  const seedsThemes = require('./themes_seeds.json');
  const seekersThemes = require('./themes_seekers.json');
  const warriorsThemes = require('./themes_warriors.json');

  if (seedsThemes.gita) {
    Object.keys(seedsThemes.gita).forEach((ch) => {
      if (!themesData.gita[ch]) themesData.gita[ch] = {};
      themesData.gita[ch].seeds = seedsThemes.gita[ch];
    });
  }
  if (seekersThemes.gita) {
    Object.keys(seekersThemes.gita).forEach((ch) => {
      if (!themesData.gita[ch]) themesData.gita[ch] = {};
      themesData.gita[ch].seekers = seekersThemes.gita[ch];
    });
  }
  if (warriorsThemes.gita) {
    Object.keys(warriorsThemes.gita).forEach((ch) => {
      if (!themesData.gita[ch]) themesData.gita[ch] = {};
      themesData.gita[ch].warriors = warriorsThemes.gita[ch];
    });
  }
} catch (e) {
  console.warn('Could not load theme files:', e.message);
}

let finalShlokas = {};
try {
  const gitaDataInline = require('./gita_data.json');
  if (gitaDataInline?.shlokas) finalShlokas = { ...gitaDataInline.shlokas };
} catch (e) {
  /* optional */
}

try {
  const legacy = require('./shlokas.json');
  finalShlokas = { ...finalShlokas, ...legacy };
} catch (e) {
  /* optional */
}

const chaptersPath = path.join(__dirname, 'chapters');
if (fs.existsSync(chaptersPath)) {
  fs.readdirSync(chaptersPath)
    .filter((f) => f.endsWith('.js'))
    .forEach((file) => {
      try {
        const chapterData = require(path.join(chaptersPath, file));
        finalShlokas = { ...finalShlokas, ...chapterData };
      } catch (err) {
        console.warn(`Could not load ${file}:`, err.message);
      }
    });
}

let finalHanuman = {};
try {
  finalHanuman = require('./hanuman_chalisa.json');
} catch (e) {
  /* optional */
}
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
  themes: themesData,
};
