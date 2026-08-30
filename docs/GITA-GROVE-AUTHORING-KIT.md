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

Synced manuscripts and curriculum live here so the app can import them. **KDP export:** `npm run grove:export-kdp -- --file=docs/books/gv##_a#-….md --format=book --full-module` (wrapper → **gita-grove-authoring** engine). Validate/compile/generate still run only in the authoring repo.

Cursor skills here are a lightweight copy for reading synced content; the engine repo remains canonical for tooling.

## Skill architecture (Little Epic Minds)

Orchestrator: **`gita-hub`** → six engines:

| Engine | Role |
|--------|------|
| `gita-source` | Verse record, interpretation, wisdom map |
| `gita-story` | Beats, prose, transformation |
| `gita-grove-world` | Cast, locations, series continuity |
| `gita-picture-book` | 25-page structure, illustration prompts |
| `gita-learning` | Remember, Practice, module back matter |
| `gita-quality` | Read-only review (Create → Review → Improve) |

Shared audience rules: `.cursor/skills/gita-hub/references/age-5-10.md`

Legacy `gita-grove-*` skills redirect to the engines above.

**Branch policy:** `main` = live website — Grove content changes on **`feature/gita-grove`** only.

**Legacy** `sd*` / `sk*` theme pipeline rules live in `.cursor/rules/gita-chatgpt-theme-stories.mdc` — separate from Grove v2.
