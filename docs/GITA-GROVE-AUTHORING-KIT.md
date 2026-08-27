# Gita Grove — engine vs product

Two repos, one pipeline:

```
gita-grove-authoring          littleepicminds
(story engine)                (product / content host)
─────────────────────         ─────────────────────────────
generate · validate      →    store manuscripts + curriculum
compile · export KDP          React app · TTS · website
Cursor skills                 everything external users touch
```

## Roles

| | gita-grove-authoring | littleepicminds |
|--|----------------------|-----------------|
| **Purpose** | Generate stories | Serve users |
| Manuscripts + `*.story.json` | ✓ source | synced copy |
| `assets/characters/` (illustration refs) | ✓ source | synced copy |
| `gita-grove-curriculum.json` | ✓ source | synced copy |
| `grove-manuscript/` + `grove-kdp/` | ✓ engine | **not synced** |
| React app, TTS, website | — | ✓ |
| Legacy `sd*` / `sk*` themes | — | ✓ (separate pipeline) |

**gita-grove-authoring** is the engine today for Grove v2 and can be extended for **other story generations** later without changing how the app deploys.

**littleepicminds** keeps the content and does everything for external users — it does not run story generation tooling.

## Sync (engine → product)

From **gita-grove-authoring**:

```powershell
.\scripts\sync-to-app.ps1
```

Copies: bibles, `docs/books/`, `book-format-spec.md`, curriculum JSON.  
Does **not** copy validate/compile/export scripts.

See `../gita-grove-authoring/SYNC.md` for full details.

## Working in this repo

Synced manuscripts and curriculum live here so the app can import them. **No generation tooling in this repo** — open **gita-grove-authoring** for validate, compile, KDP export, and `grove:generate-story`.

Cursor skills here are a lightweight copy for reading synced content; the engine repo remains canonical for tooling.

**Branch policy:** `main` = live website — Grove content changes on **`feature/gita-grove`** only.

**Legacy** `sd*` / `sk*` theme pipeline rules live in `.cursor/rules/gita-chatgpt-theme-stories.mdc` — separate from Grove v2.
