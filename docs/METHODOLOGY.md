# Methodology

*How the AI Sovereignties atlas is compiled, verified and corrected.
This page is the citable method statement for the project; the working
verification protocol is in [FACT-CHECKING-GUIDE.md](FACT-CHECKING-GUIDE.md).*

## What this is

A living atlas of the physical infrastructure behind AI in Australia — data
centres, mines, refineries, energy and water dependencies — with each site's
ownership chain, approval pathway, and the public contestation forming around
it. The map at [datacentres.civicinterplay.io](https://datacentres.civicinterplay.io)
renders a Notion-held tracker; every map point is a tracker row with
coordinates, and every row carries its sources.

## Sources

Rows are compiled from, in descending order of weight:

1. **Planning records** — permits, delegate reports, exhibited EIS documents,
   Gazette notices, register entries (Victorian ministerial permits register,
   NSW Major Projects portal, PlanningAlerts).
2. **Official lists and correspondence** — including a consolidated
   data-centre list for Melbourne and Victoria provided by City of Melbourne
   officers (June 2026), which seeded much of the Victorian coverage.
3. **Corporate records** — ASIC extracts, land titles, ASX disclosures.
4. **Operator disclosures** — location pages, sustainability reports, press
   releases (treated as claims, and labelled as such).
5. **Trade and local press** — used for leads and corroboration, cited
   per-row.
6. **A fortnightly automated scan** (GDELT news retrieval and planning-portal
   feeds) that surfaces candidate updates for human review.

## How AI is used, and where humans decide

This project uses AI agents (Anthropic's Claude) openly and on the record:

- **Compilation**: agents parse source lists, geocode addresses, retrieve and
  search planning documents, and draft row entries.
- **Research sweeps**: parallel agents research defined questions (e.g. each
  operator's contracted energy supply vs certificate claims) and must return
  evidence with URLs; findings are written to rows *with* their evidence.
- **Adversarial verification**: before findings are published, independent
  agents are tasked with *refuting* each claim from fresh sources; claims are
  graded CONFIRMED / PLAUSIBLE / REFUTED / UNVERIFIABLE, and refuted claims
  are corrected everywhere they appear.
- **Human verification**: every row carries a `Classified by` field
  (Agent / Human / Human-verified) and a `Confidence` score. Nothing is
  represented as human-verified unless a person has walked the claim to a
  primary or official source per the fact-checking guide. Compute use is
  logged (`docs/COMPUTE-LOG.md`).

Blank fields are honest: a blank means *unassessed*, and an explicit
"Unknown" or "None" means *assessed, nothing found* — the distinction is kept
deliberately, including for the energy, water and superannuation-exposure
lenses.

## Classification choices worth knowing

- **Energy lens**: "Renewable (contracted)" includes corporate REC/PPA
  *matching* — the strongest claim most operators can make — but row notes
  always distinguish certificate matching from physical supply, and offsets
  are never counted as renewable electricity.
- **Water lens**: design claims (closed-loop, waterless) are recorded with
  their provenance; an operator design claim is not treated as an assessed
  volume.
- **Public notice**: set to *Exempted* where the approval pathway skipped
  public notice (e.g. Victoria's Development Facilitation Program), based on
  the register's own process record; *Exhibited* where documents were
  publicly exhibited (e.g. NSW SSD).
- **Sovereignty registers** (Rented / Financial / Operational / Productive)
  classify what kind of sovereignty a site actually confers; the map colours
  by the most sovereign register present.
- **Capacity (MW)**: recorded from published figures with the source; where a
  figure exists only in marketing and not in any planning record, that gap is
  itself recorded (see the [disclosure audit](DISCLOSURE-AUDIT.md)).

## Known limitations

- Some coordinates are street-level geocodes of published addresses, marked
  approximate in notes where relevant.
- Negative findings ("no figure in the record") are bounded by what is
  public: redacted documents and unlocatable records are reported as exactly
  that, no more.
- Operator identities behind consultant- or shelf-company-lodged applications
  are stated as *reported* until confirmed by corporate/land records or
  register amendments.
- The tracker is a living document; rows carry `Date Logged` and notes are
  append-only with dates, so the state of knowledge at any time is
  reconstructable.

## Corrections

Errors are corrected in place, noted with a date in the row, and — where they
reached published documents or the map — corrected there with a visible
commit. Corrections are part of the method: the project applies to itself the
disclosure standard it argues planning systems should meet.

## Licence and citation

Methodology, classification and written analysis: CC BY 4.0. Underlying
records are compiled from public sources, cited per entry. Cite as:
Sarah Barns, *A living atlas of contesting and curating AI sovereignties
(Australian view)*, Civic Interplay, 2026.
[doi.org/10.5281/zenodo.21026430](https://doi.org/10.5281/zenodo.21026430).
