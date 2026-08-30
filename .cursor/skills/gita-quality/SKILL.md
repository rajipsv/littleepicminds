---
name: gita-quality
description: >-
  Independent read-only quality review for Gita Grove modules — Gita accuracy,
  story, age 5–10, character, world continuity, learning, series. Reports PASS/WARNING/FAIL;
  does not auto-rewrite. Use after gita-learning or to review existing manuscripts.
---

# Gita Quality Engine

**One job:** independent **QUALITY REVIEW** report. **Read-only** — do not rewrite prose during this skill.

Creation skills revise after your recommendations.

## When to use

- Final gate before marking module `manuscript` complete
- User asks `/review-book`
- After revision loop from `gita-hub`

## Read first

- Full manuscript: `.md` + `.story.json`
- VERSE RECORD / registry entry
- [references/quality-checklist.md](references/quality-checklist.md)
- [../gita-hub/references/age-5-10.md](../gita-hub/references/age-5-10.md)
- [../gita-grove-world/references/series-bible.md](../gita-grove-world/references/series-bible.md)

## Output format (mandatory)

```text
QUALITY REVIEW · {adventureId}

Gita Accuracy:       PASS | WARNING | FAIL
Story Quality:       PASS | WARNING | FAIL
Age 5–10:            PASS | WARNING | FAIL
Character:           PASS | WARNING | FAIL
World Continuity:    PASS | WARNING | FAIL
Learning:            PASS | WARNING | FAIL
Series:              PASS | WARNING | FAIL

Issues:
1. [ENGINE] Description
   Recommendation: …
   Route revision to: gita-source | gita-story | gita-grove-world | gita-picture-book | gita-learning

Overall: SHIP | REVISE
```

## Check dimensions

| Dimension | Questions |
|-----------|-----------|
| **Gita** | Teaching accurate? Verse appropriate? Meaning distorted? |
| **Story** | Real conflict? Character change? Engaging without Gita label? Teaching embedded naturally? |
| **Age 5–10** | Accessible? Not too babyish? Not too complex? |
| **Character** | Voice consistent? Blind spot drives plot? Supporting didn't fix too fast? |
| **World** | Grove location? No fantasy break? Cast lock respected? |
| **Learning** | Activities reinforce idea? Remember after landing? rememberLine book voice? |
| **Series** | Repetitive concept? Contradicts prior module? Teaser chain OK? |

## Critical rule

> Never force a Gita teaching into a story that doesn't naturally fit it.

If FAIL on Gita + Story together → redesign in `gita-story` with new `gita-source` VERSE RECORD — do not patch Remember only.

## Revision routing

| Issue | Route to |
|-------|----------|
| Wrong verse / distorted meaning | `gita-source` |
| Lecture ending / weak conflict | `gita-story` |
| Wrong cast / location | `gita-grove-world` |
| Page pacing / illustration drift | `gita-picture-book` |
| Activity / Remember / Moral | `gita-learning` |

## Optional tooling

```bash
# In gita-grove-authoring repo:
npm run grove:validate
```

## Never

- Auto-rewrite manuscript during review
- Pass module with hand-crafted unverified śloka text
- Skip series check for book 2+ modules
