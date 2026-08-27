#!/usr/bin/env node
/**
 * Export docs/books/*.md Grove manuscript → Amazon KDP-ready DOCX.
 *
 * Usage:
 *   node scripts/export-grove-manuscript-kdp.js --file=docs/books/gv01_a1-the-fair-before-the-drum.md
 *   node scripts/export-grove-manuscript-kdp.js --all
 *   node scripts/export-grove-manuscript-kdp.js --file=... --pandoc   (if pandoc installed)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { parseManuscriptMarkdown, buildKdpDocx } = require('./lib/grove-kdp-docx');

const ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const out = { file: null, all: false, pandoc: false, outDir: path.join(ROOT, 'output', 'kdp') };
  for (const arg of argv) {
    if (arg === '--all') out.all = true;
    else if (arg === '--pandoc') out.pandoc = true;
    else if (arg.startsWith('--file=')) out.file = arg.slice('--file='.length);
    else if (arg.startsWith('--out=')) out.outDir = path.resolve(arg.slice('--out='.length));
  }
  return out;
}

function listManuscripts() {
  const booksDir = path.join(ROOT, 'docs', 'books');
  return fs
    .readdirSync(booksDir)
    .filter((f) => /^gv\d+_a\d+-.+\.md$/.test(f))
    .map((f) => path.join(booksDir, f));
}

function exportWithPandoc(mdPath, outPath) {
  const ref = path.join(ROOT, 'scripts', 'kdp-reference.docx');
  const refFlag = fs.existsSync(ref) ? `--reference-doc="${ref}"` : '';
  execSync(`pandoc "${mdPath}" -o "${outPath}" ${refFlag}`.trim(), { stdio: 'inherit' });
}

async function exportOne(mdPath, opts) {
  const md = fs.readFileSync(mdPath, 'utf8');
  const parsed = parseManuscriptMarkdown(md);
  const base = path.basename(mdPath, '.md');
  fs.mkdirSync(opts.outDir, { recursive: true });
  const outPath = path.join(opts.outDir, `${base}.docx`);

  if (opts.pandoc) {
    try {
      exportWithPandoc(mdPath, outPath);
      console.log('Pandoc:', outPath);
      return outPath;
    } catch (e) {
      console.warn('Pandoc failed, falling back to docx builder:', e.message);
    }
  }

  const buf = await buildKdpDocx(parsed);
  fs.writeFileSync(outPath, buf);
  console.log('DOCX:', outPath);
  return outPath;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  let files = [];
  if (opts.all) files = listManuscripts();
  else if (opts.file) files = [path.resolve(opts.file)];
  else {
    console.error('Usage: node scripts/export-grove-manuscript-kdp.js --file=docs/books/gv01_a1-....md');
    console.error('       node scripts/export-grove-manuscript-kdp.js --all');
    process.exit(1);
  }

  if (files.length === 0) {
    console.error('No manuscript files found (pattern gv##_a#-slug.md)');
    process.exit(1);
  }

  for (const f of files) {
    if (!fs.existsSync(f)) {
      console.error('Missing:', f);
      process.exit(1);
    }
    await exportOne(f, opts);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
