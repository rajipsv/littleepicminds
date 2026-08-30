---
name: gita-grove-deliver-module
description: >-
  Orchestrate full Gita Grove gv##_a# delivery — run authoring-core through image-prompts in
  order. Human cast only; book-voice Remember. Use when shipping one module end-to-end.
---

# Gita Grove deliver module

## When to use

User asks to **deliver**, **ship**, or **complete** one module (`gv01_a1`, etc.) end-to-end.

## Pipeline (strict order)

| Step | Skill | Output |
|------|-------|--------|
| 1 | `gita-grove-authoring-core` | Module brief |
| 2 | `gita-grove-module-bible` | Beat sheet / page map |
| 3 | `gita-grove-module-manuscript` | `*.story.json` story pages |
| 4 | `gita-grove-module-backmatter` | Moral, Practice, teaser in `.md` |
| 5 | `gita-grove-remember-shloka` | Remember + rememberLine — **run `grove:sync-remember-shlokas` for verse text** |
| 6 | `gita-grove-image-prompts` | Final imagePrompts + cast bible |
| 7 | Authoring repo | `grove:validate`, optional `grove:compile`, `sync-to-app.ps1` |

**Do not skip steps.** Do not write Remember before story landing exists.

## Book 1 Module 1 reference path

```text
gv01_a1 · Vanshi + Aarav · Feeling overwhelmed · 1.28–1.30
```

## Locked constraints (every module)

- Human six-child cast only
- Lead + one supporting
- Adventure first → śloka later
- Remember = book voice (no Guru Ma)
- Branch: `feature/gita-grove`

## Checklist before done

- [ ] Module brief matches `docs/gita-grove/module-registry.json`
- [ ] Story enjoyable without Gita knowledge
- [ ] rememberLine reflects śloka meaning
- [ ] curriculum.json updated
- [ ] validate passes

## Optional helpers (external)

- `brainstorming` (superpowers) — beat alternatives before step 2 locks
