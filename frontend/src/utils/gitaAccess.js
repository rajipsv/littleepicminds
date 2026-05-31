/** Keep in sync with lib/gita-access.js */
export const GITA_FREE_CHAPTER_MAX = 1;

export function hasPremiumGitaAccess(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return !!user.is_premium;
}

export function isGitaChapterLocked(chapterNum, user, scripture = 'gita') {
  if (scripture !== 'gita') return false;
  const ch = parseInt(chapterNum, 10);
  if (!Number.isFinite(ch) || ch <= GITA_FREE_CHAPTER_MAX) return false;
  return !hasPremiumGitaAccess(user);
}
