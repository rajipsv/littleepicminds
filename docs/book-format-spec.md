# Gita Grove — Book Format Spec

**Version:** 1.0  
**Applies to:** Seeds (5–7) adventure modules · compiled chapter books · Seekers overlay

---

## Product tiers

| Tier | SKU | Pages | MRP (India) | Notes |
|------|-----|-------|-------------|-------|
| **Adventure module** (internal) | `gv##_a#` | 25 interior | — | Design/build unit; not primary print SKU |
| **Chapter book** (print) | Book 1–18 | 80–100 | ~₹199 | Compiles 3–7 modules + bridge pages |
| **Ebook adventure** | `gv##_a#` | — | ₹49–79 | Digital single |
| **Seekers edition** | Same IDs | +8–12 vs Seeds | ~₹219 | Same art, deeper text |

---

## Trim & binding

| Choice | Spec |
|--------|------|
| **Trim (Seeds)** | 8.5" × 8.5" square (recommended) |
| **Trim (Seekers)** | 8.5" square or 8" × 10" portrait if text-heavy |
| **Module binding** | Saddle-stitch if 24pp folded; **perfect bind** if 25 separate sheets |
| **Chapter binding** | Perfect bind; spine ≥ 3 mm (~80+ pp) |
| **Interior economy** | B&W line art + text; **color cover**; optional 4pp color insert |
| **Interior premium** | Full color all spreads (₹249+ MRP) |

---

## Seeds — 25-page adventure module map

| Page | Section | Word budget (EN) | Art note |
|------|---------|------------------|----------|
| 1 | Title | — | Adventure title, location icon, `gv##_a#` |
| 2 | Meet the friends | 20–40 | Lead character + who appears |
| 3–4 | Adventure opens | 40–60 each | Location establishing shot |
| 5–12 | Story spreads | 40–60 each | 4 spreads × 2 pages; **~320–480 words total** |
| 13 | Problem peak | 40–60 | Flaw moment |
| 14 | — | — | **No Owl lecture** — show through action |
| 15 | Resolution | 40–60 | Kind outcome |
| 16 | Moral | 1 sentence + child repeat line | Large type |
| 17–18 | Remember | 2 ślokas | Transliteration + child meaning; **Guru Ma line** unique per adventure — *Bhagavad Gita / Indian puranas* framing, tied to paired śloka meaning |
| 19 | Listen | — | QR → app audio |
| 20–22 | Practice | — | 3 activities tied to **sub-skill** |
| 23 | Celebrate | — | Name **Grove Power**; Tree leaf cut-out |
| 24 | For grown-ups | 80–120 | Power + question + optional verse refs |
| 25 | Next adventure | — | Teaser + series list |

**Rule:** Never shrink below 25 pages — expand Practice/Remember, not clipart filler.

---

## Chapter book compile (example Book 1 · ~88 pp)

| Section | Pages |
|---------|-------|
| Season intro — Grove map, cast, Tree | 6 |
| Adventure 1–4 (compressed ~10 pp each) | 40 |
| Book bridge at Tree | 4 |
| Combined practice | 12 |
| Remember — all book ślokas | 14 |
| Celebrate + grown-up guide | 8 |
| **Total** | **~84–88** |

Compression: merge spreads; keep full module text in `docs/books/` source files.

---

## Language

| Layer | Seeds | Seekers |
|-------|-------|---------|
| Story | EN primary; TE in parallel fields / facing page optional | EN + TE; longer |
| Moral / activity | EN + TE | EN + TE |
| Remember ślokas | Transliteration + child meaning EN + TE | + brief context on grown-up page |
| Body text | **No** Mahabharata names | May name Arjuna/Krishna in narration only |

---

## Branding

- Spine: **Little Epic Minds** + book number (Book 01 of 18)
- Location color band on cover (Blossom Meadow = soft yellow-pink, etc.)
- Back cover: six friends lineup every book
- Market **page count + adventure count** — not śloka count

---

## Manuscript file convention

```
docs/books/gv{book}_a{adv}-{slug}.md
```

Each file includes: metadata, page map, story EN/TE, moral, activities, Remember, art briefs.

---

## QR / app deep link (future)

```
littleepicminds://grove/gv01_a1/remember
```

---

## Change log

| Date | Change |
|------|--------|
| 2026-08-27 | v1.0 — Initial format spec |
