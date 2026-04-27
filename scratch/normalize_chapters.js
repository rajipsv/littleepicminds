const fs = require('fs');
const path = require('path');

function cleanFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Ensure all shloka keys are quoted (e.g., "1.1": {)
    content = content.replace(/^(\s*)(\d+\.\d+): \{/gm, '$1"$2": {');
    
    // 2. Remove quotes from standard property keys (sanskrit, en, etc.)
    const keysToUnquote = [
        'sanskrit', 'transliteration', 'en', 'te', 'meaning', 'childMeaning', 
        'activity', 'exercises', 'seeds', 'seekers', 'warriors', 'question', 
        'question_te', 'options', 'correct', 'telugu_script', 'lineBreakdown', 
        'word', 'sanskrit_te'
    ];
    const unquoteRegex = new RegExp(`"(${keysToUnquote.join('|')})":`, 'g');
    content = content.replace(unquoteRegex, '$1:');
    
    // 3. Fix the specific \saubhadro issue in 1.6 if it exists
    content = content.replace(/\\saubhadro/g, '\\n saubhadro');
    
    fs.writeFileSync(filePath, content);
}

const projectRoot = process.cwd();
const files = [
    'backend/data/chapters/chapter1.js',
    'api/data/chapters/chapter1.js',
    'backend/data/chapters/chapter2.js',
    'api/data/chapters/chapter2.js',
    'backend/data/chapters/chapter15.js',
    'api/data/chapters/chapter15.js'
];

files.forEach(f => {
    try {
        cleanFile(path.resolve(projectRoot, f));
        console.log(`Cleaned ${f}`);
    } catch (e) {
        console.warn(`Could not clean ${f}: ${e.message}`);
    }
});
