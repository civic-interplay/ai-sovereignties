# Network model (working draft)

This is a thinking document, not a spec. It records where the map is heading
so the next build steps have something to push against. Treat every line as a
draft.

## The thesis

A data centre is not a dot. It is the visible tip of a physical and political
supply chain. To run, it draws on:

- **Energy / grid** to power the compute.
- **Water** to cool it (which is why each site already carries a water-risk field).
- **Minerals** (copper, lithium, nickel, rare earths, silicon) out of mines.
- **Refineries / processing** to turn ore into battery-grade or chip-grade material.
- **Governance** sitting over all of it: who owns each link, foreign investment,
  AUKUS and defence overlays.

The map is making one argument: **AI sovereignty is decided across the whole
stack, not at the data centre alone.** An Australian-owned data centre running on
a foreign-owned grid and foreign-refined minerals is sovereign in name only.

## Two questions the map answers

1. **What depends on what?** The dependency chain: `mine -> refinery ->
   (manufacture) -> data centre`, with energy and water feeding the data centre
   directly.
2. **Who controls each layer?** The ownership question. Trace a chain and read
   who holds each link.

Crossing the two is the payoff: **sovereignty exposure**, ownership read along a
dependency chain.

## Three lenses on the same nodes

| Lens | Colours nodes by | Data | Status |
| --- | --- | --- | --- |
| **Layer** | infrastructure kind (data centre, mine, refinery, energy, water) | `kind` | live |
| **Ownership** | sovereignty category (Australian, foreign, JV, government, defence) | `sovereignty` | live (toggle) |
| **Actor** | a specific owner, lit up across every layer they touch | needs Actors | to build |

The Layer and Ownership lenses ship now: a toggle recolours the same nodes,
because both fields already exist per site. The Actor lens needs owners modelled
as their own entities (see below).

## Data model to get there

Today each Notion row is a standalone site with no link to any other. To draw
connections and to select an actor's full reach, we add two things:

### Sites (exists)

Location, `kind` / infrastructure type, `sovereignty`, `operator`,
`ownershipCountry`, capacity, water risk, status, source. No change needed to
ship the Ownership lens.

### Actors (new)

Owners and controllers as first-class entities, so one actor links to many
sites. Right now `operator` and `ownershipCountry` are free text and uneven
(`USA` vs `USA (Blackstone)` vs `United States (Amazon)`, plus blanks), which is
fine for labels but cannot answer "show everything this actor controls."

- A small **Actors** list (Notion database or select), each with a name, a
  home country, and a type (state / SOE / corporate / fund).
- Sites relate to one or more actors with a **role** (owner / operator / investor).

### Connections (new)

Dependency edges between sites.

- A small **Connections** table: `from` site, `to` site, `type`
  (powers / cools / supplies-minerals / processes-for).
- Rendered as a Mapbox line layer between the two sites' coordinates, coloured
  by type. Click a data centre and its dependency lines light while the rest dim,
  so the explanation reads as "here is what *this one* needs."

## Granularity: start illustrative, harden over time

Two ways to record connections:

- **Real**: this specific mine feeds this specific refinery, sourced and
  defensible. Rigorous, slow.
- **Illustrative / typed**: category-level dependency (mines -> refineries ->
  data centres) shown as a *type of* relationship, not an audited contract.
  Communicates the idea immediately and stays honest as long as the lines are
  labelled as dependency types rather than verified links.

Recommendation: start illustrative and typed, then harden specific edges to
real, sourced links as the research fills in.

## Open questions

- **Direction and focus:** is the data centre always the thing being supported
  (everything points at data centres), or do we want full chains where a
  refinery is both consumer and supplier?
- **"Networked" globally:** other regions need their own site rows or feeds. The
  map is fenced to the Australia view for now; that is one line to reopen.
- **Actor reach across borders:** an actor view becomes most interesting once
  the same owner shows up in more than one region.

## Build order (proposed)

1. Ownership lens toggle. (done)
2. This document. (done)
3. Model Actors; normalise owners; ship the Actor lens (select an actor, light
   up its holdings).
4. Model Connections; ship the dependency line layer with click-to-focus.
5. Open the map beyond Australia as regions are added.
