#!/usr/bin/env node
/**
 * Thin wrapper — runs KDP export in gita-grove-authoring against this repo's content.
 *
 * Usage:
 *   node scripts/grove-export-kdp.js --file=docs/books/gv01_a1-too-much-at-once.md --format=book --full-module
 */
const { spawnSync } = require('child_process');
const path = require('path');

const PRODUCT_ROOT = path.resolve(__dirname, '..');
const AUTHORING_ROOT = path.resolve(PRODUCT_ROOT, '..', 'gita-grove-authoring');
const exportScript = path.join(AUTHORING_ROOT, 'scripts', 'export-grove-manuscript-kdp.js');

const passthrough = process.argv.slice(2);
const args = [
  exportScript,
  `--content-root=${PRODUCT_ROOT}`,
  `--out=${path.join(PRODUCT_ROOT, 'output', 'kdp')}`,
  ...passthrough,
];

const result = spawnSync(process.execPath, args, { stdio: 'inherit', cwd: AUTHORING_ROOT });
process.exit(result.status ?? 1);
