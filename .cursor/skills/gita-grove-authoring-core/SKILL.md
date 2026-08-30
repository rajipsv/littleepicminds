---
name: gita-grove-authoring-core
description: >-
  Load locked Gita Grove module brief for gv##_a# — theme, human cast, śloka anchor,
  pairing rationale. Constitution only; no story prose. Use before bibles or manuscripts.
---

# Gita Grove authoring core

## When to use

Starting any **`gv{book}_a{adv}`** module. Outputs a **module brief** for downstream skills. **Never write story prose** in this skill.

## Read first

1. `docs/gita-grove/six-children.md` — locked cast
2. `docs/gita-grove/module-registry.json` — theme, lead, supporting, śloka per module
3. `docs/gita-grove/module-bibles/{adventureId}.md` — beat sheet if present
4. `docs/gita-grove/master-architecture.md` — book-level core ideas
4. `AGENTS-GITA-GROVE.md` or kit `AGENTS.md`
5. `docs/book-format-spec.md` — 25-page module structure

## Locked rules

```text
1 theme = 1 module = 1 adventure (~25 pp Seeds)
Human cast only — six children; no animal leads; no Guru Ma
Adventure FIRST → śloka connection LATER in same module (never opening)
Remember = book voice ("In the Bhagavad Gita…") — not a character speaking
Seeds story body: no Arjuna/Krishna names; feeling mirror only
English-first unless user requests Telugu
```

## Module brief output

Emit this block before any bible or manuscript work:

```text
adventureId: gv{book}_a{adv}
book: {N}
chapterName: {child-friendly chapter}
coreIdea: "{quote}"
theme: {locked theme string}
lead: {name}
supporting: {name}
pairingRationale: {why this pair}
primaryShloka: {e.g. 1.28-1.30}
childConnection: {one line from registry}
bookAnchor: {book primary lead from architecture}
moduleIndex: {1..n within book}
onStageCast: [{lead}, {supporting}]
```

## Lookup

1. Parse `adventureId` → book + module index
2. Find row in `docs/gita-grove/module-registry.json` → `modules[]` where `adventureId` matches
3. If missing, derive from book's theme list in registry `books[]` — do not invent themes

## Design order (for downstream skills)

```text
theme → lead flaw → location → scenario → adventure → śloka LAST
```

## Never

- Invent themes, leads, or verse numbers
- Use legacy animal names (Gulu, Kiki, Guru Ma, etc.)
- Open with a śloka or moral announcement
- Auto-include all six children

## Next skill

→ `gita-grove-module-bible` with the module brief
