const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const BCRYPT_ROUNDS = 12;
const DEFAULT_JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';
const ALLOWED_ROLES = new Set(['student', 'parent', 'admin']);

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (process.env.VERCEL && !secret) {
    throw new Error('JWT_SECRET must be set in Vercel environment variables.');
  }
  return secret || 'dev-only-change-me-not-for-production';
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeUsername(username) {
  return String(username || '').trim();
}

function validateUsername(username) {
  const u = normalizeUsername(username);
  if (u.length < 3 || u.length > 30) {
    return { ok: false, error: 'Username must be 3–30 characters.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(u)) {
    return { ok: false, error: 'Username may only contain letters, numbers, and underscores.' };
  }
  return { ok: true, value: u };
}

function validateEmail(email) {
  const e = normalizeEmail(email);
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    return { ok: false, error: 'A valid email address is required.' };
  }
  return { ok: true, value: e };
}

/** Commercial baseline: 8+ chars, letter + number. */
function validatePassword(password, { label = 'Password' } = {}) {
  const p = String(password || '');
  if (p.length < 8) {
    return { ok: false, error: `${label} must be at least 8 characters.` };
  }
  if (p.length > 128) {
    return { ok: false, error: `${label} is too long.` };
  }
  if (!/[a-zA-Z]/.test(p) || !/[0-9]/.test(p)) {
    return { ok: false, error: `${label} must include at least one letter and one number.` };
  }
  return { ok: true };
}

function passwordStrength(password) {
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

async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function signAccessToken(user) {
  const payload = {
    user: {
      id: user.id,
      role: user.role,
      is_premium: !!user.is_premium,
      level: user.level,
    },
  };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: DEFAULT_JWT_EXPIRES });
}

function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function sanitizeUser(row) {
  if (!row) return null;
  const { password_hash, ...rest } = row;
  return rest;
}

function createAuthMiddleware({ optional = false } = {}) {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) {
      if (optional) return next();
      return res.status(401).json({ error: 'Authentication required.' });
    }
    try {
      const decoded = verifyAccessToken(token);
      req.auth = decoded.user;
      next();
    } catch {
      if (optional) return next();
      return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
    }
  };
}

function requireRole(...roles) {
  const allowed = new Set(roles);
  return (req, res, next) => {
    if (!req.auth?.role || !allowed.has(req.auth.role)) {
      return res.status(403).json({ error: 'You do not have permission for this action.' });
    }
    next();
  };
}

function parseRole(role, { allowAdmin = false } = {}) {
  const r = String(role || 'student').toLowerCase();
  if (!ALLOWED_ROLES.has(r)) return 'student';
  if (r === 'admin' && !allowAdmin) return 'student';
  return r;
}

module.exports = {
  ALLOWED_ROLES,
  BCRYPT_ROUNDS,
  getJwtSecret,
  normalizeEmail,
  normalizeUsername,
  validateUsername,
  validateEmail,
  validatePassword,
  passwordStrength,
  hashPassword,
  verifyPassword,
  signAccessToken,
  verifyAccessToken,
  sanitizeUser,
  createAuthMiddleware,
  requireRole,
  parseRole,
};
