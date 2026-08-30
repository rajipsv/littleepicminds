# Series bible — continuity tracker

Update as modules ship. Source of truth for IDs/themes: `docs/gita-grove/module-registry.json`.

## Series overview

- **74 modules** · 18 books · human cast only
- ID pattern: `gv{book}_a{adv}`
- Branch: `feature/gita-grove`

## Per-book tracker (template)

### Book {N} · {chapterName}

| Field | Value |
|-------|-------|
| coreIdea | |
| bookAnchor lead | |
| moduleCount | |
| adventures | gv{N}_a1 … |

**Concepts introduced this book:**

- 

**Locations used:**

- 

**Character growth (lead arc):**

- 

**Teaser chain:**

- gv{N}_a1 → … → gv{N}_aM

## Global tracker

| Field | Update when |
|-------|-------------|
| Modules manuscript-complete | Each `gita-hub` delivery |
| Concepts NOT yet introduced | Before assigning exploratory verse |
| Repeated themes | `gita-quality` series check |
| Vocabulary introduced | Optional — key repeat phrases |

## Book hooks

Per-book teaser files: `docs/books/gv{NN}-book-hooks.md`

## Continuity rules

- Page 25 teaser must echo next module's opening hook
- Do not re-introduce a "first time" concept already shown in same book
- Cross-book: subtle callback OK · full repeat not OK

## Completed modules (update manually or via curriculum status)

| adventureId | theme | lead | status |
|-------------|-------|------|--------|
| gv01_a1 | Feeling overwhelmed | Vanshi | manuscript |

Pull latest from `scripts/data/gita-grove-curriculum.json` → `status` field.
