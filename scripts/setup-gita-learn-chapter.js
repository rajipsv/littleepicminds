/**
 * One-shot Learn-step setup for a chapter (HF chant URLs → pada export → breakdown → timings).
 *
 *   npm run gita:learn:setup -- --chapter=2
 *   npm run gita:learn:setup -- --chapter=2 --force   # refresh gita-pada-lines.json entries
 *   npm run gita:learn:setup -- --chapter=2 --skip-hf # skip HF URL refresh
 */
const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function parseChapterArg() {
  const arg = process.argv.find((a) => a.startsWith('--chapter='));
  if (!arg) {
    console.error('Usage: npm run gita:learn:setup -- --chapter=N [--force]');
    process.exit(1);
  }
  return arg.split('=')[1];
}

function run(cmd) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

function main() {
  const ch = parseChapterArg();
  const force = process.argv.includes('--force') ? ' --force' : '';
  if (!process.argv.includes('--skip-hf')) {
    run(`npm run gita:sync-hf-audio -- --urls-only --chapter=${ch}`);
  }
  run(`npm run gita:pada-lines:export -- --chapter=${ch}${force}`);
  run(`npm run gita:line-breakdown -- --chapter=${ch}`);
  run(`npm run gita:line-timings -- --chapter=${ch}`);
  console.log(
    `\n✅ Chapter ${ch} Learn setup done (Dhruv HF URLs + pada lines + line timings).` +
      ` Edit scripts/data/gita-pada-lines.json meanings if needed, then re-run gita:line-breakdown.`
  );
}

main();
