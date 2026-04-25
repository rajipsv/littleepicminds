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

try {
  shlokas = loadJsDataFile('shlokas.js', 'GITA_SHLOKAS');
  console.log(`✅ Loaded ${Object.keys(shlokas).length} Gita shlokas`);
} catch (err) {
  console.warn('⚠️ Could not load shlokas.js:', err.message);
}

try {
  hanumanChalisa = loadJsDataFile('hanuman_chalisa.js', 'HANUMAN_CHALISA');
  console.log(`✅ Loaded ${Object.keys(hanumanChalisa).length} Hanuman Chalisa verses`);
} catch (err) {
  console.warn('⚠️ Could not load hanuman_chalisa.js:', err.message);
}

try {
  evaluations = loadJsDataFile('evaluations.js', 'GITA_EVALUATIONS');
  console.log(`✅ Loaded evaluations for ${Object.keys(evaluations).length} chapters`);
} catch (err) {
  console.warn('⚠️ Could not load evaluations.js:', err.message);
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
};

