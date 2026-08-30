# Gita interpretation rules

## Core principle

Every Grove module must demonstrate the teaching through **lived experience** — not explain it upfront.

```text
WRONG:  nice story → attach śloka at end
RIGHT:  Gita principle → child situation → story proves it → Remember names it
```

## Accuracy

| Check | Rule |
|-------|------|
| Fidelity | Story embodies the **core teaching** of the anchor verse(s) |
| Scope | Do not claim the verse teaches something it does not |
| Pairing | Display ślokas in Remember must match registry; arc may reference range |
| Distortion | Simplifying language ≠ changing the principle |

## Child-safe interpretation

- Translate **principle → everyday choice**, not **Sanskrit → moral slogan**
- Avoid fatalism, violence glorification, or caste-specific framing in Seeds body
- Fear, grief, confusion (Ch. 1) are valid — show honest feeling before resolution
- Karma yoga ≠ "winning is bad" — effort vs attachment to outcome

## Where Gita may appear

| Layer | Allowed |
|-------|---------|
| Story pages (3–14) | Feelings only · no verse quotes · no Krishna lectures |
| Remember | Transliteration + child meaning + **rememberLine** (book voice) |
| Grown-up page | Verse refs · may name Arjuna/Krishna · discussion question |
| Practice | Theme tied · not śloka memorization drills for Seeds |

## rememberLine (book voice)

See `.cursor/skills/gita-grove-remember-shloka/reference-remember-voice.md`

- Opens: *In the Bhagavad Gita…*
- No character speaks the śloka
- Ties to what the child **already felt** in the adventure

## When to reject a pairing

Flag `distortionCheck: REVIEW` and stop story generation if:

- The theme cannot be shown through action without lecturing
- The verse is only tangentially related
- The story would misrepresent the commentator consensus on the anchor verse

**Fix the story or change the module brief** — never bend the verse to fit weak prose.

## MCP vs repo

Repo `childMeaning` is curated for Seeds tone. MCP `get_verse` may return adult literal translation — run through child-friendly expression in VERSE RECORD, or improve `chapter{N}.js` at source.
