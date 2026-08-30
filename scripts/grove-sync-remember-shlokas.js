#!/usr/bin/env node
/**
 * Sync Grove Remember ślokas from lib/data/chapters (or MCP fallback) into manuscript .md.
 *
 * Usage:
 *   node scripts/grove-sync-remember-shlokas.js --id=gv01_a1
 *   node scripts/grove-sync-remember-shlokas.js --file=docs/books/gv01_a1-too-much-at-once.md
 *   node scripts/grove-sync-remember-shlokas.js --id=gv01_a1 --source=mcp
 */
const fs = require('fs');
const path = require('path');
const { resolveVerses } = require('./lib/grove-verse-source');

const ROOT = path.join(__dirname, '..');
const CURRICULUM_PATH = path.join(ROOT, 'scripts/data/gita-grove-curriculum.json');

function parseArgs(argv) {
  const out = { id: null, file: null, source: 'repo', dryRun: false };
  for (const arg of argv) {
    if (arg.startsWith('--id=')) out.id = arg.slice(5).toLowerCase();
    else if (arg.startsWith('--file=')) out.file = arg.slice(7);
    else if (arg.startsWith('--source=')) out.source = arg.slice(9);
    else if (arg === '--dry-run') out.dryRun = true;
  }
  return out;
}

function loadCurriculum() {
  return JSON.parse(fs.readFileSync(CURRICULUM_PATH, 'utf8'));
}

function findManuscript(adventureId) {
  const dir = path.join(ROOT, 'docs/books');
  const id = adventureId.toLowerCase();
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(`${id}-`) && f.endsWith('.md') && !f.endsWith('-delivery.md'));
  if (files.length === 0) throw new Error(`No manuscript for ${adventureId} in docs/books/`);
  return path.join(dir, files[0]);
}

function extractRememberLine(md) {
  const m = md.match(/### Page \d+ — Remember line\s*\r?\n\r?\n([\s\S]*?)(?=\r?\n---|\r?\n## )/);
  return m ? m[1].trim() : '';
}

function renderVerseBlock(pageNum, verse) {
  const lines = [
    `### Page ${pageNum} — Śloka ${verse.id}`,
    '',
    `<!-- verse-source: ${verse.source} -->`,
    '',
  ];
  if (verse.sanskrit) {
    lines.push(verse.sanskrit, '');
  }
  lines.push(`\`${verse.transliteration.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()}\``, '');
  lines.push(`**Child meaning:** ${verse.childMeaning}`, '');
  return lines.join('\n');
}

function buildRememberSection(verseIds, verses, rememberLine, startPage = 17) {
  const blocks = ['## Remember', ''];
  verses.forEach((v, i) => {
    blocks.push(renderVerseBlock(startPage + i, v));
  });
  const rememberPage = startPage + verses.length;
  blocks.push(
    `### Page ${rememberPage} — Remember line`,
    '',
    rememberLine || '[Remember line — book voice; tie to adventure childConnection]',
    ''
  );
  return blocks.join('\n');
}

function replaceRememberSection(md, newSection) {
  const sectionStart = md.indexOf('## Remember');
  if (sectionStart === -1) throw new Error('Could not find ## Remember in manuscript');
  const tail = md.slice(sectionStart);
  const practiceMatch = tail.match(/\r?\n## Practice\r?\n/);
  if (!practiceMatch) throw new Error('Could not find ## Practice after Remember');
  const practiceStart = sectionStart + practiceMatch.index + 1;
  const before = md.slice(0, sectionStart);
  const after = md.slice(practiceStart);
  const separator = after.startsWith('---') ? '' : '---\n\n';
  return `${before}${newSection.trimEnd()}\n\n${separator}${after}`;
}

function updateCurriculum(adventureId, verses, source) {
  const data = loadCurriculum();
  const entry = data.adventures.find((a) => a.adventureId === adventureId);
  if (!entry) throw new Error(`No curriculum entry for ${adventureId}`);
  entry.shlokas = verses.map((v) => v.id);
  entry.shlokasStatus = source === 'mcp' ? 'verified-mcp' : 'verified-repo';
  fs.writeFileSync(CURRICULUM_PATH, `${JSON.stringify(data, null, 2)}\n`);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.id && !opts.file) {
    console.error('Usage: node scripts/grove-sync-remember-shlokas.js --id=gv01_a1');
    process.exit(1);
  }

  const curriculum = loadCurriculum();
  let adventureId = opts.id;
  let mdPath = opts.file ? path.resolve(opts.file) : null;

  if (!mdPath) mdPath = findManuscript(adventureId);
  if (!adventureId) {
    const m = fs.readFileSync(mdPath, 'utf8').match(/`(gv\d+_a\d+)`/i);
    adventureId = m ? m[1].toLowerCase() : null;
  }
  if (!adventureId) throw new Error('Could not determine adventureId');

  const entry = curriculum.adventures.find((a) => a.adventureId === adventureId);
  if (!entry?.shlokas?.length) throw new Error(`No shlokas on curriculum entry ${adventureId}`);

  const md = fs.readFileSync(mdPath, 'utf8');
  const rememberLine = extractRememberLine(md) || entry.rememberLine || '';

  const verses = await resolveVerses(entry.shlokas, {
    prefer: opts.source === 'mcp' ? 'mcp' : 'repo',
    fallback: true,
  });

  const newSection = buildRememberSection(entry.shlokas, verses, rememberLine);
  const updated = replaceRememberSection(md, newSection);

  console.log(`${adventureId} · Remember sync (${verses.map((v) => `${v.id} via ${v.resolvedVia}`).join(', ')})`);

  if (opts.dryRun) {
    console.log('\n--- preview ---\n');
    console.log(newSection);
    return;
  }

  fs.writeFileSync(mdPath, updated);
  updateCurriculum(adventureId, verses, verses[0]?.resolvedVia || 'repo');
  console.log('Updated:', mdPath);
  console.log('Updated:', CURRICULUM_PATH);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
