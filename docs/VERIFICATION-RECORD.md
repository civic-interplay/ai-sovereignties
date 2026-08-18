# Verification record — aggregate

*Every claim put through adversarial verification in this project, with its
verdict and the failure mode where it failed. Compiled 18 August 2026 from the
per-run records in [`disclosure-audit/`](disclosure-audit/). Companion to
[METHODOLOGY.md](METHODOLOGY.md) and [FACT-CHECKING-GUIDE.md](FACT-CHECKING-GUIDE.md).*

This page exists because the refutation rate of an agent-assisted research
pipeline is a measurable property of the pipeline, and one almost nobody
publishes. It is reported here for the same reason the project publishes its
compute use: the standard the tracker asks of planning systems applies to the
tracker.

## Headline

**28 claims put to independent refutation. 20 CONFIRMED, 2 PLAUSIBLE, 6 REFUTED.
Refutation rate 21% (6/28).** All six refutations were upheld on independent
re-check and corrected in the dataset and in published documents the same day.

| Run | Date | Claims | CONFIRMED | PLAUSIBLE | REFUTED |
|---|---|---:|---:|---:|---:|
| 1 — disclosure audit (partial; stopped on budget) | 2026-08-10 | 16 | 14 | 0 | 2 |
| 2a — City of Melbourne water reply | 2026-08-17 | 6 | 4 | 1 | 1 |
| 2b — the six claims run 1 never reached | 2026-08-17 | 6 | 2 | 1 | 3 |
| **Total** | | **28** | **20** | **2** | **6** |

Per-run detail: [`verification-2026-08-10-partial.md`](disclosure-audit/verification-2026-08-10-partial.md),
[`verification-2026-08-17.md`](disclosure-audit/verification-2026-08-17.md).

## The result worth reporting

Every one of the six refutations fell into the failure mode that
[FACT-CHECKING-GUIDE.md](FACT-CHECKING-GUIDE.md) §1 predicts for its claim type.
The taxonomy was written before these runs, to sort claims by how they fail. It
sorted them correctly.

| Claim type | Predicted failure mode (§1) | Checked | Refuted | The refutations |
|---|---|---:|---:|---|
| **Positive fact** | wrong number, wrong document, marketing mistaken for record | 11 | 1 | `kinloch-record` — permit date. Issued 17/9/2024; 4/10/2024 was the decision date of a later s71 correction. Content re-verified and unchanged. |
| **Negative fact** | the record was incomplete, redacted, or a second document exists | 6 | 1 | `westernave-record` — the corpus was wrong, not the search. ~26 documents were exhibited, including a Sustainability Management Plan, and have since been removed from the live site. |
| **Attribution** | address coincidence, shelf companies | 4 | 2 | `130 Cherry Lane` — an AusNet BESS, not a data centre; site removed from the audit set. `PA2504040` — an AusNet connection permit serving a different Leakes Road site, not CDC. |
| **Characterisation** | overstating an exemption as wrongdoing | 3 | 2 | `nsw-exhibition` — the DFP removes third-party VCAT review but does not itself exempt public notice; the audited exemptions arose from other scheme provisions. `cdclaverton-record` — a Wyndham council application (WYP14790/24), not DFP. |
| **Corporate claim** | taking marketing at face value | 6 | 1 | `STACK renewables` — the claim covers Americas + EMEA, not EMEA alone. |

Three things follow, and they are the argument for the architecture rather than
against it:

1. **Deterministic checks held.** No negative finding failed because the search
   missed something. The one negative-fact refutation was a corpus failure —
   documents pulled from the public site after consultation — which is itself a
   finding about record impermanence, not an error in method.
2. **Judgment claims are where agents fail.** Characterisation and attribution
   carry four of six refutations off a third of the claims. That is the class
   where an agent reads a legal instrument and reaches for the nearest familiar
   mechanism.
3. **Severity varies and is worth recording.** Of six refutations, two were
   material (`westernave`, `130 Cherry Lane`), three partial, one date-only.
   A flat rate hides this.

## Known limits of this record

- **Correlated error.** Runs 1 and 2 used claimant and skeptic agents from the
  same model family (Anthropic Claude). They are independent instances, not
  independent epistemics: shared training data implies shared blind spots, and
  the true error rate is a floor, not an estimate. Cross-family verification of
  load-bearing claims is a committed protocol step from
  [PRE-REGISTRATION.md](PRE-REGISTRATION.md) onward; claims verified before that
  point carry this caveat.
- **`vic-zero-water` is PLAUSIBLE, not CONFIRMED.** 6 of 13 records were
  independently re-checked; the full negative rests on the audit dataset.
  Nothing found contradicts it. The safe published form is the bounded one:
  *of the twelve records that remain publicly checkable, none discloses a
  megawatt or water figure.*
- **`emkc3-mel2` is PLAUSIBLE.** The register 403-blocks scripts, so the
  "Application to correct planning permit" naming AirTrunk MEL2 could not be
  independently re-sighted. Open task: browser re-sight and screenshot.
- **No claim→run provenance yet.** This record links claims to runs by hand.
  There is no machine link from a dataset row to the run, model and date that
  produced its classification. Until there is, reproducibility is at the level
  of the artifact (the PDFs in `disclosure-audit/`), not the pipeline.

## Open worklist

1. **Westmeadows.** Retrieve the archived Sustainability Management Plan and
   Stormwater Strategy from the Wayback Machine (outage on 2026-08-17) and
   search them. Then either restore the row to "no disclosure" or record what it
   discloses. Archived URL is in `disclosure-audit/results_audit.json`.
2. **MEL2.** Human browser re-sight of the permit-correction entry for
   PA2403452, screenshot into `disclosure-audit/`. Optionally an ASIC extract on
   EMKC3 Pty Ltd (~$10).
3. **Record impermanence.** Write up exhibited consultation documents being
   removed from the live Victorian planning site post-decision as a transparency
   deficit in its own right.

## How to cite this

Verification records are part of the method, not an appendix to it. Cite the
aggregate for the rate, the per-run file for a specific claim.
