# Picture book framework

**Full spec:** [`docs/book-format-spec.md`](../../../../docs/book-format-spec.md)

## Trim & layout (Seeds default)

- **6" × 9"** portrait · stacked spread: 1:1 art top + text band below
- Story spread: **40–60 words** EN
- Art export: ≥1425×1425 px (300 DPI for 4.75" print width)

## Spread pacing

| Moment | Layout note |
|--------|-------------|
| Opening | Establish place + lead |
| Rising | Medium emotional intensity |
| Problem peak | Optional full-page drama (p. ~13) |
| Resolution | Warm · quiet possible |
| Moral zone | Large type — learning skill |

## Sendak frame-size arc (optional drama spreads)

- Setup: smaller composition, more white space  
- Rising: medium frames  
- Climax: fullest bleed / closest camera  
- Resolution: intimate · smaller again  

## Page block format (manuscript `.md`)

```markdown
### Page 7

Mira looked at the tiny seed...

**Illustration:** Mira kneeling beside garden bed at golden hour…
```

## story.json schema

```json
{
  "adventureId": "gv01_a1",
  "defaults": { "styleSuffix": "…" },
  "pages": [
    { "beat": "…", "text": "…", "imagePrompt": "…" }
  ]
}
```

## Module character bible (before page prompts)

| Field | Lead | Supporting |
|-------|------|------------|
| Age | from six-children | from six-children |
| Hair, clothing | locked | locked |
| Signature object | optional | optional |
| Expression arc | this adventure | supporting role |
