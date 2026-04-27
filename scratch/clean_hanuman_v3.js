const fs = require('fs');
const path = require('path');

function cleanHanuman(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Fix missing opening braces in lineBreakdown or similar arrays
    // Look for lines that start with a property name but are inside an object list and missing {
    content = content.replace(/,\s*\n\s+(sanskrit:)/g, ',\n    { $1');
    
    // 2. Ensure each such fixed object has a closing brace (this is harder)
    // Actually, line 1033 already has a closing brace at the end.
    
    // 3. Fix the specific issue at line 1033
    content = content.replace(/\},\s*\n\s+sanskrit:/g, '},\n    { sanskrit:');

    // 4. Global cleanup of extra braces
    content = content.replace(/\},\s*\{\s*"([^"]+)":/g, '},\n    "$1":');
    content = content.replace(/const HANUMAN_CHALISA = \{\s*\{/, 'const HANUMAN_CHALISA = {');
    content = content.replace(/\};\s*\};/g, '};');
    
    // 5. Chaupai -> Verse
    content = content.replace(/["']Chaupai[ _](\d+)["']:/g, '"Verse $1":');
    content = content.replace(/["']Doha[ _](\d+)["']:/g, '"Doha $1":');
    
    // 6. Fix quotes on keys
    const keys = ['sanskrit', 'transliteration', 'en', 'te', 'meaning', 'childMeaning', 
                 'activity', 'exercises', 'seeds', 'seekers', 'warriors', 'question', 
                 'question_te', 'options', 'correct', 'telugu_script', 'lineBreakdown', 
                 'word', 'sanskrit_te'];
    keys.forEach(k => {
        const regex = new RegExp(`["']${k}["']:`, 'g');
        content = content.replace(regex, `${k}:`);
    });

    fs.writeFileSync(filePath, content);
}

const projectRoot = process.cwd();
const files = [
    'backend/data/prayers/hanuman_chalisa.js',
    'api/data/prayers/hanuman_chalisa.js'
];

files.forEach(f => {
    try {
        cleanHanuman(path.resolve(projectRoot, f));
        console.log(`Cleaned ${f}`);
    } catch (e) {
        console.warn(`Could not clean ${f}: ${e.message}`);
    }
});
