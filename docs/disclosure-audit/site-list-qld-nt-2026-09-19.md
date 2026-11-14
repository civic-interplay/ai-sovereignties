# Frozen site list — Queensland and Northern Territory sweep

**Frozen 19 September 2026, before any record in either jurisdiction was
searched.** Required by `PRE-REGISTRATION.md` §Scope: *"The site list is frozen
and published at the start of the sweep, before any record is searched."*

Sites are every entry in the tracker for these two jurisdictions as at the
freeze, plus anything the search frame turns up. Additions made during the
sweep are appended below with their own date and the index that found them —
never folded silently into the list above.

## Queensland — in scope

| # | Site | Status | Capacity | LGA | Pathway |
|---|---|---|---|---|---|
| Q1 | Western Downs Digital Park — Dalby (Zerra DC) | Application lodged | 1440 MW | Western Downs Regional Council | Local council |
| Q2 | Supernode — Brisbane (Quinbrook / Rest Super) | Under construction | 250 MW | not recorded | not recorded |
| Q3 | Northern Concept Swanb — Swanbank Data Centre (Ipswich) | Application lodged | not recorded | Ipswich City Council | Local council |

Q3 is currently a `[PROPOSED]` row — a pipeline discovery not yet reviewed by a
person. It is listed because the protocol freezes the list before searching and
excluding it now would be a choice made with no evidence. If review finds it is
not a data centre it leaves the sweep as a recorded exclusion, not a deletion.

**No planning instrument number is recorded for any of the three.** Locating
them is step 1 of the search frame and its results are recorded per site,
whether or not an index returns anything.

## Queensland — out of scope

| Site | Why |
|---|---|
| Queensland — data centre approvals framework (state counter-proposal) | Policy row, not a facility. No instrument of approval exists to audit. |

## Northern Territory — no sites at freeze

**The tracker holds no Northern Territory data centre.** Its only NT row is
Arafura Rare Earths — Nolans Project, a mine, which is out of scope.

The NT arm therefore begins at step 1 of the search frame rather than at a
known record. Per the pre-registration, a null result here is reported as
**"no facility located by these indexes"**, naming them, and never as "no
facility exists". This is recorded in advance precisely so that a null cannot
later be presented as a finding it is not.

## Indexes to be searched, per site

Fixed by the protocol, in this order, recorded whether or not they return
anything:

1. The jurisdiction's planning register or development-application portal
   (QLD: council DA registers; the state Development Assessment Rules pathway
   where a project is state-assessed. NT: the NT Planning Commission /
   Development Consent Authority register).
2. PlanningAlerts.
3. The relevant council's application index.
4. The jurisdiction's government gazette.

## Search log

Appended as the sweep runs. One row per (site × index), including empty
results — an index that returned nothing is evidence about the index.

