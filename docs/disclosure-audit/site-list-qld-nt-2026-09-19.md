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
| 2026-09-19 | Q1 Dalby | PlanningAlerts | **Authority not covered** — `/authorities/western-downs` returns HTTP 404. Recorded as a gap in the index, not in the record. |
| 2026-09-19 | Q1 Dalby | Trade and general press | DA lodged **17 Aug 2026** with Western Downs Regional Council by **WDDP Pty Ltd** (Zerra DC / AGP): Material Change of Use for Research and Technology Industry, workforce accommodation, and a high-impact-industry concrete batching plant. Site 1933 Dalby–Kogan Road, **Lot 125 on DY316**, 725.5 ha. No council reference number published. |
| 2026-09-19 | Q3 Swanbank | Ipswich Development.i portal | Application-number search for `2285/2026/MCU` returned **"No results"**. Address search returns a page whose results render client-side and could not be read by script. **This index has not been properly searched** — see caveat below. |
| 2026-09-19 | Q3 Swanbank | PlanningAlerts | Authority covered and current, but the public list surfaces only the most recent applications; an August lodgement is not on it. Needs the API key (requested, pending) to query by date. |
| 2026-09-19 | Q3 Swanbank | Trade press | Reference **2285/2026/MCU**, 6 Leaf Street (Lot 5), Swanbank, lodged **4 Aug 2026** by Northern Concept Swanb Pty Ltd. Reported as **code assessable** — no public notification required. |
| 2026-09-19 | Q2 Supernode | — | Not yet searched. |
| 2026-09-19 | NT | — | Not yet searched. |

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
