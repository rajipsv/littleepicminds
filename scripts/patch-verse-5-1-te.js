/** One-off: proper Telugu line meanings for 5.1 */
const fs = require('fs');
const path = require('path');

const teLines = [
  'అర్జునుడు అన్నాడు: ఓ కృష్ణా, కర్మల సంన్యాసాన్ని',
  'మరియు కర్మయోగాన్ని కూడా మీరు ప్రశంసిస్తున్నారు',
  'ఈ రెండింటిలో ఏది శ్రేయస్కరమో',
  'దానిని నాకు నిశ్చయంగా చెప్పండి',
];

const enLines = [
  'Arjun said of actions Shree Krishna',
  'About karm yog also you praise',
  'Of the two one',
  'Unto me please tell conclusively',
];

const cachePath = path.join(__dirname, 'data', 'line-te-cache.json');
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};
enLines.forEach((en, i) => {
  cache[en] = teLines[i];
});
fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');

for (const base of ['backend/data/chapters', 'lib/data/chapters']) {
  const file = path.join(__dirname, '..', base, 'chapter5.js');
  delete require.cache[require.resolve(file)];
  const ch = require(file);
  const v = ch['5.1'];
  v.lineBreakdown.forEach((row, i) => {
    row.te = teLines[i];
  });
  const sorted = {};
  Object.keys(ch)
    .sort((a, b) => parseInt(a.split('.')[1], 10) - parseInt(b.split('.')[1], 10))
    .forEach((k) => {
      sorted[k] = ch[k];
    });
  fs.writeFileSync(
    file,
    `const CHAPTER_5_SHLOKAS = ${JSON.stringify(sorted, null, 4)};\n\nmodule.exports = CHAPTER_5_SHLOKAS;\n`,
    'utf8'
  );
}
console.log('5.1 Telugu lines patched');
