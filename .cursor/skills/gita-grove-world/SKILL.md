---
name: gita-grove-world
description: >-
  Gita Grove universe continuity — six-child cast, locations, relationships, series
  bible, visual identity. Gates whether content belongs in the Grove. Use before
  gita-story and during gita-quality world checks.
---

# Gita Grove World Engine

**One job:** answer *"Does this belong in the Gita Grove universe?"* and lock **cast + place + continuity**.

## When to use

- Before story drafting (cast lock)
- When selecting lead/supporting for a theme or verse
- Continuity check for series callbacks
- Visual identity for illustration (with `gita-picture-book`)

## Canonical docs (source of truth)

| Doc | Path |
|-----|------|
| Cast table | [references/character-bible.md](references/character-bible.md) → `docs/character-bible.md` |
| World | [references/world-bible.md](references/world-bible.md) → `docs/gita-grove/world-bible.md` |
| Series | [references/series-bible.md](references/series-bible.md) |
| Module lock | `docs/gita-grove/module-registry.json` |
| Architecture | `docs/gita-grove/master-architecture.md` |

## Locked six-child cast

| Character | Archetype | Story function |
|-----------|-----------|----------------|
| **Aarav** | Thinker | Questions, analyzes, wonders |
| **Mira** | Doer | Acts, experiments, takes initiative |
| **Vanshi** | Feeler | Emotion, empathy, relationships |
| **Kabir** | Explorer | Curiosity, adventure, discovery |
| **Tara** | Steady One | Patience, calm, grounding |
| **Vihaan** | Connector | Friendship, cooperation, belonging |

**Vanshi and Vihaan are distinct** — Feeler ≠ Connector. Do not merge or replace.

**Retired v1:** Gulu, Mimi, Bobo, Timo, Kiki, Guru Ma Owl — never in new work.

## Cast lock output

```yaml
adventureId: gv01_a1
lead: Vanshi
supporting: Aarav
onStageCast: [Vanshi, Aarav]
location: Old Banyan Tree
pairingRationale: >
  Why this pair for this theme (from registry).
continuityNotes:
  priorModule: gv01_a0 | none
  teaserEcho: ...
worldGate: PASS | FAIL
worldGateReason: ...
```

## World rules

- Contemporary Indian neighborhood + living grove — **not** fantasy kingdom
- Wonder through nature, friendship, school, community — **no** talking animals, divine rescues in story body
- One lead + one supporting per module · max two children illustrated per spread (crowd rare)

## Series continuity

Track per book arc in [series-bible.md](references/series-bible.md):

- Modules completed · concepts introduced · locations used
- Character growth shown · vocabulary introduced
- Teaser chain page 25 → next module

## Next skill

→ `gita-story` with cast lock  
← `gita-quality` for world continuity warnings
