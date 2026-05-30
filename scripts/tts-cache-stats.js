/**
 * Report TTS cache size and sample paths.
 *   node scripts/tts-cache-stats.js
 */
const path = require('path');
const { getReadDirs, countCacheFiles } = require('../lib/tts/cache-store');
const { resolveCacheDir } = require('../lib/tts/cache');

const writeDir = resolveCacheDir();
const readDirs = getReadDirs();

console.log('TTS cache write dir:', writeDir);
console.log('TTS cache read dirs:', readDirs.join('\n  '));
console.log('Total .wav entries (all dirs):', countCacheFiles());
console.log('\nTip: npm run gita:prewarm-tts — fills cache once; replays use zero Sarvam credits.');
