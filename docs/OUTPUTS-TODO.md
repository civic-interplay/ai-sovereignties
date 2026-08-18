# Outputs — to-do

*Written 18 August 2026. The work list behind
[HANDOFF-research-strategy.md](HANDOFF-research-strategy.md): four outputs, what
each needs, and what has to happen before the remaining jurisdictions are
audited.*

The organising claim: nothing here is a new research programme. Every output
below is a **closure act** on work that already exists. The project's problem has
not been producing enough; it has been that both tracks run to 90% and neither
gets finished, so neither counts.

Ordering rule: the pre-registration gates the jurisdiction sweep, and the
submission is gated by an external date. Everything else can slip.

---

## 0 — Gate: pre-register before auditing another jurisdiction (this week)

Once a Queensland record is opened, the protocol can no longer be said to have
been fixed in advance. This is the only genuinely time-ordered item on the list.

- [ ] Read [PRE-REGISTRATION.md](PRE-REGISTRATION.md) and correct anything you
      would not defend in review. Written from the existing protocol — the
      substance is yours, the framing is not yet checked by you.
- [ ] Decide the cross-family skeptic model and name it in the protocol
      (currently "a model outside the family that produced the claim").
- [ ] Freeze and publish the QLD/NT/WA/SA/TAS **site list** before any record is
      searched. Currently the tracker holds 3 WA and 1 QLD data-centre rows, so
      most of the list will come from the search frame, not the tracker.
- [ ] Deposit `PRE-REGISTRATION.md` + `VERIFICATION-RECORD.md` to Zenodo, own
      DOI, before the first search.
- [ ] Only then: run the sweep.

**Why it's worth ten days of delay:** it converts "five jurisdictions unfinished"
from the reason the paper isn't ready into the design of the study.

---

## A — Senate submission: lodged and citable (by ~28 August)

The submission is already written to method-statement standard. It is the
both-at-once object the handoff brief was looking for, and it is four small fixes
from being finished.

- [ ] **Confirm the inquiry's closing date.** The handoff brief records the
      submission as drafted, not lodged, with no deadline noted. Everything below
      is worthless if the window has closed — check this first.
- [ ] Fix the affiliation. Draft says `[Civic Interplay / Sitelines Media]`;
      `zenodo/README.md` says "Sarah Barns (RMIT University)". Pick one and make
      it consistent across submission, deposit and site. This is also the
      answer to "does the output need to be a journal" — if RMIT is on it,
      institutional credit is in play.
- [ ] Fix the verification citation in the closing footnote. It cites
      `verification-2026-08-10-partial.md` ("14 of 16"). The completed record is
      `verification-2026-08-17.md`, and the aggregate is now
      [VERIFICATION-RECORD.md](VERIFICATION-RECORD.md) — **28 claims, 20
      confirmed, 6 refuted, all corrections applied**. Citing the partial run
      understates the work and invites a reader to wonder why.
- [ ] Check every numbered claim in §2 against the human-verified gate. Nothing
      numbered should rest on `classified_by = Agent`.
- [ ] Confirm §2.1 uses the bounded form — *"of the twelve records that remain
      publicly checkable"* — since `vic-zero-water` is graded PLAUSIBLE, not
      CONFIRMED (6 of 13 independently re-checked).
- [ ] Lodge.
- [ ] Deposit the lodged text with its own DOI. This is the step that makes the
      influence act an output; skipping it is the whole failure mode.

---

## B — Zenodo deposit: fix before shipping

Audited against its own README on 18 August. **Every published statistic is
correct** — 89 data-centre rows, 37 other, 94 with coordinates, 33 with a
capacity figure, 11 items below 0.6 confidence, and the jurisdiction table all
reconcile exactly against the CSVs. Data dictionary covers every column. No
duplicate IDs, no orphaned joins, no coordinates outside Australia.

One blocking defect and three worth fixing.

- [ ] **Blocking: 16 `[REJECTED]` rows ship unexplained.** `sites.csv` contains
      16 rows named `[REJECTED] Data centre DA — …` (Kemps Creek, Marsden Park,
      St Marys, Wetherill Park, and one merged NEXTDC S5 duplicate). They are
      pipeline discoveries triaged out — `classified_by = Agent`, confidence
      0.35, reasoning in `notes`, and two are marked "REJECT *leaning*", i.e.
      not settled. They carry blank `infrastructure_type`, so they do **not**
      corrupt any published statistic. But the README describes the file as "one
      row per tracked site or project" and explains only the single `[PROPOSED]`
      row, so a reuser meets 16 unexplained rows.

      Keep them — they are the pipeline's false-positive log and directly
      useful to output D — but say so: a README line, and a `status` value that
      makes them filterable rather than leaving it blank.
- [ ] **Fix the "37 other infrastructure rows" line.** Of those 37, 16 are
      rejected discoveries and 1 is `[PROPOSED]`; only ~20 are actual other
      infrastructure (7 policy/regulation, 5 mine/extraction, 2 processing,
      1 geopolitical signal, 5 untyped-but-real). The number is right, the
      description isn't.
- [ ] **Add a blank-confidence caveat.** 40 of 89 data-centre rows have blank
      `confidence`. Per project convention blank means unassessed — but a
      reuser who filters on confidence silently drops nearly half the rows.
      One line in the caveats section.
