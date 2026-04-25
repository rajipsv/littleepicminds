const fs = require('fs');

function extractData(filePath, varName) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Simple regex to extract the object
    const start = content.indexOf(`${varName} = {`);
    if (start === -1) return {};
    
    // We'll use a hack: wrap in a function and return the var
    const cleanContent = content.replace(/window\..* = .*;/g, '')
                                .replace(/const /g, 'var ')
                                .replace(/module\.exports = .*/g, '');
    
    try {
        const fn = new Function(`
            var CHAPTER_1_SHLOKAS = {};
            var CHAPTER_2_SHLOKAS = {};
            var CHAPTER_9_SHLOKAS = {};
            var CHAPTER_12_SHLOKAS = {};
            var CHAPTER_15_SHLOKAS = {};
            var GITA_SHLOKAS = {};
            var GITA_EVALUATIONS = {};
            var HANUMAN_CHALISA = {};
            ${cleanContent}
            return ${varName};
        `);
        return fn();
    } catch (e) {
        console.error(`Failed to parse ${varName}:`, e.message);
        return {};
    }
}

const ch1 = extractData('backend/data/shlokas.js', 'CHAPTER_1_SHLOKAS');
const ch2 = extractData('backend/data/shlokas.js', 'CHAPTER_2_SHLOKAS');
const ch9 = extractData('backend/data/shlokas.js', 'CHAPTER_9_SHLOKAS');
const ch12 = extractData('backend/data/shlokas.js', 'CHAPTER_12_SHLOKAS');
const ch15 = extractData('backend/data/shlokas.js', 'CHAPTER_15_SHLOKAS');

const allShlokas = { ...ch1, ...ch2, ...ch9, ...ch12, ...ch15 };
fs.writeFileSync('api/data/shlokas.json', JSON.stringify(allShlokas, null, 2));

console.log(`Converted ${Object.keys(allShlokas).length} shlokas.`);
