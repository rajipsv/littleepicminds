const fs = require('fs');
const path = require('path');

function cleanHanuman(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Remove extra opening braces before shloka keys
    // Pattern: }, followed by space/newline, then { followed by space/newline, then "Key":
    content = content.replace(/\},\s*\{\s*"([^"]+)":/g, '},\n    "$1":');
    
    // 2. Remove extra opening brace at the very beginning (after const ...)
    content = content.replace(/const HANUMAN_CHALISA = \{\s*\{/, 'const HANUMAN_CHALISA = {');
    
    // 3. Fix potential extra closing braces at the end
    content = content.replace(/\};\s*\};/g, '};');
    
    // 4. Replace Chaupai with Verse (and fix underscores)
    content = content.replace(/"Chaupai[ _](\d+)":/g, '"Verse $1":');
    
    // 5. Normalize Doha_X to Doha X
    content = content.replace(/"Doha[ _](\d+)":/g, '"Doha $1":');
    
    // 6. Unquote property keys (sanskrit, en, etc.)
    const keysToUnquote = [
        'sanskrit', 'transliteration', 'en', 'te', 'meaning', 'childMeaning', 
        'activity', 'exercises', 'seeds', 'seekers', 'warriors', 'question', 
        'question_te', 'options', 'correct', 'telugu_script', 'lineBreakdown', 
        'word', 'sanskrit_te'
    ];
    const unquoteRegex = new RegExp(`"(${keysToUnquote.join('|')})":`, 'g');
    content = content.replace(unquoteRegex, '$1:');
    
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
