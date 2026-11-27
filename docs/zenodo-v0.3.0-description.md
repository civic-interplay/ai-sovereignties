# Zenodo v0.3.0 — fields to paste

*Not part of the deposit. This is the copy for the Zenodo "New version" form.
The description prose is SB's to write; below are the facts it should carry.*

---

## Resource type
`Dataset`

## Title
Data Centres Transparency Project: Mapping AI Sovereignties through Civic AI (Australian view)

## Version
`v0.3.0`

## Publication date
`2026-11-27` (change if published on another day, and match `CITATION.cff`)

## Licence
`Creative Commons Attribution 4.0 International`

## Authors
Barns, Sarah — RMIT University — ORCID 0000-0002-0087-7166

---

## Files to upload

Everything in `zenodo/` (regenerated 27 Nov 2026 by `pipeline/export-zenodo.ts`):

- `sites.csv` — 193 rows (23 carry the `[PROPOSED]` prefix)
- `rejected_candidates.csv` — 19 rows
- `contestation_items.csv` — 120 rows
- `README.md`, `data-dictionary.md`
- `METHODOLOGY.md`, `FACT-CHECKING-GUIDE.md`, `VERIFICATION-RECORD.md`,
  `DISCLOSURE-AUDIT.md`, `CHANGELOG.md`, `PRE-REGISTRATION.md`

Remove the v0.2.0 files Zenodo carries over into the new-version draft, then
upload these.

## Figures for the description (v0.2.0 figure → v0.3.0)

- Tracked sites and projects: 126 → 193 rows in `sites.csv`
- Contestation items: 32 → 120
- `classified_by`: Human-verified 1 → 51; Human 45 → 41; Agent 21 → 41;
  blank 59 → 60
- Adversarial verification: unchanged at 28 claims (20 confirmed, 2 plausible,
  6 refuted; `VERIFICATION-RECORD.md`)

## Do not carry over from the v0.2.0 description

- "Rows classified Agent are unreviewed and are excluded from published
  figures." The code does not do this: the sheets and trends count data-centre
  rows whatever their `classified_by`. Either drop the sentence or say that
  Agent rows are counted and labelled.
- "Changes since v0.1.0" — replace with changes since v0.2.0 (below).

## Changes since v0.2.0 (facts for SB to write up)

- Title changed to match this record.
- `[REJECTED]` rows moved out of `sites.csv` into `rejected_candidates.csv`
  (v0.2.1, exported 19 Sep, not deposited).
- New `Status` options: Withdrawn, Refused, Approval revoked (4 Oct).
- 35 rows marked Human-verified on 3 Oct; 51 in this version.
- ACT, WA, SA and Tasmanian sites added (15-16 Nov).
- NSW checked against the Major Projects portal (27 Nov): 5 sites added to the
  map, 3 new rows, 14 pins moved, capacity and status corrections; three
  region rows (Amazon $20B, Google Cloud, AWS Sydney Region) kept without
  coordinates.
- Full list: `CHANGELOG.md` (note its gap from 4 Oct to 26 Nov, covered by
  `docs/COMPUTE-LOG.md`).

---

## Keywords

data centres; artificial intelligence; infrastructure; Australia; planning;
water; energy; sovereignty; open data; contestation; critical infrastructure

## Related identifiers

- `https://github.com/civic-interplay/ai-sovereignties` — is supplement to
- `https://datacentres.civicinterplay.io` — is documented by
