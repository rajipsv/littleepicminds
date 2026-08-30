---
name: gita-story
description: >-
  Turn Gita wisdom into children's stories for ages 5–10 — concepts, beats, conflict,
  dialogue, transformation. No illustration prompts or curriculum activities.
  Use after gita-source VERSE RECORD and gita-grove-world cast lock.
---

# Gita Story Engine

**One job:** transform a VERSE RECORD + cast lock into a **story worth reading without the Gita label**.

Do not write Remember blocks, Practice activities, or `imagePrompt` strings here.

## When to use

- Beat sheet / story bible for `gv##_a#`
- Full story prose in `*.story.json` `pages[].text`
- Exploratory story from verse (draft only if no registry ID)

## Read first

- VERSE RECORD from `gita-source`
- Cast lock from `gita-grove-world`
- [references/story-framework.md](references/story-framework.md)
- [references/pedagogy.md](references/pedagogy.md)
- [../gita-hub/references/age-5-10.md](../gita-hub/references/age-5-10.md)

## Seven-stage model (maps to beat sheet)

| Stage | Beat sheet # | Requirement |
|-------|--------------|-------------|
| 1. Spark | Opening hook | Ordinary world disruption |
| 2. Want | Goal | Lead wants something concrete |
| 3. Struggle | Obstacle + complication | Blind spot activates |
| 4. Inner knot | Wrong choice + consequence | Real mistake, real cost |
| 5. Choice | Escalation + turning point | Lead chooses how to respond |
| 6. Discovery | Discovery + Gita moment placement | Principle **felt**, not announced |
| 7. Transformation | Application + resolution + growth | Behavior change shown |

Full 13-beat expansion: [story-framework.md](references/story-framework.md)

## Design order

```text
theme → lead flaw → location → scenario → adventure → (śloka lands LATER in learning skill)
```

## Cast rules

- **One lead + one supporting** on stage
- Show `pairingRationale` through action — never explain in narration
- Supporting asks questions; **does not deliver the moral**
- Locked cast: Aarav, Mira, **Vanshi**, Kabir, Tara, Vihaan — see `gita-grove-world`

## Story body rules

- Adventure first — no "today we learn about…"
- No Sanskrit · no Arjuna/Krishna in narration
- 40–60 words per spread · see age-5-10
- Distinct voices per character archetype

## Outputs

| Artifact | Path |
|----------|------|
| Story bible | `docs/gita-grove/module-bibles/{adventureId}.md` |
| Story pages | `docs/books/gv{book}_a{adv}-{slug}.story.json` → `pages[].text` |
| Metadata stub | `docs/books/gv{book}_a{adv}-{slug}.md` (story section only) |

## Template

Use [templates/story-template.md](templates/story-template.md) for beat sheet structure.

## Next skill

→ `gita-picture-book` (page pacing + imagePrompt drafts)  
→ `gita-learning` (after picture-book story text locked)

## Never

- Open with śloka or moral
- Lecture ending ("Krishna says we should…")
- All six children in one module
- Guru Ma or animal protagonists
