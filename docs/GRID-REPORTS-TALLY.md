# What the grid operators say about data centres

**Read 19 September 2026.** Running tally across network service providers'
annual planning documents. Source files are not committed; see
[`disclosure-audit/SOURCES.md`](disclosure-audit/SOURCES.md) for the sha256 of
each.

### 2026 editions — comparable to each other

| Report | Pages | "data centre" | control: "network" |
| --- | ---: | ---: | ---: |
| **Transgrid** TAPR (NSW / ACT) | 191 | **187** | 951 |
| **AEMO** Victorian Annual Planning Report | 113 | 16 | 358 |
| **ElectraNet** TAPR (SA) | 84 | 11 | 557 |

### 2025 editions — comparable to each other, not to the above

| Report | Pages | "data centre" | control: "network" |
| --- | ---: | ---: | ---: |
| Ausgrid DTAPR (NSW distribution) | 49 | 22 | 676 |
| Powerlink TAPR (QLD) | 212 | 10 | 1,102 |
| Western Power TSP (WA / SWIS) | 43 | **0** | 145 |
| TasNetworks APR **summary** (TAS) | 12 | **0** | 88 |

A positive control is run on every document. "network" returns hundreds in each,
so a zero for "data centre" is a property of the document, not of the
extraction. This is now standing practice — see
[`AGENT-RECURSIVE-LISTENING.md`](AGENT-RECURSIVE-LISTENING.md).

## Never compare across the two tables

The tables are split by year on purpose. **Transgrid's 187 and Powerlink's 10
are a year apart, not a jurisdiction apart.** Transgrid's own forecast of data
centre load growth quadrupled between its 2025 and 2026 editions, by its own
statement, so its 2025 report would read far closer to Powerlink's than to its
own successor.

Reading a 2026 document against a 2025 one and calling the difference a state
effect would be exactly the error this project spent 19 September catching
three times over. Compare within a table, never across.

**Powerlink's 2026 TAPR is the single most valuable document still unread.**
Queensland received the largest data centre proposed in Australia in August
2026, and its 2025 report had explicitly excluded data centres from the load
forecast. Whatever that report says is the test of how fast a transmission
planner can turn.

## The 2026 comparison, now that three exist

Transgrid says "data centre" **187 times in 191 pages**. Victoria's planner says
it **16 times in 113**. South Australia's says it **11 times in 84**.

Normalised, that is roughly **one mention per page for NSW, one per seven pages
for Victoria, one per eight for South Australia.** Same year, same document
genre, same statutory purpose.

Both other operators are clearly tracking it — Victoria forecasts "large
inverter-based block loads, such as data centres", revised its maximum demand
forecast upward on data centre growth, and names "connection of large
industrial loads, in particular data centres" as a driver. South Australia
names data centres as an emerging large load and points to AEMO's outlook
identifying them as "a leading" source of growth.

So this is not NSW noticing something the others have missed. It is a
difference of **degree and urgency**, and it tracks where the facilities
actually are. NSW is where ~20 GW of enquiries have landed.

Treat the counts as a rough index of attention, not a measurement. A longer
report can say a word more often for reasons that have nothing to do with
emphasis.

## What each one actually says

**Transgrid, 2026 — the outlier, and the reason for the whole exercise.**
66% of NSW end-use consumption growth to FY35 is data centres. ~20 GW of
connection enquiries, about twice state peak demand. Facilities above 1 GW
seeking direct transmission connection. Minimum demand turning back up in 2029.
See [`FINDING-the-grid-already-knows.md`](FINDING-the-grid-already-knows.md).

**Powerlink, 2025 — the forecast that wasn't.** §2.3.7: "limited interest from
data centre proponents in Queensland, with minimal enquiries or developments
progressing beyond preliminary stages", citing an AEMO projection of 90 GWh of
annual consumption for the entire state, and concluding that Powerlink "has not
included specific data centre projects into the current load forecast."

Western Downs Digital Park was lodged in that network area in August 2026 at
1,440 MW of IT load. At 8,760 hours and a 70% load factor — an assumption, and
labelled as one, because the record states no consumption figure — that is
roughly 8,800 GWh a year, about 98× the figure the forecast rested on.

**AEMO Victorian Annual Planning Report, 2026 — 16 mentions in 113 pages.**
Victoria is the one state where AEMO plans transmission rather than the network
owner, so this is the AusNet equivalent and no AusNet TAPR exists. It attributes
demand growth to "new large industrial connections (predominantly data
centres)", flags "growing expectation for large inverter-based block loads, such
as data centres, to connect", and states that its maximum demand forecast rose
against the 2024 projection because of data centre growth. It also notes "a
number of small distribution connected data centres" in regional Victoria —
the only operator so far to distinguish distribution-connected facilities from
transmission-connected ones, which is the distinction that matters for whether
a facility is visible to the network that serves households.

**ElectraNet, 2026 — 11 mentions in 84 pages.** South Australia names data
centres among "emerging large loads", identifies connection hotspots where the
network is "increasingly congested", and cites AEMO's outlook highlighting data
centres as a leading source of demand growth. It is the only report so far to
mention connection enquiries (7) alongside data centres in the same document.

**Ausgrid, 2025 — 22 mentions in 49 pages.** The NSW *distribution* network,
and the highest density of any 2025 document here. Worth reading properly:
distribution is what serves households, and both Queensland sites examined
connect directly to transmission specifically to avoid it.

**Western Power, 2025 — zero.** Caveat: this is a *Transmission System Plan*,
not a TAPR, and Western Australia's SWIS sits outside the National Electricity
Market with its own regulatory regime. The tracker holds CDC Maddington and
Westech Pilbara in this network area.

**TasNetworks, 2025 — zero, but it is a 12-page summary.** The full Annual
Planning Report has not been read, and a zero in a summary is weak evidence
about the full document. Worth chasing, because Tasmania holds three Firmus
facilities in the tracker including one operating at 104 MW — so an absence in
the full report would be meaningful, and this summary cannot establish it.

## Still to obtain

| Operator | Document | Note |
| --- | --- | --- |
| **Powerlink** | 2026 TAPR | The priority. See above. |
| ~~AEMO~~ | ~~Victorian Annual Planning Report~~ | **Obtained 19 Sep 2026.** |
| ~~ElectraNet~~ | ~~2026 TAPR (SA)~~ | **Obtained 19 Sep 2026.** |
| TasNetworks | full 2025/2026 APR | Only the summary has been read. |
| Transgrid | 2025 TAPR | Would make the year-on-year comparison exact rather than inferred from the operator's own "4x". |
