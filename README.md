# 🕉️ littleEpicMinds

Welcome to **littleEpicMinds** – a premium, interactive learning platform designed to help children master the wisdom of the **Bhagavad Gita** and the **Hanuman Chalisa**!

![littleEpicMinds Preview](https://img.shields.io/badge/Status-Beta-orange?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20Postgres-blue?style=for-the-badge)

## ✨ Features

- **Interactive Verse Discovery**: Navigate through Shlokas with ease using our child-friendly dropdown system.
- **English Transliteration**: Primary learning text in English for easy pronunciation and memorization.
- **Wisdom Path (4-Step Mastery)**:
  1. 🎧 **Listen**: AI-powered audio (Google Cloud TTS optional; Sarvam Priya default for Indian languages).
  2. 🗣️ **Repeat**: Practice speaking the verse out loud.
  3. 🧩 **Match**: Interactive word-meaning matching game.
  4. ✍️ **Journal**: Reflection space to connect ancient wisdom with daily life.
- **Dynamic AI Gurus**: Specialized guidance from **Sri Krishna** (for the Gita) and **Hanuman Ji** (for the Chalisa).
- **Mastery Evaluations**: Earn scores and track progress through level-based quizzes (Seeds, Seekers, Warriors).
- **Premium Aesthetics**: A stunning "Dark Glassmorphism" UI that feels modern and magical.

## 🚀 Deployment (Vercel)

Production is **Vercel-only**: root [`vercel.json`](vercel.json) builds the frontend and routes `/api/*` to [`api/index.js`](api/index.js). Gita content lives in [`lib/data/`](lib/data/) (bundled via `includeFiles`). There is no separate Express server or `backend/data` mirror.

This project is optimized for Vercel deployment. 

1. **Import** the repository to Vercel.
2. Select **`frontend`** as the **Root Directory**.
3. Add the following **Environment Variables**:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `JWT_SECRET`: A secure string for user authentication.
   - `TTS_PROVIDER`: `hybrid` (default) — Sarvam then **Google fallback**; or `google`, `sarvam-only`, `browser`.
   - `SARVAM_API_KEY`: Primary TTS (Bulbul v3).
   - `GOOGLE_TTS_API_KEY`: **Fallback** when Sarvam fails (402/429); enable [Cloud Text-to-Speech API](https://console.cloud.google.com/apis/library/texttospeech.googleapis.com) on GCP.
   - `TRANSLATE_LIVE`: `false` in production (use `npm run gita:translate-lines` batch cache).
4. Click **Deploy**!

## Account security (commercial readiness)

- **Passwords:** bcrypt (12 rounds), minimum 8 characters with letters and numbers. Users change passwords under **Settings → Password & Security**.
- **Sessions:** JWT (`JWT_SECRET` required on Vercel). Default lifetime `7d` (`JWT_EXPIRES_IN` optional).
- **Roles:** Public signup is always `student`. Admins create `parent` / `admin` accounts from **Admin → Create account**.
- **Removed:** Hardcoded `admin123` backdoor — use `npm run db:seed-admin` with `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env`.
- **Rate limits:** Login, register, and password-change endpoints are throttled per IP.
- **Protected routes:** Settings, subscription, progress, and admin require login.

```bash
# After setting ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env
npm run db:seed-admin
```

## Testing and data scripts

The app is exercised on **Vercel** (`https://littleepicminds.vercel.app`). The frontend calls same-origin `/api` (no `localhost` API URL).

**On Vercel**, set env vars from [backend/.env.template](backend/.env.template) (database, TTS, `GITA_AUDIO_BASE_URL`, `VITE_GITA_AUDIO_BASE_URL`, etc.) and redeploy after changes.

**On your machine** (optional, for content/audio pipelines only): Node.js + `npm run gita:*` scripts (sync HF WAVs, line timings, upload R2). These do not require running a local web server.

## 🎙️ Voice (TTS) — free options (no Google billing)

| Option | Cost | Card required? | Quality |
|--------|------|----------------|---------|
| **Browser voice** (built-in fallback) | $0 | No | OK; varies by device |
| **Sarvam** (`SARVAM_API_KEY`) | Trial / paid credits | Signup only | Best Indian accent (Priya, Telugu/Hindi) |
| **Bhashini** ([bhashini.gov.in](https://bhashini.gov.in/ulca/user/register)) | Free for PoC | No | Telugu, Hindi, Sanskrit; API key after email verify |
| **Pre-warmed cache** (`npm run gita:prewarm-tts`) | $0 after one-time generate | Only if you use a paid API once | Same as provider used to build cache |
| **Google Cloud TTS** | Free tier exists | **Yes** (billing account) | Good te/hi/en |

**Browser voice (no API keys):** On Vercel set `TTS_PROVIDER=browser`, or on the frontend build set `VITE_TTS_BROWSER_ONLY=true` — meanings and lines use the device voice. With `hybrid` + keys, Sarvam/Google are tried first; **any failure automatically falls back to browser voice** in the app.

## 🎙️ Voice (TTS) and translation

| Script | Purpose |
|--------|---------|
| `npm run gita:prewarm-tts` | Generate audio once into cache (no repeat API cost on replay) |
| `npm run gita:tts-cache-stats` | Show cache folders and file count |
| `npm run gita:translate-lines` | Batch EN→TE line meanings into `lib/data/line-te-cache.json` |
| `npm run gita:sync-hf-audio` | Download per-śloka chanting WAV (Apache-2.0 HF dataset); add `-- --chapter=1` for one chapter |
| `npm run gita:pada-lines:export -- --chapter=N` | Draft 4 pada lines + meanings into `scripts/data/gita-pada-lines.json` |
| `npm run gita:line-breakdown -- --chapter=N` | Apply pada lines + meanings to `lib/data/chapters/chapterN.js` |
| `npm run gita:validate-line-breakdown -- --from=3 --to=9` | Check 4 rows, `chantIntro`, pada alignment |
| `npm run gita:fix-pada-meanings -- --from=1 --to=9` | Strip narrator gloss from row 0 when `intro` is set |
| `npm run gita:line-timings -- --chapter=N` | Pause-based chant sync (needs local WAVs in `lib/data/gita_audio/`) |
| `npm run gita:upload-r2` | Upload `lib/data/gita_audio/*.wav` to Cloudflare R2 (see `backend/.env.template`) |
| `npm run gita:qa-segments` | Assert manifest `lineEnds` + segment builder (1.1, 2.47, …) |
| `npm run gita:learn:setup -- --chapter=N` | All three steps above for one chapter |

- **TTS cache (important):** [`lib/tts/cache-store.js`](lib/tts/cache-store.js) stores one WAV per **line** (text + language). Full śloka play stitches the same cached lines with a short gap; line-by-line Listen uses the same clips. Run `npm run gita:prewarm-tts` locally, then commit/deploy `lib/data/audio_cache` (Vercel bundles it).
- **Śloka chanting (Apache-2.0, Dhruv Jaradi):** Dataset [`JDhruv14/Bhagavad-Gita_Audio`](https://huggingface.co/datasets/JDhruv14/Bhagavad-Gita_Audio). **Production playback is R2-only:** all `{verseId}.wav` on Cloudflare R2; set **`GITA_AUDIO_BASE_URL`** and **`VITE_GITA_AUDIO_BASE_URL`** on Vercel (required). Line segments use `lineEnds` + `introEnd` from the manifest (`npm run gita:line-timings` after local `gita:sync-hf-audio`). Pipeline: sync → upload (`npm run gita:upload-r2`) → CORS (`scripts/r2-cors-gita-audio.json`). Details: [`docs/GITA_AUDIO_R2.md`](docs/GITA_AUDIO_R2.md). See [`NOTICES.md`](NOTICES.md).
- **TTS providers**: [`lib/tts/`](lib/tts/) — `hybrid` tries Sarvam, then Google (te/hi/en WaveNet); cache checked first.
- **Translate**: Live `/api/translate-meaning` only when `TRANSLATE_LIVE=true`; otherwise cache-only (no Sarvam spend).
- **Four-line Meaning table (ch 3–9):** Export draft padas → edit `scripts/data/gita-pada-lines.json` (4 `lines`, optional `intro`) → `gita:fix-pada-meanings` for speaker verses → `gita:line-breakdown` → `gita:validate-line-breakdown`.

## 📜 Credits & Content
Content is ported and enhanced from the original *Gita Kids Hub* data, restructured for a more immersive and gamified experience.

---
*Created with ❤️ for the next generation of little epic minds.*
