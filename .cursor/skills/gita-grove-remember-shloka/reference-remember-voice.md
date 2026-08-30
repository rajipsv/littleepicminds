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
3. Pick **2 display refs** for Remember pages (may be subset of range)
4. Write **rememberLine** (book voice) from verse **meaning**, not keyword match
5. Set curriculum: `shlokas`, `rememberLine`, `shlokasStatus: "paired"`

## Field migration

| Legacy | New |
|--------|-----|
| `guruMaLine` | `rememberLine` (prefer new name on update) |

## Anti-patterns

- ❌ Guru Ma Owl or any character lecturing
- ❌ Same rememberLine on every adventure
- ❌ Śloka driving the plot title
- ❌ Invented Sanskrit
- ❌ Verse before the child has lived the problem
