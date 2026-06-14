/**
 * Merge Ch1–Ch2 v3 story batch files into final import JSON.
 * Run: node scripts/merge-ch1-ch2-v3-stories.js
 */
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, 'data');

function load(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8')).stories || {};
}

function merge(outFile, ...parts) {
  const stories = {};
  for (const part of parts) {
    Object.assign(stories, part);
  }
  fs.writeFileSync(
    path.join(DATA, outFile),
    JSON.stringify({ stories }, null, 2) + '\n',
    'utf8'
  );
  console.log(`✅ ${outFile}: ${Object.keys(stories).length} stories`);
}

merge(
  'chatgpt-stories-import-ch1-seeds-v3.json',
  load('chatgpt-stories-import-ch1-seeds-v3.json'),
  load('chatgpt-stories-import-ch1-seeds-v3-batch1.json'),
  load('chatgpt-stories-import-ch1-seeds-v3-batch2.json')
);

merge(
  'chatgpt-stories-import-ch2-seekers-v3.json',
  load('chatgpt-stories-import-ch2-seekers-v3-batch1.json'),
  load('chatgpt-stories-import-ch2-seekers-v3-batch2.json')
);
