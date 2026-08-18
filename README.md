# AI Sovereignties

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21026429.svg)](https://doi.org/10.5281/zenodo.21026429)

A map of Australia's critical AI infrastructure (rare-earth mines, refineries,
data centres, energy & policy signals), rendered with Mapbox.

Live at https://datacentres.civicinterplay.io

## Live data from Notion

The map is **driven live by the Notion "Critical Infrastructure Tracker — Australia"
database**. There is no hardcoded data:

- `src/app/api/sites/route.ts` queries the Notion database and returns GeoJSON.
  Any row with both a **Latitude** and a **Longitude** becomes a point on the map.
- `src/app/components/Map.tsx` fetches `/api/sites` on load.

Edit a row in Notion (or add a new one with coordinates) → refresh the map → it
updates. The API caches for 60s, so allow up to a minute.

### Setup

1. Copy `.env.example` to `.env.local` and fill in the values.
2. Create a Notion **internal integration** at
   https://www.notion.so/my-integrations and copy its secret into `NOTION_TOKEN`.
3. Open the tracker in Notion → `•••` → **Connections** → add your integration,
   so it can read the database.
4. New tracker rows need **Latitude** / **Longitude** filled in to appear on the
   map. Rows without coordinates (e.g. national policy signals) are skipped.

For Cloudflare (`npm run preview` / `npm run deploy`), set the secret on the
Worker too:

```bash
npx wrangler secret put NOTION_TOKEN
# For local `wrangler` preview, put NOTION_TOKEN in a .dev.vars file instead.
```

## Getting Started

Read the documentation at https://opennext.js.org/cloudflare.

## Develop

Run the Next.js development server:

```bash
npm run dev
# or similar package manager command
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Preview

Preview the application locally on the Cloudflare runtime:

```bash
npm run preview
# or similar package manager command
```

## Deploy

Deploy the application to Cloudflare:

```bash
npm run deploy
# or similar package manager command
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
