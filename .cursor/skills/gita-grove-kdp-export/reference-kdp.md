# KDP reference — Gita Grove interiors

## Trim sizes (from book-format-spec)

| Product | Trim | KDP print size setting |
|---------|------|------------------------|
| Seeds adventure module | 6" × 9" portrait | 6 × 9 in |
| Seeds chapter book (~88 pp) | 6" × 9" portrait | 6 × 9 in |
| Seekers (text-heavy option) | 8" × 10" portrait | 8 × 10 in |
| Premium square (future SKU) | 8.5" × 8.5" | 8.5 × 8.5 in — large trim, higher cost |

6×9 is **KDP regular trim** (cheaper than 8.5×8.5 large trim). At ≤110 pages B&W on Amazon.com, print cost is ~**$2.30** per copy.

## Stacked page layout (story spreads)

| Zone | Size | Content |
|------|------|---------|
| Top | ~4.75" × 4.75" | 1:1 B&W line art (AI square master) |
| Bottom | ~2.5–3" band | Story text, 40–60 words, 14–16 pt |

Margins: 0.5" top/bottom, 0.625" left/right → **4.75" × 8"** live area.

**Art pixels:** Generate 1:1 at 1024×1024 or 2048×2048; print export ≥ **1425×1425 px** (300 DPI).

## Margins (starting point)

| Edge | Inches | Notes |
|------|--------|-------|
| Top / bottom | 0.5 | Increase if header/footer art |
| Outside | 0.625 | |
| Gutter | +0.125–0.25 | For perfect-bound 80+ pp chapter books |

Script defaults are editorial — **always verify in KDP previewer**.

## Bleed

- Text-only interior export: **no bleed** required
- Full-bleed illustrations: extend art 0.125" past trim; export PDF with bleed from layout tool

## KDP upload mapping

| KDP field | Grove source |
|-----------|--------------|
| Interior | `output/kdp/*.docx` → PDF in Word if needed |
| Cover | Separate design (not from markdown export) |
| Page count | Module ~25; chapter book ~84–88 |
| Language | English (Telugu edition later) |
| Ink type | **Black & white** interior (economy tier) |
| Paper | White |
| Cover | Full color PDF uploaded separately |

## Word workflow

1. Export DOCX from manuscript markdown:
   - `--format=book` — full front matter + paginated 25-page body + back matter
   - `--layout=stacked` — draft export with art placeholders per story section
2. Or start from [KDP 6×9 Word template](https://kdp.amazon.com/en_US/help/topic/G201834230)
3. Insert page breaks at page-map boundaries (pages 1–25) if using draft export
4. Drop 1:1 B&W line art in top zone of each story page
5. Place story text in bottom band
6. Optional: [Amazon Endure font](https://kdp.amazon.com/en_US/help/topic/G201834230) to reduce page count
7. Save as PDF (embed fonts)
8. Upload to KDP

### `--format=book` front matter (per adventure)

Based on [`ch2slk47_6_9_v2.pdf`](../../../gita-grove-authoring/ch2slk47_6_9_v2.pdf) (6×9 reference). Edit copy in [`scripts/lib/grove-kdp-book-template.js`](../../../scripts/lib/grove-kdp-book-template.js).

| # | Section | Content |
|---|---------|---------|
| 1 | Title | GITA GROVE + adventure title (caps) + author name |
| 2 | Copyright | ©, All rights reserved, ISBN: |
| 3 | Dedication | DEDICATION + personal text |
| 4 | Illustration | Full-page art placeholder (no text) |
| 5 | Acknowledgments | Roman *i* + ACKNOWLEDGMENTS + thank-you text |
| 6+ | Body | Pages 1–25 from `### Page N` blocks in manuscript |
| last | About the author | ABOUT THE AUTHOR bio |

**Body art (`--format=book`):** `loadAdventure()` reads `*.story.json` + markdown back matter. Each story page = image prompt box + text. Use `--full-module` for Moral → Teaser. Legacy `*.pages.json` still loads with warnings.

**Validate:** `npm run grove:validate -- --id=gv01_a1` before export.

## India

KDP paperback is **not** distributed on Amazon.in. Publish **Kindle ebook** for India; local print is a separate channel.

## Creating `scripts/kdp-reference.docx` (optional)

Run once after clone:

```bash
node scripts/create-kdp-reference-docx.js
```

Or manually:

1. New Word doc → Layout → Size **6 × 9 in**
2. Set styles: Title, Heading 1, Heading 2, Normal (Georgia 12pt)
3. Save as `scripts/kdp-reference.docx`
4. Use `--pandoc` for exports styled with that template
