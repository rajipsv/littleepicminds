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

This project is optimized for Vercel deployment. 

1. **Import** the repository to Vercel.
2. Select **`frontend`** as the **Root Directory**.
3. Add the following **Environment Variables**:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `JWT_SECRET`: A secure string for user authentication.
   - `TTS_PROVIDER`: `auto` (default), `sarvam`, `hybrid`, `google`, or `browser`.
   - `SARVAM_API_KEY`: Optional; Sarvam Bulbul v3 (Priya voice) when you have credits (signup may include trial).
   - `GOOGLE_TTS_API_KEY`: Optional; needs GCP billing account even for free tier.
   - `TRANSLATE_LIVE`: `false` in production (use `npm run gita:translate-lines` batch cache).
4. Click **Deploy**!

## 🛠️ Local Development

### Prerequisites
- Node.js installed.
- A PostgreSQL database (or Neon.tech account).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rajipsv/littleepicminds.git
   ```

2. Setup the Backend:
   ```bash
   cd frontend/backend
   npm install
   # Copy backend/.env.template → backend/.env (DATABASE_URL, GOOGLE_TTS_API_KEY, etc.)
   node migrate.js # Initialize database tables
   node server.js
   ```

3. Setup the Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🎙️ Voice (TTS) — free options (no Google billing)

| Option | Cost | Card required? | Quality |
|--------|------|----------------|---------|
| **Browser voice** (built-in fallback) | $0 | No | OK; varies by device |
| **Sarvam** (`SARVAM_API_KEY`) | Trial / paid credits | Signup only | Best Indian accent (Priya, Telugu/Hindi) |
| **Bhashini** ([bhashini.gov.in](https://bhashini.gov.in/ulca/user/register)) | Free for PoC | No | Telugu, Hindi, Sanskrit; API key after email verify |
| **Pre-warmed cache** (`npm run gita:prewarm-tts`) | $0 after one-time generate | Only if you use a paid API once | Same as provider used to build cache |
| **Google Cloud TTS** | Free tier exists | **Yes** (billing account) | Good te/hi/en |

**Recommended without a credit card:** set `TTS_PROVIDER=auto` and `SARVAM_API_KEY` if you have Sarvam credits, otherwise the app uses **browser TTS** automatically when the server has no keys.

## 🎙️ Voice (TTS) and translation

| Script | Purpose |
|--------|---------|
| `npm run gita:prewarm-tts` | Generate audio once into cache (no repeat API cost on replay) |
| `npm run gita:tts-cache-stats` | Show cache folders and file count |
| `npm run gita:translate-lines` | Batch EN→TE line meanings into `lib/data/line-te-cache.json` |
| `npm run gita:sync-hf-audio` | Download per-śloka chanting WAV (Apache-2.0 HF dataset); add `-- --chapter=1` for one chapter |

- **TTS cache (important):** [`lib/tts/cache-store.js`](lib/tts/cache-store.js) stores one WAV per **line** (text + language). Full śloka play stitches the same cached lines with a short gap; line-by-line Listen uses the same clips. Run prewarm once locally, then deploy `lib/data/audio_cache` or keep `backend/data/audio_cache` on your server.
- **Śloka chanting (HF, Apache-2.0):** Audio by **Dhruv Jaradi** — [`JDhruv14/Bhagavad-Gita_Audio`](https://huggingface.co/datasets/JDhruv14/Bhagavad-Gita_Audio). Production uses HF CDN URLs in `lib/data/gita-verse-audio-manifest.json` (`npm run gita:sync-hf-audio -- --urls-only`). Re-run that command about once a year (signed URLs expire). Optional local WAV: `lib/data/gita_audio/`. See [`NOTICES.md`](NOTICES.md).
- **TTS providers**: [`lib/tts/`](lib/tts/) — `TTS_PROVIDER=auto` uses Sarvam if keyed, else Google if keyed; cache always checked first.
- **Translate**: Live `/api/translate-meaning` only when `TRANSLATE_LIVE=true`; otherwise cache-only (no Sarvam spend).

## 📜 Credits & Content
Content is ported and enhanced from the original *Gita Kids Hub* data, restructured for a more immersive and gamified experience.

---
*Created with ❤️ for the next generation of little epic minds.*