| Date | Site | Index | Result |
|---|---|---|---|
| 2026-09-19 | Q1 Dalby | WDRC Development.i portal | Portal reachable (HTTP 200). Application search requires a session token and renders results client-side; **not searched successfully by script**. Instrument number still unknown. |
| 2026-09-19 | Q1 Dalby | PlanningAlerts | ~~Authority not covered — `/authorities/western-downs` returns HTTP 404.~~ **WRONG — CORRECTED SAME DAY.** The slug is `western_downs` with an underscore, which returns HTTP 200. The authority **is** covered. The 404 was a bad guess at the URL, recorded as a fact about the index. See the correction note below. |
| 2026-09-19 | Q2 Brendale | PlanningAlerts | Covered — `/authorities/moreton_bay` returns HTTP 200. |
| 2026-09-19 | Q2 Brendale | Council DA Tracker | City of Moreton Bay runs its own tracker, not Development.i. `pdonline.moretonbay.qld.gov.au` does not resolve; the council site returns HTTP 403 to scripted requests. Not yet searched. |
| 2026-09-19 | Q2 Brendale | Council open data | **Queried successfully.** ArcGIS FeatureServer via `datahub.moretonbay.qld.gov.au`, 16,519 applications, 2016-01-31 → 2026-08-21. Index verified working (controls: `DWELLING` 3,302; `INDUSTR` 402). **`DATA` appears in ZERO of 16,519 application descriptions.** Supernode's own DA not identified — see below. |
| 2026-09-19 | Q2 Brendale | Council DA Tracker | Three candidate DAs opened by SB: all Determined; none names Supernode or Quinbrook. One resolved to a property described as "Cribb Rd Water Pollution Control/Pump Station" — a different site ~1.2 km west. Candidates rejected. |
| 2026-09-19 | Q2 Brendale | Trade press and ministerial statement | Site confirmed as **Brendale, City of Moreton Bay** — 30 ha beside the South Pine substation, up to four data centre buildings, council planning approval and FIRB approval both granted. **Already approved, so a decision notice with conditions should exist.** |
| 2026-09-19 | Q1 Dalby | Trade and general press | DA lodged **17 Aug 2026** with Western Downs Regional Council by **WDDP Pty Ltd** (Zerra DC / AGP): Material Change of Use for Research and Technology Industry, workforce accommodation, and a high-impact-industry concrete batching plant. Site 1933 Dalby–Kogan Road, **Lot 125 on DY316**, 725.5 ha. No council reference number published. |
| 2026-09-19 | Q3 Swanbank | Ipswich Development.i portal | Application-number search for `2285/2026/MCU` returned **"No results"**. Address search returns a page whose results render client-side and could not be read by script. **This index has not been properly searched** — see caveat below. |
| 2026-09-19 | Q3 Swanbank | PlanningAlerts | Authority covered and current, but the public list surfaces only the most recent applications; an August lodgement is not on it. Needs the API key (requested, pending) to query by date. |
| 2026-09-19 | Q3 Swanbank | Trade press | Reference **2285/2026/MCU**, 6 Leaf Street (Lot 5), Swanbank, lodged **4 Aug 2026** by Northern Concept Swanb Pty Ltd. Reported as **code assessable** — no public notification required. |
| 2026-09-19 | Q2 Supernode | — | Not yet searched. |
| 2026-09-19 | NT | — | Not yet searched. |

### Q2 Supernode — searched, not located. Recorded as that.

Supernode is **83 Kremzow Road, Brendale**, adjacent to the South Pine
switchyard: ~$3bn, a 30 ha campus combining large-scale battery storage with
hyperscale data centres, up to four buildings, 260 MW-IT, three high-voltage
connections totalling 800 MW, Stage 1 BESS operational at 260 MW / 619 MWh.
Council and FIRB approvals are both on the public record via ministerial
statement and trade press.

**Its development application has not been located in the council's own open
data.** Searched 19 Sep 2026:

- `DATA CENTRE`, `DATA CENTER`, `DATA STORAGE`, `SERVER`, `SUPERNODE`,
  `QUINBROOK` — **zero matches each**, across all 16,519 records.
- `DATA` as a bare string — **zero matches**.
- Spatially, every application within ~1.2 km of Kremzow Road (108 records) and
  within ~4 km of Brendale (1,291 records): warehouses, stormwater, dwellings,
  medium-impact industry. Nothing recognisable as the campus.
- Nearest plausible artefacts: `DA/2023/1419`, a **Battery Storage Facility**
  permit approved Nov 2023 about 2 km west; and `DA/2021/2718` / `DA/2023/3495`
  / `DA/2024/5313`, three Minor Changes to one permit for *High Impact Industry,
  Utility Installation and ERA6/ERA54*. **None confirmed**; the three were
  opened and none names the project or proponent.

**Further routes tried, all negative (19 Sep 2026):**

- **By decision date.** The approval is reported as secured by 13 Jul 2022
  (ministerial statement, Deputy Premier Steven Miles). Every application
  decided in Brendale between 1 Jan 2020 and that date: **177 records.**
  Warehouses, stormwater, advertising devices, dwellings, electrical
  reticulation. Exactly one could plausibly be a multi-billion-dollar campus —
  `DA/2021/2718`, *High Impact Industry, Utility Installation and ERA6/ERA54* —
  and it is a **Minor Change**, so an original permit exists.
- **By parcel history.** Nine applications at that parcel back to 2016. The
  original permit for that use **is not in the dataset**, so it predates
  1 Feb 2016. The parcel's own earlier history is a *service station, food
  outlet and showroom* and *medium impact industry* — not a 30 ha campus.
- **By actual address.** Supernode is **83 Kremzow Road**, beside the South
  Pine switchyard, ~1.8 km from that parcel. Sixty-six applications at or near
  Kremzow Road: hotels, warehouses, showrooms, advertising devices,
  stormwater. Nothing resembling the campus.

