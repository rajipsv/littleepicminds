# Remember framing (book voice)

**Where:** Remember section only (pages 17–19 area). **Never** in story body.

## Human-only cast

**No Guru Ma Owl.** No mentor character speaks the śloka. Remember uses **book voice**.

## Formula

1. Open: **In the Bhagavad Gita** (or *from India's great puranas*)
2. One–three sentences: plain-English meaning of **paired/display ślokas**
3. Close: tie to what the **child already felt** in the adventure — not "this story was about verse X"

## Example tone

> In the Bhagavad Gita, a great warrior stands before a battle he did not choose. His hands shake. His mind will not settle. He cannot see a good path — and he says so honestly. That is not weakness. That is where clarity can begin.

## Seeds vs grown-up

| Layer | Content |
|-------|---------|
| Remember (child-facing) | Transliteration + child meaning; book-voice framing |
| Grown-up page | May cite Arjuna, Kṛṣṇa, verse refs |

## Pairing ślokas

1. Story + emotional landing complete
2. Use **primaryShloka** from module registry as anchor
3. Curriculum `shlokas[]` holds the **2 display refs** (typically first + last of range)
4. Run **`npm run grove:sync-remember-shlokas -- --id=gv##_a#`** — pulls text from `lib/data/chapters/` or MCP
5. Write **rememberLine** (book voice only) from verse meaning + this adventure's childConnection
6. Set curriculum: `shlokasStatus: "verified-repo"` (set by sync script)

## Field migration

| Legacy | New |
|--------|-----|
| `guruMaLine` | `rememberLine` (prefer new name on update) |

## Anti-patterns

- ❌ Guru Ma Owl or any character lecturing
- ❌ Same rememberLine on every adventure
- ❌ Śloka driving the plot title
- ❌ Hand-crafted transliteration or Sanskrit
- ❌ Invented Sanskrit
- ❌ Verse before the child has lived the problem
