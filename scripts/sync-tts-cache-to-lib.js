/**
 * Copy backend/data/audio_cache → lib/data/audio_cache for Vercel/read-only deploy.
 *   npm run gita:sync-tts-cache
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const src = path.join(ROOT, 'backend', 'data', 'audio_cache');
const dest = path.join(ROOT, 'lib', 'data', 'audio_cache');

if (!fs.existsSync(src)) {
  console.error('No cache at', src, '— run npm run gita:prewarm-tts first');
  process.exit(1);
}

fs.mkdirSync(dest, { recursive: true });
let n = 0;
for (const name of fs.readdirSync(src)) {
  if (!name.endsWith('.wav') && !name.endsWith('.json')) continue;
  fs.copyFileSync(path.join(src, name), path.join(dest, name));
  n++;
}
console.log(`Copied ${n} cache files to ${dest}`);
