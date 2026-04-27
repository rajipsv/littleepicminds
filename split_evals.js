const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend/data/evaluations.js');
const content = fs.readFileSync(filePath, 'utf8');

// Regex to find the data inside the main object
// We want to match "1": { ... }, "2": { ... }
const evalRegex = /"(\d+)": ({[\s\S]*?})(?=,?\n\s+"|\n})/g;

const evaluationsDir = path.join(__dirname, 'backend/data/evaluations');
if (!fs.existsSync(evaluationsDir)) {
    fs.mkdirSync(evaluationsDir, { recursive: true });
}

let match;
while ((match = evalRegex.exec(content)) !== null) {
    const chapterNum = match[1];
    const data = match[2];
    
    const outputContent = `module.exports = ${data};`;
    const outputPath = path.join(evaluationsDir, `chapter${chapterNum}.js`);
    
    fs.writeFileSync(outputPath, outputContent, 'utf8');
    console.log(`Saved Evaluation Chapter ${chapterNum} to ${outputPath}`);
}
