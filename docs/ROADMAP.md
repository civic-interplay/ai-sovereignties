# Roadmap & visualisation plan

A single place to see the whole thing, so no thread gets lost as the map is
populated over time. Living document — edit freely.

## Where things stand (built)

- **Map — attribute-lens node map.** One set of nodes from the Notion tracker,
  recoloured by lens: Layer · Ownership · Country · Capital · Water · Energy ·
  Super $. Ownership depth (Country + Capital lenses + ownership-chain popup)
  added. Colour is split by job — categorical for identity, ordinal ramps for
  one-directional scales, diverging pairs where both poles matter, and a reserved
  channel for overlays (see the COLOUR SYSTEM block at the top of `Map.tsx`).
  Also: zoom controls, `?view=` city deep links, and a Stage filter that narrows
  the set while the active lens keeps colouring.
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
6. **Super-fund exposure** — ⏳ **LENS BUILT (3-channel)**: the "Super $" lens
   colours sites by *how* Australian super/sovereign money touches them —
   **operator** (CDC, green), **land** (Mamre via IFM, gold), **via-manager**
   (Supernode via Rest/Quinbrook, Vantage via Aware, teal), or none (grey).
   Remaining: load the rest of the seed list, ingest Portfolio Holdings
   Disclosure, and the "select your fund → contested sites" reverse-interaction.
   *Reverse view, activist-facing.* Which Australian
   super funds are invested in each data centre — directly, or via infra-fund
   managers. The interaction: "select your fund → see the contested sites your
   retirement savings touch." The sharpest civic-interplay irony: communities may
   be funding the data centre they're fighting. **Data source:** mandatory
   Portfolio Holdings Disclosure (twice-yearly, per fund — messy CSVs, public;
   the pipeline could ingest them). **Seed already in the tracker:** CDC (Future
   Fund 34.55% + CSC 12.04%). **Caveat to label:** direct stakes are exact;
   indirect exposure via pooled infra funds is approximate (fund backs the
   manager, not a per-site dollar figure) — must be flagged, not overclaimed.

   **Seed list — documented Australian super/sovereign → DC exposures (research 2026-07-26):**
   - Future Fund 34.55% + CSC 12.04% → **CDC** (operator, 46.59% precise). ✅ on map.
   - ~20 industry funds (AustralianSuper, Hostplus, Cbus, UniSuper, HESTA…) → **IFM
     Investors** → **Mamre Road land** (land channel; IFM ≈100% of the land). ✅.
   - Rest Super ($1bn) → **Quinbrook** → **Supernode Brisbane** (via-manager). ✅.
   - Aware Super (US$300m) → Skyline JV / Vantage APAC → **Vantage AU sites**
     (Tullamarine etc., operator minority). ❌ NOT in tracker — gap to fill.
   - ART → consortium w/ Mubadala (SWF); + bidding for a CDC stake (pending).
   - Offshore context (not on AU map): AustralianSuper → Vantage EMEA (€1.5bn) +
     DataBank US ($1.5bn); Aware → Switch US.
   **Model implication:** three exposure channels — operator / land / via-manager —
   so replace the single % with an `Exposure channel` + `Exposure level` pair.

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

## Glossary — what the map's overlays mean

These need explaining *on the map* (an info tooltip by the toggles), because they
are jargon — and together they name the core tension: the state's **acceleration**
pathway vs the community's **contestation** pathway.

The overlays are drawn in neutral ink and told apart by geometry, not colour:
contested one ring, fast-tracked two, named hyperscaler a centre pip. They sit on
top of whichever lens is active, so a hue here would collide with the fills —
which is exactly what went wrong when contested was red and fast-tracked amber
while several lenses used those same hues for categories.

### "State fast-tracked" (double neutral ring)

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

### "Contested" / the contestation pathway (single neutral ring)

"Contested" marks sites with active or emerging community opposition. The
**contestation pathway** is the set of channels through which a project is opposed
or scrutinised:

- **Formal:** public-exhibition submissions and objections; merit appeals (NSW
  Land & Environment Court; VIC VCAT); council motions and resolutions (Hume).
- **Civic / informal:** parliamentary petitions, FOI requests, media campaigns,
  community alliances (e.g. Concerned Waterways Alliance).

*Data source:* `Community Concern` = "Active Opposition" or "Emerging Concern".
The automated pipeline's job is to surface items travelling these pathways.

### "Sovereignty type" — the register (Type lens — currently hidden)

