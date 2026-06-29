# AI Sovereignties

A live map and research toolkit charting the infrastructure behind AI in
Australia (data centres, the mines, refineries, energy and water they draw, and
the ownership running through them) and the public debate forming around it.

- **Live map:** https://sovereignties.civicinterplay.io
- **On the website:** https://civicinterplay.io/sovereignties
- **Project explainer (methods + what each category is for):** https://studio-esem.notion.site/AI-Sovereignties-project-explainer-38d18df0b77581ab8465dcb65a6628ad

Part of [Civic Interplay](https://civicinterplay.io). Everything here is a draft.

## What's in this repo

- **The map** (`src/`): a Next.js app (OpenNext on Cloudflare Workers) that
  renders the Notion-backed Critical Infrastructure Tracker as an interactive
  map, with lenses for infrastructure type, ownership, water risk, and
  sovereignty register.
- **The contestation pipeline** (`pipeline/`): a TypeScript pipeline that pulls
  candidate contestation items (GDELT + a manual inbox), classifies them via
  Anthropic tool-use into a Notion database, and resolves each to a site. See
  [`docs/CONTESTATION-PIPELINE.md`](docs/CONTESTATION-PIPELINE.md).
- **Docs** (`docs/`): [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) (the system and a
  "transportable vs dependency" sovereignty ledger) and the pipeline runbook.

## Live data from Notion

The map is **driven live by the Notion "Critical Infrastructure Tracker —
Australia" database**. There is no hardcoded data:

- `src/app/api/sites/route.ts` queries the database and returns GeoJSON. Any row
  with both a **Latitude** and a **Longitude** becomes a point on the map.
- `src/app/components/Map.tsx` fetches `/api/sites` on load.

Edit a row in Notion (or add one with coordinates), refresh the map, and it
updates. The API caches for 60s, so allow up to a minute.

## Configuration

Two values are required:

| Variable | Where it runs | Purpose |
|---|---|---|
| `NOTION_TOKEN` | server-side (runtime) | Notion internal integration secret; reads the tracker |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | client (**build-time**) | Mapbox public token (`pk....`); renders the base map |

> **Important:** `NEXT_PUBLIC_MAPBOX_TOKEN` is inlined into the client bundle at
> **build time**. If a build runs without it, the map ships broken (a blank page
> with "a client-side exception has occurred"). It must be present wherever the
> build happens.

### Local setup

1. Copy `.env.example` to `.env.local` and fill in both values.
2. **Notion:** create an internal integration at
   https://www.notion.so/my-integrations, copy its secret into `NOTION_TOKEN`,
   then open the tracker in Notion, `•••` → **Connections**, and add the
   integration so it can read the database.
3. **Mapbox:** copy a public token from https://account.mapbox.com into
   `NEXT_PUBLIC_MAPBOX_TOKEN`.
4. New tracker rows need **Latitude** / **Longitude** to appear; rows without
   coordinates (e.g. national policy signals) are skipped.

### Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

## Deploy

Production runs on Cloudflare Workers (OpenNext). The Cloudflare build holds
`NOTION_TOKEN` and `NEXT_PUBLIC_MAPBOX_TOKEN`, so the reliable path is to **push
to `main` and let Cloudflare build and deploy**.

> **Do not run `npm run deploy` locally unless both tokens are in your build
> environment.** A local build without `NEXT_PUBLIC_MAPBOX_TOKEN` will overwrite
> the live Worker with a broken (tokenless) bundle. If that happens, recover with
> `npx wrangler rollback`, then redeploy via the Cloudflare build.

Where the values live for deploys:

```bash
# Server-side Notion secret on the Worker (runtime):
npx wrangler secret put NOTION_TOKEN          # or .dev.vars for local preview

# Client Mapbox token must be a BUILD variable (Cloudflare build settings),
# and in .env.local for any local build.
```

## The contestation pipeline

A companion to the map: it records public contestation around the tracked sites
into Notion, capturing the structure of a position (who, on what grounds, how
intensely, supporting or opposing) so it can be cross-tabbed against ownership
and sovereignty. It runs fortnightly via `.github/workflows/contestation.yml`
and needs `NOTION_TOKEN` and `ANTHROPIC_API_KEY` as repository secrets. Full
detail and the maintenance runbook are in
[`docs/CONTESTATION-PIPELINE.md`](docs/CONTESTATION-PIPELINE.md).

## Status, contributions, licence

This is research in progress and is offered as a draft. The underlying data is
open and exportable, and corrections are welcome, please open an issue or reach
out via [sarahbarns.com](https://sarahbarns.com).

Licence: to be confirmed. Please ask before reuse in the meantime.
