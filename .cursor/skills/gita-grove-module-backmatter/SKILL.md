---
name: gita-grove-module-backmatter
description: >-
  Write Gita Grove module back matter — Moral, Practice, Celebrate, grown-up page, page-25
  teaser. Use after module-manuscript story pages. No Remember śloka block (remember-shloka skill).
---

# Gita Grove module back matter

## When to use

After **`gita-grove-module-manuscript`** story pages are drafted. Before **`gita-grove-remember-shloka`**.

## Read first

- Completed `*.story.json` + story summary
- `docs/gita-grove-capabilities.md` — Grove Power + sub-skill for book
- `.cursor/skills/gita-grove-manuscript/reference-hooks.md` — teaser rules (ignore Guru Ma rows)
- `docs/books/gv{book}-book-hooks.md` if present

## Append to `.md` manuscript

One `###` block per printed back-matter page under these sections:

## Moral

- One sentence moral tied to **sub-skill**, not śloka jargon
- **Child repeat line** — short, speakable (8–12 words)

## Practice

- Three activities tied to sub-skill
- Concrete, home/school doable, ages 5–7

## Celebrate

- Name the **Grove Power**
- Tree leaf / series collectable beat where applicable

## For grown-ups

- 80–120 words: power, discussion question, optional verse refs
- May name Arjuna/Krishna here only — not in Seeds story body

## Page 25 — Next adventure

- **Teaser:** feeling + vivid detail; name next lead if known
- **Wonder question** — not lesson recap
- Last module in book → book bridge + optional Book N+1 tease

## Curriculum fields

Update adventure in `scripts/data/gita-grove-curriculum.json`:

```json
"moral": "...",
"childRepeatLine": "...",
"nextAdventureId": "gv01_a2",
"page25Teaser": "...",
"page25WonderQuestion": "...",
"status": "manuscript"
```

## Never

- Put śloka text or Remember block here — **`gita-grove-remember-shloka`** owns Remember
- Guru Ma or animal cast in teasers

## Next skill

→ `gita-grove-remember-shloka`
