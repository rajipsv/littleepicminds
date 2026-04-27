const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find keys like 1.1: or 15.11: and wrap them in quotes if they aren't already
    // Pattern: start of line or space, then digit.digit, then colon
    // But be careful not to match values.
    // In this file, shloka keys are usually at the top level of the object.
    
    // Let's use a more robust approach: match keys that look like shloka numbers
    content = content.replace(/^(\s+)(\d+\.\d+): \{/gm, '$1"$2": {');
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${filePath}`);
}

const projectRoot = process.cwd();
fixFile(path.resolve(projectRoot, 'backend/data/chapters/chapter1.js'));
fixFile(path.resolve(projectRoot, 'api/data/chapters/chapter1.js'));
fixFile(path.resolve(projectRoot, 'backend/data/chapters/chapter2.js'));
fixFile(path.resolve(projectRoot, 'api/data/chapters/chapter2.js'));
fixFile(path.resolve(projectRoot, 'backend/data/chapters/chapter15.js'));
fixFile(path.resolve(projectRoot, 'api/data/chapters/chapter15.js'));
