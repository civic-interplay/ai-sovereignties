# The connection agreement is the most sovereign thing in the stack, and the least visible

**Finding, 19 September 2026.** Extends the four-register typology in the Data
for Policy abstract with a mechanism observed in two Queensland primary records.
Not yet adversarially verified.

## The argument in one line

Of everything in an Australian data centre's stack, **the grid connection is the
only input that is unambiguously publicly owned, genuinely scarce, and
impossible to relocate** — and it is allocated by a commercial contract that
appears in no planning record and is subject to no public process.

## Against the stack ladder

The field note *Who holds each layer of the Australian AI stack?* (16 Aug 2026)
sets out six layers, and marks exactly one as Australian:

| | Layer | Held by |
| --- | --- | --- |
| 06 | Value & returns | offshore — booked through Dublin and Singapore |
| 05 | Models & workloads | US labs — foreign weights on leased capacity |
| 04 | Compute | hyperscalers — public share ~150 H100-equivalents |
| 03 | Facilities | global funds — A$65bn announced private build |
| **02** | **Land · water · energy** | **Australia** |
| 01 | Minerals | Washington / Beijing — China refines ~90% |

*Australia holds the ground of a stack it does not hold.* Layer 02 is the
stable layer — the one that cannot be booked offshore, and the only one where
value can be captured locally, through rates, charges, water pricing, land and
labour.

**This finding is a correction to layer 02's own caption.** The field note reads
"granted through state planning · fast-tracked · public notice exempted". That
is true of land and of water. **It is not true of energy.**

Land use and water are assessed through the planning system: exhibited,
notifiable, open to submission, appealable. Grid connection is not in that
system at all. It is allocated by a commercial contract between a proponent and
a network operator. It was never fast-tracked or notice-exempted, because it was
never in the instrument that could exempt it.

So the layer Australia holds is not one thing. It splits:

- **Land and water** — granted through planning, visible, contestable, and
  already documented as fast-tracked and notice-exempted.
- **Energy** — granted through a connection agreement, invisible, uncontestable,
  and outside planning entirely.

And energy is the component that makes the other two worth having. A hyperscale
site without a connection is a paddock.

## Against the four registers

The typology distinguishes **locational** sovereignty (compute onshore,
ownership and model governance foreign), **financial** (public equity under
commercial mandates), **operational** (the state runs its own stack), and
**productive** (models built and published as public goods). The critique of
locational sovereignty is that it is sovereign in name only: the building is
here, the authority is elsewhere.

The two Queensland sites read against that:

| | Western Downs (Dalby) | Supernode (Brendale) |
| --- | --- | --- |
| Land | Wambo Cattle Company — AU | 30 ha, Brendale — AU |
| Developer | WDDP / Zerra DC (AGP) — **Singapore** | Quinbrook — US-headquartered, FIRB-approved |
| Capital | foreign | **Rest Super $1bn**, via manager |
| Compute | **rented to Anthropic — US** | multi-tenant, up to four buildings |
| Transmission | Powerlink — **QLD state-owned**, 2,160 MVA | Powerlink — **QLD state-owned**, 800 MW |
| Register | Locational + Rented | Locational + Financial + Rented |

Both are textbook locational arrangements. But the table contains one row that
does not behave like the others.

**Every other input is either private or tradeable.** Land can be bought.
Capital can be raised anywhere. The buildings are commodity construction. The
compute is rented offshore the moment it is switched on. The only input that a
private party cannot simply acquire, substitute or import is a connection to
publicly owned transmission at a node with spare capacity.

Quinbrook says so itself, describing the site as having "access to three
independent high voltage connections forming the major power transmission node
for Queensland". The Dalby report is equally explicit: 275 kV and 330 kV
customer-owned switching stations connecting **directly to transmission**, and
not to the distribution network that serves homes and businesses.

So the scarce sovereign asset is not the land, the money or the data. It is
**headroom on a state-owned network at a specific point in space** — and it is
finite, because a substation has a rating.

## Why this sharpens the locational critique

The standard reading of locational sovereignty is that the state gets a building
and gives up authority. These two sites show something more specific and more
uncomfortable.

At the locational layer the state **does** hold a real asset. Powerlink is
Queensland government-owned. Transmission capacity is a public good, built with
public money, and its allocation is a genuinely sovereign decision about who
gets access to a finite public resource.

And it is allocated by **connection agreement** — a commercial contract between
a state-owned corporation and a proponent.

Consider the asymmetry:

- The **land use** is assessed by a council, publicly notified, open to
  submission. Dalby's file contains roughly a dozen objections from named
  residents and the Darling Downs Environment Council.
- The **allocation of 800 MW of public transmission capacity** is executed as
  Connection and Access Agreements. No exhibition. No submissions. No appearance
  in the planning record at all.

A resident can object to a shed's setback and cannot see, let alone contest, the
allocation of the public asset that determines whether the project is viable at
all. **The state gave away the thing it actually owned, through the instrument
nobody can read.**

That is not a failure of the locational register. It is the locational register
working as designed, with the one genuinely sovereign lever inside it made
invisible.

## What follows for the 10 Principles critique

Principle 8 — public value first — cannot be assessed without separating value
creation from value capture at the infrastructure layer. This is where that
separation is decided, and it is decided in a contract.

The abstract argues the contest over sovereignty is "settled in procurement and
memoranda before any public institution has deliberated it". The connection
agreement is that claim with a named instrument attached. It is not a metaphor
for pre-emption; it is the document.

## What would make this measurable

1. **Record the connection** as a tracked attribute: connecting network
   operator, substation, voltage, contracted capacity, and whether the
   connection is to transmission or distribution. Both QLD sites disclose all
   five; nothing in the tracker captures them.
2. **Read the Transmission Annual Planning Reports.** Each network service
   provider publishes connection enquiries annually. That is the only public
   trace of who asked for what, and it precedes any planning application — see
   [`GRID-SITING.md`](GRID-SITING.md).
3. **Report transmission-connected share.** What proportion of Australian data
   centre capacity connects directly to transmission rather than distribution?
   Direct connection means the facility is invisible to the distribution
   network that prices and plans for households.
4. **Name the counterfactual.** Public transmission headroom is finite. A
   connection granted is a connection unavailable to another user — industrial,
   residential, or renewable generation seeking to export. That is the public
   value question, and it is currently unasked because the allocation is
   unpublished.

## Limits

- I have not read a connection agreement. Their existence, parties and
  headline capacity come from proponent statements and a ministerial release —
  rung 3 and rung 5. Whether they are obtainable at all, by FOI or otherwise,
  is untested and is the obvious next step.
- "Publicly owned" is accurate for Powerlink (Queensland) and does not
  generalise: transmission is privatised or partly privatised in Victoria and
  South Australia. The argument holds in a different form where the network is
  private — the asset is then scarce but not sovereign, which is its own
  finding.
- Connection capacity is not consumption, per
  [`coding-rules-2026-09-19.md`](disclosure-audit/coding-rules-2026-09-19.md).
  An 800 MW connection is a right to draw, not a statement of draw.
- Not adversarially verified. Given the argument's reach, it should get a
  cross-family skeptic before publication.
