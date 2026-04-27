const fs = require('fs');
const path = require('path');

function renameKeys(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/"Ending Doha 1":/g, '"Doha 3":');
    content = content.replace(/"Ending Doha 2":/g, '"Doha 4":');
    fs.writeFileSync(filePath, content);
}

const projectRoot = process.cwd();
renameKeys(path.resolve(projectRoot, 'backend/data/prayers/hanuman_chalisa.js'));
renameKeys(path.resolve(projectRoot, 'api/data/prayers/hanuman_chalisa.js'));

console.log('Renamed ending dohas to Doha 3 and Doha 4.');
