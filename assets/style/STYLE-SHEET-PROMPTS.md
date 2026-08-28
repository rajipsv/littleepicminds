# Style reference prompts — Gita Grove locations

One **location style PNG** per major Grove training ground. Each locks lighting, palette, and signature nature elements for `--sref` (Midjourney) or style-reference uploads in other tools.

Canonical specs live in [`manifest.json`](manifest.json). Page art picks the ref from the adventure **location** in curriculum (see `npm run grove:images`).

## Shared rules

- Soft watercolor / gentle picture-book look, full color
- **No characters, no text** — establishing shot only
- **1:1 square** composition (`--ar 1:1`)
- Do **not** mix locations in one PNG (no starry night + meadow flowers in the same ref)

**Midjourney:** upload an approved location ref → `--sref {url}`. After first approved ref, use it when generating the next location for palette consistency.

---

## Blossom Meadow

**Save as:** `assets/style/blossom-meadow-sref.png`  
**Book 1:** `gv01_a1` · **Lighting:** golden hour

```
Gita Grove children's picture book establishing shot, Blossom Meadow, soft watercolor,
full color, warm golden hour lighting, soft yellow-pink wildflowers, gentle green rolling
hills, distant fair tents and flower strings, peaceful open sky, no characters, no text, 1:1
```

---

## Courage Hill

**Save as:** `assets/style/courage-hill-sref.png`  
**Book 1:** `gv01_a2` · **Lighting:** sunrise gold

```
Gita Grove children's picture book establishing shot, Courage Hill, soft watercolor,
full color, clear sunrise gold lighting, steep grassy hill with stone steps, starting line
and ribbon poles, small ceremony stage at the top, warm gold and green tones, no characters,
no text, 1:1
```

---

## Rainbow Bridge

**Save as:** `assets/style/rainbow-bridge-sref.png` · **Lighting:** soft midday

```
Gita Grove picture book establishing shot, Rainbow Bridge location, soft watercolor,
midday soft light, winding stream below, arched wooden bridge, vibrant gentle greens,
friendly storybook trees, no characters, no text, 1:1
```

---

## Kindness Garden

**Save as:** `assets/style/kindness-garden-sref.png` · **Lighting:** misty morning

```
Gita Grove picture book establishing shot, Kindness Garden, soft watercolor, misty soft
morning light, vegetable beds and fruit trees, wooden sharing bench, gentle ant paths,
warm greens and earth tones, no characters, no text, 1:1
```

---

## River of Patience

**Save as:** `assets/style/river-of-patience-sref.png` · **Lighting:** overcast calm

```
Gita Grove picture book establishing shot, River of Patience, soft watercolor, overcast
calm post-rain lighting, slow gentle stream, stepping stones across water, paper boats
and lotus at the edge, deeper soft blues and grey-green water, no characters, no text, 1:1
```

---

## Moonlight Library

**Save as:** `assets/style/moonlight-library-sref.png` · **Lighting:** starry twilight + lamp glow

```
Gita Grove picture book establishing shot, Moonlight Library exterior or nook glimpse,
soft watercolor, starry twilight with warm owl-lamp glow, blue-grey and soft gold tones,
books and gentle magic, not scary dark night, no characters, no text, 1:1
```

---

## Series fallback (optional)

**Save as:** `assets/style/grove-picture-book-sref.png` — copy of Blossom Meadow or your default Grove look when location is unknown (e.g. Tree of Wisdom).

Character refs: [`../characters/CHARACTER-SHEET-PROMPTS.md`](../characters/CHARACTER-SHEET-PROMPTS.md)
