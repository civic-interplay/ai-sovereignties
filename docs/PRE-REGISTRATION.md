# Pre-registration — disclosure audit, remaining jurisdictions

*Written and frozen 18 August 2026, before any Queensland, Northern Territory,
Western Australian, South Australian or Tasmanian record has been audited.
Deposited for citation so that the protocol is on the record ahead of the
results.*

**Status: FROZEN — do not edit after deposit.** Departures from this protocol
get recorded in the results, not backported here. If the protocol needs to
change, that is a version 2 with its own date and its own reason.

## Why pre-register

Negative findings get most of their force from being pre-committed. "We searched
these records for these terms and found nothing" is a weak claim if the terms
and the record set were chosen after seeing what was there, and a strong one if
they were fixed in advance and published.

Victoria and New South Wales were audited before this document existed. That
work is **exploratory**: it found the pattern and produced the protocol. This
pre-registration covers the **confirmatory** run across the five remaining
jurisdictions, whose answers are not known at the time of writing. The
distinction is stated here rather than blurred, and should be stated in anything
published from either half.

## Question

In each remaining Australian jurisdiction, does the public planning record for
an approved or lodged data centre disclose the facility's expected electrical
load, its expected water demand, and its cooling method?

## Expectation, stated in advance

Based on Victoria and New South Wales, the expectation is a **pathway effect,
not a state effect**: disclosure tracks whether the approval pathway requires
public exhibition of an impact statement, not which jurisdiction it sits in.
Where a jurisdiction exhibits an EIS (as NSW SSD does), numbers are expected in
the record; where approval runs through a facilitated or delegated pathway
without exhibition (as Victoria's does), they are not.

**What would falsify it:** a jurisdiction whose non-exhibited pathway
nonetheless conditions numeric resource limits in the permit, or an exhibiting
jurisdiction whose EIS omits load and water. Either result gets published.

## Scope

- **Jurisdictions:** Queensland, Northern Territory, Western Australia, South
  Australia, Tasmania.
- **Sites:** every data centre in the tracker in those jurisdictions at the time
  the sweep starts, plus any found by the search below. The site list is frozen
  and published at the start of the sweep, before any record is searched.
- **Record types:** planning permit or development approval; delegate, officer
  or assessment report; exhibited impact statement where one exists; gazette or
  register entry.
- **Excluded:** operator marketing, investment-promotion pages and press. These
  are recorded separately as the announcement track (§ "Two-track lifecycle" in
  the Senate submission), never as disclosure.

## Search frame

Sites are found by searching, in this order, and the indexes searched are
recorded per site whether or not they return anything:

1. The jurisdiction's planning register or development-application portal.
2. PlanningAlerts.
3. The relevant council's application index.
4. The jurisdiction's government gazette.

"Not locatable" is recorded as exactly that, naming the indexes searched. It is
never reported as "no record exists".

## The check

Per [FACT-CHECKING-GUIDE.md](FACT-CHECKING-GUIDE.md) §3, unchanged:

1. Obtain the record as a document. Store a copy in `docs/disclosure-audit/`
   with its retrieval date and source URL.
2. Extract full text deterministically (`pdftotext`, or equivalent for other
   formats). Page-scan-only documents are recorded as **NOT-ACCESSIBLE** — a
   result, not a gap.
3. Search the full text for this term list, frozen here:

   `MW` · `megawatt` · `load` · `demand` · `kWh` · `MWh` · `PUE` · `WUE` ·
   `water` · `litres` · `ML` · `kL` · `m3` / `m³` · `cooling` · `evaporative` ·
   `potable` · `recycled`

4. Classify every hit as **operational demand** (what counts as disclosure) or
   **construction / stormwater / drainage / fire-service** (which does not).
5. Record the count of hits per term, the classification of each, and the page
   references. The count is reported even when it is zero — especially when it
   is zero.
6. Grade the record on the existing evidence ladder: CONDITIONED-NUMERIC /
   CONDITIONED-GENERIC / EIS-ONLY / NOT-ACCESSIBLE.

Steps 2–5 are deterministic over a fixed artifact. Anyone with the stored PDF
can re-run them and must get the same answer. Agents orchestrate this work; they
do not adjudicate it.

## Verification protocol

Every claim produced by the sweep goes to adversarial verification before
publication, per [METHODOLOGY.md](METHODOLOGY.md), with two changes committed
here:

- **Cross-family skeptic.** Load-bearing claims — anything that would appear as
  a numbered claim in a submission, and every jurisdiction-level negative — get
  at least one refutation pass from a model outside the family that produced the
  claim. Claimant and skeptic model are both recorded per claim. This addresses
  the correlated-error limit noted in
  [VERIFICATION-RECORD.md](VERIFICATION-RECORD.md): same-family skeptics share
  training data and therefore share blind spots, so a same-family refutation rate
  is a floor rather than an estimate.
- **Human gate on load-bearing claims.** No numbered claim in any submission or
  publication rests on agent-only classification. `Classified by` must read
  `Human-verified`, per FACT-CHECKING-GUIDE §6, and the claim must have been
  walked to rung 1–3 of the source hierarchy by a person.

Claim types are recorded using the FACT-CHECKING-GUIDE §1 taxonomy at the time
the claim is made, not after it is verified. This is what makes the "does the
taxonomy predict the failure mode" result testable rather than retrospective.

## Stopping rule

The sweep ends when every site on the frozen list has a recorded outcome in one
of: audited, NOT-ACCESSIBLE, or not-locatable-with-indexes-named. It does not
end when a pattern looks established.

## What gets published regardless of result

- The frozen site list and the per-site outcome table, including every
  not-locatable and NOT-ACCESSIBLE row.
- Per-record term-hit counts, including zeros.
- The refutation rate for this sweep, by claim type, appended to
  [VERIFICATION-RECORD.md](VERIFICATION-RECORD.md) — including if it is worse
  than the 21% recorded for the exploratory runs.
- Any result that falsifies the stated expectation, given the same prominence as
  one that confirms it.

## Bounded claims only

Findings are reported per jurisdiction and per record, never aggregated into a
national claim beyond the audited set. "Twelve of twelve checkable Victorian
records disclose no megawatt or water figure" survives the arrival of Queensland
data; a national synthesis would have to be withdrawn and rewritten. Bounded
negative findings compose. This is a deliberate design property, not caution.

## Deposit

To be deposited with a DOI before the first record in scope is searched. Cite as
the protocol; cite the results separately when they exist.
