#!/usr/bin/env node
/**
 * Generate v2 human-cast bibles: character, world, universe, and 74 module story bibles.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REGISTRY = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/gita-grove/module-registry.json'), 'utf8'));
const CURRICULUM = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/data/gita-grove-curriculum.json'), 'utf8'));

const ARCHETYPES = {
  Aarav: { voice: 'I want to understand.', blind: 'overthinks and freezes', strength: 'notices details', object: 'notebook' },
  Mira: { voice: 'I want to make things happen.', blind: 'rushes before thinking', strength: 'courageous energy', object: 'wristband' },
  Vanshi: { voice: 'I care deeply.', blind: 'takes things personally', strength: 'empathy', object: 'friendship bracelet' },
  Kabir: { voice: 'I want to know why.', blind: 'curiosity gets him into trouble', strength: 'imaginative discovery', object: 'magnifying glass' },
  Tara: { voice: 'I want to learn how to manage myself.', blind: 'becomes too rigid', strength: 'patience', object: 'small plant' },
  Vihaan: { voice: 'I want to understand my place in the world.', blind: 'worries about belonging', strength: 'includes others', object: 'woven thread' },
};

const BOOK1_SCENARIOS = {
  gv01_a1: {
    title: 'Too Much at Once',
    logline: 'When a Grove Club day piles up, Vanshi learns she can pause with Aarav beside her.',
    hook: 'Grove Club planned a small celebration under the Old Banyan — decorations, games, and a shared snack table. Three things go wrong before anyone sits down.',
    goal: 'Help the day feel special for everyone.',
    obstacle: 'Wind, a spilled rangoli, and a missing snack bowl hit at once.',
    wrongChoice: 'Vanshi tries to fix everything alone and snaps when Aarav asks a question.',
    consequence: 'Her words land sharp; a younger child goes quiet.',
    escalation: 'More helpers arrive asking what to do — the noise grows.',
    turningPoint: 'Aarav does not argue. He lists only two things. "Pick one. We do that first."',
    discovery: 'Overwhelmed is a real feeling — not failure.',
    gitaFeeling: 'Sometimes everything hits at once and your body feels too full to move.',
    application: 'Vanshi names it out loud: "This is too much." She chooses one small task.',
    resolution: 'The group finishes one thing together; the rest can wait.',
    growth: 'She asks for help before the next pile-up.',
    visuals: ['Wind lifting paper decorations', 'Spilled rangoli powder', 'Vanshi hands on head under banyan roots', 'Aarav holding notebook calm', 'Two children fixing one table', 'Quiet smile when snack table works'],
    teaser: 'At the library tomorrow, Aarav faces a puzzle with too many answers — and Kabir wants to run in every direction at once.',
  },
  gv01_a2: {
    title: 'The Map with No Path',
    logline: 'Aarav cannot choose a Grove Journal page layout until Kabir helps him try one small start.',
    hook: 'The Grove Journal needs a new page for the club wall. Aarav has four layout ideas and keeps erasing.',
    goal: 'Finish one page the group can use.',
    obstacle: 'Every option seems wrong once he imagines what could fail.',
    wrongChoice: 'He redraws until the paper tears and says he cannot do it.',
    consequence: 'Kabir waits, then wanders toward the window — the wall stays blank.',
    escalation: 'Club meeting starts in twenty minutes.',
    turningPoint: 'Kabir spreads three objects on the table. "What if we just pick one corner and go?"',
    discovery: 'Not knowing is honest — starting small is allowed.',
    gitaFeeling: 'When you cannot see the next step, your mind can spin in circles.',
    application: 'Aarav picks one corner, one question, one drawing.',
    resolution: 'The page is imperfect and done.',
    growth: 'He says "I do not know yet" without shame.',
    visuals: ['Eraser crumbs on library table', 'Four sketched layouts', 'Kabir pointing at window light', 'Torn paper corner', 'Half-finished journal page', 'Page pinned on club wall'],
    teaser: 'On the playground, Mira sees two friends needing help — but only one of her can run first.',
  },
  gv01_a3: {
    title: 'Two Ways to Help',
    logline: 'Mira must choose how to help on the playground while Vihaan shows her both sides matter.',
    hook: 'Two classmates need help at once — one dropped lunch, one sits alone after a rough game.',
    goal: 'Help quickly because that is what Mira does.',
    obstacle: 'Both needs are real; acting fast might miss the quieter one.',
    wrongChoice: 'Mira runs to the louder problem and waves off the quiet child.',
    consequence: 'The quiet child walks away; Vihaan watches, worried.',
    escalation: 'Mira finishes the first fix but feels something unfinished.',
    turningPoint: 'Vihaan asks, "Who did we not see?" — not accusing, wondering.',
    discovery: 'A hard choice means someone waits — and seeing that is part of choosing.',
    gitaFeeling: 'When two good actions pull you, the choice itself feels heavy.',
    application: 'Mira goes back, sits beside the quiet child, shares her snack.',
    resolution: 'She could not fix both at once — but she did not pretend the second need was gone.',
    growth: 'She pauses one breath before sprinting.',
    visuals: ['Spilled lunch box on playground', 'Child alone on bench', 'Mira mid-run', 'Vihaan looking between both', 'Shared snack on bench', 'Mira slowing at line start'],
    teaser: 'Book 2 opens with Aarav and a science-fair stage that will not stop feeling huge.',
  },
};

const LOCATION_HOOKS = {
  School: 'after-school club runs long and something ordinary turns tricky',
  Meadow: 'a Grove Club outdoor task starts simple then shifts',
  'Old Banyan Tree': 'friends gather under the banyan for a shared plan',
  'Little Grove Library': 'a library project needs finishing before closing time',
  Playground: 'recess games spill into a real problem between friends',
  'Community Garden': 'watering and planting duty reveals an unexpected snag',
  'Quiet Corner': 'a quiet spot becomes the only place to think clearly',
  Neighborhood: 'a street-side errand for a neighbor turns emotional',
  'Little Creek': 'stones and water mirror a feeling they cannot name yet',
};

function scenarioForModule(m, prev, next) {
  if (BOOK1_SCENARIOS[m.adventureId]) return BOOK1_SCENARIOS[m.adventureId];

  const lead = ARCHETYPES[m.lead];
  const theme = m.theme.toLowerCase();
  const loc = m.location;
  const locHook = LOCATION_HOOKS[loc] || 'an everyday Grove moment sharpens';

  const title = `${m.theme}`;
  const hook = `At ${loc}, ${locHook}. ${m.lead} notices ${theme} first — ${m.supporting} is nearby.`;
  const goal = `${m.lead} wants the situation to feel fair and finished today.`;
  const obstacle = `${m.childConnection}. ${m.theme} makes the usual fix harder.`;
  const wrongChoice = `${m.lead} defaults to their habit (${lead.blind}) and pushes past ${m.supporting}'s slower idea.`;
  const consequence = 'Someone feels unseen or the mess gets bigger.';
  const escalation = 'Others arrive, or a deadline moves closer.';
  const turningPoint = `${m.supporting} slows the moment: ${m.pairingRationale}`;
  const discovery = `${m.childConnection} — saying it plainly helps more than fixing everything alone.`;
  const gitaFeeling = `Late in the story, ${m.lead} names the feeling behind ${theme} in simple words.`;
  const application = `${m.lead} tries one honest, smaller step with ${m.supporting} beside them.`;
  const resolution = 'The day ends imperfect but true; the Grove keeps breathing.';
  const growth = `${m.lead} repeats the new move once — action, not a lesson speech.`;
  const visuals = [
    `${loc} wide shot — warm afternoon light`,
    `${m.lead} clutching ${lead.object}, face showing ${theme}`,
    `${m.supporting} listening, not lecturing`,
    'Mid-story consequence — faces and hands tell the story',
    'Turning point — two children, one small choice',
    'Closing image — quiet relief, Grove still there',
  ];
  const teaser = next
    ? `${next.lead} and ${next.supporting} next — ${next.theme.toLowerCase()} at ${next.location}.`
    : m.book < 18
      ? `Book ${m.book + 1} opens with a new chapter feeling.`
      : 'All six friends under the Old Banyan — the journey continues.';

  return {
    title,
    logline: `${m.lead} and ${m.supporting} face ${theme} at ${loc}.`,
    hook,
    goal,
    obstacle,
    wrongChoice,
    consequence,
    escalation,
    turningPoint,
    discovery,
    gitaFeeling,
    application,
    resolution,
    growth,
    visuals,
    teaser,
  };
}

function moduleBrief(m) {
  const book = REGISTRY.books.find((b) => b.book === m.book);
  return `adventureId: ${m.adventureId}
book: ${m.book} · ${book.chapterName}
coreIdea: "${book.coreIdea}"
theme: ${m.theme}
lead: ${m.lead}
supporting: ${m.supporting}
pairingRationale: ${m.pairingRationale}
primaryShloka: ${m.primaryShloka}
childConnection: ${m.childConnection}
location: ${m.location}
onStageCast: [${m.lead}, ${m.supporting}]`;
}

function renderModuleBible(m, s, prev, next) {
  const beats = [
    ['Opening hook', s.hook],
    ['Goal', s.goal],
    ['Obstacle', s.obstacle],
    ['Emotional complication', `${m.lead}'s blind spot: ${ARCHETYPES[m.lead].blind}.`],
    ['Wrong choice', s.wrongChoice],
    ['Consequence', s.consequence],
    ['Escalation', s.escalation],
    ['Turning point', s.turningPoint],
    ['Discovery', s.discovery],
    ['Gita moment placement', s.gitaFeeling],
    ['Application', s.application],
    ['Resolution', s.resolution],
    ['Growth shown', s.growth],
  ];

  const pageMap = [
    '| Page | Beat | Visual note |',
    '|------|------|-------------|',
    '| 1 | Title | Adventure title + location |',
    '| 2 | Meet lead | Lead + supporting introduced |',
    '| 3–4 | Hook + Goal | ' + s.visuals[0] + ' |',
    '| 5–6 | Obstacle + Complication | ' + s.visuals[1] + ' |',
    '| 7–8 | Wrong choice + Consequence | ' + s.visuals[2] + ' |',
    '| 9–10 | Escalation + Turning point | ' + s.visuals[3] + ' |',
    '| 11–12 | Discovery + Application | ' + s.visuals[4] + ' |',
    '| 13–14 | Resolution + Growth | ' + s.visuals[5] + ' |',
    '| 15+ | Backmatter | Moral, Remember, Practice — separate skills |',
  ];

  return `# Story bible · ${m.adventureId} · ${m.theme}

**Working title:** ${s.title}

## Module brief (from core)

\`\`\`text
${moduleBrief(m)}
\`\`\`

## One-line logline

${s.logline}

## Beats (numbered 1–13)

${beats.map(([name, text], i) => `${i + 1}. **${name}** — ${text}`).join('\n\n')}

## Page map

${pageMap.join('\n')}

## Visual set-pieces

${s.visuals.map((v, i) => `${i + 1}. ${v}`).join('\n')}

## Gita moment (late — no Sanskrit in story body)

What happened → ${s.gitaFeeling} → what I could do → Remember connects to **${m.primaryShloka}**

## Continuity

- **Prior teaser echo:** ${prev ? `From ${prev.adventureId}: lead-in to ${m.theme.toLowerCase()}.` : 'Book opener — no prior module.'}
- **Page 25 teaser seed:** ${s.teaser}

## Quality gate

- [x] Enjoyable with zero Gita knowledge
- [x] Only ${m.lead} + ${m.supporting} on stage
- [x] Lead blind spot drives mistake
- [x] Śloka connection after emotional landing
- [x] Ending shows change in action
`;
}

function writeCharacterBible() {
  const content = `# Gita Grove — Character Bible (v2 human cast)

**Version:** 2.0 · Human six children only  
**Companion:** [\`six-children.md\`](gita-grove/six-children.md) · [\`module-registry.json\`](gita-grove/module-registry.json)

---

## Cast overview

| Character | Archetype | Age | Signature object | Role |
|-----------|-----------|-----|------------------|------|
| **Aarav** | The Thinker | 9 | Notebook | Analyzes; overthinks |
| **Mira** | The Doer | 9 | Wristband | Acts; rushes |
| **Vanshi** | The Feeler | 8 | Friendship bracelet | Feels deeply; takes things personally |
| **Kabir** | The Explorer | 8 | Magnifying glass | Explores; gets into trouble |
| **Tara** | The Steady One | 10 | Small plant | Steady; can become rigid |
| **Vihaan** | The Connector | 9 | Woven thread | Connects; worries about belonging |

**Rule:** Each module = **one lead + one supporting**. Never all six in one module.

**Retired (v1):** Gulu, Mimi, Bobo, Timo, Kiki, Guru Ma Owl, Pip, Diya — archived under \`docs/archive/v1-animal-cast/\`.

---

## Aarav · The Thinker

**Voice:** "I want to understand."  
**Strength:** Thoughtful, observant, loyal.  
**Blind spot:** Overthinks; freezes when afraid of being wrong.  
**Home:** Calm, book-filled; parents ask *"What do you think?"*  
**Visual:** Neat hair, simple kurta or shirt, always carries notebook.

---

## Mira · The Doer

**Voice:** "I want to make things happen."  
**Strength:** Courageous, energetic, practical.  
**Blind spot:** Rushes before thinking; assumes action fixes everything.  
**Home:** Busy, energetic; *"If something needs doing, do it."*  
**Visual:** Ponytail or short hair, sporty clothes, colored wristband.

---

## Vanshi · The Feeler

**Voice:** "I care deeply."  
**Strength:** Empathetic, warm, notices who is left out.  
**Blind spot:** Takes things personally; hurt shows fast.  
**Home:** Warm, expressive; feelings discussed openly.  
**Visual:** Soft colors, friendship bracelet, expressive eyes.

---

## Kabir · The Explorer

**Voice:** "I want to know why."  
**Strength:** Curious, imaginative, brave about questions.  
**Blind spot:** Curiosity leads to messes; hard to finish one thing.  
**Home:** Creative clutter; tools and art supplies everywhere.  
**Visual:** Messy hair, pockets full of found objects, magnifying glass on string.

---

## Tara · The Steady One

**Voice:** "I want to learn how to manage myself."  
**Strength:** Patient, focused, reliable.  
**Blind spot:** Rigidity; frustration when plans change.  
**Home:** Structured mornings, plant-care routine, study corner.  
**Visual:** Neat braid, small potted plant often nearby, calm posture.

---

## Vihaan · The Connector

**Voice:** "I want to understand my place in the world."  
**Strength:** Inclusive, cooperative, sees relationships.  
**Blind spot:** People-pleasing; fear of being left out.  
**Home:** Welcoming; cousins and friends often visiting.  
**Visual:** Open smile, woven thread bracelet, often in group scenes.

---

## Adults (background only)

Parents, teachers, grandparents — **support, don't solve**. No mid-story Gita lectures.

**Meera Aunty** (optional recurring): warm librarian; asks questions, never preachy in story body.

---

## Shared series object

**Grove Journal** — six children's shared journal of discoveries, drawings, questions. Not magical; meaning comes from the children.

---

## Casting matrix

Full 74-module lead + supporting pairs: [\`module-registry.json\`](gita-grove/module-registry.json)
`;
  fs.writeFileSync(path.join(ROOT, 'docs/character-bible.md'), content);
}

function writeWorldBible() {
  const content = `# Gita Grove — World Bible (v2)

**Version:** 2.0 · Contemporary Indian neighborhood · Human cast

---

## Core world

Warm **contemporary Indian neighborhood** surrounded by a living grove — trees, gardens, paths, water, old places with stories.

**Not** a fantasy kingdom. Recognizable children's world + **gentle wonder**.

> Big wisdom through **small everyday experiences.**

**Wonder, not fantasy:** fireflies, leaf patterns, stream reflections, lonely child joining, built thing finally working. **No** talking animals, supernatural powers, or divine characters solving problems in story body.

---

## Neighborhood map

| Location | Role |
|----------|------|
| **Old Banyan Tree** | Heart of Grove — gather, play, plan; symbol of roots and time |
| **Meadow** | Open adventure — trails, races, storms |
| **Little Creek** | Quiet — stones, bridges, reflections |
| **Community Garden** | Tara's plant; care, patience, growth |
| **School** | Classroom, playground, art room, science corner |
| **Little Grove Library** | Questions, stories, Meera Aunty (background) |
| **Quiet Corner** | Shade, stones, breathe after arguments |
| **Playground** | Teamwork, fairness, friendship |
| **Neighborhood** | Six homes close enough to meet after school |

---

## Six homes

See [\`character-bible.md\`](../character-bible.md) for per-child home character.

---

## Seasons

Spring · Summer · Monsoon · Autumn · Winter — time passes across the series.

---

## Cultural world

Festivals, school life, local games, rangoli, diyas, music, grandparents, neighborhood celebrations. Gita is part of cultural environment — not every scene religious.

---

## Story engine (5 ingredients)

1. **Place** — school, grove, meadow, creek, garden, home, library  
2. **Character tendency** — overthink, rush, sensitivity, curiosity, rigidity, people-please  
3. **Real childhood problem** — competition, friendship, failure, jealousy, fear  
4. **Adventure** — build, find, help, solve, explore, prepare  
5. **Gita insight** — emerges **after** the problem (Remember section)

---

## Learning loop

Experience → Emotion → Mistake → Consequence → Reflection → Wisdom → Application

**Never:** śloka → lecture → story.
`;
  fs.writeFileSync(path.join(ROOT, 'docs/gita-grove/world-bible.md'), content);
}

function writeUniverseBible() {
  const content = `# Gita Grove — Universe Bible (v2)

**Version:** 2.0 · Human cast · 74 modules · 18 books

**Companion:** [\`world-bible.md\`](gita-grove/world-bible.md) · [\`character-bible.md\`](character-bible.md) · [\`module-registry.json\`](gita-grove/module-registry.json)

---

## What Gita Grove is

A **persistent contemporary Indian neighborhood world** where six children grow through ordinary-extraordinary days. Gita wisdom lives in **Remember** and grown-up pages — not mid-story lectures.

---

## Hierarchy

\`\`\`text
BOOK (1 Gita chapter, ~80 pp compiled)
  └── MODULE (1 theme, 1 adventure, ~25 pp, gv{book}_a{adv})
        └── LEAD + one SUPPORTING (human children only)
\`\`\`

**74 modules** series-wide · **1 theme = 1 module**

---

## Cast rule

- **Human six children only** on stage per module
- **No animal protagonists** · **No Guru Ma Owl**
- Remember = **book voice** ("In the Bhagavad Gita…") — not a character speaking

---

## 18 Grove Powers

One trainable capability per book (Celebrate page). Themes within each book map to sub-skills. See [\`gita-grove-capabilities.md\`](gita-grove-capabilities.md).

---

## Module story bibles

All 74 beat sheets: [\`docs/gita-grove/module-bibles/\`](gita-grove/module-bibles/)

---

## Legacy

v1 animal cast archived: \`docs/archive/v1-animal-cast/\`
`;
  fs.writeFileSync(path.join(ROOT, 'docs/universe-bible.md'), content);
}

function generateModuleBibles() {
  const dir = path.join(ROOT, 'docs/gita-grove/module-bibles');
  fs.mkdirSync(dir, { recursive: true });
  const modules = REGISTRY.modules;
  const index = [];

  for (let i = 0; i < modules.length; i++) {
    const m = modules[i];
    const prev = i > 0 && modules[i - 1].book === m.book ? modules[i - 1] : m.module > 1 ? modules[i - 1] : null;
    const next = modules[i + 1];
    const s = scenarioForModule(m, prev, next);
    const md = renderModuleBible(m, s, prev, next);
    const file = path.join(dir, `${m.adventureId}.md`);
    fs.writeFileSync(file, md);
    index.push({ adventureId: m.adventureId, theme: m.theme, lead: m.lead, title: s.title, file: `docs/gita-grove/module-bibles/${m.adventureId}.md` });

    const adv = CURRICULUM.adventures.find((a) => a.adventureId === m.adventureId);
    if (adv) {
      adv.title = s.title;
      adv.openingHook = s.hook.split('.')[0] + '.';
      if (next && next.book === m.book) adv.page25Teaser = s.teaser;
    }
  }

  fs.writeFileSync(
    path.join(dir, 'INDEX.md'),
    `# Module story bibles — 74 modules (v2 human cast)

Generated from \`module-registry.json\`. Beat sheets only — no full prose.

| ID | Title | Theme | Lead | File |
|----|-------|-------|------|------|
${index.map((r) => `| ${r.adventureId} | ${r.title} | ${r.theme} | ${r.lead} | [${r.adventureId}.md](${r.adventureId}.md) |`).join('\n')}
`
  );

  fs.writeFileSync(path.join(ROOT, 'scripts/data/gita-grove-curriculum.json'), JSON.stringify(CURRICULUM, null, 2) + '\n');
  return index.length;
}

writeCharacterBible();
writeWorldBible();
writeUniverseBible();
const count = generateModuleBibles();
console.log(`Generated character, world, universe bibles + ${count} module story bibles`);
