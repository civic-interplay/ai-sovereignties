# Transparency register — information architecture

Status: **design, agreed 2026-09-19.** Not built. Supersedes nothing; the infra
tracker (Notion `8b537010…`) remains the spine and the map source.

## What this is for

The tracker answers *what exists*. The register answers *what has been
disclosed about it, against what the law required* — and makes the gap a
computed figure rather than a hand-argued finding.

The method already exists and is written down: `FACT-CHECKING-GUIDE.md` §2 (the
six source rungs) and §3 (how a negative claim is checked — get the record,
search it, record the terms and page count, carry the redaction caveat). What
does not exist is anywhere to *put* the result. This document is the schema for
that.

## Why normalise, in one table

Populated field counts across the 143 tracker rows, 19 Sep 2026:

| field | populated |
| --- | --- |
| Planning Pathway | 68 / 143 |
| Water Risk | 57 / 143 |
| Public notice | 19 / 143 |
| Evidence rung | 6 / 143 |
| Energy claim level | 4 / 143 |
| **Resource conditions** | **2 / 143** |

The interpretive fields are populated; the evidentiary ones are all but empty.
That is not diligence drifting. `Resource conditions` describes *an instrument
of approval*, but it is stored on *a site*, and a site has many instruments —
57 Station Road, Seven Hills carries four PANs; 42A Bluett Drive carries two.
There is no single correct value to enter, so nothing is entered. Under the
tracker's own convention a blank means "unassessed", so the schema is
currently producing a false reading: it says nobody looked, when in fact there
was nowhere to record what they found.

Normalising fixes that, and as a by-product turns the disclosure audit into a
query.

## The five entities

Site is the existing tracker. The other four are new, related databases in the
same Notion workspace.

```
Site ──< Instrument ──< Document ──< Disclosure >── Requirement
 (existing)   (new)        (new)        (new)          (new)
```

### 1. Site — existing, unchanged as the spine

Identity: address / coordinates, plus `Campus group` where several buildings
are one project. Keeps everything the map and sheets read today.

**Fields that move off Site** (they belong to an instrument, not a place, and
are the ones sitting empty): `Approval date`, `Public notice`,
`Resource conditions`, `State approval body`, `Accelerated via`. They stay
readable on Site as rollups so nothing on the site breaks.

**A lifecycle field replaces the title prefix.** `[PROPOSED]` / `[REJECTED]`
become `Register status` — one of `Proposed`, `Under review`, `Admitted`,
`Rejected`. The prefix convention is why 15 rejected rows leak into
`sites.csv` (the open v0.2.1 item); a field can be filtered, a title prefix
has to be parsed. Rejected rows are still kept — they are the pipeline's
false-positive log and the only measure of discovery precision.

### 2. Instrument — one row per statutory act

A DA, a modification, an SSD, a Ministerial permit, a scheme amendment. Many
per Site. This is what the feeds populate.

| field | type | note |
| --- | --- | --- |
| Instrument ID | text | PAN-594877, SSD-70889211, PA2604553 — the natural key |
| Site | relation → Site | may be blank while unmatched |
| Jurisdiction | select | NSW / VIC / QLD / WA / SA / TAS / NT / ACT / Federal |
| Pathway | select | reuse `Planning Pathway`: State assessed, Ministerial fast-track, Local council, Federal assessment, Not applicable |
| Instrument type | select | Original / Modification / Amendment / Review |
| Authority | text | consent authority as named in the instrument |
| Lodged | date | |
| Exhibition start / end | date | absent ⇒ not exhibited; this is `Public notice`, evidenced |
| Determination | select | Approved / Refused / Withdrawn / Undetermined |
| Determined | date | |
| Register status | select | as Site above — feeds land as `Proposed` |
| Discovered by | select | ePlanning / PlanningAlerts / DFP register / Press / Manual |

### 3. Document — the paper, and whether it can still be reached

| field | type | note |
| --- | --- | --- |
| Instrument | relation → Instrument | |
| Doc type | select | EIS / Permit / Delegate or officer report / Endorsed plan / Gazette notice / Submission |
| URL | url | |
| Retrieved | date | |
| Local copy | text | path under `docs/disclosure-audit/` |
| Access status | select | **Public** / **Public, script-blocked** / **Redacted** / **Removed from site** / **Never public** |
| Pages searched | number | §3 asks you to record this |
| Terms searched | text | the literal term list, so the negative claim is reproducible |

