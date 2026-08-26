# Fact-checking guide

*A working protocol for verifying claims in the AI Sovereignties tracker —
written for research assistants, publishable as method. Companion to
[METHODOLOGY.md](METHODOLOGY.md) and worked through in practice in
[DISCLOSURE-AUDIT.md](DISCLOSURE-AUDIT.md).*

This tracker is compiled with AI assistance and verified by humans. Nothing
here should be quoted to a council, a journalist or a minister until a human
has walked the claim back to its source. This guide is how.

## 1. Know what kind of claim you are checking

Different claims fail differently. Identify the type first:

| Type | Example | How it's verified | How it fails |
|---|---|---|---|
| **Positive fact** | "Project Mars's EIS states 510,009 m³/yr" | Open the source document, find the figure | Wrong number, wrong document, marketing mistaken for record |
| **Negative fact** | "The permit contains no MW figure" | Obtain the record, search it yourself | The record was incomplete, redacted, or a second document exists |
| **Attribution** | "PA2403452 is AirTrunk MEL2" | Corporate/land records, register corrections | Address coincidence, shelf companies |
| **Characterisation** | "Consultation was skipped" | The register's own process record | Overstating an exemption as wrongdoing |
| **Corporate claim** | "100% renewable" | Read what is *contracted* vs *certificate-matched* | Taking marketing at face value |

## 2. The source hierarchy

Always cite the highest rung you can reach; never quote a lower rung as if it
were a higher one.

1. **The primary record** — the permit PDF, delegate report, exhibited EIS,
   Gazette notice, titles register, ASIC extract.
2. **The official register entry** — planning.vic.gov.au ministerial register,
   NSW Major Projects portal, PlanningAlerts mirror.
3. **Named-official statements** — ministerial media releases, council minutes,
   quoted officers (e.g. a Deputy Lord Mayor on the record).
4. **Quality trade/local press** — Datacenter Dynamics, The Urban Developer,
   iTnews, local mastheads. Good for leads; verify their sources.
5. **Operator materials** — location pages, sustainability reports, press
   releases. Treat as *claims by an interested party*, not facts.
6. **Directories** (DataCentreMap, PeeringDB, datacenters.com) — location
   leads only; capacities here are frequently stale or aspirational.

## 3. Checking negative claims (the audit's core)

"The record discloses no energy or water data" is checked by **getting the
record and searching it**:

- Download the permit / delegate report PDF from the register entry (the
  Victorian register blocks scripts but works in a browser; PDFs sit on a
  public blob store). Copies of audited PDFs live in `docs/disclosure-audit/`.
- Search the full text for: `MW`, `megawatt`, `load`, `demand`, `kWh`, `PUE`,
  `water`, `litres`, `ML`, `kL`, `cooling`, `evaporative`, `potable`.
