const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
/** Canonical Gita/content tree bundled on Vercel (`vercel.json` → includeFiles). */
const DATA_DIR = path.join(ROOT, 'lib', 'data');
/** Local secrets for npm scripts (not committed). */
const ENV_PATH = path.join(ROOT, 'backend', '.env');

module.exports = { ROOT, DATA_DIR, ENV_PATH };
