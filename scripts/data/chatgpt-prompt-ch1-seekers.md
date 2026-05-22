# ChatGPT prompt — Chapter 1 Seekers (13 stories)

Copy everything below the line into ChatGPT. Paste the JSON output into `scripts/data/chatgpt-stories-import.json`, then run:

```bash
npm run gita:import-chatgpt-stories
npm run gita:build-themes
```

---

You are writing moral stories for **Little Epic Minds**, a kids' Bhagavad Gita app.

**Audience:** Seekers level, ages **8–10** (slightly deeper than Seeds 5–7).  
**Tone:** Warm, modern school/home analogies. You **may** name Arjuna and Krishna and link gently to Chapter 1 verses.  
**Length:** Story `content` ~120–180 words EN; same idea in natural Telugu (`content_te`).  
**Required fields per story:** `id`, `title`, `title_te`, `emoji`, `micro_theme`, `micro_theme_te`, `storyTitle`, `storyTitle_te`, `content`, `content_te`, `moral`, `moral_te`, `activity`, `activity_te`.  
**Do not change:** `id`, `micro_theme` (English idea text).

Return **only** valid JSON:

```json
{ "stories": { "sk1_01": { ... }, ... "sk1_13": { ... } } }
```

## Stories to write

| id | shlokas | idea |
|----|---------|------|
| sk1_01 | 1.28, 1.29 | Fear and confusion can take over |
| sk1_02 | 1.29, 1.30 | Fear affects body and mind |
| sk1_03 | 1.30, 1.31 | Confusion makes decisions hard |
| sk1_04 | 1.31, 1.32 | Running away from duty |
| sk1_05 | 1.33, 1.34 | Attachment affects decisions |
| sk1_06 | 1.34, 1.35 | Hard choices with loved ones |
| sk1_07 | 1.35, 1.36 | Saying no to responsibility |
| sk1_08 | 1.36, 1.37 | Overthinking outcomes |
| sk1_09 | 1.38, 1.39 | Overthinking leads to stress |
| sk1_10 | 1.40, 1.41 | Confusion clouds right thinking |
| sk1_11 | 1.41, 1.42 | One negative thought leads to another |
| sk1_12 | 1.42, 1.43 | Fear of losing everything |
| sk1_13 | 1.44, 1.45 | Giving up mentally |

## Verse context (seeker meanings — summarize, do not quote verbatim)

- **1.28–1.29:** Arjuna filled with compassion and despair; limbs weak, mouth dry, trembling.  
- **1.30:** Bow slips, skin burns, cannot stand, mind reels.  
- **1.31–1.32:** Sees bad omens; no good in killing kin; does not want victory, kingdom, or pleasure.  
- **1.33–1.35:** Those he loves stand in battle; regards kin as self; would not slay them even for three worlds.  
- **1.36–1.37:** No joy in killing; sin; how be happy if kin die?  
- **1.38–1.39:** Others blinded by greed; he sees evil of destroying clan.  
- **1.40–1.42:** Ruin destroys traditions and law; chain of terrible outcomes.  
- **1.43–1.45:** Fear of hell and sin; alas, resolved to great wrong.

## Quality bar (match this style)

- One relatable child (name + situation), one clear link to Arjuna’s moment, one practical moral, one short activity.  
- Telugu must be child-friendly, not word-for-word translation.  
- Avoid duplicate Seeds stories (younger, simpler); Seekers can be longer and mention duty/fairness/truth more openly.
