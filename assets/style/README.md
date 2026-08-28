# Style reference

One approved **location style PNG** per major Grove training ground — locks palette, lighting, and signature elements for `--sref` / style-reference uploads.

## Layout

```
assets/style/
  manifest.json              # location → file, lighting, palette, status
  STYLE-SHEET-PROMPTS.md     # generation prompts per location
  blossom-meadow-sref.png    # gv01_a1, series fallback
  courage-hill-sref.png      # gv01_a2
  rainbow-bridge-sref.png
  kindness-garden-sref.png
  river-of-patience-sref.png
  moonlight-library-sref.png
  grove-picture-book-sref.png  # optional copy of Blossom Meadow for unknown locations
```

## Usage

| Tool | Style ref |
|------|-----------|
| **Midjourney** | `--sref` with location-matched PNG from manifest |
| **Leonardo.ai** | Style reference upload |
| **ComfyUI / fal.ai** | Style image node |

`npm run grove:images -- --id=gv01_a1` prints the **location-matched** style ref from curriculum + per-page prompts.

Character refs: [`../characters/manifest.json`](../characters/manifest.json)
