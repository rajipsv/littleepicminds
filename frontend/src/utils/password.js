export function validatePassword(password) {
  const p = String(password || '');
  if (p.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
  if (!/[a-zA-Z]/.test(p) || !/[0-9]/.test(p)) {
    return { ok: false, error: 'Password must include at least one letter and one number.' };
  }
  return { ok: true };
}

export function passwordStrength(password) {
  const p = String(password || '');
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^a-zA-Z0-9]/.test(p)) score++;
  if (score <= 2) return 'weak';
  if (score <= 3) return 'fair';
  return 'strong';
}

export const PASSWORD_HINT =
  'Use at least 8 characters with letters and numbers. Add uppercase and symbols for a stronger password.';
