# KDP reference — Gita Grove interiors

## Trim sizes (from book-format-spec)

| Product | Trim | KDP print size setting |
|---------|------|------------------------|
| Seeds adventure module | 8.5" × 8.5" | 8.5 × 8.5 in |
| Seeds chapter book (~88 pp) | 8.5" × 8.5" | 8.5 × 8.5 in |
| Seekers (text-heavy option) | 8" × 10" portrait | 8 × 10 in |

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

## Word workflow

1. Export DOCX from manuscript markdown
2. Insert page breaks at page-map boundaries (pages 1–25)
3. Drop in B&W line art spreads
4. Save as PDF (embed fonts)
5. Upload to KDP

## Creating `scripts/kdp-reference.docx` (optional)

1. New Word doc → Layout → Size 8.5 × 8.5 in
2. Set styles: Title, Heading 1, Heading 2, Normal (Georgia 12pt)
3. Save as `scripts/kdp-reference.docx`
4. Use `--pandoc` for exports styled with that template
