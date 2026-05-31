/**
 * Quick check: Sarvam → Google fallback chain for one phrase.
 *   node scripts/test-tts-providers.js
 *   node scripts/test-tts-providers.js --te
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const envPath = path.join(ROOT, 'backend', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  }
}

const useTe = process.argv.includes('--te');
const text = useTe ? 'ఓ సంజయా, పుణ్యక్షేత్రమైన' : 'O Sanjaya, on the holy field';
const lang = useTe ? 'te' : 'en';

async function main() {
  const { getProviderOrder, synthesizeSpeech } = require('../lib/tts');
  const order = getProviderOrder();
  console.log('TTS_PROVIDER=', process.env.TTS_PROVIDER || 'hybrid (default)');
  console.log('Chain:', order.join(' → ') || '(browser only)');
  console.log('Sarvam:', Boolean(process.env.SARVAM_API_KEY));
  console.log('Google:', Boolean(process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS));
  console.log('Text:', text);
  const result = await synthesizeSpeech({ text, targetLanguageCode: lang });
  console.log('OK provider=', result.provider, 'encoding=', result.audioEncoding, 'fallbackFrom=', result.fallbackFrom || '-');
}

main().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
