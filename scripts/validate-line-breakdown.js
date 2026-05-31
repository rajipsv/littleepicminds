/**
 * Validate lineBreakdown (4 pada rows + chantIntro) against chapter 1–2 rules.
 *
 *   npm run gita:validate-line-breakdown
 *   npm run gita:validate-line-breakdown -- --chapter=3
 *   npm run gita:validate-line-breakdown -- --from=3 --to=9
 */
const path = require('path');
const {
  extractSpeakerPrefix,
  splitTransliterationPadas,
  LINES_PER_SHLOKA,
} = require('./gita-line-breakdown');
const { getVersePadaOverride, loadPadaLinesFile } = require('../lib/gita-pada-lines');

const BACKEND_DATA = path.join(__dirname, '..', 'backend', 'data');
const chaptersConfig = require(path.join(BACKEND_DATA, 'chapters.json'));
const UVACA_IN_LINE = /\s+uv[aā\u0101]ch?a[cḥ]?\s*/i;

function parseRangeArgs() {
  const fromArg = process.argv.find((a) => a.startsWith('--from='));
  const toArg = process.argv.find((a) => a.startsWith('--to='));
  const chArg = process.argv.find((a) => a.startsWith('--chapter='));
  if (chArg) {
    const n = parseInt(chArg.split('=')[1], 10);
    return { from: n, to: n };
  }
  return {
    from: fromArg ? parseInt(fromArg.split('=')[1], 10) : 1,
    to: toArg ? parseInt(toArg.split('=')[1], 10) : 18,
  };
}

function normIast(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[āàáâãäå]/g, 'a')
    .replace(/[īìíîï]/g, 'i')
    .replace(/[ūùúûü]/g, 'u')
    .replace(/ś/g, 's')
    .replace(/ṣ/g, 's')
    .replace(/ñ/g, 'n')
    .replace(/ḥ/g, 'h')
    .replace(/[ṁṃ]/g, 'm')
    .replace(/[.,|]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function rowIast(row) {
  return (row?.transliteration || row?.word || '').trim();
}

function hasSpeakerInText(text) {
  const t = String(text || '').trim();
  if (!t) return false;
  const first = splitTransliterationPadas(t)[0] || t.split(/\s+/).slice(0, 3).join(' ');
  return UVACA_IN_LINE.test(first) || UVACA_IN_LINE.test(t);
}

function expectedFromVerse(transliteration, intro) {
  const { speaker, bodyPadas } = extractSpeakerPrefix(transliteration);
  const parts = [];
  if (speaker || intro) parts.push(normIast(speaker || intro));
  for (const p of bodyPadas) {
    if (p.trim()) parts.push(normIast(p));
  }
  return parts.filter(Boolean).join(' ');
}

function actualFromBreakdown(rows, chantIntro) {
  const parts = [];
  if (chantIntro?.transliteration) parts.push(normIast(chantIntro.transliteration));
  for (const row of rows || []) {
    const t = rowIast(row);
    if (t) parts.push(normIast(t));
  }
  return parts.filter(Boolean).join(' ');
}

function validateVerse(verseId, shloka, padaOverride) {
  const issues = [];
  const rows = shloka.lineBreakdown || shloka.word_by_word || [];
  const intro = shloka.chantIntro;
  const trans = (shloka.transliteration || '').trim();
  const { speaker } = extractSpeakerPrefix(trans);

  if (rows.length !== LINES_PER_SHLOKA) {
    issues.push(`rowCount:${rows.length}`);
  }

  for (let i = 0; i < rows.length; i++) {
    if (!rowIast(rows[i])) issues.push(`emptyIast:row${i}`);
  }

  const row0 = rowIast(rows[0]);
  if (speaker && !intro) {
    issues.push('speakerOnRow0:noChantIntro');
  }
  if (intro && row0 && hasSpeakerInText(row0)) {
    issues.push('introOnRow:row0HasUvaca');
  }
  if (!intro && row0 && hasSpeakerInText(row0) && speaker) {
    issues.push('speakerOnRow0:embedded');
  }

  if (trans && rows.length === LINES_PER_SHLOKA) {
    const exp = expectedFromVerse(trans, intro?.transliteration);
    const act = actualFromBreakdown(rows, intro);
    if (exp && act) {
      const expTok = exp.split(' ').filter(Boolean);
      const actTok = act.split(' ').filter(Boolean);
      const expJoin = expTok.join(' ');
      const actJoin = actTok.join(' ');
      if (expJoin !== actJoin && !actJoin.includes(expJoin) && !expJoin.includes(actJoin)) {
        const overlap =
          expTok.filter((t) => actTok.includes(t)).length / Math.max(expTok.length, 1);
        if (overlap < 0.45) issues.push('padaMismatch');
      }
    }
  }

  if (!padaOverride?.lines?.length && speaker) {
    issues.push('missingPadaOverride');
  }

  if (padaOverride?.intro && !intro) {
    issues.push('padaIntroNotApplied');
  }

  return issues;
}

function main() {
  const { from, to } = parseRangeArgs();
  loadPadaLinesFile();
  const byIssue = {};
  const failures = [];

  for (const chMeta of chaptersConfig.chapters) {
    const ch = chMeta.id;
    if (ch < from || ch > to) continue;
    delete require.cache[require.resolve(path.join(BACKEND_DATA, 'chapters', `chapter${ch}.js`))];
    const chapter = require(path.join(BACKEND_DATA, 'chapters', `chapter${ch}.js`));
    let chFail = 0;

    for (const [verseId, shloka] of Object.entries(chapter)) {
      if (!/^\d+\.\d+$/.test(verseId)) continue;
      const pada = getVersePadaOverride(verseId);
      const issues = validateVerse(verseId, shloka, pada);
      if (!issues.length) continue;
      chFail++;
      failures.push({ verseId, issues });
      for (const iss of issues) {
        byIssue[iss] = (byIssue[iss] || 0) + 1;
      }
    }
    console.log(`Chapter ${ch}: ${chMeta.count} verses, ${chFail} with issues`);
  }

  console.log('\nIssue counts:');
  for (const [k, v] of Object.entries(byIssue).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }

  if (failures.length <= 40) {
    console.log('\nFailing verses:');
    for (const f of failures) {
      console.log(`  ${f.verseId}: ${f.issues.join(', ')}`);
    }
  } else {
    console.log(`\n${failures.length} failing verses (first 30):`);
    failures.slice(0, 30).forEach((f) => console.log(`  ${f.verseId}: ${f.issues.join(', ')}`));
  }

  if (Object.keys(byIssue).length) process.exit(1);
  console.log('\nAll checks passed.');
}

main();
