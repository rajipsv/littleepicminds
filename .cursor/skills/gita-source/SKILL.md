---
name: gita-source
description: >-
  Gita authority layer for Little Epic Minds — retrieve verses, extract core teaching,
  child-safe interpretation, and wisdom-map lookup. Does not write story prose.
  Use before gita-story or when syncing Remember śloka text.
---

# Gita Source Engine

**One job:** answer *"What does this verse actually teach?"* and emit a structured **VERSE RECORD**.

Do **not** write picture-book prose, activities, or illustration prompts in this skill.

## When to use

- Starting from `chapter.verse` (e.g. `2.47`)
- Validating that a locked module's ślokas match the story's emotional landing
- Syncing Remember Sanskrit/transliteration/child meaning
- Looking up which Grove themes map to a Gita concept

## Read first

- [references/gita-source.md](references/gita-source.md) — data sources + sync commands
- [references/gita-interpretation-rules.md](references/gita-interpretation-rules.md)
- [references/gita-wisdom-map.md](references/gita-wisdom-map.md)
- `docs/gita-grove/module-registry.json` — locked verse refs per module

## Source priority (strict)

| Priority | Source | Use |
|----------|--------|-----|
| 1 | `lib/data/chapters/chapter{N}.js` | Default · Seeds `childMeaning` curated here |
| 2 | Pipeworx MCP `get_verse` | Fallback · `https://gateway.pipeworx.io/bhagavad-gita/mcp` |
| 3 | widegita MCP (optional) | Commentary / search only — not for print text without review |

**Never hand-craft** Sanskrit or transliteration. Run:

```bash
npm run grove:sync-remember-shlokas -- --id=gv##_a#
```

## VERSE RECORD output

Emit before any story work:

```yaml
verseId: "2.47"
chapter: 2
verse: 47
source: lib/data/chapters/chapter2.js | verified-mcp
sanskrit: "..."
transliteration: "..."
translation: "..."
coreTeaching: >
  One sentence — philosophical accuracy, adult-readable.
childFriendlyExpression: >
  One or two sentences a child 5–10 can hear.
possibleChildExperiences:
  - competition
  - trying something difficult
  - performing
distortionCheck: PASS | REVIEW
notes: >
  Optional commentary context; not for story body.
```

## Interpretation rules (summary)

1. Preserve the **principle**, not a single English moral slogan
2. Never force a verse into a story that does not naturally fit — flag `distortionCheck: REVIEW`
3. Child expression simplifies **language**, not **meaning**
4. Multiple commentators may differ — cite registry anchor; do not cherry-pick to fit a pre-written story
5. Story body: **feeling mirror** only — no Arjuna/Krishna lecture

## Wisdom map

Use [gita-wisdom-map.md](references/gita-wisdom-map.md) to connect concepts → chapters → registry modules. Do not invent new module IDs.

## Next skill

→ `gita-story` (with VERSE RECORD) or → `gita-learning` (Remember sync only)
