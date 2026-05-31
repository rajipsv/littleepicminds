/**
 * Build handcrafted-style theme stories from clusters + verse data.
 */
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const CHAPTERS_DIR = path.join(ROOT, 'lib', 'data', 'chapters');

const KIDS = ['Riya', 'Arjun', 'Maya', 'Dev', 'Anika', 'Kiran', 'Priya', 'Sia'];
const EMOJIS = ['🌱', '📖', '💡', '🌟', '🎯', '🛡️', '⚖️', '🔥', '🌳', '✨', '☀️', '🧘', '👀', '😢', '🌿', '💪'];

function loadChapter(ch) {
  const mod = require(path.join(CHAPTERS_DIR, `chapter${ch}.js`));
  const keys = Object.keys(mod);
  if (keys.some((k) => /^\d+\.\d+$/.test(k))) return mod;
  const key = keys.find((k) => k.startsWith('CHAPTER_'));
  return mod[key] || mod;
}

function getVerses(ch, shlokaIds) {
  const data = loadChapter(ch);
  return shlokaIds.map((id) => ({ id, ...(data[id] || {}) }));
}

function shlokaKey(arr) {
  return [...arr].sort().join('|');
}

function overlapScore(a, b) {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x)).length;
}

/** Find best existing theme by shloka overlap */
function findExistingTheme(themesByLevel, level, shlokas) {
  const list = themesByLevel[level]?.gita || {};
  const exactKey = shlokaKey(shlokas);
  for (const themes of Object.values(list)) {
    if (!Array.isArray(themes)) continue;
    for (const t of themes) {
      if (shlokaKey(t.shlokas || []) === exactKey) return t;
    }
  }
  let best = null;
  let bestScore = 0;
  for (const themes of Object.values(list)) {
    if (!Array.isArray(themes)) continue;
    for (const t of themes) {
      const score = overlapScore(shlokas, t.shlokas || []);
      if (score >= 2 && score > bestScore) {
        bestScore = score;
        best = t;
      }
    }
  }
  return best;
}

function ideaToTitle(idea) {
  if (!idea) return 'A Lesson from the Gita';
  return idea.length < 40 ? idea : idea.split('—')[0].trim();
}

function generateSeedsStory(cluster, ch, verses, idx) {
  const kid = KIDS[idx % KIDS.length];
  const teachings = verses
    .map((v) => v.en?.childMeaning || v.en?.meaning)
    .filter(Boolean)
    .join(' ');
  const teachingsTe = verses
    .map((v) => v.te?.childMeaning || v.te?.meaning)
    .filter(Boolean)
    .join(' ');
  const storyTitle = `${kid}'s Choice`;
  const title = ideaToTitle(cluster.idea);
  const content = `${kid} had a school day that tested something important. ${teachings ? `In the Gita, Chapter ${ch} teaches: ${teachings.slice(0, 200)}${teachings.length > 200 ? '...' : ''} ` : ''}${kid} felt unsure at first, then took a deep breath and chose kindness and courage. That evening, ${kid} felt peaceful inside—not because everyone cheered, but because the heart knew the choice was right.`;
  const contentTe = teachingsTe
    ? `${kid}కి పాఠశాలలో ఒక ముఖ్యమైన పాఠం వచ్చింది. అధ్యాయం ${ch} బోధన: ${teachingsTe.slice(0, 180)}... ${kid} మొదట సంకోచించాడు, తర్వాత లోతైన శ్వాస తీసుకుని దయ మరియు ధైర్యం ఎంచుకున్నాడు.`
    : `${kid}కి పాఠశాలలో ఒక ముఖ్యమైన పాఠం వచ్చింది. ${kid} మొదట సంకోచించాడు, తర్వాత సరైనది చేశాడు.`;
  return {
    title,
    title_te: cluster.ideaTe || title,
    emoji: EMOJIS[idx % EMOJIS.length],
    micro_theme: cluster.idea,
    micro_theme_te: cluster.ideaTe || cluster.idea,
    storyTitle,
    storyTitle_te: `${kid} యొక్క ఎంపిక`,
    content,
    content_te: contentTe,
    moral: cluster.moral || `Remember: ${cluster.idea}.`,
    moral_te: cluster.moralTe || cluster.idea,
    activity: `Draw how ${kid} made a good choice today.`,
    activity_te: `${kid} ఈరోజు మంచి ఎంపిక ఎలా చేసాడో బొమ్మ గీయండి.`,
  };
}

