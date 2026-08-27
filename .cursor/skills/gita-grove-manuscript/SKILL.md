---
name: gita-grove-manuscript
description: >-
  Draft Gita Grove Seeds adventure manuscripts (gv##_a#), Guru Ma Remember lines
  from Bhagavad Gita ślokas, book hooks, and curriculum updates. Use when the
  user asks to write or draft Grove stories, gv01_a2, Honest Heart, Grove Powers,
  adventure modules, Guru Ma lines, or gita-grove-curriculum.json.
---

# Gita Grove manuscript skill

## When to use

Drafting or editing **`gv{book}_a{adv}`** adventure modules for Gita Grove (Seeds 5–7).

## Read first (in order)

1. `AGENTS-GITA-GROVE.md` (app repo) or kit `AGENTS.md` — architecture
2. `docs/gita-grove-capabilities.md` — power + sub-skill for target book
3. `docs/gita-grove-series-v2.md` — synopsis row
4. `docs/character-bible.md` + `docs/universe-bible.md` — cast/world
5. `docs/books/gv{book}-book-hooks.md` — if present (Book 1: `gv01-book-hooks.md`)
6. Prior manuscript in same book — continuity
7. `scripts/data/gita-grove-curriculum.json` — target entry

## Design order (mandatory)

```
Grove Power → sub-skill → location → lead flaw → scenario → story → ślokas last
```

**Never:** verse vocabulary in titles; Gita names in Seeds **story body**; Guru Ma lectures mid-story; pandit blocks as plot engine.

## Draft workflow

```
- [ ] Confirm adventureId, power, sub-skill, lead, location from curriculum
- [ ] Read openingHook + prior adventure page-25 teaser
- [ ] Write docs/books/gv{book}_a{adv}-{slug}.story.json — ordered pages[] with beat, text, imagePrompt
- [ ] Write docs/books/gv{book}_a{adv}-{slug}.md — metadata + back matter only (Moral → Teaser)
- [ ] npm run grove:validate -- --id=gv{book}_a{adv}
- [ ] npm run grove:compile -- --id=gv{book}_a{adv}  (optional — preview ## Story in md)
- [ ] Pair 2 ślokas; write Guru Ma line (see reference-guru-ma.md)
- [ ] Art briefs (4 key spreads) in markdown
- [ ] Update curriculum JSON entry
```

**Hybrid files:** Story lives in **`*.story.json`**; markdown holds back matter with one `###` block per printed page. Export reads JSON directly — compile is optional for human preview.

**Scaffold new story:** `npm run grove:generate-story -- --id=gv01_a3 --write-scaffold --write-prompt`

## File naming

```
docs/books/gv{book}_a{adv}-{slug}.md          # metadata + back matter
docs/books/gv{book}_a{adv}-{slug}.story.json  # story pages (canonical)
```

Examples: `gv01_a1-the-fair-before-the-drum.md`, `gv01_a2-mimis-butterflies.md`

## Manuscript template

Use [reference-manuscript-template.md](reference-manuscript-template.md).

**Pilot quality:** `docs/books/gv01_a1-the-fair-before-the-drum.md`, `gv01_a2-mimis-butterflies.md`

## Guru Ma Remember line

See [reference-guru-ma.md](reference-guru-ma.md). One unique line per adventure; opens with Bhagavad Gita / Indian puranas; reflects **semantic meaning** of paired ślokas.

Book 1 pre-paired: `docs/books/gv01-book-hooks.md` § Remember.

## Serial hooks

See [reference-hooks.md](reference-hooks.md). Every module page 25 teases the next; last module in book uses book bridge + optional Book N+1 tease.

## Curriculum update fields

After draft, set on the adventure object in `scripts/data/gita-grove-curriculum.json`:

| Field | Notes |
|-------|-------|
| `status` | `manuscript` |
| `manuscript` | path under `docs/books/` |
| `moral`, `childRepeatLine` | from manuscript |
| `shlokas` | 2 refs, e.g. `["1.28","1.29"]` |
| `shlokasStatus` | `paired` |
| `guruMaLine` | plain text (no markdown italics) |

## English-first

Do not write Telugu unless user requests. Set `title_te: null` in curriculum.

## Seekers overlay

Same ID and plot; deeper text + 3–4 ślokas — only when user asks for Seekers edition.

## Additional references

- `docs/book-format-spec.md` — 25-page map
- `docs/gita-grove-series-v2.md` — all synopses
