const fs = require('fs');
const path = require('path');

function resolveCacheDir() {
  if (process.env.TTS_CACHE_DIR) {
    return path.resolve(process.env.TTS_CACHE_DIR);
  }
  const root = path.join(__dirname, '..', '..');
  return path.join(root, 'lib', 'data', 'audio_cache');
}

function ensureCacheDir() {
  const dir = resolveCacheDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

module.exports = { resolveCacheDir, ensureCacheDir };
