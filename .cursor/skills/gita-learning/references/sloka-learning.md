# Śloka learning — Remember layer

## Book voice (Remember only)

- **No Guru Ma.** No character lectures.
- Open: *In the Bhagavad Gita…*
- Close: tie to adventure feeling — not "this story was about verse X"

Full voice guide: `.cursor/skills/gita-grove-remember-shloka/reference-remember-voice.md`

## Sync command (required)

```bash
npm run grove:sync-remember-shlokas -- --id=gv##_a#
```

Sources: `lib/data/chapters/chapter{N}.js` → MCP fallback

## Display pair

- Registry `primaryShloka` = anchor (e.g. `1.28-1.30`)
- Curriculum `shlokas[]` = **2 display refs** (typically first + last of range)

## Fields

| Field | Who writes |
|-------|------------|
| Sanskrit, transliteration, child meaning | **gita-source** / sync script |
| rememberLine | **gita-learning** (book voice, per adventure) |
| childRepeatLine | Moral section · speakable 8–12 words |

## Understand layer

- Child meaning from repo — if too adult, fix `chapter{N}.js` `en.childMeaning`
- Moral = theme language, not Sanskrit jargon

## Memory cues (optional)

- Short phrase child can carry: *"Do my part."* · *"One step."*
- Not full śloka memorization pressure for Seeds

## Anti-patterns

- Hand-crafted transliteration
- Same rememberLine on every module
- Verse before child lived the problem
- Invented Devanagari
