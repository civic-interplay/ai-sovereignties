# Data changelog

*Significant changes to the tracker and published findings, most recent first.
Per-site provenance lives in each Notion row's Notes; this log records the
batch-level changes a reader of the map or docs should know about.*

## 2026-08-10

- **Corrections from adversarial verification** (16 of 22 claims checked; 14
  confirmed against primary documents, 2 refuted and corrected):
  - *130 Cherry Lane, Laverton North removed from the disclosure audit* —
    PA2402783 is AusNet's Altona BESS (100MW/200MWh; MW disclosed, proponent
    named), not a data centre. Tracker row retitled to the actual Cherry Lane
    data-centre application, Stockland's 72-76 Cherry Lane (PA2604458,
    reported ~250MW IT, unverified). Audit headline revised 0/14 → **0/13**.
  - *STACK renewable-claim scope corrected*: covers Americas + EMEA
    portfolios, not "EMEA only". Australian position unchanged (no PPA,
    grid supply).
- **Operator identity confirmed:** permit PA2403452 (85 Sharps Rd,
  Tullamarine; lodged by shelf company EMKC3 Pty Ltd) is AirTrunk MEL2, per
  an "Application to correct planning permit" naming AirTrunk MEL2 Pty Ltd —
  sighted on the ministerial register. The earlier tentative attribution of
  this permit to a NEXTDC M2 expansion was withdrawn.
- **Disclosure audit recorded** (see DISCLOSURE-AUDIT.md): 13 Victorian
  approvals audited — none disclose expected MW, none disclose water demand,
  one describes cooling. `Public notice` set per site (VIC ministerial →
  Exempted; NSW SSD comparators → Exhibited), `Transparency deficit`
  governance flag applied, per-site evidence appended to Notes.
- **Energy/water sweep applied to 57 rows** with sourced evidence notes:
  Energy Source and Water Risk selects populated across the tracker
  (REC-matching vs physical supply distinguished in notes). Map Energy lens
  went from mostly-unknown to 44 grid-mixed / 21 renewable-contracted /
  18 unknown.
- Git branches reconciled: `main` = `retitle2` (production).

## 2026-08-06

- **45 Victorian sites added** from the City of Melbourne consolidated
  data-centre list (June 2026): operating CBD/western colocation sites
  (Equinix ME1–ME5, NEXTDC M1–M3, AirTrunk MEL1, Telstra InfraCo, Vocus and
  others), the Microsoft construction trio, CDC Brooklyn/Laverton, and the
  permitted/announced cohort. Victorian data centres on the live map went
  from ~16 to 59. Rows carry `Date Logged: 2026-08-06`,
  `Classified by: Human` (CoM-curated list, agent-assembled).
- **NEXTDC M4 enriched** with permit chronology (TPMR-2025-27 / PA2504019,
  pre-apps to 2022, CoM referral 17/11/2025); **Vantage Tullamarine
  corrected** Producing → Feasibility (54MW, not built) per the CoM list.
- Ministerial fast-track pathway + governance flags set on the CoM-identified
  ministerial cohort (~10 sites).
