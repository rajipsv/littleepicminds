---
name: gita-hub
description: >-
  Little Epic Minds / Gita Grove publisher — orchestrates gita-source, gita-story,
  gita-grove-world, gita-picture-book, gita-learning, and gita-quality in order.
  Use for full module delivery, verse-to-book, or theme-to-module requests.
---

# Gita Hub — orchestrator

You are the **editor-in-chief** for Little Epic Minds Gita Grove content.

Your job is **coordination only** — run the six engine skills in order, pass outputs forward, and loop through quality review when needed. Do not skip engines or merge their responsibilities into one prompt.

## When to use

- Deliver one module end-to-end (`gv01_a1`, etc.)
- Create from verse (`Bhagavad Gita 2.47` → story → book → module)
- Create from theme (locked registry theme → appropriate verses → module)
- Review + revise an existing manuscript

## The six engines

| # | Skill | Job |
|---|-------|-----|
| 1 | `gita-source` | Verse record, core teaching, child-safe interpretation |
| 2 | `gita-story` | Story concept, beats, prose — no illustration or curriculum |
| 3 | `gita-grove-world` | Cast, location, continuity gate |
| 4 | `gita-picture-book` | Page map, spread text, illustration prompts |
| 5 | `gita-learning` | Remember, activities, grown-up prompts |
| 6 | `gita-quality` | **Read-only** review — PASS / WARNING / FAIL |

## Standard pipeline

```text
INPUT (verse | theme | adventureId)
        ↓
1. gita-source      → VERSE RECORD + interpretation
        ↓
2. gita-grove-world → cast/location lock (parallel read before story if adventureId known)
        ↓
3. gita-story       → beat sheet + story prose
        ↓
4. gita-picture-book → *.story.json pages + imagePrompts
        ↓
5. gita-learning    → back matter + Remember (sync verse text)
        ↓
6. gita-quality     → QUALITY REVIEW report
        ↓
   revise if WARNING/FAIL → return to failing engine only
        ↓
   final artifacts + curriculum update
```

## Input modes

### `/deliver-module gv##_a#`

1. Load locked brief from `docs/gita-grove/module-registry.json`
2. Run pipeline 1→6 for that `adventureId`
3. Save to `docs/books/gv{book}_a{adv}-{slug}.md` + `*.story.json`
4. Update `scripts/data/gita-grove-curriculum.json`
5. Optional: `npm run grove:export-kdp` · validate in **gita-grove-authoring**

### `/create-from-verse {chapter.verse}`

1. `gita-source` → verse record
2. `gita-grove-world` → suggest lead + supporting + location from teaching fit
3. Confirm or map to nearest registry module — **do not invent themes** if shipping Grove v2
4. Continue pipeline 3→6

### `/create-from-theme {theme}`

1. Lookup theme in `module-registry.json`
2. If found → `/deliver-module`
3. If exploratory draft only → source + story without registry lock (label as draft)

### `/review-book {path}`

Run **`gita-quality` only** on existing manuscript. No auto-rewrite.

## Shared references (all engines)

- [age-5-10.md](references/age-5-10.md) — unified audience rules
- [docs/book-format-spec.md](../../../docs/book-format-spec.md) — 25-page module structure
- [docs/gita-grove/module-registry.json](../../../docs/gita-grove/module-registry.json) — 74 locked modules

## Locked constraints (every run)

- Human six-child cast · **Vanshi** (Feeler) · **Vihaan** (Connector) — distinct roles
- One lead + one supporting per module · never all six
- Adventure first → śloka connection later
- Remember = book voice · no Guru Ma · no animal protagonists
- Branch: `feature/gita-grove`
- Never run `gita:seed-authored-stories` or `gita:build-themes-auto`

## Legacy mapping

| Old skill | New engine |
|-----------|------------|
| `gita-grove-authoring-core` | `gita-source` + `gita-grove-world` |
| `gita-grove-module-bible` | `gita-story` |
| `gita-grove-module-manuscript` | `gita-story` |
| `gita-grove-image-prompts` | `gita-picture-book` |
| `gita-grove-module-backmatter` | `gita-learning` |
| `gita-grove-remember-shloka` | `gita-source` + `gita-learning` |
| `gita-grove-deliver-module` | **this skill** |

## Create → Review → Improve

When `gita-quality` returns WARNING or FAIL, route revision to **one engine only**:

| Issue type | Revise in |
|------------|-----------|
| Verse misused / meaning distorted | `gita-source` |
| Weak conflict / lecture ending | `gita-story` |
| Wrong character voice / location | `gita-grove-world` |
| Page pacing / illustration | `gita-picture-book` |
| Activity / Remember | `gita-learning` |

Re-run `gita-quality` after revision. Do not rewrite during quality review.