- **By Strathwyn Street.** A fifth address associated with the site. 55
  applications within ~600 m: warehouses, showrooms, a place of worship, an
  Aldi distribution centre, earthworks. Nothing resembling the campus.

So the earlier candidates are rejected too: they are at the wrong parcel.

Street View of the site in 2026 shows an empty paddock with transmission towers
on the horizon in both directions. That is the whole siting logic in one
accidental image: the land is worth what it is worth because of what is behind
it, and the planning record describes the paddock.

**This is "not located by these indexes", not "no record exists".** The index
demonstrably works — the controls return thousands — so the null is about the
match, not the dataset. Three explanations remain open and none has been chosen:
the approval may predate 1 Feb 2016; it may sit outside the council pathway
(a Priority Development Area or state-assessed route — note `DA/2026/3398`, a
**PDA** permit for "Research and Technology Industry and ancillary substation"
at Petrie, showing that second route exists); or it is present under a
description generic enough that it cannot be recognised as what it is.

**The finding that holds regardless of which explanation is right:** in a
council hosting one of the southern hemisphere's largest data centre campuses,
no development application description contains the word "data". The battery is
legible in the planning record, because *Battery Storage Facility* is a use
class. The data centre is not, because Queensland's use classes have no term
for one — it is a *utility installation*, a *high impact industry*, or at Dalby
a *research and technology industry*. A resident searching their council's own
open data for "data centre" finds nothing, and this is the transparent end of
the system.

That is a vocabulary failure rather than a records failure, and it is the same
one that forces the NSW adapter to infer data centres from construction cost.

### Correction, 19 September 2026 — a null that was an artefact of the query

The PlanningAlerts line for Q1 above originally read "authority not covered",
on the strength of `/authorities/western-downs` returning 404. The slug is
`western_downs`. With the underscore it returns 200 and the authority is
covered, as are `ipswich` and `moreton_bay`.

The error is left visible rather than overwritten because it is an instance of
the thing this protocol exists to catch: **a null result reported as a property
of the record when it was a property of the query.** The guide's rule — "not
locatable" is never "does not exist", and name the index you searched — has to
extend to naming the query, because an index searched with the wrong key has
not been searched at all.

Second instance the same day: the concept-DOI check reported "no file emits the
old DOI" after searching for the wrong DOI number. Both were caught, but only
because something else prompted a re-check, which is not a control.

**Standing consequence for this sweep:** before any negative result is
recorded, the query that produced it is recorded alongside it, and a positive
control is run where one is available — a query that *should* return something,
to prove the index answers at all.

### Caveat on the two portal results, recorded per FACT-CHECKING-GUIDE §3

Neither portal result above is evidence that a record does not exist. Both
councils run the **Development.i** platform, whose search returns results to a
browser and not to a scripted request. A scripted "No results" therefore means
*this method did not reach the index*, not *the index is empty*.

Under the protocol this must be reported as **"not located by this method"**,
naming the method. It is recorded now, before the answer is known, so that a
later null cannot be quietly upgraded into a finding.

Two routes remain for both: the PlanningAlerts API once the key arrives, and
opening the portals in a browser. Until one of them is done, neither Q1 nor Q3
has been searched in the sense the protocol means.

### Two things already visible, and why neither is disclosure

The press carries figures for Q1 — roughly 47 GWh/day at full build, about
16.5 kL/day operational water, air-based cooling, 4 × 360 MW buildings, with
water from coal-seam-gas water, rainwater, delivery, recycled wastewater and
on-site surface water. **None of this is disclosure under the protocol.** It is
the announcement track: proponent and press material, explicitly excluded by
§Scope. It is noted here only so that it is not mistaken for a record later,
and so the eventual comparison between what was announced and what the
instrument states can be made deliberately.

Q1 and Q3 also sit on **opposite assessment pathways** — Q1 impact-assessable
with a public notification period, Q3 code-assessable with none. The
pre-registration predicts a pathway effect rather than a state effect, so a
single jurisdiction now offers a within-state test of it. That prediction is on
the record before either instrument has been read.

## Additions after the freeze

Appended 14 November 2026. Per §Scope, sites found after the freeze are added
here with their own date and the route that found them, not folded into the
list above.

