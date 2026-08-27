#!/usr/bin/env node
/**
 * Export Grove adventure → KDP DOCX via loadAdventure() pipeline.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { loadAdventure } = require('./lib/grove-manuscript');
const { renderBookDocx, renderDraftDocx } = require('./lib/grove-kdp');

const ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const out = {
    file: null,
    all: false,
    pandoc: false,
    layout: 'default',
    format: 'draft',
    outDir: path.join(ROOT, 'output', 'kdp'),
    storyPath: null,
    fullModule: false,
  };
  for (const arg of argv) {
    if (arg === '--all') out.all = true;
    else if (arg === '--pandoc') out.pandoc = true;
    else if (arg === '--full-module') out.fullModule = true;
    else if (arg.startsWith('--file=')) out.file = arg.slice('--file='.length);
    else if (arg.startsWith('--out=')) out.outDir = path.resolve(arg.slice('--out='.length));
    else if (arg.startsWith('--layout=')) out.layout = arg.slice('--layout='.length);
    else if (arg.startsWith('--format=')) out.format = arg.slice('--format='.length);
    else if (arg.startsWith('--story=')) out.storyPath = arg.slice('--story='.length);
    else if (arg.startsWith('--pages=')) out.storyPath = arg.slice('--pages='.length);
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
  const adventure = loadAdventure(mdPath, { storyPath: opts.storyPath });
  const base = path.basename(adventure.mdPath, '.md');
  fs.mkdirSync(opts.outDir, { recursive: true });
  const suffix = opts.format === 'book' ? '-book' : '';
  const outPath = path.join(opts.outDir, `${base}${suffix}.docx`);

  if (opts.format === 'book') {
    const buf = await renderBookDocx(adventure, { includeBackMatter: opts.fullModule });
    fs.writeFileSync(outPath, buf);
    console.log('Book layout DOCX:', outPath);
    console.log(
      `  Story: ${adventure.summary.storyPageCount} pages (pp ${adventure.summary.storyFirstPage}–${adventure.summary.storyLastPage}); ` +
        (opts.fullModule
          ? `back matter pp ${adventure.summary.backMatterFirstPage}–${adventure.summary.modulePageCount}`
          : 'back matter omitted (use --full-module)')
    );
    if (adventure.storyPath) console.log('  Story JSON:', adventure.storyPath);
    for (const w of adventure.warnings) console.warn('  warn:', w);
    return outPath;
  }

  if (opts.pandoc) {
    try {
      exportWithPandoc(adventure.mdPath, outPath);
      console.log('Pandoc:', outPath);
      return outPath;
    } catch (e) {
      console.warn('Pandoc failed, falling back to docx builder:', e.message);
    }
  }

  const buf = await renderDraftDocx(adventure, { layout: opts.layout });
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
