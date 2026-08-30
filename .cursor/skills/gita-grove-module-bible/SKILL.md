---
name: gita-grove-module-bible
description: >-
  Write a Gita Grove module story bible / beat sheet for gv##_a# from a locked module brief.
  Adventure arc only — no full prose, no Remember block. Use after authoring-core.
---

# Gita Grove module bible

> **Legacy redirect:** use **`gita-story`** (beat sheet / story framework).

## When to use

After **`gita-grove-authoring-core`** module brief exists. Before **`gita-grove-module-manuscript`**.

## Read first

- `docs/gita-grove/module-registry.json` — locked brief
- `docs/gita-grove/module-bibles/{adventureId}.md` — pre-generated beat sheet (refine if needed)
- `docs/gita-grove/six-children.md` — cast

## Beat structure (mandatory)

Each bible must include all beats in order:

1. **Opening hook** — interesting situation; never "today we learn about…"
2. **Goal** — what the lead wants
3. **Obstacle** — challenge or mystery
4. **Emotional complication** — archetype blind spot activates
5. **Wrong choice / imperfect response** — realistic mistake
6. **Consequence** — something actually happens
7. **Escalation** — stakes rise
8. **Turning point** — new way of seeing
9. **Discovery** — deeper idea felt, not announced
10. **Gita moment placement** — *late module only*; child names feeling; no verse yet
11. **Application** — lead tries new response in the situation
12. **Resolution** — adventure closes
13. **Growth shown** — behavior change, not lecture

## Pairing on page

Show **pairingRationale** through action and dialogue — do not explain the relationship in narration.

## Page map (~25 pp Seeds)

| Section | Pages | Notes |
|---------|-------|-------|
| Title | 1 | Adventure title, location |
| Meet lead | 2 | Lead + supporting appear |
| Story spreads | 3–~14 | One beat cluster per spread; 40–60 words each at prose stage |
| Moral zone | after story | Reserved for backmatter skill |
| Remember | late | Śloka lands **after** adventure — mark which spread |

## Visual set-pieces

List 4–6 illustration moments: location, weather, object, expression, action, quiet beat.

## Output format

```markdown
# Story bible · {adventureId} · {theme}

## Module brief (from core)
...

## One-line logline
...

## Beats (numbered 1–13)
...

## Page map
| Page | Beat | Visual note |
...

## Gita moment (late — no Sanskrit in story body)
What happened → what I feel → what I could do → (Remember will connect to {primaryShloka})

## Continuity
- openingHook echo from prior teaser:
- page25Teaser seed for next module:
```

## Quality gate

- [ ] Enjoyable with zero Gita knowledge?
- [ ] Only lead + supporting on stage?
- [ ] Lead's blind spot drives the mistake?
- [ ] Śloka connection marked **after** emotional landing?
- [ ] Ending shows change in action?

## Next skill

→ `gita-grove-module-manuscript`
