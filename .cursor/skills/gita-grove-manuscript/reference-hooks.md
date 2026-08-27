# Adventure serial hooks

## Purpose

Each 25-page module ends (page 25) with a **teaser** so Book N reads as one season, not isolated stories.

## Rules

1. Teaser = **feeling + wonder question**, not lesson recap
2. Name **next lead** + one vivid body/detail
3. Same **in-world clock** (Book 1 = Spring Fair week)
4. Next adventure **opening** (pages 2–3) may echo teaser (`openingHook` in curriculum)

## Book-level files

```
docs/books/gv{book}-book-hooks.md
```

Book 1 reference: `docs/books/gv01-book-hooks.md`

When starting Book 2+, copy Book 1 structure:

- Season frame (intro paragraph)
- Per-adventure: after / page 25 / opening hook / art tease
- Remember table (ślokas + Guru Ma)
- Quick reference table

## Last adventure in book

Page 25 = **book bridge** (Tree leaves, celebrate line) + optional tease to Book N+1 first adventure.

Book 1 close teases `gv02_a1` *Timo Won't Come Out*.

## Curriculum fields

```json
"nextAdventureId": "gv01_a3",
"page25Teaser": "...",
"page25WonderQuestion": "...",
"openingHook": "..."
```

## Example chain (Book 1)

| From | Hook |
|------|------|
| a1 → a2 | Mimi, ribbon, shaking paws at sunrise |
| a2 → a3 | Bobo grabs banner, runs on wet bridge |
| a3 → a4 | Gulu missing from fair list |
| a4 → Book 2 | Four leaves; Timo won't come out |