- Classify every hit: *operational demand* (what we're looking for) vs
  *stormwater/construction conditions* (not disclosure).
- Record what you did: "searched N pages, terms X/Y/Z, found only stormwater
  conditions at cl. 12–14".

**Caveats to carry honestly:**
- *Redactions.* If the report is redacted, the claim is "not in the **public**
  record" — never "the government doesn't hold the data".
- *"Not locatable" ≠ "doesn't exist".* Say which indexes you searched
  (register, PlanningAlerts, council minutes, Gazette). A council file
  request or FOI can settle it.
- *A negative claim is falsified by one document.* If anyone produces a
  planning document with the figure, the claim dies — check the register
  again for amendments before publishing.

## 4. Checking who is behind an application

Applications are lodged by consultants and shelf companies. Before asserting
an operator identity:

- **ASIC company extract** (~$10) — directors, shareholders, registered
  address of the applicant entity (e.g. EMKC3 Pty Ltd).
- **Land title search** (~$15, LANDATA in Victoria) — the registered
  proprietor and any leases/caveats naming the operator or financier.
- **Register amendments** — "Application to correct planning permit" entries
  can surface the real name post-approval (this is how AirTrunk MEL2 was
  confirmed).
- Until then, write "reported as X" or "a site AirTrunk's materials describe
  as MEL2" — attribution, not assertion.

## 5. Checking corporate energy/water claims

The single most common error is equating **certificate matching** with
**physical supply**. Ask, in order:

1. Is there a **named PPA** (counterparty, MW, start date)? That's
   contracted renewables — cite it.
2. Is it **REC/LGC matching** ("100% renewable matched")? Real, but different
   — the site physically draws the state grid. Say so.
3. Is it **offsets** (Climate Active etc.)? That's carbon accounting, not
   renewable electricity at all.
4. Is it a **target** ("by 2030")? A target is not a status.
5. Does the claim's **scope** cover Australia? (Global and EMEA claims
   routinely don't.)

Water: "closed-loop", "waterless" and "WUE 0.01" are design claims — note
whether they come from an assessment record, an independent report, or the
operator's own marketing, and whether any annual volume is stated.

## 6. Recording a verification in the tracker

Every checked claim gets written back to Notion:

- **Classified by** → `Human-verified` once you have personally reached rung
  1–3 of the hierarchy for the row's load-bearing facts.
- **Confidence** → 0.9+ primary record sighted; 0.7 official register/named
  official; 0.5 press-only; leave/lower if contested.
- **Evidence rung** → the rung you actually reached, 1–6.
- **Verified by** / **Verified date** → your initials and the date, so coverage
  is a query rather than a reading exercise.
- **Notes** → append one line: date, what you checked, how, result — e.g.
  `Verified 2026-08-14 (RA: <initials>): permit PDF searched, no MW figure;
  stormwater conditions only.` Keep the source URL.
- If a claim **fails**, do not silently edit: correct the row, note the
  correction and date, and check whether the same error propagated to
  `docs/DISCLOSURE-AUDIT.md`, the map popup, or published copy.

**Do not do this by hand.** Use the tool, so the rules cannot drift between
people:

```bash
npm run verify -- --queue --tier 1      # what to work on, in priority order
npm run verify -- --status              # coverage across the tracker

npm run verify -- --row "NEXTDC M4" --by SB --rung 2 \
  --evidence "https://planning.vic.gov.au/…" \
  --note "permit PDF searched 34pp; stormwater conditions only" \
  --dry-run                             # preview, then re-run without it
```

It refuses three things on purpose: rung 4–6 cannot mark a row
`Human-verified`; rung 1–3 requires `--evidence`, because a verification
without a URL is an assertion the next person cannot check; and an ambiguous
`--row` lists the candidates rather than guessing.

This records verification at **row** level. Claim-level adversarial
verification — what was put to refutation and what survived — lives in
[VERIFICATION-RECORD.md](VERIFICATION-RECORD.md) and the per-run files in
`disclosure-audit/`. They are complements: one says which claims survived
refutation, the other says which rows a person has stood behind.

## 7. Escalation

- **Claim refuted** → correct everywhere (tracker, docs, site), note the
  correction in the commit message. Corrections are part of the method, not
  an embarrassment; this project holds planning systems to exactly this
  standard.
- **Claim unverifiable** → keep it, labelled as such, with what you tried.
- **New evidence** (FOI return, register amendment, council file) → attach to
  the row, re-run the checks it affects.

## Appendix: quick kit

- Victorian ministerial permits register: planning.vic.gov.au → Planning
  approvals → Ministerial permits register (browser only)
- PlanningAlerts: planningalerts.org.au (searchable mirror of applications)
- NSW Major Projects portal: planningportal.nsw.gov.au/major-projects
  (exhibited EIS documents, submissions)
- Victoria Government Gazette: gazette.vic.gov.au
- ASIC registers: connectonline.asic.gov.au · Victorian titles: landata.vic.gov.au
- This repo: audited PDFs in `docs/disclosure-audit/`, dataset in
  `docs/disclosure-audit/results_audit.json`
