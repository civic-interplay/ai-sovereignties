# Roadmap & visualisation plan

A single place to see the whole thing, so no thread gets lost as the map is
populated over time. Living document — edit freely.

## Where things stand (built)

- **Map — attribute-lens node map.** One set of nodes from the Notion tracker,
  recoloured by lens: Layer · Ownership · Country · Capital · Water · Type.
  Ownership depth (Country + Capital lenses + ownership-chain popup) added.
- **Pipeline.** Fortnightly GDELT retrieval hardened (retry); planning-portals
  multi-feed wired but inert until a NSW ePlanning API key is obtained.

## Visualisations needed (the "multiple")

Different axes, deliberately — not one map doing everything.

1. **Attribute node map** — *built*; ongoing data population.
2. **Ownership-transfer lifecycle** — ✅ **BUILT** (AirTrunk prototype). Per-site
   popup stepper Land 🇦🇺 → Operator → Owner, gated to sites with a `Landowner`;
   the flag-flip (onshore land, offshore owner) is the point. Grows as landowners
   are added. Next: add more landowners; optional Planning/SSD stage + dates.
3. **Supply-chain map** — ✅ **BUILT** (illustrative). A "Supply chain" toggle
   draws red flow-lines from each AU rare-earth mine to an offshore "Separation &
   magnets (China)" node, with domestic processors (Eneabba, ANSTO) ringed green
   as the loop-closer. Edges are an in-code config; swap for Notion relations
   later. Next: power/water dependency edges; more offshore nodes (fabs, HQs).
4. **Electoral boundaries overlay** — AEC federal-division polygons as a subtle
   toggle; optional "sites in marginal seats" highlight.
5. **Governance / contestation timeline** — *chronological*. A running record of
   policy and governance events (see Hume, below) that grows alongside the map.

## The timeline (home for stories like Hume)

**Decided: lives in the Notion Contestation Tracker** (the pipeline already feeds
it; dates and site-links exist there), rendered as a timeline view — so it grows
automatically as the map is populated. Governance/policy events (Hume, council
motions, ministerial call-ins) become entries, linked to the sites they concern.
May need a small extension so the tracker can hold *governance* events, not only
media-sourced contestation items.

### Seed entry — Hume City Council (reallocate from infra node → governance item)

- **25 Aug 2025** — first Victorian council to endorse developing a draft
  framework assessing data centres against *sustainable resource use*, and to
  call on the state to strengthen planning controls.
- **Trigger:** ~7 data centres into Hume, 20–30 across Melbourne's west; several
  ministerially fast-tracked or FOI-surfaced; NEXTDC Tullamarine (Sharps Rd)
  already straining parking/amenity.
- **Water:** Yarra Valley Water — 7 applications to draw municipal water for
  cooling; 1 approved ≤3.94M m³/yr (~town of 66k), 1 approved, 5 pending.
- **Framework asks:** cumulative/precinct-scale assessment; water-source
  hierarchy (recycled before potable); WUE reporting; early council involvement
  vs ministerial bypass.
- **Cooling trade-off:** evaporative cooling uses 20–30% less power than dry, so
  high power prices push developers toward water. (Anchors the Water lens.)
- **Tension:** state's $5.5M Sustainable DC Action Plan (~$25bn capex target).
- **Lead:** Cr Jim Kurt — "a wicked problem… huge in scale, consuming massive
  amounts of water and electricity whilst offering little back… in terms of jobs".
- **Links:** NEXTDC Tullamarine; Melbourne-west cluster.
- **To read:** Star Weekly (source), ABC News 26 Aug 2025, TBH Consultancy
  "Rethinking Water and Data Centre Growth in Melbourne", Concerned Waterways
  Alliance, PIA "Planning for Data Centres".

## Glossary — what the map's two flags mean

These need explaining *on the map* (an info tooltip by the toggles), because they
are jargon — and together they name the core tension: the state's **acceleration**
pathway vs the community's **contestation** pathway.

### "State fast-tracked" (amber ring)

A development lifted out of normal local-council assessment onto an accelerated
**state** pathway, where a minister or state department is the decision-maker
instead of the council. In practice:

- **NSW — State Significant Development (SSD):** large projects assessed by the
  Dept of Planning, Housing & Infrastructure and determined by the Minister or
  the Independent Planning Commission, not the local council.
- **NSW — Investment Delivery Authority (IDA):** the 2025 fast-track pipeline for
  major investments (many data centres were moved into it).
- **VIC — Development Facilitation Program / ministerial call-in:** the Minister
  for Planning becomes the responsible authority instead of council — the bypass
  Hume objects to.

*Data source:* `Governance Flags` = "Ministerial fast-track" or "NSW State
Significant Development".

### "Contested" / the contestation pathway (red ring)

"Contested" marks sites with active or emerging community opposition. The
**contestation pathway** is the set of channels through which a project is opposed
or scrutinised:

- **Formal:** public-exhibition submissions and objections; merit appeals (NSW
  Land & Environment Court; VIC VCAT); council motions and resolutions (Hume).
- **Civic / informal:** parliamentary petitions, FOI requests, media campaigns,
  community alliances (e.g. Concerned Waterways Alliance).

*Data source:* `Community Concern` = "Active Opposition" or "Emerging Concern".
The automated pipeline's job is to surface items travelling these pathways.

### "Sovereignty type" — the register (Type lens)

The Type lens colours each site by its **sovereignty register**: *how much Australia
actually owns, versus merely hosts*. This is the project's own framework — the
"thesis in colour". The two poles are the whole story:

> **Productive** = *"we own and build it here."*
> **Locational** = *"it's just parked on our land."*

Everything else sits between. A site can hold several registers (it's multi-select);
the map colours by the most-sovereign one present.

- **Productive** — *owned and built here.* An Australian company builds/owns the
  asset, so control and value stay onshore. The most sovereign.
- **Operational** — *run by government here.* The state operates it (e.g. ANSTO
  running the rare-earth processing facility).
- **Financial** — *paid for with public money.* Underwritten by Australian public
  or superannuation capital, even if not Australian-run.
- **Locational** — *just hosted here.* The data centre physically sits on
  Australian soil but is foreign-owned — we host the building, not the capability.
  The least sovereign (e.g. the AirTrunk / KNBDC campus on IFM land, ultimately
  Blackstone-owned).
- **Not coded** — not yet classified.

*Data source:* `Sovereignty register` (multi-select). Colour precedence when a site
has several: Productive > Operational > Financial > Locational.

## Data-model to-dos (what unblocks each view)

- ~~**Notion fields:** `Parent`, `Ultimate Owner`, `Owner Type`~~ **DONE** —
  columns created, 21 high-confidence rows backfilled; Capital lens + chain live.
- **`Landowner` field** → unblocks the lifecycle transfer view.
- **Edges/relations** (from-site, to-site, flow-type) → supply-chain map.
- **AEC boundary file** → electoral overlay.

## Small open items

- ~~Commit pending map fixes~~ **DONE** (commit `b0248ac`).
- Finish `Owner Type` for the ~15 rows still "Other" (the medium-confidence
  operators: Keppel, CDC, STACK, PGIM, AIMS, etc., plus the blanks).
- Consistency check: "Australian-owned" ⟺ Country = Australia (JV exempt).
- Surface the glossary on the map — an info tooltip by the Contested /
  State fast-tracked toggles.
- Finish ownership data entry (a handful still in "Other"; medium-confidence rows
  — South Morang/Dover, Truganina/Aljasser, Glendenning/AWS, Lane Cove/undisclosed).
