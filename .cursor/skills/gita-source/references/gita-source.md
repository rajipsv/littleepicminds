# Gita source — data paths and sync

## Canonical verse data (Little Epic Minds repo)

```
lib/data/chapters/chapter{N}.js   # N = 1..18
```

Each verse key: `"2.47"` → `{ sanskrit, transliteration, en: { meaning, childMeaning }, telugu_script }`

Loader: `scripts/lib/grove-verse-source.js`

## Sync Remember blocks into manuscripts

```bash
npm run grove:sync-remember-shlokas -- --id=gv01_a1
node scripts/grove-sync-remember-shlokas.js --id=gv01_a1 --source=mcp
```

Sets curriculum `shlokasStatus`: `verified-repo` | `verified-mcp`

Adds audit comment: `<!-- verse-source: lib/data/chapters/chapter1.js -->`

## MCP — mcp-bhagavad-gita (Pipeworx)

Config (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "bhagavad-gita": {
      "url": "https://gateway.pipeworx.io/bhagavad-gita/mcp"
    }
  }
}
```

| Tool | Use |
|------|-----|
| `list_chapters` | Chapter metadata |
| `get_chapter` | Summary + verse count |
| `get_verse` | Sanskrit, transliteration, multi-commentator English |

MCP provides **source text only**. Child meaning for Seeds print comes from repo curation when available.

## MCP — widegita (optional research)

```bash
pip install widegita-mcp
# or: uvx widegita-mcp
```

| Tool | Use |
|------|-----|
| `search_gita` | Thematic verse discovery during brief drafting |
| `get_commentary` | Shankara / Ramanuja / Madhva — grown-up page only |
| `get_verse` | Cross-check when repo row missing |

## Registry — locked verse refs

`docs/gita-grove/module-registry.json` → each module's `primaryShloka` and display pair in curriculum `shlokas[]`.

Do not change verse numbers without updating `scripts/build-gita-grove-v2-curriculum.js` and rebuilding registry.