> **Hidden as of 2026-08-13.** `operational` has no sites, `financial` has two,
> `productive` five, and 55% of rows are uncoded — but the deciding problem is
> that `rented`, the one category carrying signal, is not coded consistently
> against the `tenants` field: 24 of its 34 sites name only "Multiple /
> colocation", while 40 non-rented sites name tenants including explicit
> hyperscalers. The evidenced version of the claim is now the **Named
> hyperscaler** overlay, derived from `tenants` directly (12 sites). The Notion
> field and the map constants are retained; restore the lens once the register
> coding follows the tenant data. The framework below still stands.

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
- ~~Super $ lens (3-channel) + Vantage + cluster~~ **DONE** (map at 47 sites).
- Finish `Owner Type` for the ~15 rows still "Other" (the medium-confidence
  operators: Keppel, CDC, STACK, PGIM, AIMS, etc., plus the blanks).
- Consistency check: "Australian-owned" ⟺ Country = Australia (JV exempt).
- Surface the glossary on the map — an info tooltip by the Contested /
  State fast-tracked toggles.

## Next session (priority order)

0a. **Shape encoding on the categorical lenses — accessibility, ships blocking a
   wider audience.** Layer / Ownership / Country / Capital currently carry
   identity in colour alone. Measured against the map's own surface (`#0a0c0b`)
   on the all-pairs pairlist — a dot map is an all-pairs form, since any two
   sites can sit side by side — the seven-slot palette clears normal vision at
   ΔE 17.0 but sits at **CVD ΔE 6.4**, inside the band that is legal *only*
   alongside a second encoding channel. That channel is not built, so those four
   lenses are hard for red-green colourblind readers. (Water, Energy, Super and
   the three overlays are unaffected: ramps and geometry carry those.)

   The fix: move the core node from a Mapbox `circle` layer to a `symbol` layer
   with generated SDF icons, so `icon-color` stays data-driven and shape rides
   alongside hue. Shape carries roughly 4–5 distinguishable values at map scale.
   Worth considering at the same time: pointing shape at a *second lens* rather
   than duplicating the colour lens, so colour and shape can answer two questions
   at once (e.g. colour by ownership, shape by water risk).

0b-i. **Add `Application lodged date` to the Notion tracker.** The one field that
   unlocks approval *duration*, which is the interstate-competition story (the
   claim in circulation is VIC ~3 months vs NSW ~18). Duration is lodgement →
   determination; the tracker holds only `announcementDate` and `approvalDate`,
   so it cannot currently be computed. The announcement→approval gap is a poor
   proxy: only 8 sites carry both, 3 of those have the two dates set identically
   (a data-entry artefact, worth fixing), and of the 5 real pairs 4 are Victoria
   and 1 is NSW — no state average is possible from that.

   Once populated, two things become available that nothing else in the tracker
   does: duration crossed with the existing `fastTracked` flag ("fast-tracked
   sites determine in X months, normal pathway in Y") — a directly evidenced
   claim about the acceleration pathway rather than an assertion — and duration
   by state once each has enough rows to average honestly. Neither needs a
   scrubber; duration is a number per site, so it can ride the popup, drive a
   lens, or sit in a small stat panel.

   Until then, treat the 3mo/18mo figures as sourced context, not as something
   the map computes. Worth confirming whether that quote is a published system
   average or was drawn from individual cases — two rows here sit at 3.7 (a
   Truganina application) and 18.4 months (CDC Marsden Park), which is close
   enough to be the origin of it.

0b-ii. **Scoped approvals timeline.** Scrub bar along the bottom of the index.
   Blocked on framing, not on build: `approvalDate` covers **10 of 91** sites and
   `announcementDate` **27**, union **29 (32%)** — and the union is *biased*, not
   merely thin. 18 of the 29 dated sites are 2026, and of the 38 operating sites
   only 3 carry a date. A plain time axis would therefore draw a curve showing
   nothing before 2025 and an explosion in 2026, which is the history of when
   tracking started, not the history of the industry.

   Build it scoped, or not at all: label it as approvals and announcements
   *recorded since tracking began*, show a persistent "29 of 91 dated" count, and
   draw undated sites in neutral rather than hiding them. The 2026 wave is a real
   story; it just cannot be presented as history. Revisit an unscoped version at
   roughly 60–70% date coverage. Pairs naturally with the Stage filter.

1. **Load the rest of the super-exposure seed list** (item 6) — attach the
   AustralianSuper/Aware/ART/IFM findings to sites; add IFM as a "conduit" note.
2. **"Select your fund → contested sites"** reverse-interaction — the activist
   payoff on top of the 3-channel lens.
3. **Electoral boundaries overlay** — the one unbuilt visualisation (AEC file).
4. **Portfolio Holdings Disclosure ingestion** — a pipeline step that greps the
   big funds' PHD CSVs for operator names/tickers to surface exposures.
5. Data hygiene: 3 remaining "Other" owner types (Lane Cove undisclosed only now);
   add coordinates to any remaining off-map DC rows; finish landowners.
6. Timeline view in Notion (2-min UI step); glossary tooltip on the map.
- Finish ownership data entry (a handful still in "Other"; medium-confidence rows
  — South Morang/Dover, Truganina/Aljasser, Glendenning/AWS, Lane Cove/undisclosed).
