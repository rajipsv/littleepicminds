# Gita Grove — Agent Architecture (v2 human cast)

How Cursor agents write Grove stories. Use the **6-skill pipeline** — start with `gita-grove-deliver-module` or `gita-grove-authoring-core`.

---

## Two repos

| Repo | Role |
|------|------|
| **gita-grove-authoring** | Story engine — validate, compile, export |
| **littleepicminds** (this) | Product — synced content, app, audio |

Content flows **engine → sync → app**.

---

## Design spine (v2)

- **74 modules** · IDs `gv{book}_a{adv}` · ~25 pp each
- **18 books** · one Bhagavad Gita chapter each · ~80 pp compiled
- **Human six-child cast only** — one lead + one supporting per module
- **Theme-first:** locked theme → adventure → śloka **last**
- **Remember = book voice** — "In the Bhagavad Gita…" — not a character

---

## Locked sources (read first)

| Doc | Content |
|-----|---------|
| `docs/gita-grove/module-registry.json` | 74 modules — theme, cast, śloka |
| `docs/gita-grove/module-bibles/` | Pre-generated beat sheets |
| `docs/gita-grove/six-children.md` | Human cast table |
| `docs/gita-grove/world-bible.md` | Neighborhood, locations |
| `docs/character-bible.md` | Full human character bible |
| `docs/gita-grove-capabilities.md` | 18 Grove Powers per book |
| `scripts/data/gita-grove-curriculum.json` | Curriculum entries |

---

## 6-skill pipeline

```
authoring-core → module-bible → module-manuscript → module-backmatter
  → remember-shloka → image-prompts → validate → curriculum sync
```

**Orchestrator:** `.cursor/skills/gita-grove-deliver-module/SKILL.md`

Module bibles already exist at `docs/gita-grove/module-bibles/{adventureId}.md` — refine before manuscript if needed.

---

## Module anatomy (25 pages)

See `docs/book-format-spec.md`.

| Section | Notes |
|---------|-------|
| Story pages | No śloka in body · no Arjuna/Krishna names (Seeds) |
| Remember | Book voice + paired ślokas · field: `rememberLine` |
| Celebrate | Name Grove Power for book |
| Page 25 | Teaser → next module |

---

## Regenerate bibles

```bash
node scripts/build-gita-grove-v2-curriculum.js
node scripts/generate-gita-grove-bibles.js
```

---

## Legacy (do not use)

v1 animal cast (Gulu, Mimi, Bobo, Timo, Kiki, Guru Ma) — archived under `docs/archive/v1-animal-cast/`.
