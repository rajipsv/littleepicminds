const fs = require('fs');
const path = require('path');

function fixHanumanSyntax(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Remove the extra { at the beginning (line 2 usually)
    content = content.replace(/const HANUMAN_CHALISA = \{\s*\{/, 'const HANUMAN_CHALISA = {');
    
    // 2. Fix the extra } at the end if it exists
    // (Search for the last }; and see if there is one too many)
    content = content.replace(/\};\s*\};/g, '};');
    
    // 3. Normalize keys: Doha_1 -> Doha 1, Verse_1 -> Verse 1
    content = content.replace(/"(Doha|Verse)_(\d+)":/g, '"$1 $2":');
    
    // 4. Unquote property keys (sanskrit, en, etc.)
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
const hcPath = path.resolve(projectRoot, 'backend/data/prayers/hanuman_chalisa.js');
const apiHcPath = path.resolve(projectRoot, 'api/data/prayers/hanuman_chalisa.js');

fixHanumanSyntax(hcPath);
fixHanumanSyntax(apiHcPath);

console.log('Fixed hanuman_chalisa.js syntax and normalized keys.');
