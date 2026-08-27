---
name: gita-grove-kdp-export
description: >-
  Export Gita Grove manuscript markdown (docs/books/gv##_a#.md) to Amazon KDP-ready
  DOCX. Use when the user asks for Word export, KDP, publish, print layout, docx,
  or Amazon paperback from Grove books.
---

# Gita Grove → Amazon KDP (DOCX)

## Quick start

```bash
npm install
npm run grove:export-kdp -- --file=docs/books/gv01_a1-the-fair-before-the-drum.md
```

Stacked layout (1:1 art placeholder + text zones for story spreads):

```bash
npm run grove:export-kdp -- --file=docs/books/gv01_a1-the-fair-before-the-drum.md --layout=stacked
```

Full 6×9 book layout (title, copyright, dedication, acknowledgements, story pages with image prompts, About the Author):

```bash
npm run grove:export-kdp -- --file=docs/books/gv01_a1-the-fair-before-the-drum.md --format=book
```

Include Moral → Teaser back matter as well:

```bash
npm run grove:export-kdp -- --file=docs/books/gv01_a1-the-fair-before-the-drum.md --format=book --full-module
```

Optional story JSON override:

```bash
npm run grove:export-kdp -- --file=docs/books/gv01_a1-the-fair-before-the-drum.md --format=book --story=docs/books/gv01_a1-the-fair-before-the-drum.story.json
```

Validate before export:

```bash
npm run grove:validate -- --id=gv01_a1
```

Output: `output/kdp/gv01_a1-the-fair-before-the-drum-book.docx` (with `--format=book`)

Export all manuscripts:

```bash
npm run grove:export-kdp:all
```

## What it produces

- **Format:** `.docx` (Word) — accepted by [Amazon KDP](https://kdp.amazon.com/) for paperback interior upload
- **Trim:** 6" × 9" portrait (Seeds default per `docs/book-format-spec.md`; KDP regular trim)
- **Layout:** Stacked — 1:1 art zone on top, text band below (with `--layout=stacked`)
- **Margins:** 0.5" top/bottom, 0.625" left/right — tune in Word before final upload
- **Sections:** Title, metadata, page map, story, moral, practice, Remember, teaser, KDP checklist
- **Omitted from print text:** Art briefs (stay in markdown for illustrators)

## After export (human steps)

1. Open DOCX in Word / LibreOffice (or paste into [KDP 6×9 Word template](https://kdp.amazon.com/en_US/help/topic/G201834230))
2. Apply final typography and **page breaks** (exporter emits one page per `###` block; story length is dynamic)
3. Drop **1:1 B&W line art** in top zone of each story page; text in bottom band
4. Optional: switch body to **Amazon Endure** font to reduce page count
5. KDP → Create paperback → **Black & white** interior, white paper → upload interior PDF + **cover PDF** separately
6. Use KDP previewer before publish

## Pandoc path (optional, higher fidelity)

If [Pandoc](https://pandoc.org/) is installed:

```bash
npm run grove:export-kdp -- --file=docs/books/gv01_a1-the-fair-before-the-drum.md --pandoc
```

Reference template: `scripts/kdp-reference.docx` (6×9 — run `node scripts/create-kdp-reference-docx.js` to generate).

## Not included (v1)

- PDF export (export DOCX → Save as PDF in Word, or add `--pdf` later)
- EPUB / Kindle ebook layout
- Full-bleed cover design
- Automatic 25-page pagination with embedded art
- Telugu parallel columns

## Files

| Path | Role |
|------|------|
| `scripts/export-grove-manuscript-kdp.js` | CLI |
| `scripts/lib/grove-manuscript/` | loadAdventure, validate, compile, generation prompts |
| `scripts/lib/grove-kdp/` | DOCX render (book + draft) |
| `scripts/lib/grove-kdp-book-template.js` | Front/back copy from `ch2slk47_6_9_v2.pdf` |
| `docs/books/*.story.json` | Canonical story pages |
| `output/kdp/` | Generated files (gitignored) |

## MCP note

No custom MCP server required — run the npm script. A future MCP could wrap the same CLI if you want one-click export from Cursor.

## littleepicminds app repo

Same scripts live under `littleepicminds` after sync. Run from either repo after `npm install`.

See [reference-kdp.md](reference-kdp.md) for trim, bleed, stacked layout, and KDP field mapping.
