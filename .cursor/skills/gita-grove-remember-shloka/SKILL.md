---
name: gita-grove-remember-shloka
description: >-
  Write Gita Grove Remember section — paired ślokas, transliteration, child meaning, book-voice
  rememberLine. No Guru Ma; human-only cast. Use after module-manuscript and backmatter draft.
---

# Gita Grove Remember + śloka

## When to use

After adventure prose and emotional landing exist. **Last** narrative layer before image prompt polish.

## Read first

1. Module brief — `primaryShloka`, `childConnection`
2. [reference-remember-voice.md](reference-remember-voice.md)
3. `scripts/data/gita-grove-curriculum.json` — `shlokas` refs (display pair)
4. Completed story pages — verify feeling matches verse

## Śloka text — **never hand-craft**

Pull Sanskrit, transliteration, and child meaning from **one of these sources only**:

| Priority | Source | Path / tool |
|----------|--------|-------------|
| 1 (default) | **littleepicminds repo** | `lib/data/chapters/chapter{N}.js` |
| 2 (fallback) | **mcp-bhagavad-gita** | `get_verse` via `https://gateway.pipeworx.io/bhagavad-gita/mcp` |

**Do not** type transliteration from memory. **Do not** invent Devanagari.

### Sync command (required)

```bash
node scripts/grove-sync-remember-shlokas.js --id=gv01_a1
# or
npm run grove:sync-remember-shlokas -- --id=gv01_a1
# force MCP when repo row missing:
node scripts/grove-sync-remember-shlokas.js --id=gv01_a1 --source=mcp
```

Writes `<!-- verse-source: … -->` HTML comments in `.md` for audit. Updates curriculum `shlokasStatus` to `verified-repo` or `verified-mcp`.

## What you still write (book voice only)

- **rememberLine** — one paragraph, book voice, tied to this adventure's `childConnection` (not copied from repo verbatim unless adapted)

## Rules

- **Book voice only** — no Guru Ma, no character speaking ślokas
- **Experience first** — Remember echoes what the child already felt
- Display **2 śloka refs** from curriculum `shlokas[]` (first + last of anchor range unless overridden)

## Remember section shape (after sync)

```markdown
## Remember

### Page N — Śloka 1.28
<!-- verse-source: lib/data/chapters/chapter1.js -->
{Devanagari from source}
`{transliteration from source}`
**Child meaning:** {from source en.childMeaning or en.meaning}

### Page N+1 — Śloka 1.30
…

### Page N+2 — Remember line
{book voice — author writes this}
```

## Curriculum fields

```json
"shlokas": ["1.28", "1.30"],
"shlokasStatus": "verified-repo",
"rememberLine": "plain text, no markdown italics"
```

## Shared-anchor modules

When multiple modules share one verse (e.g. 4.34), **rememberLine** must reflect **this module's** childConnection — śloka text still comes from source sync.

## Next skill

→ `gita-grove-image-prompts`
