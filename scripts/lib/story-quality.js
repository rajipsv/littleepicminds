/**
 * Detect auto-seeded / template theme stories vs handcrafted ChatGPT-quality entries.
 */

const PLACEHOLDER_PATTERNS = [
  /had a school day that tested something important/i,
  /On the field of Kurukshetra, Arjuna listened as Krishna explained ideas for Chapter/i,
  /Students today face smaller battles/i,
  /In the Gita, Chapter \d+ teaches:/i,
  /^Verses \d+\.\d+/i,
];

function isPlaceholderStory(entry) {
  if (!entry?.content?.trim()) return true;
  const c = entry.content;
  if (PLACEHOLDER_PATTERNS.some((re) => re.test(c))) return true;
  const te = (entry.content_te || '').trim();
  const en = c.trim();
  if (te && te === en) return true;
  if (te && te.length < 40) return true;
  return false;
}

function isCompleteStory(entry) {
  const required = ['title', 'content', 'moral', 'activity'];
  if (required.some((f) => !entry?.[f] || !String(entry[f]).trim())) return false;
  return !isPlaceholderStory(entry);
}

module.exports = { isPlaceholderStory, isCompleteStory, PLACEHOLDER_PATTERNS };
