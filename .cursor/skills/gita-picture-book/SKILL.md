---
name: gita-picture-book
description: >-
  Turn approved Grove story into a 25-page picture book — page map, spread text,
  illustration directions, visual continuity, cover. Use after gita-story prose draft.
---

# Gita Picture Book Engine

**One job:** story prose → **complete book structure** with page-by-page illustration directions.

Does not interpret Gita meaning or write Practice activities.

## When to use

- After `gita-story` locks `pages[].text`
- Refining `imagePrompt` in `*.story.json`
- KDP export prep (`npm run grove:export-kdp`)

## Read first

- `docs/book-format-spec.md` — **canonical** 25-page map
- [references/picture-book-framework.md](references/picture-book-framework.md)
- [../gita-hub/references/age-5-10.md](../gita-hub/references/age-5-10.md)
- Cast lock from `gita-grove-world`
- `assets/characters/manifest.json`

## Book structure (25 pages)

| Section | Pages |
|---------|-------|
| Title | 1 |
| Meet friends | 2 |
| Story spreads | 3–~14 |
| Moral zone | after story (learning skill) |
| Remember | 17–19 (learning skill) |
| Listen / Practice / Celebrate / Grown-up / Teaser | 19–25 |

Never shrink below 25 pages.

## Per-page output

```yaml
page: 7
text: |
  Mira looked at the tiny seed...
illustration:
  characters: [Mira, Tara]
  location: Community Garden · golden hour
  action: Mira kneeling, seed in palm
  emotion: uncertainty → curiosity
  style: soft watercolor · 1:1 · Gita Grove Seeds
  prohibitions: no text in image · no Sanskrit in image
storyPurpose: Beginning of internal realization
```

## Illustration stack (every prompt)

```text
WORLD STYLE + CHARACTER DESIGN + CLOTHING + ENVIRONMENT + LIGHTING + CAMERA + EMOTION + ACTION
```

Default style suffix:

```
Children's picture book illustration, soft watercolor style, full color, 1:1 square composition, Gita Grove Seeds, warm natural lighting, consistent character design, Indian contemporary children ages 5-10, no text in image
```

## Prohibitions

- Changing character age, hair, or outfit between pages
- Random clothing · inconsistent proportions
- Unrelated characters on spread (max 2 children unless crowd)
- Art style drift · animal mascots · Guru Ma Owl
- Text, letters, speech bubbles, Sanskrit in image

## Files

| Output | Path |
|--------|------|
| Story + prompts | `docs/books/gv{book}_a{adv}-{slug}.story.json` |
| Manuscript | `docs/books/gv{book}_a{adv}-{slug}.md` |
| Images (generated) | `output/images/{adventureId}/` (gitignored) |

## Templates

- [book-template.md](templates/book-template.md)
- [page-template.md](templates/page-template.md)
- [illustration-template.md](templates/illustration-template.md)

## Next skill

→ `gita-learning` (back matter + Remember)  
→ `gita-quality`

## Export

```bash
npm run grove:export-kdp -- --file=docs/books/gv01_a1-too-much-at-once.md --format=book --full-module
```

Engine runs in **gita-grove-authoring** repo.
