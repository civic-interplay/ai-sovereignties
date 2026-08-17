# Adversarial verification — 2026-08-17

Two runs, completing the programme the 2026-08-10 partial run left open.

## Run 1 — claims in the City of Melbourne water reply (6 claims)

**4 CONFIRMED, 1 PLAUSIBLE, 1 REFUTED** (independently re-checked; the
refutation was upheld by a second skeptic and is corrected in
`DISCLOSURE-AUDIT.md`).

| id | verdict | evidence reached |
|---|---|---|
| `vic-zero-water` | PLAUSIBLE | 6 of 13 records independently re-checked (4 local PDFs + Gazette S697 + PlanningAlerts 3206534): none disclose water demand; only Kinloch describes cooling, no volume. The other 7 register records are browser-blocked or not locatable, so the full negative rests on the audit dataset — nothing found contradicts it. |
| `four-pdfs-stormwater` | CONFIRMED | All four PDFs re-extracted with pdftotext. No operational water-demand figure in any; the AWS Cobblebank permit's 29 "water" occurrences are all stormwater / drainage / waste-water / fire-water-retention conditions. |
| `mars-water` | CONFIRMED | Exhibited SSD-82052708 document downloaded from the NSW portal (~1,405 kL/day average ≈ 513 ML/yr, consistent with 510,009 m³/yr); In the Cove quotes the EIS verbatim (510,009 m³/yr drinking water, PUE 1.35). Exhibition and submissions window (closed 28 Apr 2026) confirmed. |
| `mamre-water` | CONFIRMED | NSW portal shows SSD-92743706 EIS on exhibition; ACS Information Age, reporting on the EIS, states 22.4 ML/yr water and 1.2 GW capacity. |
| `nsw-exhibition` | **REFUTED (VIC half)** | NSW half confirmed (EP&A Act Sch 1: min 28-day EIS exhibition before determination). VIC half wrong on mechanism: the DFP (cl 53.22) removes third-party VCAT review but does not itself exempt public notice; notice exemptions on audited approvals arose from other scheme provisions (e.g. UGZ) or case-by-case decisions. Corrected in `DISCLOSURE-AUDIT.md` ("The skipped step" section). |
| `pools-conversion` | CONFIRMED | 510,009 / 2,500 = 204.0; ~2,500 m³ is the World Aquatics standard pool and matches the convention in independent reporting (ACS: 22.4 ML ≈ 9 pools). |

## Run 2 — the six claims the 2026-08-10 run never reached

**2 CONFIRMED, 1 PLAUSIBLE, 3 REFUTED** (all three refutations upheld on
independent recheck; corrections applied to `results_audit.json` and
`DISCLOSURE-AUDIT.md` the same day).

| id | verdict | outcome |
|---|---|---|
| `corio-record` | CONFIRMED | Register entry found: **PA2503895**, Next DC, decision Permit 24/10/2025, "Statutory Days: 28" printed in the officer report. Redacted officer report downloaded: zero MW mentions, no water/cooling; acoustic EIA and SMP listed but unpublished. Council objection confirmed in press. Dataset enriched with the register ref/URL. |
| `kinloch-record` | REFUTED (date only) | Permit was **issued 17 September 2024** — 4/10/2024 was the decision date of a subsequent s71 permit-correction (amendment PA2403014-1 followed 20/8/2025). Every content detail re-verified: register delegate report MD5-identical to the local PDF; no MW figure; free cooling + Direct Evaporative Cooling above 28.4°C; no annual water volume. Date corrected in dataset. |
| `westernave-record` | REFUTED (materially) | The consultation page did **not** exhibit "only a traffic report": Wayback CDX lists ~26 exhibited PDFs incl. a **Sustainability Management Plan (Datacentre)**, Waste Management Plan, Environmental Summary Report and Stormwater Management Strategy — **all since removed from the live site (403/404)**. Whether any disclosed MW/water is unverified (Wayback replay down during both checks). Row downgraded to *unknown*; headline tally now carries a caveat. **Open task: retrieve and search the archived SMP when Wayback is back.** |
| `cdclaverton-record` | REFUTED (partially) | Generic-record and no-MW findings stand (PlanningAlerts 3206534 verified verbatim), but two errors: the application is a **Wyndham council application (WYP14790/24)**, not DFP; and **PA2504040 is not CDC-related** — that AusNet connection permit serves the anonymised "PAC1 Leakes Road Data Centre" at 114-146 Leakes Rd Truganina (a different site). Both corrected in dataset. |
| `emkc3-mel2` | PLAUSIBLE | Register snippets confirm PA2403452 applicant EMKC3 Pty Ltd, DFP, permit 28/3/2025, later entry PA2403452-1 decided 26/6/2026, no MW in description. The "Application to correct planning permit" naming AirTrunk MEL2 Pty Ltd could **not** be independently re-sighted (register 403-blocks scripts). **Open task: re-sight in a browser and screenshot into this folder; optionally ASIC extract on EMKC3 Pty Ltd (~$10).** |
| `norecord-mel12-stack` | CONFIRMED | Independent searches (PlanningAlerts, ministerial register via search index, council indexes) found no data-centre planning record for MEL12 Deer Park or STACK MEL02 Truganina; capacity figures are marketing/media only. |

## Open worklist after this run

1. Westmeadows: pull the archived Sustainability Management Plan + Stormwater
   Strategy from the Wayback Machine (outage on 2026-08-17) and search for
   MW/water; then either restore the row to "no disclosure" or record what it
   discloses. Archived URL is in `results_audit.json`.
2. MEL2: human browser re-sight of the "Application to correct planning
   permit" on the register entry for PA2403452 (screenshot into this folder).
3. New finding to consider writing up: exhibited consultation documents being
   **removed from the live Victorian planning site** post-decision — record
   impermanence as its own transparency deficit.
