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
