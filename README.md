# BooyahFF

An unofficial, fan-made Free Fire database platform built with Next.js (App Router). It serves a curated, provenance-tracked dataset — characters, weapons, pets, counter relationships and pre-match loadout items — plus comparison / build tools. No database, API keys or external services are required to run it.

## Stack

- **Next.js 16** (App Router, Cache Components / partial prerendering)
- **React 19**, **TypeScript** (strict)
- **Tailwind CSS 4** with shadcn/ui components and Radix primitives
- **framer-motion** (page/element reveals) and **GSAP ScrollTrigger** (hero parallax)
- **zod** schema validation for every data record

## Data pipeline

The upstream community dataset lives in a sibling folder `../free_fire_data_starter_kit`
(imported from the public `ff-center` community dataset). It is normalized into typed
JSON that this app reads at build/runtime.

```bash
# 1. import raw upstream records into the starter kit (Python 3.10+)
cd ../free_fire_data_starter_kit
python scripts/import_ff_center.py

# 2. normalize validated records into app-consumable JSON
npm run data:import      # scripts/export-data.mjs -> src/data/*.json

# 3. download item sprites into public/assets (Imgur-hosted, ~166 files)
npm run data:assets      # scripts/fetch-assets.mjs

# 4. validate the normalized output against the app schemas
npm run data:validate
```

Normalized output (committed, deterministic):

- `src/data/characters.json` — 64 characters
- `src/data/weapons.json` — 75 weapons
- `src/data/pets.json` — 23 pets
- `src/data/counters.json` — 23 counter profiles / 69 counter relationships
- `src/data/loadouts.json` — 4 pre-match loadout items
- `src/data/asset-index.json` — image asset manifest
- `src/data/status/*.json` — import provenance + asset sync logs

**Integrity rules:** never fabricate values. Missing stats are hidden or rendered as
"Not available"; no verified redeem codes / events exist in the dataset, so those
pages render honest empty states instead of placeholder content.

### Known upstream limitations

- `team_logos.json` is malformed upstream and cannot be parsed (documented in
  `src/data/status/data-status.json`).
- Pets have no verification metadata upstream (fields are `null` on purpose).
- Weapon patch notes stop at the 2026-04 snapshot; characters are reviewed through
  2026-06.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

QA gates:

```bash
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run build      # production build (includes both checks)
npm run start      # serve the production build
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage: category explorer, featured picks, tool showcase |
| `/characters`, `/characters/[slug]`, `/characters/[slug]/counters` | Character database + counter relationships |
| `/weapons`, `/weapons/[slug]` | Weapon stats with verification metadata |
| `/pets`, `/pets/[slug]` | Pet skills |
| `/loadouts`, `/loadouts/[slug]` | Pre-match loadout items with documented costs |
| `/tools/weapon-compare`, `/tools/character-compare` | Side-by-side comparison tools |
| `/tools/loadout-builder`, `/tools/sensitivity` | Loadout picker + sensitivity mixer (local only) |
| `/search`, `/api/search` | Full-database search (also `/` + `Ctrl+K` / `/` shortcuts) |
| `/guides`, `/updates` | Editorial placeholder pages (honest empty states) |
| `/about`, `/data-sources`, `/privacy`, `/terms` | Project context, provenance and policies |
| `sitemap.xml`, `robots.txt` | SEO support |

## Architecture notes

- **All data access goes through `src/lib/data/index.ts`.** Pages never read JSON
  files directly, so a future server/database backend can replace the JSON
  implementation without touching page code. Getters are marked `"use cache"`.
- **Types are generated from schemas** in `src/types/game.ts` (mirrored by
  `scripts/validate-data.mjs`), keeping scripts and app in sync.
- Search params (`q`, `role`, `type`, `sort`, `page`) drive all list pages; tools
  persist selections in the URL or `localStorage` (sensitivity tool only).
- Respect `prefers-reduced-motion` globally (CSS kill switch + `useReducedMotion`).

## Disclaimer

BooyahFF is a fan project and is **not affiliated with, endorsed by, or sponsored
by Garena or 111dots Studio**. Free Fire and related marks belong to their owners.
Game data reflects community documentation as of the import date and may be
incomplete or outdated — always verify in-game.
