---
name: gita-grove-deliver-module
description: >-
  Legacy redirect — use gita-hub to orchestrate gita-source, gita-story, gita-grove-world,
  gita-picture-book, gita-learning, and gita-quality for full gv##_a# delivery.
---

# Gita Grove deliver module (legacy)

**Use [`gita-hub`](../gita-hub/SKILL.md) instead.**

This skill is retained for backward compatibility with rules and transcripts that reference `gita-grove-deliver-module`.

## Pipeline

Run **`gita-hub`** with the same constraints:

| Step | New engine |
|------|------------|
| 1 | `gita-source` + `gita-grove-world` (brief + cast lock) |
| 2 | `gita-story` (bible + manuscript) |
| 3 | `gita-picture-book` (pages + imagePrompts) |
| 4 | `gita-learning` (back matter + Remember sync) |
| 5 | `gita-quality` (read-only review) |
| 6 | Revise → re-review if needed |

See [gita-hub/SKILL.md](../gita-hub/SKILL.md) for input modes and revision routing.
