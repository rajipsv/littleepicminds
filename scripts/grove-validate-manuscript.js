#!/usr/bin/env node
const { loadAdventure, validateAdventure, validateAllManuscripts, findManuscriptById } = require('./lib/grove-manuscript');

function parseArgs(argv) {
  const out = { id: null, all: false };
  for (const arg of argv) {
    if (arg === '--all') out.all = true;
    else if (arg.startsWith('--id=')) out.id = arg.slice('--id='.length);
    else if (arg.startsWith('--file=')) out.file = arg.slice('--file='.length);
  }
  return out;
}

function printResult(result) {
  console.log(`${result.adventureId}: ${result.ok ? 'OK' : 'FAIL'}`);
  if (result.summary) {
    console.log(
      `  story ${result.summary.storyPageCount} pp (${result.summary.storyFirstPage}–${result.summary.storyLastPage}); back matter ${result.summary.backMatterPageCount} pages`
    );
  }
  for (const e of result.errors) console.error('  error:', e);
  for (const w of result.warnings) console.warn('  warn:', w);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  let results = [];
  if (opts.all) {
    results = validateAllManuscripts();
  } else if (opts.file) {
    results = [validateAdventure(opts.file)];
  } else if (opts.id) {
    const md = findManuscriptById(opts.id);
    if (!md) {
      console.error('No manuscript for', opts.id);
      process.exit(1);
    }
    results = [validateAdventure(md)];
  } else {
    console.error('Usage: node scripts/grove-validate-manuscript.js --id=gv01_a1');
    console.error('       node scripts/grove-validate-manuscript.js --all');
    process.exit(1);
  }

  for (const r of results) printResult(r);
  if (results.some((r) => !r.ok)) process.exit(1);
}

main();
