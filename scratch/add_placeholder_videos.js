const fs = require('fs');
const path = require('path');

// Go up one level from 'scratch' folder
const baseDir = path.join(__dirname, '..');

const THEME_FILES = [
  path.join(baseDir, 'backend/data/themes.json'),
  path.join(baseDir, 'api/data/themes.json')
];

const SAMPLE_VIDEO = "https://www.youtube.com/watch?v=_4mXIna42S4";

THEME_FILES.forEach(filePath => {
  console.log(`Checking ${filePath}...`);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let count = 0;
  for (const scripture in data) {
    for (const chapter in data[scripture]) {
      data[scripture][chapter] = data[scripture][chapter].map(theme => {
        if (!theme.videoUrl) {
          count++;
          return { ...theme, videoUrl: SAMPLE_VIDEO };
        }
        return theme;
      });
    }
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${count} themes in ${filePath}`);
});
