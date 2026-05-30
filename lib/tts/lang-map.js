/** App language codes → BCP-47 for TTS providers */
const APP_TO_BCP47 = {
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  en: 'en-IN',
  sa: 'hi-IN',
};

function toBcp47(targetLanguageCode) {
  return APP_TO_BCP47[targetLanguageCode] || 'hi-IN';
}

module.exports = { APP_TO_BCP47, toBcp47 };
