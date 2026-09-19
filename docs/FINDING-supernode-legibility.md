# A $3 billion data centre that its own council's records cannot name

**Finding, 19 September 2026.** Status: searched and documented; the negative
result is reproducible from the search log at
[`disclosure-audit/site-list-qld-nt-2026-09-19.md`](disclosure-audit/site-list-qld-nt-2026-09-19.md).
Not yet adversarially verified — see *Limits*.

## The claim

Supernode at Brendale is a data centre and battery campus reported at
$2.5–3 billion. Its planning approval was announced by the Deputy Premier of
Queensland. **The word "data" does not appear in any of the 16,519 development
application descriptions published by the council that approved it.**

Not "data centre". The four-letter string, anywhere, in any application
description in City of Moreton Bay's open data, 2016 to August 2026.

## What is publicly known

From the Queensland Government's own media statement, 8 July 2022, attributed
to Dr Steven Miles as Deputy Premier and Minister for State Development,
Infrastructure, Local Government and Planning:

> "Queensland-based global renewables investor Quinbrook Infrastructure Partners
> had gained **council planning and FIRB approvals** for its Supernode complex
> in Brendale, Moreton Bay."

> "The Supernode had the potential to be a **$2.5 billion-plus investment**,
> developed in stages on a **30-hectare site**."

The project as since described: up to four hyperscale data centre buildings,
260 MW-IT, three independent high-voltage connections at the South Pine
substation totalling 800 MW, Stage 1 battery storage operational at
260 MW / 619 MWh, at 83 Kremzow Road.

**The ministerial statement contains no energy figure and no water figure.**

## What the planning record shows

Five search routes, each recorded with the query that produced it, against an
index verified as working (controls: `DWELLING` returns 3,302; `INDUSTR`
returns 402):

| Route | Result |
| --- | --- |
| `DATA CENTRE`, `DATA CENTER`, `DATA STORAGE`, `SERVER`, `SUPERNODE`, `QUINBROOK` | zero each |
| `DATA` — the bare string | **zero of 16,519** |
| Every application decided in Brendale, Jan 2020 → 13 Jul 2022 | 177 records; warehouses, stormwater, advertising devices |
| Parcel history of the nearest candidate | service station, food outlet, showroom, medium impact industry |
| Every application near Kremzow Rd (66) and Strathwyn St (55) | warehouses, showrooms, a place of worship, an Aldi distribution centre |

The nearest thing to a trace is `DA/2023/1419` — a **Battery Storage Facility**
permit, approved November 2023.

**The battery is legible. The data centre is not.**

## Why: there is no word for it

That asymmetry is the finding, and it is not an accident of this council.

"Battery Storage Facility" is a use class. A planning officer entering it into a
register has a term that means the thing. A data centre does not have one — in
Queensland it is approved as a **utility installation**, a **high impact
industry**, or, at the Western Downs campus 200 km west, a **research and
technology industry**. In New South Wales it is `Data storage premises` where
anyone thinks to use it, and where they do not, the tracker's own discovery
pipeline has to infer data centres from construction cost, which is why fifteen
proposals have had to be rejected by hand as warehouses.

So the register is not concealing anything. It is faithfully recording a
category that does not exist. A resident searching their own council's
published, machine-readable, no-login open data for "data centre" finds nothing
— at the most transparent end of the system.

The government's own announcement does the same thing. It calls Supernode
"large-scale storage facilities for both data and battery energy". Even the
press release does not say data centre.

## The 2022 problem

Supernode's approval was secured by July 2022. ChatGPT launched that November.

The consent now underwriting a hyperscale AI campus was granted before the
public conversation about AI infrastructure existed, under a description —
"storage facilities for data and battery energy" — that was accurate at the
time. And the permit chain runs back further: the candidate applications at the
site are *Minor Changes* to an original whose use class predates February 2016.

This reframes the enforcement question. It is not only that no numeric energy
or water condition was imposed. It is that **whatever conditions exist were
written for a different thing**. There is no moment at which an assessing
officer failed to ask about AI compute loads; the question had not arrived. The
facility changed underneath a consent that stayed still.

## What this means

Three consequences follow, and they are separable.

1. **The public cannot audit what it cannot name.** Every civic check on this
   sector — a resident searching a register, a journalist filing an RTI, a
   council counting its own exposure — depends on the facility being findable.
   None of them work here.
2. **Neither can the state.** A jurisdiction cannot report how many data centres
   it has approved, or their cumulative load, if its own records do not
   distinguish them from warehouses. The absence is upstream of policy: you
   cannot set a target against an uncountable denominator.
3. **Siting is transmission-led, and the record describes the land.** Supernode
   sits beside the South Pine switchyard, which Quinbrook calls "the major power
   transmission node for Queensland". The Western Downs campus sits beside the
   Braemar substation, taking 275 kV and 330 kV connections directly off
   transmission and explicitly bypassing the distribution network that serves
   houses. Both were chosen by substation. The planning record describes a lot
   boundary.

A Street View image of the Supernode site in 2026 shows an empty paddock with
transmission towers on the horizon in both directions. That is the whole logic
in one accidental frame: the land is valuable because of what stands behind it,
and the planning record describes the paddock.

## Limits

- **This is "not located by these indexes", not "no record exists."** The
  approval plainly exists; a Deputy Premier announced it. Three explanations
  remain open and none has been chosen: the permit may predate the dataset's
  1 February 2016 start; it may sit outside the council pathway entirely
  (a Priority Development Area permit for "Research and Technology Industry and
  ancillary substation" at Petrie shows that route exists in this council); or
  it may be present under a description too generic to recognise. **Each of
  those would still support the legibility finding**, but they are different
  claims and should not be merged.
- The `DATA` count is over the open data extract's *description* field. It is
  not a claim about what is in the permit documents themselves, which have not
  been read.
- This finding has not been through adversarial verification or the
  cross-family skeptic. It should be before publication.
- One document naming the facility would falsify the strong version. That is
  the right bar, and it should be re-checked before anything goes to print.

## Sources

- Queensland Government media statement, 8 July 2022 —
  `statements.qld.gov.au/statements/95682` (rung 3, named-official statement)
- City of Moreton Bay open data, Development Applications —
  `datahub.moretonbay.qld.gov.au/datasets/development-applications`, queried
  19 September 2026 via its ArcGIS FeatureServer (rung 2, official register)
- Western Downs Digital Park Infrastructure Services Report, document 6397059,
  113 pp, Western Downs Regional Council register, retrieved 19 September 2026
  (rung 1, primary record)