| # | Site | Found | Route that found it | Tracker state at addition |
|---|---|---|---|---|
| N1 | Energy North — Project Ares, Murranji Station (Barkly, NT) | 30 Sep 2026 | Tracker discovery agent, web search (press: ABC, 1 Jul 2026). **Not one of the four protocol indexes.** | `[PROPOSED]`, unreviewed; agent note "NOT VERIFIED — from search-result snippets only" |
| N2 | Beetaloo Digital — Weddell data centre (NT) | 30 Sep 2026 | Tracker discovery agent, web search (NT Territory Coordinator news page). **Not one of the four protocol indexes.** | `[PROPOSED]`, unreviewed; same agent note |

**Departure, recorded rather than smoothed over.** The protocol's search frame
names four indexes. N1 and N2 were found by a route outside that frame (press
and a government news page, via the tracker's general discovery agent). They
are in scope as Northern Territory data centres, and they change the NT arm:
it no longer begins with no known site. The NT search through the four indexes
still has to be run in full, and its results reported separately from these
two press-found sites, so that what the indexes find can be told apart from
what the press found.

Both rows stay `[PROPOSED]` until a person reviews them. If review finds either
is not a data centre proposal, it leaves the sweep as a recorded exclusion.

### Search log addition

| Date | Site | Index | Result |
|---|---|---|---|
| 2026-11-14 | Q1 Dalby | Planning-notice aggregator site (outside the protocol indexes) | A research agent found reference **030.2026.00000513.001**, lodged 17 Aug 2026, 1933 Dalby–Kogan Road, with a link to the WDRC Development.i portal. The portal link loaded with no results by script. **Lead only:** to be confirmed by opening WDRC Development.i (index 1) in a browser. |
| 2026-11-14 | Q1 Dalby | WDRC Development.i portal (index 1), searched by SB in a browser | **Located.** Application Number 030.2026.00000513.001; Date Submitted 17/8/2026; status filter "In Progress"; Description: "Material Change of Use: Workforce Accomm, Research&Technology Industry & High Impact Industry - 1933 Dalby-Kogan Road KOGAN". Confirms the 14 Nov lead. The description does not contain "data centre"; the locality is given as Kogan. Document list not yet read. |
| 2026-11-14 | Q3 Swanbank | Ipswich Development.i portal (index 1), searched by SB in a browser | **Located.** Application Number **12285/2026/MCU** (not 2285/2026/MCU as reported in the trade press). Full Description: "Material Change of Use - Warehouse (Data Centre)". Progress: In Progress; Stage/Decision: Decision. Assessment Level: Code. Use: "Centres and Industry Uses; Warehouse". Date Submitted 4/8/2026. **Public Notification Required: No.** Associated properties: Lot 6 Unnamed Road, 99999 Blackheath Road and Lot 5 Unnamed Road, Swanbank 4306. Assessment stages: Confirmation Period completed 4/8-18/8/2026; Confirmation Notice 18/8/2026; Action Notice not started. Document list not yet read. |

### Correction, 14 November 2026: the Swanbank null of 19 September was the query, again

The 19 September entry recorded that an application-number search for
`2285/2026/MCU` returned "No results". The number came from trade press. The
council's own record is **12285/2026/MCU**. The search was run with the wrong
key, so the index was not searched in the sense the protocol means. This is the
same failure recorded above for the PlanningAlerts slug: a null that was a
property of the query, not of the record. The press figure is kept in the log
above, unedited, so the error stays visible.

Two things are now on the record for Q3 before any document is read:
- The facility is assessed under the use class **Warehouse**, with "(Data
  Centre)" only in the free-text description.
- It is **code assessable with no public notification**, against Q1 Dalby,
  which is impact assessable. The within-state pathway test noted above now
  has both arms located.

### Q3 Swanbank: documents obtained and scanned, 14 November 2026

SB downloaded 11 documents from the Ipswich Development.i "Application
Documents" list (32 files in total). Copies stored locally with sha256 in
`SOURCES.md`; records in `records/swanbank_*.json`, scanned with
`pipeline/audit.ts` under term list v2. Every hit is UNCLASSIFIED until a
person classifies it. Documents scanned: Engineering Infrastructure Report;
Powerlink referral agency response; Noise Impact Assessment; Town Planning
Report; DA Form 1; Assessment Manager Information Request; IR response
letter; Owner's consent; Current title searches; Department of Defence
response; Superseded Planning Scheme Request decision notice (9000/2026/SPSR).
Not yet obtained: the other 21 files (ecology, bushfire, traffic, stormwater,
landscape, plans, referral confirmations, SARA documents).

