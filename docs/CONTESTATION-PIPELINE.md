# Contestation pipeline

A companion to the Critical Infrastructure Tracker. It records discrete
instances of public contestation around the tracked data centre and
rare-earth sites, capturing the *structure of objection* (who, on what
grounds, how framed, how intensely) so it can be cross-tabbed against the
infra tracker's ownership, funding and sovereignty fields.

The argument lives in the absence as much as the presence: long lags between a
decision being locked and any contestation appearing, and foreign-owned sites
with a sovereignty claim that draw zero contestation, are the signal. That is
why the infra tracker now carries an **Approval date**, a **Contestation
count**, and an **Earliest contestation** rollup.

## How it runs

```
npm run pipeline -- --source gdelt --dry-run            # no key, no writes (plumbing check)
npm run pipeline -- --source gdelt --limit 5            # classify, print only
npm run pipeline -- --source inbox --limit 10 --write   # classify + write to Notion
```

Flow: retrieve candidates -> classify (Anthropic tool-use -> strict JSON) ->
resolve the site name to an infra-tracker page ID -> write to the Contestation
Tracker. Dedup is by source URL, so re-runs don't duplicate.

The **site resolver is deliberately conservative**: a weak or ambiguous match
yields no site link and a capped confidence, so the item is flagged for review
rather than misattributed. Misattribution is the worst error here.

## Secrets

Local runs read, in order: `~/.config/contestation/.env` (NOTION_TOKEN), then
`~/.config/contestation/anthropic.env` (ANTHROPIC_API_KEY), then the process
environment. The config files win so a `NOTION_TOKEN` exported in the shell
profile (e.g. another project's integration) can't shadow the pipeline's. In CI
the files are absent, so GitHub Actions secrets are used.

The pipeline uses the **Data Tracker** Notion integration, which has both
databases shared with it.

## What you maintain (roughly fortnightly)

- **Planning portals / inquiry submissions** — the richest, most explicitly
  framed material. When the pipeline flags a low-confidence site match, confirm
  or correct it. This is the one check that matters most.
- **Factiva (via RMIT)** — licensed, no scraping. Run your saved search, export,
  drop the file in `pipeline/inbox/` (see its README), then run with
  `--source inbox`.
- **Council minutes / town halls** — manual deep-dives on a few exemplar sites.
  Add by hand, or paste text into the inbox and let the classifier draft fields.
- **Review queue** — anything with `Confidence` below threshold or
  `Classified by = Agent` gets a glance before it's quoted in print; flip it to
  `Human-verified` once checked.

## Sources

`gdelt` (free, no auth, wide net but thin on hyperlocal AU coverage) and
`inbox` (manual ingestion) are wired. Planning-portal adapters are the natural
next addition.

## Controlled vocabulary

The classifier emits the exact Notion option strings. Note Notion forbids
commas in option names, so a few labels use " / " (e.g. "Land use / amenity /
visual", "Jobs / investment / economic", "Process / consultation /
transparency"). See `pipeline/config.ts`.

## Capturing the whole debate, not just opposition

The tracker records `Stance` (Opposing / Conditional / Supporting / Neutral), so
it holds the case *for* a project as well as against it. Retrieval deliberately
includes support and benefit terms (support, welcomes, jobs, investment)
alongside objection terms, so the benefits framing isn't missed. The
`Jobs / investment / economic` ground carries the main pro-argument; the
Synoptics database also has a `Strategic or sovereign capability` ground for the
strategic case. Read the tracker as a map of the whole debate, not a list of
objections.

## Synoptics (survey and overview sources)

Some sources span many sites or the sector as a whole: multi-site news roundups,
parliamentary inquiries, NGO or government reviews, moratorium calls. These
don't fit the one-record-per-site grain, so they live in the **Synoptics —
Australia** database, which relates to many sites at once and records a
`Stance mix` rather than a single stance.

Workflow: log the survey once as a synoptic, then hand-split any clearly
site-attributable items into the Contestation Tracker, putting a `#anchor` on
the source URL (e.g. `...#plumpton`) so dedup keeps them distinct. Do not run a
survey article through the auto-pipeline; it would flatten it into one
misleading record.

## Non-public / licensed sources: the RMIT / Factiva review method

Factiva (via the RMIT library) and similar licensed databases are gated, and
their terms forbid automated scraping, so they are a manual, human-in-the-loop
strand. Never point a crawler at them.

1. **Access.** Sign in to the RMIT Library, open the Databases A–Z list, launch
   Factiva (or ProQuest / Newsbank as appropriate). You are bound by RMIT's
   licence terms for that database.
2. **Search.** Build a query for the tracked sites and operators (e.g. a site
   name OR operator) with a date range. Save it as an alert so you can re-run it
   each fortnight.
3. **Export.** Export the results as article text (RTF/HTML/plain text). Do not
   bulk-download beyond what the licence permits; export the specific articles
   you will code.
4. **Stage.** For each article, create a file in `pipeline/inbox/` as JSON with
   `source_url`, `date` and `text` (see `pipeline/inbox/README.md`). Use the
   real publisher URL as `source_url` where one exists, not the Factiva link.
5. **Classify.** Run `npm run pipeline -- --source inbox --write`. Files stay
   local (gitignored); the licensed text never enters the repo or Notion. Only
   the structured codes, a short frame summary and a single attributed quote do.
6. **Review.** In Notion, filter the Contestation Tracker for
   `Confidence < 0.6` or `Classified by = Agent`. Confirm the site match first
   (the riskiest field), then the stance and grounds. Flip verified rows to
   `Classified by = Human-verified`. Nothing is used in print before this.
7. **Quoting.** Keep `Representative quote` to one short attributed line (fair
   dealing for research/criticism). Cite the original publisher, not Factiva.
