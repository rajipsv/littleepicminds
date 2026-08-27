# Gita Grove authoring kit (portable repo)

Grove v2 manuscripts, skills, and curriculum live in a **standalone repo** for use on any laptop / Cursor account:

```
../gita-grove-authoring/
```

Or clone from GitHub after you push it (see that repo's `README.md`).

## What's portable

| Item | Location in kit |
|------|-----------------|
| Agent architecture | `AGENTS.md` |
| Cursor skill | `.cursor/skills/gita-grove-manuscript/` |
| Cursor rule | `.cursor/rules/gita-grove-authoring.mdc` |
| Bibles + manuscripts | `docs/` |
| Curriculum JSON | `scripts/data/gita-grove-curriculum.json` |

## Sync

From the kit repo:

```powershell
.\scripts\sync-to-app.ps1
```

Copies docs + curriculum into this `littleepicminds` tree.

## This repo also has

The same skill and rule are copied under `.cursor/` here so Grove drafting works without opening the sibling folder.

**Branch policy (littleepicminds):** `main` = live website — **do not** commit Grove/book changes to `main`. Use **`feature/gita-grove`** for all Grove work in this repo.

**Legacy** `sd*` / `sk*` theme pipeline rules remain in `.cursor/rules/gita-chatgpt-theme-stories.mdc` — separate from Grove v2.
