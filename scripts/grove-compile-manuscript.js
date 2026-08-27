#!/usr/bin/env node
const { loadAdventure, compileManuscript, findManuscriptById } = require('./lib/grove-manuscript');

function parseArgs(argv) {
  const out = { id: null, file: null, dryRun: false };
  for (const arg of argv) {
    if (arg === '--dry-run') out.dryRun = true;
    else if (arg.startsWith('--id=')) out.id = arg.slice('--id='.length);
    else if (arg.startsWith('--file=')) out.file = arg.slice('--file='.length);
  }
  return out;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  let mdPath = opts.file;
  if (!mdPath && opts.id) {
    mdPath = findManuscriptById(opts.id);
    if (!mdPath) {
      console.error('No manuscript for', opts.id);
      process.exit(1);
    }
  }
  if (!mdPath) {
    console.error('Usage: node scripts/grove-compile-manuscript.js --id=gv01_a1');
    process.exit(1);
  }

  const adventure = loadAdventure(mdPath);
  const result = compileManuscript(adventure, { write: !opts.dryRun });
  console.log(opts.dryRun ? 'Dry run — story section preview:' : 'Compiled:', result.mdPath);
  if (opts.dryRun) {
    const match = result.md.match(/## Story[\s\S]*?(?=\n## Moral)/);
    console.log(match ? match[0] : '(no story section)');
  }
}

main();
