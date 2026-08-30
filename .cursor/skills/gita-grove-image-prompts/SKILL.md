---
name: gita-grove-image-prompts
description: >-
  Refine Gita Grove page imagePrompts and module character bible for human cast consistency.
  Use after story.json and Remember are drafted.
---

# Gita Grove image prompts

## When to use

After **`gita-grove-module-manuscript`** + **`gita-grove-remember-shloka`**. Refines illustration prompts in `*.story.json`.

## Read first

- `docs/book-format-spec.md` — 1:1 art, stacked layout, ≥1425px export
- `assets/characters/manifest.json` — update for **human** refs when available
- Module brief — lead + supporting only

## Human cast appearance (Seeds — consistent)

Describe in a **module character bible** before page prompts:

| Field | Lead | Supporting |
|-------|------|------------|
| Age | from six-children | from six-children |
| Hair, clothing, shoes | consistent across pages | consistent |
| Signature object | optional (notebook, bracelet, etc.) | optional |
| Expression range | for this adventure's arc | supporting role |

**No Guru Ma Owl. No animal protagonists.**

## imagePrompt rules

Each prompt must include:

- Who is visible (max 2 children unless rare crowd scene)
- Location / time of day / weather
- Action + emotion (face, body language)
- Important objects
- Style suffix from `story.json` defaults
- **1:1 square composition**
- **No text, letters, speech bubbles, Sanskrit in image**

## Workflow

```
- [ ] Write module character bible snippet (lead + supporting)
- [ ] Refine each pages[].imagePrompt in story.json
- [ ] Flag 4 key spreads for art briefs in .md (optional)
- [ ] grove:validate
```

## Style suffix (default)

```
Children's picture book illustration, soft watercolor style, full color, 1:1 square composition, Gita Grove Seeds, warm natural lighting, consistent character design, no text in image
```

## Final pipeline

→ `npm run grove:validate` / `grove:compile` in **gita-grove-authoring**  
→ `scripts/sync-to-app.ps1`  
→ Update curriculum `manuscript` path + `status`
