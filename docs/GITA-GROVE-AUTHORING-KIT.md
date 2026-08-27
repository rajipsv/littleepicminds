# Gita Grove authoring kit (portable repo)

Grove v2 **authoring** lives in **`gita-grove-authoring`** (canonical).  
**`littleepicminds`** is the product app — it receives **content** via sync, not authoring tooling.

```
../gita-grove-authoring/     ← write stories, validate, export KDP here
littleepicminds/             ← app runtime; feature/gita-grove gets synced docs + curriculum
```

## What's in each repo

| | gita-grove-authoring | littleepicminds |
|--|----------------------|-----------------|
| Manuscripts + `*.story.json` | ✓ source | synced copy |
| `gita-grove-curriculum.json` | ✓ source | synced copy |
| `grove-manuscript/` + `grove-kdp/` scripts | ✓ | **not synced** |
| React app, TTS, legacy `sd*`/`sk*` themes | — | ✓ |

## Sync (authoring → app)

From **gita-grove-authoring**:

```powershell
.\scripts\sync-to-app.ps1
```

Copies: bibles, `docs/books/`, `book-format-spec.md`, curriculum JSON.  
Does **not** copy export/validate/compile scripts.

See `../gita-grove-authoring/SYNC.md` for full details.

## Working in littleepicminds today

Cursor skills/rules are duplicated under `.cursor/` so drafting works if you open the app repo — but **prefer `gita-grove-authoring`** for new Grove work and KDP export.

**Branch policy (littleepicminds):** `main` = live website — Grove changes on **`feature/gita-grove`** only.

**Legacy** `sd*` / `sk*` theme pipeline rules remain in `.cursor/rules/gita-chatgpt-theme-stories.mdc` — separate from Grove v2.
