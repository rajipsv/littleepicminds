---
name: gita-grove-manuscript
description: >-
  Legacy redirect — use the 6-skill Gita Grove pipeline (authoring-core through
  deliver-module) for gv##_a# manuscripts. Human cast only; book-voice Remember.
---

# Gita Grove manuscript skill (legacy redirect)

## Use the 6-skill pipeline instead

This skill is superseded. For any **`gv{book}_a{adv}`** module, run skills in order:

| Step | Skill |
|------|-------|
| 1 | `gita-grove-authoring-core` — module brief |
| 2 | `gita-grove-module-bible` — beat sheet |
| 3 | `gita-grove-module-manuscript` — story.json pages |
| 4 | `gita-grove-module-backmatter` — Moral, Practice, teaser |
| 5 | `gita-grove-remember-shloka` — Remember + rememberLine (book voice) |
| 6 | `gita-grove-image-prompts` — imagePrompt QA |

**Orchestrator:** `gita-grove-deliver-module` — full end-to-end delivery.

## Locked sources (read first)

1. `docs/gita-grove/six-children.md` — human cast
2. `docs/gita-grove/module-registry.json` — 74 modules (theme, lead, supporting, śloka)
3. `docs/gita-grove/master-architecture.md` — 18-book table
4. `AGENTS-GITA-GROVE.md` — architecture
5. `docs/book-format-spec.md` — 25-page module structure

## Key changes from v1

| v1 (legacy) | v2 (current) |
|-------------|--------------|
| Guru Ma Owl speaks Remember | **Book voice** — "In the Bhagavad Gita…" |
| Animal cast (Gulu, Mimi, etc.) | **Six human children** only |
| `guruMaLine` in curriculum | **`rememberLine`** |
| 65 adventures | **74 modules** (1 theme = 1 module) |
| Single mega-skill | **6-skill pipeline** |

## Design order (unchanged)

```text
theme → lead flaw → location → scenario → adventure → śloka LAST
```

## File naming

```
docs/books/gv{book}_a{adv}-{slug}.md
docs/books/gv{book}_a{adv}-{slug}.story.json
```

## Curriculum update fields

After draft, set on the adventure object in `scripts/data/gita-grove-curriculum.json`:

| Field | Notes |
|-------|-------|
| `status` | `manuscript` |
| `manuscript` | path under `docs/books/` |
| `moral`, `childRepeatLine` | from backmatter |
| `shlokas` | 2 refs from primary anchor |
| `shlokasStatus` | `paired` |
| `rememberLine` | book-voice Remember (replaces `guruMaLine`) |

## Legacy references (do not use for new work)

- [reference-guru-ma.md](reference-guru-ma.md) — superseded by `gita-grove-remember-shloka/reference-remember-voice.md`
- [reference-manuscript-template.md](reference-manuscript-template.md) — still useful for page structure
- [reference-hooks.md](reference-hooks.md) — serial hooks (update cast names when drafting)

## English-first

Do not write Telugu unless user requests.
