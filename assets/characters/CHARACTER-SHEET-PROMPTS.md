# Character sheet prompts — Gita Grove Seeds

Use these to generate **`reference-sheet.png`** for each character. Save output to the folder listed in [`manifest.json`](manifest.json), then set `"status": "approved"`.

## Shared style (append to every prompt)

```
Children's picture book character design reference sheet, Gita Grove Seeds,
soft watercolor and colored pencil style, full color, warm gentle lighting,
big head and simple limbs (ages 5-7 proportions), clean white background,
character turnaround plus expression row, no text, no labels, no watermark
```

**Recommended layout in prompt:** front view, three-quarter view, side view, and a row of five expressions (happy, scared, thinking, sorry, proud).

**Midjourney:** add `--ar 3:2` (wide sheet) or `--ar 1:1` (single hero pose first, then sheet).  
**After first approved character:** use `--cref` with that sheet when generating the next, and `--sref` once `assets/style/grove-picture-book-sref.png` exists.

---

## Style reference (generate once first)

**Save as:** `assets/style/grove-picture-book-sref.png`

```
Gita Grove children's picture book world sample, soft watercolor style, full color,
Blossom Meadow at golden hour, gentle rolling hills, friendly storybook trees,
warm yellow-pink flowers, peaceful magical grove atmosphere, no characters,
no text, establishing illustration for picture book series, 1:1 composition
```

---

## Gulu (squirrel)

**Save as:** `assets/characters/gulu/reference-sheet.png`

```
Character design sheet for GULU, a curious young squirrel age 6, Gita Grove Seeds.
Bushy reddish-brown tail, bright curious eyes, warm friendly face, small paws
often holding an acorn or leaf. Expression: thoughtful and kind, sometimes nervous.
Front view, three-quarter view, side view, expression row: happy, scared, thinking,
sorry, proud. Children's picture book character design reference sheet, Gita Grove Seeds,
soft watercolor and colored pencil style, full color, warm gentle lighting,
big head and simple limbs, clean white background, no text, no labels
```

---

## Mimi (rabbit)

**Save as:** `assets/characters/mimi/reference-sheet.png`

```
Character design sheet for MIMI, a gentle young rabbit age 5-6, Gita Grove Seeds.
Long expressive ears, soft brown or grey fur, sweet observant eyes, small paws
that often hold a ribbon, flower, or paintbrush. Shy but warm smile. Expression row
shows tummy-flutter nervousness and quiet bravery. Front, three-quarter, side views
plus happy, scared, thinking, sorry, proud expressions. Children's picture book
character design reference sheet, soft watercolor, full color, big head simple limbs,
white background, no text
```

---

## Bobo (monkey)

**Save as:** `assets/characters/bobo/reference-sheet.png`

```
Character design sheet for BOBO, an energetic young monkey age 6-7, Gita Grove Seeds.
Long arms, playful striped tail, bold grin, messy cheerful energy, often mid-leap
or mid-gesture. Generous eyes that look sorry when caught rushing. Front, three-quarter,
side views plus expression row: happy, scared, thinking, sorry, proud. Children's
picture book character design reference sheet, soft watercolor, full color,
big head simple limbs, white background, no text
```

---

## Timo (tortoise)

**Save as:** `assets/characters/timo/reference-sheet.png`

```
Character design sheet for TIMO, a kind young tortoise age 7, Gita Grove Seeds.
Round patterned shell, gentle old-soul eyes, calm small smile, short sturdy legs,
sometimes holding a leaf or small book. Patient and thoughtful expression. Front,
three-quarter, side views plus happy, scared, thinking, sorry, proud. Children's
picture book character design reference sheet, soft watercolor, full color,
big head simple limbs, white background, no text
```

---

## Kiki (myna bird)

**Save as:** `assets/characters/kiki/reference-sheet.png`

```
Character design sheet for KIKI, a witty young myna bird age 6, Gita Grove Seeds.
Bright yellow-orange beak, dark glossy feathers, clever head tilt, folded wings and
spread wings poses, often looks like she just noticed something funny. Small but
confident. Front, three-quarter, side views plus happy, scared, thinking, sorry,
proud expressions. Children's picture book character design reference sheet,
soft watercolor, full color, big head simple limbs, white background, no text
```

---

## Guru Ma Owl

**Save as:** `assets/characters/guru-ma/reference-sheet.png`

```
Character design sheet for GURU MA OWL, a warm elder owl guide, Gita Grove Seeds.
Soft grey feathers, round kind eyes, optional small round glasses, moonlight-library
wise grandmother energy, never stern or scary. Unhurried gentle smile. Front,
three-quarter, side views plus happy, scared, thinking, sorry, proud expressions.
Children's picture book character design reference sheet, soft watercolor, full color,
white background, no text, approachable not preachy
```

---

## Pip (guest — field mouse, gv01_a1)

**Save as:** `assets/characters/guests/pip/reference-sheet.png`

```
Character design sheet for PIP, a small field mouse guest character, Gita Grove Seeds.
Round ears, tiny paws tucked when nervous, small and easily overlooked, shiny anxious
eyes that soften when brave. Shy posture on wooden steps. Front, three-quarter, side
views plus happy, scared, thinking, sorry, proud. Children's picture book character
design reference sheet, soft watercolor, full color, big head simple limbs,
white background, no text
```

---

## Diya (guest — firefly, Books 2+)

**Save as:** `assets/characters/guests/diya/reference-sheet.png`

```
Character design sheet for DIYA, a gentle firefly guest character, Gita Grove Seeds.
Soft yellow-green bioluminescent glow, tiny delicate wings, summer evening light,
memory and wonder feeling, poetic and calm not cartoon-bug silly. Small scale next
to a flower for size reference. Front, three-quarter, side views plus happy, scared,
thinking, sorry, proud. Children's picture book character design reference sheet,
soft watercolor, full color, white background, no text
```

---

## Midjourney quick copy (example — Kiki)

```
/imagine Character design sheet for KIKI, a witty young myna bird age 6, Gita Grove Seeds. Bright yellow-orange beak, dark glossy feathers, clever head tilt, front and three-quarter views, expression row happy scared thinking sorry proud, soft watercolor picture book style, full color, white background, no text --ar 3:2
```

After saving Kiki's sheet, generate Mimi with:

```
... same Mimi prompt ... --cref {kiki_sheet_url} --sref {style_sheet_url} --ar 3:2
```

---

## Order of generation (recommended)

1. **Style ref** → `assets/style/grove-picture-book-sref.png`
2. **Core cast** (any order): Gulu, Mimi, Bobo, Timo, Kiki, Guru Ma
3. **Guests when needed:** Pip (Book 1), Diya (Book 2+)

After each approval: update `manifest.json` → `"status": "approved"`.
