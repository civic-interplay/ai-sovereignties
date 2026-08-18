# Zenodo v0.2.0 — fields to paste

*Not part of the deposit. This is the copy for the Zenodo form.*

---

## Resource type
`Dataset`

## Title
A living atlas of contesting and curating AI sovereignties (Australian view)

## Version
`v0.2.0`

## Publication date
`2026-08-18`

## Licence
`Creative Commons Attribution 4.0 International`

## Authors
Barns, Sarah — RMIT University — ORCID 0000-0002-0087-7166

---

## Description

*(paste into the Description field)*

A snapshot of a living tracker of the physical infrastructure behind AI in
Australia: data centres, mines, refineries, and the energy and water they draw.
Each site carries its ownership chain, its approval pathway, and the public
contestation forming around it. The live version is at
https://datacentres.civicinterplay.io — this deposit freezes it on a date so it
can be cited.

**This version deposits the data and the method together.** Version 0.1.0 was an
initial snapshot of the project's code repository. From v0.2.0 the record holds
what the title describes: the dataset, the datasheet, the method statement, the
verification protocol, and the record of which claims survived adversarial
checking and which were refuted and corrected.

### What is in it

- `sites.csv` — 126 tracked sites and projects, one row each
- `contestation_items.csv` — 32 source events (articles, submissions, motions),
  joined to sites
- `data-dictionary.md` — every column defined, including what a blank means
- `README.md` — the datasheet: coverage, caveats, and how to reuse it
- `METHODOLOGY.md` — how the atlas is compiled, verified and corrected
- `FACT-CHECKING-GUIDE.md` — the working verification protocol
- `VERIFICATION-RECORD.md` — adversarial verification results, including the
  claims that were refuted
- `DISCLOSURE-AUDIT.md` — a completed audit of what Victorian planning records
  disclose about energy and water
- `CHANGELOG.md` — what changed between deposited versions

### How to read the blanks

A blank is not a zero. Throughout this dataset a blank field means the question
has not been assessed; an explicit "Unknown" or "None" means it was assessed and
nothing was found. The distinction is deliberate and it is what makes an absence
citable. `capacity_mw` is the clearest case: most tracked sites have no capacity
figure in any public record, and that absence is itself the finding.

Two fields carry this further. `resource_conditions` records whether the legal
instrument of approval imposes any obligation on energy or water use, graded only
from the instrument itself — never from an impact statement, an assessment report
or a media release. `governance_flags` records findings about how an approval was
handled; an absent flag means the row was not assessed on that dimension, not
that it passed.

### How much of it is human-verified

Stated plainly, because a reuser should not have to work it out: of 126 rows, one
is marked Human-verified, 45 Human, 21 Agent, and 59 carry no classification.
"Human-verified" is a high bar — it means a person walked the claim to a primary
or official source under the fact-checking guide. Rows classified Agent are
unreviewed and are excluded from published figures. The tracker is openly a
work in progress, and the `classified_by` and `confidence` columns are there so
you can filter to the level of assurance your use requires.

### Use of AI, on the record

This project uses AI agents openly. Agents retrieve and search planning
documents, draft row entries, and run research sweeps that must return evidence
with URLs. Before findings are published, independent agents are tasked with
refuting each claim from fresh sources, and claims are graded confirmed,
plausible, refuted or unverifiable. Refuted claims are corrected everywhere they
appear. Of 28 claims put through that process, 20 were confirmed and 6 refuted —
a refutation rate we publish rather than hide, because it is the honest measure
of what the method catches. Compute use is logged in the repository.

### Changes since v0.1.0

The full list is in `CHANGELOG.md`. The substantive ones:

- The governance-flag vocabulary was reduced from 11 terms to 3. Flags that
  merely restated the statutory approval route were retired once the planning
  pathway field carried that information on its own.
- A First Nations engagement flag was removed. Its six uses were concentrated in
  Western Australia and the Northern Territory and on mining projects — a record
  of where an analyst looked rather than where engagement is unclear. Because a
  flag is silent both when a row passes and when nobody checked it, an empty
  result could be read as an absence of concern. Every site in this dataset sits
  on Country. The replacement, when the work is done, is the statutory record —
  whether a Cultural Heritage Management Plan was required and approved, assessed
  with the Registered Aboriginal Party for that Country — not our judgement.
- The planning pathway vocabulary was made state-neutral. "State significant
  development" is New South Wales statute and was being applied to Western
  Australian projects that have no such pathway. It now reads "State assessed",
  covering the equivalent route in each jurisdiction, with the local instrument
  named per row.
- A new field, `resource_conditions`, records whether an approval instrument
  binds energy or water use at all.

### Citing

Cite the concept DOI 10.5281/zenodo.21026429 to always resolve to the latest
version, or this version's DOI to cite this snapshot specifically.

---

## Keywords

data centres; artificial intelligence; infrastructure; Australia; planning;
water; energy; sovereignty; open data; contestation; critical infrastructure

## Related identifiers

- `https://github.com/civic-interplay/ai-sovereignties` — is supplement to
- `https://datacentres.civicinterplay.io` — is documented by
