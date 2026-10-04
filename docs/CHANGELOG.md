# Data changelog

*Significant changes to the tracker and published findings, most recent first.
Per-site provenance lives in each Notion row's Notes; this log records the
batch-level changes a reader of the map or docs should know about.*

## 2026-10-04 — Not proceeding: Withdrawn, Refused, Approval revoked

- **Three new `Status` options** for projects that ended before they were
  built: Withdrawn (the developer pulled the application), Refused (the
  consent authority said no), and Approval revoked. The map draws them as a
  faint outline under a new Not proceeding filter, and the glossary defines
  them.
- **The status records what happened, not why.** Opposition stays in
  Community Concern, so "not proceeding while contested" is the Not proceeding
  filter with the Contested overlay on. Stated reasons are cited in each row's
  notes.
- **Two rows moved off the old convention.** Goodman Project Mars (Lane Cove
  West) and GreenSquareDC Hazelmere had a blank status and `[withdrawn]` in
  the title, which drew them as "Stage not recorded". Both are now Withdrawn,
  with the title marker removed and a dated line in their notes.

## 2026-10-03 — human verification recorded

- **35 rows marked Human-verified (Verified by SB, 3 Oct).** SB confirmed the
  rows in a Claude Code session, and the agent recorded the sign-off.
  - Western Downs Digital Park (Dalby). Its notes now open with the
    verification, so no agent demotes it again under the `discover.ts`
    contract.
  - 34 rows from the City of Melbourne consolidated list (June 2026). AWS
    Cobblebank keeps its earlier `audit-2026-08-10` credit alongside SB's.
- **11 City of Melbourne rows held back.** Their own notes still say
  "operational status unverified", or "Is this it?" for NEXTDC Craigieburn.
  Marking them verified would contradict the row. They wait for SB to confirm
  each site exists and operates.
- **Swanbank duplicate merged.** A 30 Sep `[PROPOSED]` row repeated the 26 Aug
  one. Its notes moved into the older row and it left the tracker.

## 2026-09-30 — news sweep, 22–30 September

Every entry in this batch rests on search-result snippets. The session's
network policy blocked page fetches, so no source document was opened. Each
change is tagged `NOT VERIFIED` in the row's Notes, with the URL that would
verify it.

- **Two status changes on the map.**
  - Goodman Project Mars (Lane Cove West) is withdrawn. Goodman asked DPHI on
    28 Sep to stop assessing SSD-82052708, six days after telling the Senate
    inquiry it would decide by year end. Status is cleared and the title marked
    `[withdrawn]`, following the Hazelmere convention.
  - Glendenning Road (SSD-73761707, $2.17bn) is now approved, dated 14 Sep.
    Capacity stays blank: three power figures are reported (202.4 / 235 / 193.6
    MW) under three different definitions.
- **Notes appended, status held.**
  - Firmus Wesley Vale: work stopped by Latrobe Council, and a state call-in
    was requested.
  - Firmus Long Reach: six TASCAT appeals lodged.
  - Firmus Launceston: its own source may call it under construction.
  - Hydro Tasmania: no decision yet.
  - Campbellfield: the EPA objected.
  - NEXTDC M3 expansion: 66 kV poles went up in residential streets.
  - NEXTDC M4: the construction start is unconfirmed, and the permit gives
    150 MW against the 162 MW in the row.
  - Western Downs: the Anthropic lease is subject to FIRB. `2285/2026/MCU` is
    Swanbank's reference, not this project's.
  - The Anthropic MOU row is linked to Western Downs.
  - ASM Dubbo: operator changed to Energy Fuels, acquisition completed 28 Aug.
  - ANSTO: open and running a pilot. Arafura: Strategic Reserve offtake.
    Northern Minerals: the FID deadline is today.
  - The VIC plan may be an election commitment.
  - The NSW LC inquiry report was due today; tabling is unconfirmed.
  - Westech Pilbara has no traceable source and needs a human decision.
- **14 `[PROPOSED]` rows**, with no type and no coordinates, per the
  `discover.ts` contract.
  - Sites: CDC Wagga Wagga (1.4 GW), CDC Beard 2 (ACT), Southern Highlands
    Moss Vale (gas-paired), Northern Concept Swanbank, IREN Bundey (the first
    SA row), Beetaloo Digital Weddell, Energy North Project Ares, Gingerah
    Project Meridien, and Goodman 433 Mount Atkinson Rd.
  - Policy: the federal "Getting it right" consultation (closes 9 Oct), the
    Senate AI and data centres inquiry (reports 16 Nov), the Tasmanian draft
    Expectations (closes 12 Oct), the SA Data Centre Strategy, and the ACT
    framework.
- **ACT option added to `State / Region` (3 Oct).** The code already expected
  it: `STATE_SLUGS` in `src/lib/tracker.ts` routes `/sheets/act`, the news page
  maps `ACT`, and `discover.ts` lists it as a state. But the Notion select never
  had the option, so the ACT sheet was always empty, and any ACT proposal from
  discovery would have failed to write. Microsoft Azure — Canberra Region
  moves from National / Federal to ACT, along with the two ACT `[PROPOSED]`
  rows from this sweep.

## 2026-09-19 — v0.2.1

- **Rejected candidates leave `sites.csv`.** 15 rows the discovery pipeline
  proposed and a human rejected now ship as their own `rejected_candidates.csv`
  with the same columns. `sites.csv` drops from 143 to 128 rows. No published
  statistic changes — the rejected rows never carried an
  `infrastructure_type` and were excluded from every count — but a reuser
  loading `sites.csv` no longer receives 15 rows that are not sites and are
  nowhere explained. They are published rather than deleted because they are
  the only direct measure of how precise automated discovery is; a register
  that published only its successes would report a hit rate with the
  denominator removed.
- **The pre-registration now travels with the deposit.** `PRE-REGISTRATION.md`
  is a companion document from this version. A protocol that lives only in a
  working repository is not on the record.
- **Pre-registration scope corrected before deposit.** The confirmatory run is
  narrowed to Queensland and the Northern Territory. Western Australia, South
  Australia and Tasmania move to the exploratory half alongside Victoria and
  New South Wales, because the repository's history cannot demonstrate that the
  protocol preceded their audit. The amendment is recorded in the document
  itself rather than applied silently. The five-jurisdiction finding is
  unchanged and stands on the documents it read; what it can no longer claim is
  that its terms were fixed before the answers were seen.
- **Citation corrected across the project.** Four places still pointed at
  `10.5281/zenodo.21026430`, the v0.1.0 *version* DOI, including
  `docs/METHODOLOGY.md` — which the export copies into the deposit, so every
  re-export re-shipped a superseded citation inside the published dataset. All
  now cite the concept DOI, `10.5281/zenodo.21026429`.

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
