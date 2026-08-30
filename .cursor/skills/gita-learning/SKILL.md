---
name: gita-learning
description: >-
  Turn Grove story into learning module — Remember, śloka sync, Understand/Notice/Try/Reflect,
  Practice activities, Celebrate, grown-up prompts. Use after gita-picture-book story lock.
---

# Gita Learning Engine

**One job:** emotional story → **learning module** (Remember + activities + reflection).

A storybook is not the same as a curriculum module. This skill owns everything **after** the last story spread.

## When to use

- Moral, Practice, Celebrate, grown-up page, page-25 teaser
- Remember block + `rememberLine` (book voice)
- Curriculum JSON fields
- Śloka text sync (delegates verse fetch to `gita-source`)

## Read first

- Completed story in `*.story.json`
- VERSE RECORD / registry `primaryShloka`
- [references/sloka-learning.md](references/sloka-learning.md)
- `.cursor/skills/gita-grove-remember-shloka/reference-remember-voice.md`
- [../gita-hub/references/age-5-10.md](../gita-hub/references/age-5-10.md)

## Learning pipeline

```text
STORY (locked)
  ↓
GITA IDEA (from gita-source coreTeaching)
  ↓
SLOKA (sync — never hand-craft)
  ↓
UNDERSTAND — child meaning + Moral
  ↓
NOTICE — "When do I feel this way?" (Practice 1–2)
  ↓
TRY — one tiny real-life activity (Practice 3)
  ↓
REFLECT — Celebrate + grown-up discussion
```

## Remember (Skill 5)

1. Run `npm run grove:sync-remember-shlokas -- --id=gv##_a#`
2. Write **rememberLine** only (book voice) — agent-authored, tied to `childConnection`
3. Do not hand-craft Sanskrit/transliteration

## Back matter sections (`.md`)

| Section | Content |
|---------|---------|
| Moral | 1 sentence + child repeat line (8–12 words) |
| Remember | Paired ślokas + rememberLine |
| Practice | 3 activities · theme-tied · ages 5–10 |
| Celebrate | What lead practiced · Tree leaf collectable |
| For grown-ups | 80–120 words · may cite Arjuna/Krishna |
| Page 25 | Teaser + wonder question → next module |

## Curriculum update

`scripts/data/gita-grove-curriculum.json`:

```json
"moral": "...",
"childRepeatLine": "...",
"rememberLine": "...",
"shlokasStatus": "verified-repo",
"nextAdventureId": "gv01_a2",
"page25Teaser": "...",
"status": "manuscript"
```

## Templates

- [module-template.md](templates/module-template.md)
- [activity-template.md](templates/activity-template.md)

## Next skill

→ `gita-quality` (read-only review)

## Never

- Remember before story emotional landing exists
- Guru Ma or character speaking śloka
- Śloka in Moral/Practice instead of theme language