function generateSeekersStory(cluster, ch, verses, idx) {
  const teachings = verses
    .map((v) => v.en?.childMeaning || v.en?.meaning)
    .filter(Boolean)
    .join(' ');
  const teachingsTe = verses
    .map((v) => v.te?.childMeaning || v.te?.meaning)
    .filter(Boolean)
    .join(' ');
  const title = ideaToTitle(cluster.idea);
  const storyTitle = `Verses ${cluster.shlokas.join(', ')}`;
  const content = `On the field of Kurukshetra, Arjuna listened as Krishna explained ideas for Chapter ${ch}. ${teachings ? `These verses teach: ${teachings.slice(0, 280)}${teachings.length > 280 ? '...' : ''} ` : ''}Students today face smaller battles—fairness, fear, friendship—and the same wisdom can guide a steady heart.`;
  const contentTe = teachingsTe
    ? `కురుక్షేత్రంలో అర్జునుడు అధ్యాయం ${ch} బోధన వింటూ ఉన్నాడు: ${teachingsTe.slice(0, 220)}... ఈ రోజు విద్యార్థులు ఎదుర్కొనే సవాళ్లకు ఈ జ్ఞానం దీపంలా.`
    : `అధ్యాయం ${ch}లో కృష్ణుడు అర్జునుడికి మార్గం చూపించాడు.`;
  return {
    title,
    title_te: cluster.ideaTe || title,
    emoji: EMOJIS[idx % EMOJIS.length],
    micro_theme: cluster.idea,
    micro_theme_te: cluster.ideaTe || cluster.idea,
    storyTitle,
    storyTitle_te: `శ్లోకాలు ${cluster.shlokas.join(', ')}`,
    content,
    content_te: contentTe,
    moral: cluster.moral || cluster.idea,
    moral_te: cluster.moralTe || cluster.idea,
    activity: `Write three sentences: how does "${cluster.idea}" help you this week?`,
    activity_te: `"${cluster.idea}" ఈ వారం మీకు ఎలా సహాయపడుతుందో మూడు వాక్యాలు రాయండి.`,
  };
}

function themeFromExisting(existing) {
  return {
    title: existing.title,
    title_te: existing.title_te || existing.title,
    emoji: existing.emoji || '📖',
    micro_theme: existing.micro_theme,
    micro_theme_te: existing.micro_theme_te || existing.micro_theme,
    storyTitle: existing.story?.title || existing.title,
    storyTitle_te: existing.story?.title_te || existing.story?.title || existing.title,
    content: existing.story?.content || '',
    content_te: existing.story?.content_te || existing.story?.content || '',
    moral: existing.story?.moral || existing.micro_theme,
    moral_te: existing.story?.moral_te || existing.micro_theme_te || existing.micro_theme,
    activity: existing.activity || '',
    activity_te: existing.activity_te || existing.activity || '',
  };
}

function themeFromUpdateTheme(ut) {
  return {
    title: ut.title,
    title_te: ut.title,
    emoji: ut.emoji || '📖',
    micro_theme: ut.micro_theme,
    micro_theme_te: ut.micro_theme,
    storyTitle: ut.story?.title || ut.title,
    storyTitle_te: ut.story?.title || ut.title,
    content: ut.story?.content || '',
    content_te: ut.story?.content || '',
    moral: ut.story?.moral || ut.micro_theme,
    moral_te: ut.story?.moral || ut.micro_theme,
    activity: ut.activity || '',
    activity_te: ut.activity || '',
  };
}

function scenarioToAuthored(scenario, cluster) {
  return {
    title: scenario.title,
    title_te: scenario.title_te,
    emoji: scenario.emoji,
    micro_theme: cluster.idea,
    micro_theme_te: cluster.ideaTe || cluster.idea,
    storyTitle: scenario.storyTitle,
    storyTitle_te: scenario.storyTitle_te,
    content: scenario.content,
    content_te: scenario.content_te,
    moral: cluster.moral || cluster.idea,
    moral_te: cluster.moralTe || cluster.ideaTe || cluster.idea,
    activity: scenario.activity,
    activity_te: scenario.activity_te,
  };
}

function buildAuthoredEntry(clusterId, cluster, ch, level, idx, sources) {
  const verses = getVerses(ch, cluster.shlokas);
  const key = shlokaKey(cluster.shlokas);

  if (sources.getMoralStory) {
    const scenario = sources.getMoralStory(cluster.idea, level, idx);
    if (scenario?.content && scenario.content.length > 120) {
      return { id: clusterId, ...scenarioToAuthored(scenario, cluster) };
    }
  }

  if (sources.updateByKey[key]) {
    return { id: clusterId, ...themeFromUpdateTheme(sources.updateByKey[key]) };
  }
  const existing = findExistingTheme(sources.themes, level, cluster.shlokas);
  if (existing && existing.story?.content && !existing.story.content.includes('One ordinary school day became special for Arjun')) {
    return { id: clusterId, ...themeFromExisting(existing) };
  }
  const gen =
    level === 'seeds'
      ? generateSeedsStory(cluster, ch, verses, idx)
      : generateSeekersStory(cluster, ch, verses, idx);
  return { id: clusterId, ...gen };
}

module.exports = {
  buildAuthoredEntry,
  shlokaKey,
  getVerses,
  KIDS,
  EMOJIS,
};
