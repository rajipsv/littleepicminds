/**
 * Data Loader for littleEpicMinds
 * Loads all static content from the ported gita-kids-hub data files.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DATA_DIR = __dirname;

// Load chapters & levels config (pure JSON)
const chaptersConfig = require('./chapters.json');
let themes = {};
try {
  const seedsThemes = require('./themes_seeds.json');
  const seekersThemes = require('./themes_seekers.json');
  
  // Merge into structured format: { scripture: { chapter: { seeds: [], seekers: [] } } }
  themes = { gita: {} };
  
  // Merge Seeds
  if (seedsThemes.gita) {
    Object.keys(seedsThemes.gita).forEach(ch => {
      if (!themes.gita[ch]) themes.gita[ch] = {};
      themes.gita[ch].seeds = seedsThemes.gita[ch];
    });
  }
  
  // Merge Seekers
  if (seekersThemes.gita) {
    Object.keys(seekersThemes.gita).forEach(ch => {
      if (!themes.gita[ch]) themes.gita[ch] = {};
      themes.gita[ch].seekers = seekersThemes.gita[ch];
    });
  }
} catch (err) {
  console.warn('⚠️ Could not load level-based themes:', err.message);
}

/**
 * Load a JS data file that uses `window.X = ...` pattern.
 * Creates a temporary wrapper module that provides a fake `window`.
 */
function loadJsDataFile(filename, globalVarName) {
  const filePath = path.resolve(DATA_DIR, filename);
  
  // Read file, strip zero-width chars
  let code = fs.readFileSync(filePath, 'utf-8');
  code = code.replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
  
  // Create a sandbox with a fake window object
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  
  try {
    // Run the code in the sandbox
    vm.runInContext(code, sandbox);
    return sandbox.window[globalVarName];
  } catch (err) {
    console.error(`Error executing JS data file ${filename}:`, err.message);
    throw err;
  }
}

// Load all content
let shlokas = {};
let hanumanChalisa = {};
let evaluations = {};

// 1. Load split chapters from chapters/ directory
const chaptersPath = path.join(DATA_DIR, 'chapters');
if (fs.existsSync(chaptersPath)) {
  const chapterFiles = fs.readdirSync(chaptersPath).filter(f => f.endsWith('.js'));
  chapterFiles.forEach(file => {
    try {
      const chapterData = require(path.join(chaptersPath, file));
      shlokas = { ...shlokas, ...chapterData };
      console.log(`✅ Loaded ${file}`);
    } catch (err) {
      console.warn(`⚠️ Could not load chapter file ${file}:`, err.message);
    }
  });
}

// 2. Load legacy shlokas.js if it exists (and merge/overwrite)
try {
  const legacyShlokas = loadJsDataFile('shlokas.js', 'GITA_SHLOKAS');
  shlokas = { ...shlokas, ...legacyShlokas };
  console.log(`✅ Loaded legacy shlokas.js (${Object.keys(legacyShlokas).length} items)`);
} catch (err) {
  // Silent if missing, we prefer the split chapters now
}

console.log(`🚀 Total Gita shlokas loaded: ${Object.keys(shlokas).length}`);

// 3. Load prayers from prayers/ directory
const prayersPath = path.join(DATA_DIR, 'prayers');
if (fs.existsSync(prayersPath)) {
  const prayerFiles = fs.readdirSync(prayersPath).filter(f => f.endsWith('.js'));
  prayerFiles.forEach(file => {
    try {
      const prayerData = require(path.join(prayersPath, file));
      if (file === 'hanuman_chalisa.js') {
        hanumanChalisa = prayerData;
      }
      console.log(`✅ Loaded prayer ${file}`);
    } catch (err) {
      console.warn(`⚠️ Could not load prayer file ${file}:`, err.message);
    }
  });
}

// Load legacy hanuman_chalisa.js if it exists (fallback)
try {
  const legacyChalisa = loadJsDataFile('hanuman_chalisa.js', 'HANUMAN_CHALISA');
  hanumanChalisa = { ...hanumanChalisa, ...legacyChalisa };
} catch (err) { }

// 4. Load split evaluations from evaluations/ directory
const evalsPath = path.join(DATA_DIR, 'evaluations');
if (fs.existsSync(evalsPath)) {
  const evalFiles = fs.readdirSync(evalsPath).filter(f => f.endsWith('.js'));
  evalFiles.forEach(file => {
    try {
      const chapterNum = file.replace('chapter', '').replace('.js', '');
      const evalData = require(path.join(evalsPath, file));
      evaluations[chapterNum] = evalData;
      console.log(`✅ Loaded evaluation for chapter ${chapterNum}`);
    } catch (err) {
      console.warn(`⚠️ Could not load evaluation file ${file}:`, err.message);
    }
  });
}

// 5. Load legacy evaluations.js if it exists
try {
  const legacyEvals = loadJsDataFile('evaluations.js', 'GITA_EVALUATIONS');
  evaluations = { ...evaluations, ...legacyEvals };
  console.log(`✅ Loaded legacy evaluations.js (${Object.keys(legacyEvals).length} items)`);
} catch (err) {
  // Silent if missing
}

// Also load the GITA_DATA from gita_data.js (has inline shlokas like 2.47, 9.26)
try {
  const gitaDataInline = loadJsDataFile('gita_data.js', 'GITA_DATA');
  if (gitaDataInline && gitaDataInline.shlokas) {
    shlokas = { ...gitaDataInline.shlokas, ...shlokas };
    console.log(`✅ Merged inline shlokas. Total: ${Object.keys(shlokas).length}`);
  }
} catch (err) {
  console.warn('⚠️ Could not load gita_data.js:', err.message);
}

module.exports = {
  chapters: chaptersConfig.chapters,
  levels: chaptersConfig.levels,
  shlokas,
  hanumanChalisa,
  evaluations,
  themes,
};

