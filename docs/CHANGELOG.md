# Data changelog

*Significant changes to the tracker and published findings, most recent first.
Per-site provenance lives in each Notion row's Notes; this log records the
batch-level changes a reader of the map or docs should know about.*

## 2026-08-18

- **Governance-flag vocabulary reduced 11 → 3.** Flags that restated the
  statutory route (Ministerial fast-track, NSW State Significant Development,
  Bypassed local council) were retired once Planning pathway carried that
  information. Sovereign compute claim, Social licence contested, Open data
  commitment and Worker transition plan also retired. Surviving vocabulary:
  Transparency deficit, Community consultation lacking, FIRB scrutiny.
- **First Nations engagement flag removed.** Its six uses were four WA, one NT,
  one VIC, against 62 Victorian and 46 NSW rows — a record of where an analyst
  looked, not where engagement is unclear. Because a flag is silent both when a
  row passes and when nobody checked, an empty filter result could read as "no
  Traditional Owner concerns here". Replacement, when done, is the statutory
  record (Cultural Heritage Management Plan status, assessed with the Registered
  Aboriginal Party), not our judgement. See METHODOLOGY.md.
- **Planning pathway vocabulary made state-neutral.** "State significant
  development" is NSW statute and was being applied to Western Australian rows
  that have no such pathway; it is now **State assessed**, covering NSW SSD, WA's
  Part 17 pathway and equivalents, with the local instrument named per row.
  Three WA rows corrected: Hazelmere → Local council (assessed as
  warehouse/storage), Mt Weld → Not applicable (a mine, under the Mining Act and
  EP Act Part IV), Westech Pilbara cleared as undetermined.
- **"State fast-tracked" re-derived and redefined.** The figure came from two
  governance flags and would have silently reported zero once they were retired;
  it now reads Planning pathway (36 → 41 rows, none lost). The published
  definition said "not subject to normal public consultation" — wrong for NSW
  SSD, which is exhibited. It now says the State, not the council, is the consent
  authority, and points to Public notice for exhibition.
- **New field: Resource conditions.** Whether the legal instrument of approval
  imposes any obligation on energy or water use — Numeric / Generic via endorsed
  document / Claim only — unconditioned / Not accessible. Graded only from the
  instrument itself; blank means unread. Two rows graded so far.
- **Enforcement research, five jurisdictions.** No instrument of approval found
  in NSW, VIC, TAS, WA or SA imposing a numeric energy or water condition.
  Marsden Park (SSD-70889211): zero occurrences of PUE or WUE. Oroya Drive
  Truganina (PA2504032, Minister for Planning): sustainability handled by
  endorsing the proponent's own plan; water referred out to a Greater Western
  Water agreement. Tasmania: cl 6.11.2 gives councils no head of power to impose
  such a condition at all. WA on the record: "specific water take limits have not
  been formally set for the data centre industry as a distinct customer class"
  (Tabled Paper 1137, 5 May 2026). QLD and NT not yet closed.

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
