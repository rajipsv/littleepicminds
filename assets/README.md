# Gita Grove art assets

Canonical **character reference images** and **style reference** for AI illustration. Tool-agnostic PNG files — use with Midjourney, Leonardo, ComfyUI, fal.ai, or any generator that accepts reference uploads.

## Layout

```
assets/
  characters/
    manifest.json              # IDs, paths, bible links — start here
    gulu/reference-sheet.png     # Primary ref per character (--cref / upload)
    mimi/ … bobo/ timo/ kiki/ guru-ma/
    guests/pip/ …                # Adventure-specific guests
  style/
    grove-picture-book-sref.png  # Locked palette + illustration style (--sref)
```

## Before generating page art

1. Create **`reference-sheet.png`** for each core character (see [`docs/character-bible.md`](../docs/character-bible.md) illustration notes).
2. Seeds proportions: big heads, simple limbs.
3. Optional: expression PNGs in each `expressions/` subfolder (happy, scared, thinking, sorry, proud).
4. Create **`assets/style/grove-picture-book-sref.png`** — one approved Grove world sample.
5. Set `"status": "approved"` in [`characters/manifest.json`](characters/manifest.json) when refs are final.

## Tool usage

| Tool | Character ref | Style ref |
|------|---------------|-----------|
| **Midjourney** | Upload `reference-sheet.png` → `--cref {url}` | `--sref` with style PNG |
| **Leonardo.ai** | Character Reference → upload sheet | Style reference upload |
| **ComfyUI / fal.ai** | IP-Adapter → path from manifest | Style image node |
| **ChatGPT / DALL-E** | Attach PNG (weaker consistency) | Attach style PNG |

**Prompt per story page** (from `*.story.json`):

```
{imagePrompt}, {defaults.styleSuffix}, no text, no watermark, 1:1
```

**Layout rule:** Color art in top zone only; all book text stays **black on white** (see [`docs/book-format-spec.md`](../docs/book-format-spec.md)).

## Generated page art (not here)

Save finished spreads to **`output/images/{adventureId}/`** (gitignored). Only approved **character/style refs** live in `assets/`.

## CLI helper

```bash
npm run grove:images -- --id=gv01_a1
npm run grove:character-prompts
```

Prints per-page prompts + manifest ref paths (does not call an image API yet).