Recorded facts (not disclosure findings):
- Title: Lot 5 on SP221204 (the data centre site) is registered to Northern
  Concept Swanb Pty Ltd as trustee (dealing 719838006, 9/1/2020). Lot 6 on
  SP221722 is registered to Ipswich City Council as trustee; the council's
  owner's consent covers a reconfiguration of Lot 5.
- The application is assessed under the **superseded** Ipswich Planning Scheme
  2006 (Version 03/2017), at the applicant's request of 8 June 2026, agreed by
  Council on 17 June 2026 (9000/2026/SPSR).
- The Powerlink referral was triggered because the premises are within 100 m
  of the Blackstone Substation.


**Classification, 14 November 2026 (SB).** All hits in the 11 Swanbank records
classified. Operational hits: Engineering Infrastructure Report 30, Town
Planning Report 8; all other records 0. Per coding rule 1, item by item:
connection capacity **not found**; energy consumption **not found**; PUE **not
found**; operational water **no site figure** (one figure borrowed from an
AirTrunk Sydney approval, with final demand deferred to "the future
occupier"); cooling method **not stated** (options listed). The council's
information request asks about parking, stormwater and visual impact, not
load or water. The Powerlink referral is about proximity to Blackstone
Substation and states no figure. **Grade deferred:** the ladder grades the
instrument of approval, and no decision has issued (status: In Progress, at
Decision). The record is graded when the decision notice is published.

### NT arm: search frame run, 14 November 2026

Run by a research agent, read-only, logged here after spot checks (the three
NTLIS records and the EPBC referral PDF were re-checked). One row per
(site × index), with the query and a positive control.

| Date | Site | Index | Query / URL | Positive control | Result |
|---|---|---|---|---|---|
| 2026-11-14 | NT general | 1. NTLIS Planning Notices Online (current) | `ntlis.nt.gov.au/planning-notices-online/notices/json` | 21 current notices returned | No data centre among them. |
| 2026-11-14 | NT general | 1. NTLIS archived notices (exhibited applications) | `…/notices/archived/json`, byMonth Jan 2020–Nov 2026 and byDate 2008–2026 (11,129 records); regex on purpose/parcel/applicant: data cent, data center, data storage, data hall, server, digital, hyperscale, computing | PA2025/0044 returned | **Three data centre applications located** (N3–N5 below). None before 2020. |
| 2026-11-14 | N1 Project Ares | 1. NTLIS archive | applicant `Energy North`, `Raggiana`; text `Murranji`, `NT Portion 851`, `Ares` | applicant control `Cunnington Rosse` (312); locality control Elliott/Newcastle Waters (17) | Not located by this index/query. |
| 2026-11-14 | N1 Project Ares | 1. NTLIS pastoral notices (non-pastoral use, clearing) | current and archived byMonth Apr 2024–Nov 2026 | 36 records incl. PL2026/0002 | Not located. Months before Apr 2024 returned empty; earlier years not searched. |
| 2026-11-14 | N2 Beetaloo Digital | 1. NTLIS | applicant `Beetaloo`, `Territory Coordinator`, `Tamboran`; suburb WEDDELL; `Middle Arm` | as above; Weddell returned 7 records | No data centre. The 185 ha site's land description is not published, so no parcel search was possible. Not located. |
| 2026-11-14 | NT general | 1. NT Land Information Search | address/planning API | not run | **Not searched**: reCAPTCHA-gated; needs a browser. |
| 2026-11-14 | NT general | 1. DA Online "Lodge and Track" | n/a | n/a | Login required; not a public search. |
| 2026-11-14 | N1, N2, general | 1. DCA, NT Planning Commission, DLPE pages | direct GET | n/a | **Not searched**: HTTP 403 (Cloudflare challenge); needs a browser. |
| 2026-11-14 | N1, N2 | 1. Territory Coordinator | direct GET | n/a | **Not searched**: HTTP 403 (Cloudflare). No Significant Project declaration for N1 or N2 found by search engine (only Nolans, 1 Jun 2026). |
| 2026-11-14 | NT general | 2. PlanningAlerts | `/authorities/northern_territory` (the only NT authority; council slugs 404 because councils are not planning authorities in the NT) | browse works; Ryko Court address search found PA2025/0044 | Browse shows only the 62 most recent; full-text search not available; API key expired. **PA2023/0228 is missing from PlanningAlerts.** Its scraper skips records without a street address, so remote sites (Murranji, Weddell) cannot appear: those nulls are a property of the scraper. |
| 2026-11-14 | N1, N2, general | 3. Council indexes (Darwin, Palmerston, Litchfield, Barkly) | site searches and planning pages | none available | No council DA registers: Darwin and Litchfield state that the DCA decides applications. Searches inconclusive or empty. |
| 2026-11-14 | N1, N2, general | 4. NT Government Gazette | direct GET | n/a | **Not searched**: HTTP 403 (Cloudflare). Search engine found Gazette S41 (1 Jun 2026) assigning "Data Centre Services" to the Minister for Corporate and Digital Development; no data centre notice. |
| 2026-11-14 | N1 Project Ares | Outside frame: NT EPA | archive copies of the EIA register pages (live site 403) | n/a | **Located**: EP2026/052, Energy North Pty Ltd; notice 8 Jul 2026; decision 7 Oct 2026, assessment by EIS required. |
| 2026-11-14 | N1 Project Ares | Outside frame: EPBC portal | search engine plus direct GET of the referral PDF | other data centre referrals found | **Located**: EPBC 2026/10560 "Project Ares - Integrated Hyperscale Data Centre Campus" (PDF re-checked, HTTP 200). |
| 2026-11-14 | N2 Beetaloo Digital | Outside frame: NT EPA, EPBC | search engine | same query type found Ares | Not located. |

**Additions found by index 1 (in scope, appended per §Scope):**

| # | Site | Instrument | Land | Zone | Applicant | Category | Exhibited |
|---|---|---|---|---|---|---|---|
| N3 | Data centre, CDU Casuarina campus, Brinkin | PA2021/0065 (variation: car parking) | Lot 9198 Town of Nightcliff, 7 Ellengowan Dr | CP | MasterPlan NT | Impact Assessment | 23 Apr–7 May 2021 |
| N4 | Data centre, Darwin City | PA2023/0228 | Lot 9702 Town of Darwin, 8 Ryko Court | CB | Cunnington Rosse Town Planning | Impact Assessment | 14–28 Jul 2023 |
| N5 | Data centre with ancillary office, 7 storeys, Darwin City | PA2025/0044 | Lots 9703 and 9704 Town of Darwin, 6 and 2 Ryko Court | CB | Cunnington Rosse | Impact Assessment | 21 Feb–7 Mar 2025 |

None names an operator; press links Ryko Court to NEXTDC (rung 4). Decisions
not located (DCA minutes 408 and 440 are reported to record consents; not read).
Document lists in the NTLIS JSON look incomplete; full lists need a browser.

**Use class, recorded before any NT document is read.** The NT Planning Scheme
2020 defines no "data centre" use (Schedule 2, 61 defined uses; Schedule 1 to
amendment 160, 6 Feb 2026, adds none). An undefined use is **impact
assessable** in 27 of 31 zones, including CB, and prohibited in four
residential zones. All three applications were impact assessed and publicly
exhibited, and their descriptions name the use as "Data centre". Under the
pre-registered expectation (a pathway effect), this predicts disclosure on the
NT DCA pathway. That prediction is recorded here before the documents are
read. Whether the Territory Coordinator Act 2025 offers a pathway that bypasses
this was not checked.

**Departures, recorded.** (1) Some Cloudflare-blocked pages were read from
Internet Archive snapshots (NT EPA Ares pages, the Territory Coordinator
Beetaloo item, NT Planning Scheme Schedule 2, Part 1 and Part 4). These are
dated copies, not live pages, and must be re-obtained live before citation.
(2) Indexes not searched by script (Cloudflare, reCAPTCHA, login) are listed
above as not searched, not as nulls.

**NT arm status:** N1 located in referral indexes only (no planning
application found); N2 not located by any index; N3–N5 located in index 1.
Next: obtain N3–N5 documents (browser), and open the four blocked indexes in a
browser.

