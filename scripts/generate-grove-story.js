#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  findManuscriptById,
  buildStoryGenerationPrompt,
  scaffoldStoryJson,
} = require('./lib/grove-manuscript');

const ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const out = { id: null, writePrompt: false, writeScaffold: false };
  for (const arg of argv) {
    if (arg === '--write-prompt') out.writePrompt = true;
    if (arg === '--write-scaffold') out.writeScaffold = true;
    else if (arg.startsWith('--id=')) out.id = arg.slice('--id='.length);
  }
  return out;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.id) {
    console.error('Usage: node scripts/generate-grove-story.js --id=gv01_a3 [--write-prompt] [--write-scaffold]');
    process.exit(1);
  }

  const mdPath = findManuscriptById(opts.id);
  if (!mdPath) {
    console.error('No manuscript markdown yet for', opts.id, '— create docs/books/{id}-slug.md first');
    process.exit(1);
  }

  const prompt = buildStoryGenerationPrompt(opts.id);
  console.log(prompt);

  if (opts.writePrompt) {
    const outDir = path.join(ROOT, 'output', 'grove');
    fs.mkdirSync(outDir, { recursive: true });
    const promptPath = path.join(outDir, `${opts.id}-story-prompt.md`);
    fs.writeFileSync(promptPath, prompt, 'utf8');
    console.error('\nWrote prompt:', promptPath);
  }

  if (opts.writeScaffold) {
    const { outPath, scaffold } = scaffoldStoryJson(opts.id, mdPath);
    if (fs.existsSync(outPath)) {
      console.error('Story JSON already exists:', outPath);
      process.exit(1);
    }
    fs.writeFileSync(outPath, `${JSON.stringify(scaffold, null, 2)}\n`, 'utf8');
    console.error('Wrote scaffold:', outPath);
  }
}

main();
