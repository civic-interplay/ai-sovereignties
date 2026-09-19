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

So the earlier candidates are rejected too: they are at the wrong parcel.

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
