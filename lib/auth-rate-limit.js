/**
 * Simple in-memory rate limiter (per serverless instance).
 * Sufficient to slow brute-force on login/register; use WAF/CDN for production scale.
 */
const buckets = new Map();

function prune() {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}

function rateLimit({ windowMs = 15 * 60 * 1000, max = 20, keyPrefix = 'auth' } = {}) {
  return (req, res, next) => {
    prune();
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
    const id = req.body?.username || req.body?.email || '';
    const key = `${keyPrefix}:${ip}:${id}`;
    const now = Date.now();
    let entry = buckets.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      buckets.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({
        error: 'Too many attempts. Please wait a few minutes and try again.',
      });
    }
    next();
  };
}

module.exports = { rateLimit };
