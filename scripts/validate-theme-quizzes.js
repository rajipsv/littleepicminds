/**
 * Report theme quiz coverage: 5 story + 5 per shloka (N shlokas varies by theme).
 * Run: node scripts/validate-theme-quizzes.js
 * Warnings only — does not exit 1 (many themes still migrating).
 */
const fs = require('fs');
const path = require('path');

const CLUSTERS_PATH = path.join(__dirname, 'data', 'gita-theme-clusters.json');
const AUTHORED_PATH = path.join(__dirname, 'data', 'gita-theme-stories-authored.json');
const { DATA_DIR } = require('./lib/data-dir');
const CHAPTERS_DIR = path.join(DATA_DIR, 'chapters');

const STORY_Q = 5;
const SHLOKA_Q = 5;

function loadChapter(ch) {
  return require(path.join(CHAPTERS_DIR, `chapter${ch}.js`));
}

function countShlokaQuestions(shloka, level) {
  const ex = shloka?.exercises?.[level];
  if (!ex) return 0;
  return Array.isArray(ex) ? ex.length : 1;
}

function main() {
  const clusters = JSON.parse(fs.readFileSync(CLUSTERS_PATH, 'utf8'));
  const authored = JSON.parse(fs.readFileSync(AUTHORED_PATH, 'utf8')).stories || {};
  const warnings = [];
  let complete = 0;
  let total = 0;

  for (const [ch, data] of Object.entries(clusters.gita)) {
    const chapterData = loadChapter(ch);
    for (const level of ['seeds', 'seekers']) {
      const prefix = level === 'seeds' ? 'sd' : 'sk';
      for (const cluster of data[level] || []) {
        const id = cluster.id;
        if (!id) continue;
        total++;
        const story = authored[id];
        const shlokas = cluster.shlokas || [];
        const storyN = story?.storyQuiz?.length || 0;
        const shlokaCounts = shlokas.map((sid) => ({
          sid,
          n: countShlokaQuestions(chapterData[sid], level),
        }));
        const expectedTotal = STORY_Q + shlokas.length * SHLOKA_Q;
        const actualTotal = storyN + shlokaCounts.reduce((a, x) => a + x.n, 0);
        const ok =
          storyN === STORY_Q &&
          shlokaCounts.every((x) => x.n === SHLOKA_Q);

        if (ok) {
          complete++;
        } else {
          const parts = [];
          if (storyN !== STORY_Q) parts.push(`storyQuiz ${storyN}/${STORY_Q}`);
          for (const { sid, n } of shlokaCounts) {
            if (n !== SHLOKA_Q) parts.push(`${sid} ${n}/${SHLOKA_Q}`);
          }
          warnings.push(`${id} (${shlokas.length} shlokas, ${actualTotal}/${expectedTotal} Q): ${parts.join(', ')}`);
        }
      }
    }
  }

  console.log(`Theme quizzes: ${complete}/${total} complete (${STORY_Q} story + ${SHLOKA_Q} × each shloka)`);
  if (warnings.length) {
    console.warn(`Incomplete (${warnings.length}):`);
    warnings.slice(0, 20).forEach((w) => console.warn(`  ${w}`));
    if (warnings.length > 20) console.warn(`  ... and ${warnings.length - 20} more`);
  } else {
    console.log('✅ All theme quizzes meet the 5 + 5×N pattern');
  }
}

main();
