# 🕉️ littleEpicMinds

Welcome to **littleEpicMinds** – a premium, interactive learning platform designed to help children master the wisdom of the **Bhagavad Gita** and the **Hanuman Chalisa**!

![littleEpicMinds Preview](https://img.shields.io/badge/Status-Beta-orange?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20Postgres-blue?style=for-the-badge)

## ✨ Features

- **Interactive Verse Discovery**: Navigate through Shlokas with ease using our child-friendly dropdown system.
- **English Transliteration**: Primary learning text in English for easy pronunciation and memorization.
- **Wisdom Path (4-Step Mastery)**:
  1. 🎧 **Listen**: High-quality AI-powered audio (via Sarvam AI).
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
   - `SARVAM_API_KEY`: Your API key for high-quality Indian TTS.
   - `JWT_SECRET`: A secure string for user authentication.
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
   # Create a .env file with your DATABASE_URL and SARVAM_API_KEY
   node migrate.js # Initialize database tables
   node server.js
   ```

3. Setup the Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📜 Credits & Content
Content is ported and enhanced from the original *Gita Kids Hub* data, restructured for a more immersive and gamified experience.

---
*Created with ❤️ for the next generation of little epic minds.*
