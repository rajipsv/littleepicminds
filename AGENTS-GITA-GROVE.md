# Gita Grove — Agent Architecture

How Cursor agents write Grove stories. **Read `.cursor/skills/gita-grove-manuscript/SKILL.md` before drafting.**

---

## Two repos

| Repo | Role |
|------|------|
| **gita-grove-authoring** (this) | Bibles, manuscripts, curriculum, Cursor skills/rules |
| **littleepicminds** | React app, audio, legacy Gita theme import (`sd*`/`sk*`) |

Do **not** mix legacy theme auto-seed pipelines with Grove v2 manuscripts.

---

## Design spine

- **18 Grove Powers** — one print book each (~80–100 pp)
- **~65 adventures** — IDs `gv{book}_a{adv}` · 25-page internal modules
- **5 arcs** — Tree of Wisdom branch colors
- **Capability-first:** power → sub-skill → location → character flaw → plot → ślokas **last**

**Rejected as plot drivers:** pandit blocks, verse-shaped titles, Mahabharata cosplay in Seeds story body, śloka vocabulary in titles.

---

## Cast & world

| Doc | Content |
|-----|---------|
| `docs/universe-bible.md` | Map, Tree, learning loop, seasons |
| `docs/character-bible.md` | Gulu, Mimi, Bobo, Timo, Kiki, Guru Ma Owl, Diya |
| `docs/gita-grove-capabilities.md` | 18 powers, sub-skills, locations |
| `docs/gita-grove-series-v2.md` | Full adventure catalog + synopses |

---

## Manuscript pipeline

```
Curriculum entry (synopsis)
    → Read hooks for book (e.g. gv01-book-hooks.md)
    → Draft docs/books/gv##_a#-slug.md
    → Pair 2 ślokas + Guru Ma line (Bhagavad Gita / puranas)
    → Update scripts/data/gita-grove-curriculum.json
    → Optional: sync to littleepicminds (SYNC.md)
```

---

## Module anatomy (25 pages)

See `docs/book-format-spec.md`. Critical rules:

| Page | Section |
|------|---------|
| 3–15 | Story (~320–480 words Seeds) — **no Guru Ma lecture in body** |
| 16 | Moral + child repeat line |
| 17–19 | Remember — ślokas + **unique Guru Ma line** |
| 20–22 | Practice (sub-skill tied) |
| 23 | Celebrate — name Grove Power |
| 24 | Grown-up — power + discussion + verse refs |
| 25 | **Teaser** → next adventure in book |

---

## Guru Ma (Remember only)

- Open: *In the Bhagavad Gita, from India's puranas…*
- Reflect **meaning** of paired ślokas (agent should know Gita semantics)
- Story body: Grove friends only; grown-up page may name Dhritarashtra, Arjuna, etc.
- Book 1 lines: `docs/books/gv01-book-hooks.md` § Remember

---

## Localization

- **English-first** — `title_te`, story TE deferred
- Translation pass later (skill/MCP) — do not block manuscripts on Telugu

---

## Quality bar (Seeds 5–7)

- School/home analogies, simple language
- Light Gita link **only in Remember**
- One sub-skill per adventure
- Organic titles (moment-based, not verse labels)

**Seekers (8–10):** same IDs/art; deeper duty/fairness; may name Arjuna/Krishna in grown-up sidebar only.

---

## Agent invocation

| Task | Instruction |
|------|-------------|
| Draft adventure | "Use gita-grove-manuscript skill; draft gv03_a2" |
| Book hooks | "Extend gv02-book-hooks.md like Book 1" |
| Guru Ma line | "Pair ślokas X.Y for gv05_a1 and write Guru Ma Remember line" |
| Curriculum sync | "Update curriculum after gv01_a3 manuscript" |

---

## Files to read before writing Book N adventure M

1. `docs/gita-grove-capabilities.md` — Book N power + sub-skills
2. `docs/gita-grove-series-v2.md` — synopsis row
3. `docs/books/gv0N-book-hooks.md` — if exists; else create from Book 1 pattern
4. Prior adventure manuscript in same book — for continuity
5. `scripts/data/gita-grove-curriculum.json` — entry for `gv0N_aM`
