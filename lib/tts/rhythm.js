/** Add light punctuation so TTS pauses between lines / word-meaning pairs */
function toRhythmicText(text) {
  if (!text) return '';
  if (text.includes('\n')) {
    return (
      text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join(', ') + '.'
    );
  }
  if (text.includes('. ')) {
    return text.replace('. ', ', ');
  }
  return text;
}

module.exports = { toRhythmicText };
