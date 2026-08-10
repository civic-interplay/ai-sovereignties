# State planning feeds → new-project discovery (parked 2026-07-27)

Status: **parked with a working, validated NSW probe.** Not wired into the pipeline
or the map. Resume by scraping the NSW Major Projects / SSD pages (**confirmed: no
API** — Sarah checked, 2026-07-27), or when a second state is ready.

## Why parked

Automated *new-project discovery* is the pipeline's weak spot. The NSW council
DA API is a genuine, keyless source and the probe below works — but it is
**one state only**, and every state exposes planning data differently. The
right shape is federated:

> **Each state = its own ingestion adapter → the one main infra tracker.**
> The tracker (Notion `8b537010…`) stays the single spine / map source; states
> are pluggable sources, like `gdelt` / `inbox` / `portals` already are.

Building the full NSW write path now would bank one state while the *better*
discovery source (SSD/Major Projects — see below) is still pending, so it waits.

## NSW OnlineDA API — validated findings

Endpoint (public, **keyless** — confirmed 2026-07-27):

```
GET https://api.apps1.nsw.gov.au/eplanning/data/v0/OnlineDA
```

- **It is header-driven, not query-string.** Required headers: `PageSize`,
  `PageNumber`, and a JSON `filters` header, e.g.
  `{"filters":{"CouncilName":["PENRITH CITY COUNCIL"],"DevelopmentCategory":["Industrial","Commercial"]}}`.
  A call *without* these returns `"Required parameters not met"` — which a prior
  session misread as key-gating. **No API key is required.** (The key Sarah
  obtained is for the `api.nsw.gov.au` gateway, a different host; keep only as an
  optional rate-limit lever — the probe sends it as an `apikey` header if
  `EPLANNING_API_KEY` is set, else omits it.)
- Response envelope: `{ PageSize, PageNumber, TotalPages, TotalCount, Application: [ … ] }`.
- Data since 10-12-2018, updated **daily**. Sibling datasets on the same host:
  `OnlineCDC` (complying development), `OnlineCC`, `OC`.

### What it gives / doesn't

| Want | Feed |
| --- | --- |
| Development type, cost, storeys, subdivision, EPI-variation flag, determination authority | ✅ structured |
| On public exhibition (or not) + window | ✅ `AssessmentExhibitionStartDate/EndDate` (present ⇒ exhibited) |
| Real coordinates | ✅ `Location[].X` = **lon**, `Location[].Y` = **lat** (WGS84) |
| Who lodges (applicant / proponent) | ❌ **no such field** |
| State Significant Development (Mamre, Lane Cove flagships) | ❌ **absent** — SSDs are state-assessed, never in council DAs |

### Key discovery findings (from the dry-run)

1. **`Data storage premises` is the precise data-centre marker** — NSW's actual
   development-type value for data centres. Gate on data-centre *terms*, not on
   cost. The broad "industrial + big cost" net is **noise** (catches every
   warehouse in the Kemps Creek / Erskine Park belt; 0 were data centres).
   Cost gating also wrongly drops DC *modifications* (often $0).
2. **Multiple DAs per site.** e.g. 57 Station Rd, Seven Hills = 4 PANs (original +
   modifications + additional-info); 42A Bluett Dr, Smeaton Grange = 2. So the
   write path should be **one main-tracker row per site (address/coords)**, with
   each DA / modification / exhibition as a **linked planning event** — which
   also realises the deferred development-lifecycle / temporal view.
3. Most matches are `Determined` (already approved) — great for **backfilling**
   the tracker with accurate coordinates; for a live "what's on exhibition now"
   monitor, filter to open windows / recent `ApplicationLastUpdatedFrom`.

Real data centres the probe surfaced (with coords + exhibition windows):
16 Lockwood Rd Erskine Park · 57 Station Rd Seven Hills · 42A/42B Bluett Dr
Smeaton Grange (Camden) · 10 Eastern Creek Dr Eastern Creek.

## The probe

`pipeline/retrieve/eplanning.ts` — self-contained, **read-only**, not imported by
`pipeline/run.ts` (inert). Fetch + relevance gate + normalise + a CLI preview:

```
tsx pipeline/retrieve/eplanning.ts [--councils N] [--pages N] [--since YYYY-MM-DD]
```

Exports `fetchEplanning()` and the `Discovery` type for when the write path is built.

## Other states

- **NSW SSD / Major Projects** — the *real* data-centre discovery source: has
  proponent names, project descriptions, EIS, and public submissions (feeds the
  existing contestation pipeline cleanly). **No API — confirmed** (Sarah checked
  with Major Projects, 2026-07-27). So ingestion = **scrape the public
  major-projects project pages** (planningportal.nsw.gov.au/major-projects) or
  manual `inbox`. Still the priority resume point despite being a scrape, since
  it's where the flagship DCs, proponents, and submissions live.
- **VIC** — no public feed for this scope. City of Melbourne OpenDataSoft is the
  wrong scope; relevant data is behind "The Data Exchange" (public-sector access,
  `planning.support@transport.vic.gov.au`). Manual `inbox` for now.
- **Other states** — TBD.

## When resumed — open decisions

1. Confirm gate = data-centre development terms; drop/park the cost net.
2. Confirm shape = one site row + linked planning events (not one row per PAN).
3. Build `createInfraSite()` / upsert-by-site in `pipeline/lib/notion.ts` (main
   tracker), with dedup keyed on PAN(s) per site.
4. Decide backfill (historical Determined DAs) vs live-monitor (open exhibitions).
5. Wire `--source eplanning` into `run.ts` as a discovery flow (separate from the
   contestation `createContestationItem` path).
6. Add the source to the map/methodology explainer for provenance honesty.
