# Gita Grove — Book Format Spec

**Version:** 1.3  
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
| **Trim (Seeds)** | **6" × 9" portrait** (KDP regular trim; default US paperback) |
| **Trim (Seekers)** | 6" × 9" or 8" × 10" portrait if text-heavy |
| **Trim (premium, future)** | 8.5" × 8.5" square full-color — separate SKU only |
| **Module binding** | Saddle-stitch if 24pp folded; **perfect bind** if 25 separate sheets |
| **Chapter binding** | Perfect bind; spine ≥ 3 mm (~80+ pp) |
| **Interior standard (Seeds default)** | **Color illustration** top zone + **black text** on white; color cover |
| **Interior economy (legacy)** | B&W line art + text; color cover only |
| **Interior premium** | Full color all spreads (₹249+ MRP) |
| **KDP print (USA)** | **Standard color interior** for color art modules (~$5–8+ print cost at ~25 pp); B&W option ~$2.30 at ≤110 pp if all line art |
| **KDP print (India)** | Not available on Amazon.in — use **Kindle ebook**; local offset print later |

---

## Page layout (Seeds story spreads)

**Live area:** 6" × 9" page, 0.5" top/bottom and 0.625" side margins → **4.75" × 8"** content.

**Stacked spread** (pages 5–12 and most story pages): 1:1 art on top, text below.

```
┌─────────────────────────┐  6"
│      (margin 0.5")      │
│  ┌───────────────────┐  │
│  │   1:1 color art   │  │  ~4.75" × 4.75"
│  │   (AI square)     │  │
│  └───────────────────┘  │
│  Story text block       │  ~2.5–3" band
│  40–60 words, 14–16 pt  │
└─────────────────────────┘  9"
```

**Art asset pipeline:** Character refs in [`assets/characters/`](../assets/characters/manifest.json). Generate **1:1 color** page masters (1024×1024 or 2048×2048). Save finished pages to `output/images/{adventureId}/` (gitignored). Export for print at **≥1425×1425 px** (4.75" × 300 DPI).

**Wide scenes:** Prompt square composition with wide field of view — do not use a separate aspect ratio.

**Full-page drama** (optional): Problem peak (p. 13) and resolution (p. 15) may use **full-page art + facing text page** instead of stacked layout.

---

## Seeds — 25-page adventure module map

| Page | Section | Word budget (EN) | Art note |
|------|---------|------------------|----------|
| 1 | Title | — | Adventure title, location icon, `gv##_a#` |
| 2 | Meet the friends | 20–40 | Lead character + who appears |
| 3–N | Story spreads | 40–60 each | One `###` block per page under `## Story`; stacked 1:1 art + text; **~320–480 words total** (N varies by adventure) |
| N+1 | Problem peak *(optional extra story page)* | 40–60 | Flaw moment — may be last story block |
| … | Resolution | 40–60 | Kind outcome — last story block before Moral |
| Moral | Moral | 1 sentence + child repeat line | Large type — first back-matter page after story |
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

## Manuscript file convention (hybrid)

```
docs/books/gv{book}_a{adv}-{slug}.md          # metadata, page map, back matter, art briefs
docs/books/gv{book}_a{adv}-{slug}.story.json  # story pages — canonical for generation/export
```

**`*.story.json` schema:**

```json
{
  "adventureId": "gv01_a1",
  "defaults": { "styleSuffix": "Children's picture book illustration, full color…" },
  "pages": [
    { "beat": "Opens", "text": "40–60 words…", "imagePrompt": "1:1 scene for AI art…" }
  ]
}
```

- **`pages`** is an ordered array — page numbers assigned at export (story from page 3).
- Legacy `*.pages.json` and `storyPages` field still load with deprecation warnings.

**Markdown:** Back matter only under `## Moral`, `## Remember`, etc. — one `###` block per printed page. `## Story` is optional generated preview (`npm run grove:compile`).

**KDP export:** `loadAdventure()` merges JSON + md → `npm run grove:export-kdp -- --format=book`. Story pages show image prompt + text; use `--full-module` for Moral → Teaser.

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
| 2026-08-27 | v1.3 — Color art + black text default; assets/characters manifest for AI refs |
