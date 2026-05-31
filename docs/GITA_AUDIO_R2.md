# Gita chant audio on Cloudflare R2

**Production requires R2.** The app does not stream or proxy Hugging Face at runtime. WAVs load only from:

`{GITA_AUDIO_BASE_URL}/{verseId}.wav`

Line-by-line playback still uses `lineEnds` / `introEnd` from `/api/gita-audio/manifest` (timings only).

## 1. Sync and timings (on your machine)

```bash
npm run gita:sync-hf-audio
npm run gita:line-timings
npm run gita:qa-segments
```

## 2. Upload to R2

Create an R2 bucket with public access (custom domain or `*.r2.dev`). In `backend/.env` (do not commit):

```
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_BASE_URL=https://pub-xxxxx.r2.dev
```

```bash
npm run gita:upload-r2
# dry run: npm run gita:upload-r2 -- --dry-run
# one chapter: npm run gita:upload-r2 -- --chapter=1
```

## 3. CORS (required for seek / preload)

In Cloudflare: R2 → bucket → Settings → CORS, paste [`scripts/r2-cors-gita-audio.json`](../scripts/r2-cors-gita-audio.json).

Or with Wrangler:

```bash
wrangler r2 bucket cors put YOUR_BUCKET --file scripts/r2-cors-gita-audio.json
```

## 4. Vercel env (required)

| Variable | Value |
|----------|--------|
| `GITA_AUDIO_BASE_URL` | `https://pub-xxxxx.r2.dev` (no trailing slash) |
| `VITE_GITA_AUDIO_BASE_URL` | same (frontend build) |

Without both, chant URLs are `null` and line play fails. Redeploy after setting env. Network tab must show only `pub-….r2.dev/*.wav` — not `/api/gita-audio/1.1` or `datasets-server.huggingface.co`.

Upload **all** chapters to R2 before enabling production; missing objects return 404.

## 5. Verify line segments

After deploy, in Gita Learn:

- **1.1** (with intro text): row 1 chant starts after narrator (~3s), not from 0s.
- **2.47**: four distinct row clips.
- Run `npm run gita:qa-segments` before deploy when timings change.
