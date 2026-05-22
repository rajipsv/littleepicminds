/** Apply scripts/data/line-te-cache.json to all chapter lineBreakdown te fields. */
const fs = require('fs');
const path = require('path');
const { hasTeluguScript } = require('./gita-line-breakdown');

const ROOT = path.join(__dirname, '..');
const BACKEND_DATA = path.join(ROOT, 'backend', 'data');
const LIB_DATA = path.join(ROOT, 'lib', 'data');
const CACHE_FILE = path.join(__dirname, 'data', 'line-te-cache.json');
const chaptersConfig = require(path.join(BACKEND_DATA, 'chapters.json'));

function main() {
  const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  let updated = 0;

  for (const chMeta of chaptersConfig.chapters) {
    const ch = chMeta.id;
    const modPath = path.join(BACKEND_DATA, 'chapters', `chapter${ch}.js`);
    delete require.cache[require.resolve(modPath)];
    const chapter = require(modPath);
    const out = { ...chapter };

    for (const key of Object.keys(out)) {
      if (!/^\d+\.\d+$/.test(key)) continue;
      const shloka = out[key];
      if (!shloka.lineBreakdown) continue;
      shloka.lineBreakdown = shloka.lineBreakdown.map((row) => {
        const en = (row.en || '').trim();
        if (hasTeluguScript(row.te)) return row;
        const te = cache[en];
        if (te && hasTeluguScript(te)) {
          updated++;
          return { ...row, te };
        }
        return row;
      });
    }

    const sorted = {};
    Object.keys(out)
      .sort((a, b) => parseInt(a.split('.')[1], 10) - parseInt(b.split('.')[1], 10))
      .forEach((k) => {
        sorted[k] = out[k];
      });
    const content = `const CHAPTER_${ch}_SHLOKAS = ${JSON.stringify(sorted, null, 4)};\n\nmodule.exports = CHAPTER_${ch}_SHLOKAS;\n`;
    fs.writeFileSync(modPath, content, 'utf8');
    if (fs.existsSync(LIB_DATA)) {
      fs.copyFileSync(modPath, path.join(LIB_DATA, 'chapters', `chapter${ch}.js`));
    }
  }

  if (fs.existsSync(LIB_DATA)) {
    fs.copyFileSync(CACHE_FILE, path.join(LIB_DATA, 'line-te-cache.json'));
  }
  console.log(`Applied Telugu to ${updated} line rows.`);
}

main();
