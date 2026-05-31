/** Gita chapter 1 is free; chapter 2+ require premium (or admin). */
const GITA_FREE_CHAPTER_MAX = 1;

function parseChapterNumber(chapter) {
  const ch = parseInt(String(chapter).replace(/^chapter/i, ''), 10);
  return Number.isFinite(ch) ? ch : null;
}

function hasPremiumGitaAccess(authUser) {
  if (!authUser) return false;
  if (authUser.role === 'admin') return true;
  return !!authUser.is_premium;
}

function canAccessGitaChapter(chapter, authUser) {
  const ch = parseChapterNumber(chapter);
  if (ch == null) return true;
  if (ch <= GITA_FREE_CHAPTER_MAX) return true;
  return hasPremiumGitaAccess(authUser);
}

const PREMIUM_GITA_MESSAGE =
  'Premium membership required to access Chapter 2 and beyond. Chapter 1 is free for all learners.';

function denyPremiumGitaChapter(res) {
  return res.status(403).json({ error: PREMIUM_GITA_MESSAGE });
}

module.exports = {
  GITA_FREE_CHAPTER_MAX,
  PREMIUM_GITA_MESSAGE,
  parseChapterNumber,
  hasPremiumGitaAccess,
  canAccessGitaChapter,
  denyPremiumGitaChapter,
};
