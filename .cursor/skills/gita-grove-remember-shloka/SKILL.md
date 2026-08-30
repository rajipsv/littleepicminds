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
3. `docs/gita-grove/module-registry.json`
4. Completed story pages — verify feeling matches verse

## Rules

- **Book voice only** — no Guru Ma, no Meera Aunty speaking ślokas, no character lecture
- **Never invent Sanskrit** — verify before publish; flag if uncertain
- **Experience first** — Remember echoes what the child already felt
- Pick **2 śloka refs** for Remember pages from anchor range (display verses)

## Remember section output (in `.md`)

```markdown
## Remember

### Page N — Śloka 1
Transliteration…
Child meaning…

### Page N+1 — Śloka 2
Transliteration…
Child meaning…

**Remember line:** "In the Bhagavad Gita… {book voice tied to semantic meaning}"
```

## Curriculum update

```json
"shlokas": ["1.28", "1.29"],
"shlokasStatus": "paired",
"rememberLine": "plain text, no markdown italics"
```

Legacy `guruMaLine` → copy to `rememberLine` when updating entries.

## Shared-anchor modules

When multiple modules share one verse (e.g. 4.34, 8.7), **adventure differentiates** — rememberLine must reflect **this module's** childConnection.

## Verification TODO

Before final lock: Devanagari, transliteration, literal meaning from authoritative Gita source.

## Next skill

→ `gita-grove-image-prompts`