`Access status` is a finding in its own right, not an error log. Westmeadows'
exhibited documents were removed from the live site after exhibition closed;
"was public, now is not" is exactly the kind of thing a transparency register
exists to say. `Public, script-blocked` is the Victorian register's state —
per §3 it blocks scripts but works in a browser, and the PDFs themselves sit on
a public blob store.

### 4. Disclosure — one row per (document × item)

The heart of it. One row per disclosable item per document, so a site with four
instruments can hold four different answers without contradiction.

| field | type | note |
| --- | --- | --- |
| Document | relation → Document | |
| Item | select | IT load (MW) / Site load (MW) / Water source / Water volume (ML/yr) / WUE / PUE / Cooling type / Backup fuel / Emissions / Grid connection / Jobs |
| Status | select | **Disclosed — numeric** / **Disclosed — qualitative** / **Claim only** / **Redacted** / **Not found** / **Not required** |
| Value | text | as written in the source, units included, not normalised |
| Location in doc | text | clause or page — §3 wants "cl. 12–14", not "somewhere" |
| Evidence rung | select | 1–6, reusing the §2 hierarchy |
| Verified by | text | initials |
| Verified date | date | |
| Confidence | number | |

Verification hangs here, not on Site. A site can then be honestly
half-verified: two disclosures checked against the primary record, three still
on a press claim. The current schema forces one verdict for a whole row.

### 5. Requirement — the yardstick

What a jurisdiction obliges a proponent to disclose, at a given pathway. Without
this the register can record what *was* disclosed but cannot justify the word
"gap".

| field | type | note |
| --- | --- | --- |
| Jurisdiction | select | |
| Pathway | select | same vocabulary as Instrument |
| Item | select | same vocabulary as Disclosure |
| Requirement | select | **Mandatory numeric** / **Mandatory qualitative** / **Discretionary** / **None** |
| Basis | text | the clause, SEPP, practice note or Act section that imposes it |
| Established by / date | text, date | this is research output — it needs the same provenance as a disclosure |

Populate for NSW and VIC first. QLD and NT stay null until the enforcement
sweep closes — and null must render as "not established", never as "None".

## The gap becomes a query

For a site, for each item required at its instrument's jurisdiction × pathway:

```
required(item)  AND  no Disclosure row with Status in
                     {Disclosed — numeric, Disclosed — qualitative}
              ⇒  gap
```

"0 of 13 checkable VIC records disclose MW or water" stops being an audit
re-run by hand and becomes a derived figure that updates when a row changes —
and that cannot silently go stale, because a new Disclosure row falsifies it
automatically. §3's rule that *a negative claim is falsified by one document*
becomes a property of the data rather than a discipline.

Three figures fall out for free: disclosure rate per jurisdiction, per item,
and per pathway — the last being the one that tests whether fast-tracking
costs disclosure.

## Feeds map onto Instrument, not Site

| source | populates | state |
| --- | --- | --- |
| NSW ePlanning OnlineDA | Instrument (council tail) | built, `retrieve/eplanning.ts` |
| PlanningAlerts API | Instrument (VIC + NSW council tail) | **needs an API key** |
| VIC DFP / Ministerial register | Instrument + Document (state tail) | script-blocked; PDFs on a public blob store |
| NSW Major Projects | Instrument + Document (state tail) | no API, confirmed 2026-07-27 — scrape |
| Press (GDELT) | Site candidates only | built |

Discovery proposes Instruments. A human promotes an Instrument to a Site. That
is the right boundary: the pipeline is good at finding that an application
exists and bad at deciding whether it is a data centre.

Note that PlanningAlerts already sits at rung 2 in the source hierarchy, so
nothing about the evidence standard has to move to accommodate it.

## Build order

The ordering rule from 18 Aug applies and is not optional: **deploy code that
reads a field before migrating the data it reads.** Retiring governance flags
before shipping their replacement zeroed a published figure silently for an
hour.

1. Create the four databases with their vocabularies. Nothing reads them yet.
2. Backfill Instruments for NSW + VIC from the existing rows' Notes, which
   already carry PANs and PA numbers.
3. Populate Requirement for NSW + VIC from the closed enforcement research.
4. Move the disclosure audit out of `DISCLOSURE-AUDIT.md` into Disclosure rows.
   The prose document stays as the narrative; the rows become the source.
5. Only then add rollups to Site and switch the sheets to read them.
6. Add the derived gap figures to the state sheets.
7. Split `rejected_candidates.csv` out of `sites.csv` (v0.2.1) — trivial once
   `Register status` exists.

Notion silently ignores select-option renames via the API, so every vocabulary
above must be created correctly the first time, not migrated into.