- [ ] **`zenodo/` is gitignored** (`.gitignore:62`), so the deposit's contents
      are not version-controlled. That sits badly with a reproducibility claim
      and means the 18 August snapshot exists only on disk. Either track it or
      state in the README that the deposit itself is the version record.
- [ ] Confirm whether the 18 August snapshot has actually been **deposited**, or
      only prepared locally. I can't tell from the repo.

---

## C — Data descriptor: the dataset peer-reviewed (Sept–Oct)

The most literal answer to "can this be reconstituted as peer reviewed". A data
descriptor reviews provenance, reusability and method rather than an argument,
and `METHODOLOGY.md` + the deposit is most of one already.

- [ ] Pick the venue. Yours to choose — the shortlist question is whether you
      want a data-journal descriptor or a methods venue in your own field.
- [ ] Assemble from existing parts: METHODOLOGY.md (method), zenodo README
      (structure and caveats), data-dictionary.md (schema),
      VERIFICATION-RECORD.md (quality), COMPUTE.md (reflexive disclosure).
- [ ] Write the two sections that don't exist yet: technical validation, and
      reuse potential.
- [ ] Add `docs/citations.ris` as the source bibliography (see F).
- [ ] Do **after** the Zenodo fixes in B — the descriptor cites a specific
      version.

---

## D — Methods paper: the architecture and its refutation rate (Oct–Dec)

The contribution with the longest shelf life, and the one nobody else can write
without having run the thing on real contestable material.

The finding, already in hand: **28 claims, 6 refuted (21%), and every refutation
fell into the failure mode the claim-type taxonomy predicted for it in advance.**
Deterministic checks held; judgment claims carried four of six refutations off a
third of the claims.

- [ ] Sign off (or correct) the claim-type classification in
      VERIFICATION-RECORD.md. I assigned types retrospectively; you wrote the
      taxonomy, and if you disagree with an assignment the headline result
      changes.
- [ ] **Record claim type at claim time, not after.** This is what makes the
      prediction result prospective rather than a retrospective fit — and it is
      the single change that most strengthens the paper. Needed before the
      jurisdiction sweep, so it belongs with item 0.
- [ ] **Cross-family verification.** Committed in the pre-registration; also
      worth a retro pass on the six or seven claims carrying the submission, so
      the correlated-error caveat can be narrowed rather than just declared.
- [ ] **Claim→run provenance.** No machine link exists from a dataset row to the
      run, model and date that produced its classification. `compute-log.jsonl`
      has the runs; rows have `classified_by` but not *which* run. Closing this
      is the difference between reproducible-at-the-artifact and
      reproducible-at-the-pipeline. Real work — schedule it, don't squeeze it.
- [ ] Clear the two open verification tasks: Westmeadows archived Sustainability
      Management Plan via Wayback, and the MEL2 permit-correction browser
      re-sight.
- [ ] Frame around the narrow reflexivity claim, not the elegant one: *a research
      method that meets the disclosure standard it demands of its object, and
      reports where it fails to.* Checkable in `COMPUTE.md`; the refusal to
      state a fabricated energy figure is the worked example.

---

## E — The planning argument (timing open)

The empirical finding about the visibility regime — the one that is least about
AI and most about what the state chooses to make knowable. Blocked on the
jurisdiction sweep if it wants national scope; publishable now if bounded to
Victoria and New South Wales.

- [ ] Decide: bounded VIC+NSW now, or wait for the sweep. Bounded negative
      findings compose, so publishing now costs nothing later.
- [ ] Candidate framing already surfaced and not yet written up: **record
      impermanence** — exhibited consultation documents removed from the live
      Victorian planning site after decision, as a transparency deficit in its
      own right.
- [ ] Second candidate, from memory rather than the repo: the gap between
      announced investment figures and statutory CIV as a finding.

---

## F — Bibliography (done, needs a human pass)

`docs/citations.ris` — 262 unique sources harvested from the tracker and the
research documents, generated by `docs/gen-citations.py`, importable into
Zotero/EndNote/Mendeley. Each record carries its FACT-CHECKING-GUIDE §2 source
rung as a keyword, so the bibliography inherits the project's own evidence
weighting.

| | |
|---|---:|
| Records | 262 |
| Rung 1 — primary record | 32 |
| Rung 3 — named-official statement | 65 |
| Rung 4 — trade or local press | 47 |
| Rung 5 — operator materials | 26 |
| Rung 6 — directory (leads only) | 27 |
| Unassigned — needs classifying | 65 |

- [ ] **236 of 262 titles are derived** from the tracker row or the URL slug, not
      the publisher's own headline. Every one is flagged in its `N1` note. They
      are leads; correct before quoting. Fastest fix is to import to Zotero and
      let it re-fetch metadata by URL.
- [ ] Classify the 65 unassigned-rung records — mostly domains not yet in the
      rung map in `gen-citations.py`.
- [ ] Re-run `python3 docs/gen-citations.py` after the jurisdiction sweep.

---

## What I'd do in what order

1. Confirm the Senate closing date. Everything in A depends on it and nothing
   else does.
2. Ship A. It is days of work, it is externally dated, and it closes both tracks
   at once.
3. Fix B, deposit, then do item 0 and start the sweep.
4. C and D through spring; E when the sweep lands.
