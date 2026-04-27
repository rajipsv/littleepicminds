const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend/data/shlokas.js');
const content = fs.readFileSync(filePath, 'utf8');

// Regex to find CHAPTER_X_SHLOKAS blocks
const chapterRegex = /const (CHAPTER_(\d+)_SHLOKAS) = ({[\s\S]*?});\n/g;

let match;
const chaptersDir = path.join(__dirname, 'backend/data/chapters');
if (!fs.existsSync(chaptersDir)) {
    fs.mkdirSync(chaptersDir, { recursive: true });
}

while ((match = chapterRegex.exec(content)) !== null) {
    const varName = match[1];
    const chapterNum = match[2];
    const data = match[3];
    
    const outputContent = `const ${varName} = ${data};\n\nmodule.exports = ${varName};`;
    const outputPath = path.join(chaptersDir, `chapter${chapterNum}.js`);
    
    fs.writeFileSync(outputPath, outputContent, 'utf8');
    console.log(`Saved Chapter ${chapterNum} to ${outputPath}`);
}
