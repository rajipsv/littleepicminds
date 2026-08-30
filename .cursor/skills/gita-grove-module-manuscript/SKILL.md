---
name: gita-grove-module-manuscript
description: >-
  Draft Gita Grove Seeds story pages in gv##_a#.story.json from a locked module brief and
  story bible. Human cast only; adventure-first; no śloka in story body. Use after module-bible.
---

# Gita Grove module manuscript

> **Legacy redirect:** use **`gita-story`** (prose) + **`gita-picture-book`** (pages + prompts).

## When to use

After **`gita-grove-authoring-core`** + **`gita-grove-module-bible`**. Writes **`*.story.json`** story pages only (not back matter).

## Read first

1. Module brief + approved bible
2. `docs/book-format-spec.md` — 40–60 words/spread, 1:1 art
3. Prior manuscript in same book for voice continuity
4. Pilots for tone (human rewrite targets): structure only — **replace animal cast with locked humans**

## Story body rules

- **Adventure first** — no moral at opening; no "In the Bhagavad Gita" in story pages
- **Human cast only** — lead + supporting from brief; never all six
- **No Guru Ma, no animal mentors, no mid-story lectures**
- **Seeds:** no Arjuna/Krishna names in narration; mirror **feelings** only
- **Show pairing** through behavior (see pairingRationale)
- **40–60 English words** per story page
- Distinct voices per [six-children.md](../../docs/gita-grove/six-children.md)

## Files

```
docs/books/gv{book}_a{adv}-{slug}.story.json   # canonical pages[]
docs/books/gv{book}_a{adv}-{slug}.md           # metadata only until backmatter skill
```

## story.json schema

```json
{
  "adventureId": "gv01_a1",
  "defaults": {
    "styleSuffix": "Children's picture book illustration, soft watercolor, full color, 1:1 square, Gita Grove Seeds, no text in image"
  },
  "pages": [
    {
      "beat": "Opens — overwhelmed",
      "text": "40–60 words…",
      "imagePrompt": "Draft scene — refine in image-prompts skill"
    }
  ]
}
```

## Workflow

```
- [ ] Confirm adventureId, slug, lead, supporting from brief
- [ ] Write pages[] following bible page map
- [ ] Emotional arc: experience → struggle → choice → consequence → insight (verse comes later)
- [ ] Draft imagePrompt per page (rough — skill 6 refines)
- [ ] Write .md metadata + page map only (no back matter yet)
- [ ] In gita-grove-authoring: npm run grove:validate -- --id=gv{book}_a{adv}
```

## Anti-patterns

- ❌ Śloka vocabulary in title or opening
- ❌ Guru Ma or elder explains Gita mid-adventure
- ❌ "And they learned an important lesson"
- ❌ Perfect child with no mistake
- ❌ Legacy animal names (Gulu, Mimi, etc.)

## Next skills (in order)

→ `gita-grove-module-backmatter`  
→ `gita-grove-remember-shloka`  
→ `gita-grove-image-prompts`

## Legacy skill

Supersedes story-prose portions of `gita-grove-manuscript`. Back matter moved to separate skills.
