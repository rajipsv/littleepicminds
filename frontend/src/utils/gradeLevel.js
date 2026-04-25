/**
 * Derives the quiz difficulty level from the user's school grade.
 * Grade 1-2  → seeds   (beginner, playful)
 * Grade 3-5  → seekers (intermediate, energetic)
 * Grade 6+   → warriors (advanced, sophisticated)
 *
 * Falls back to user.level if grade is not set.
 */
export const getLevelFromUser = (user) => {
  const grade = parseInt(user?.grade);
  if (!isNaN(grade)) {
    if (grade <= 2) return 'seeds';
    if (grade <= 5) return 'seekers';
    return 'warriors';
  }
  // Fallback: use user.level if grade not available
  return user?.level || 'seeds';
};
