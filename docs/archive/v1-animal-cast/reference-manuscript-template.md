# Manuscript template (gv##_a#)

Copy structure from pilots. Replace `{placeholders}`.

```markdown
# {adventureId} · {Title}

**Book:** {N} · {Power} · *{Book working title}*
**Grove Power:** {Power}
**Sub-skill:** {Sub-skill}
**Location:** {Location}
**Lead:** {Lead}
**Arc:** {I–V name}
**Audience:** Seeds (5–7)
**Status:** Manuscript v1.0 (English-first)

---

## Metadata

| Field | Value |
|-------|-------|
| ID | `{adventureId}` |
| Cast | {lead} (lead), {others} |
| Ślokas (Remember only) | {X.Y}, {X.Z} |
| Story feeling | {one line} |
| Word count (story) | ~{400} |
| Localization | English-first |
| Continues from | `{priorId}` — {one line} |

---

## Page map (25-page module)

| Page | Beat |
|------|------|
| 1 | Title |
| 2 | Meet {lead} |
| 3–{N} | Story spreads *(dynamic — one ### block per page under ## Story)* |
| {N+1} | Moral + repeat |
| … | Remember · Practice · Celebrate · Grown-up · Teaser |

*Page numbers for back matter are assigned at export time after the last story page. Optional `Page N —` in headings is for author reference only.*

---

## Story

<!-- generated from {adventureId}-{slug}.story.json — run npm run grove:compile -->

---

## Moral

### Moral

{One sentence.}

**Child repeat line:** "{short line}"

---

## Practice activities

### Practice

1. **{Name}** — {description}

### Practice

2. **{Name}** — {description}

### Practice

3. **{Name}** — {description}

---

## Remember

### Remember

**Celebrate:** "{Lead} grew **{Power}** — {specific moment}."

**Ślokas:** {refs}

**Guru Ma line:** "{Bhagavad Gita / puranas opening + śloka meaning}"

### Remember

**Child repeat:** "{same as moral section}"

**Grown-up:** {Power} + paired verse meaning for parents + discussion question

### Listen

Scan to hear the Remember song and ślokas with Guru Ma.

[QR placeholder — littleepicminds.com/grove]

---

## Celebrate

### Celebrate

"{Lead} grew **{Power}** — {specific moment}."

Cut out your {Power} leaf and place it on the Tree of Wisdom.

---

## For grown-ups

### For grown-ups

{Power} + paired verse meaning · discussion question

---

## Next adventure teaser

### Next adventure

> **Next adventure:** *{Title}*
>
> {3–4 lines + italic wonder question}

---

## Art briefs (key spreads)

| Spread | Scene |
|--------|-------|

---

## Change log

| Date | Change |
|------|--------|
| {date} | v1.0 — First Seeds manuscript |
```

## Story JSON (`{adventureId}-{slug}.story.json`)

```json
{
  "adventureId": "{adventureId}",
  "defaults": {
    "styleSuffix": "Children's book B&W line art, 1:1 square, Gita Grove Seeds, {location} palette"
  },
  "pages": [
    {
      "beat": "Opens",
      "text": "40–60 words per page…",
      "imagePrompt": "1:1 B&W line art scene description…"
    }
  ]
}
```

## Story craft notes

- **Canonical story source:** `*.story.json` — one `pages[]` entry per printed spread (~10–13 pages, ~320–480 words total).
- **Markdown:** back matter only; run `npm run grove:compile` to preview `## Story` in md.
- Short paragraphs; dialogue for Seeds
- Show flaw through action (Bobo rushes, Mimi shrinks, Gulu freezes, Timo hides, Kiki jokes too soon)
- Guest **Pip**, **Diya** only when synopsis says so
- Callbacks to prior adventure in same book: one light touch max
- Peak beat: lead wants old habit BUT chooses sub-skill
