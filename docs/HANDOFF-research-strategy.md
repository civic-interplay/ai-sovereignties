# Handoff brief — research strategy for influence *and* output

*Written 18 August 2026 for a fresh session. Read this file and you are current;
you do not need the prior conversation.*

## The question on the table

> What does a research strategy look like when you are trying to influence a
> live public governance process **and** produce research output at the same
> time? I seem to do only one or the other.

This brief is not an answer. It sets out the state of play precisely enough
that the new session can argue with it.

## Why this project is a good case to think with

The AI Sovereignties tracker already does both — but by accident rather than
design, which is probably why it feels like one or the other. The two halves
already exist in the repository:

**Influence-side assets**
- `content updates/senate-submission-DRAFT.md` — submission to the Senate
  Environment and Communications References Committee inquiry into AI and data
  centres. Has a "Recommendations" section and, notably, an "Offer" section.
- `content updates/outreach-contacts.md` — a mapped field of actors with
  verified emails: campaigners (Concerned Waterways Alliance as the closest
  organised counterpart), ministers, MPs, councils.
- The live site — map, per-state summary sheets, news feed with RSS.
- A working relationship with City of Melbourne officers, who supplied the
  consolidated Victorian list and have asked for water/energy approval-gap and
  lifecycle views next.

**Output-side assets**
- A Zenodo deposit with a DOI — a frozen, citable snapshot of a living database.
- `docs/METHODOLOGY.md` — a citable method statement.
- `docs/FACT-CHECKING-GUIDE.md` — the working verification protocol.
- `docs/DISCLOSURE-AUDIT.md` — a completed, adversarially verified audit.
- An evidence-grading ladder (CONDITIONED-NUMERIC / CONDITIONED-GENERIC /
  EIS-ONLY / NOT-ACCESSIBLE) invented for this work and reusable beyond it.

The infrastructure for doing both is already built. What is missing is a design
principle that makes one act of work serve both, rather than two acts competing
for the same hours.

## The structural asymmetry to reason from

**Governance has dates. Research does not.**

A consultation closes. A submission deadline passes. An inquiry reports. Those
are hard, external, and indifferent to whether the analysis is finished. A paper
has no such date — which is exactly why it always loses to the thing that does.

This suggests the sequencing question is not "which comes first" but "which one
is allowed to set the calendar." The live dates set it; the research output is
what remains once the window has passed, if the work was structured to leave a
residue.

**Live dates as at 18 Aug 2026**
- Mamre Road submissions close ~28 August 2026 — ten days out.
- NSW energy consultation closes 14 September 2026.
- NSW Data Centre Guidelines are subject to annual review — a recurring window.
- Senate inquiry — submission drafted, not yet lodged.

## Three shapes where one object does both jobs

These are the cases where the tension dissolves rather than being managed.
Each already has a working instance in this project.

**1. The living database with frozen citable versions.**
The tracker is an intervention: it is used, linked, and cited by people arguing
about specific facilities right now. The Zenodo deposit is the same data,
stopped on a date and given a DOI. One compilation effort, two temporalities.
The intervention wants currency; the output wants fixity; versioning gives both
without duplicated work.

**2. The method as the contribution.**
The evidence ladder was built to answer a policy question — is this enforceable?
— but the ladder itself is the transferable contribution. It is what makes the
submission credible *and* it is publishable in its own right. Method work is the
most reliable both-at-once, because rigour is simultaneously the currency of
academic output and the thing that makes an advocacy claim survive contact with
a hostile reader.

**3. The negative and infrastructural finding.**
"Zero occurrences of PUE or WUE in the consent instrument." "Twelve of twelve
checkable Victorian records disclose no MW or water figure." "The only confirmed
volume cap in the country reached the public through FOI, not a register." "A
born-digital permit published as page scans, unreadable to any automated audit."

These are the sweet spot. As policy argument they are devastating and cheap to
state. As research they are novel empirical claims about a visibility regime —
about what the state chooses to make knowable. Neither framing is a translation
of the other; they are the same finding read by two audiences.

## Naming the failure modes precisely

The "one or the other" experience usually has a specific mechanism. Candidates
worth testing against Sarah's actual experience:

- **Sequential translation.** Do the research, then translate it for the
  submission. Fails because the window closes during the research.
- **Retrofitting scholarship.** Write the submission, then try to make a paper
  from it. Fails because the submission was never built to bear that weight — no
  method statement, no reproducibility, sources cited loosely.
- **Divergent evidence bases.** Run both in parallel off different working data.
  They drift, and eventually you cannot cite your own intervention because you
  no longer trust the version it was based on.
- **Register collision.** Believing the two need different voices, and so
  writing everything twice. (Note the existing preference: plain language, no
  jargon, cut editorial intros. That register works for both — the assumption
  that scholarship requires a different one may be the expensive part.)
- **Credit invisibility.** The influence work is real labour that leaves no
  trace an institution counts, so it reads as time stolen from output even when
  it produced the finding.

## Questions for the new session

1. Which failure mode above is actually the operative one? The remedy differs
   sharply depending on the answer.
2. Is there a version of the submission that is *itself* the citable output —
   lodged, public, DOI'd, and written to method-statement standard from the
   start? What would it cost to write it that way?
3. What is the smallest change to the current workflow that leaves a research
   residue automatically, rather than as a separate act of writing?
4. Does the audience for the output need to be an academic journal at all, or is
   the Zenodo-plus-method-statement route sufficient for the credit that matters?
5. What is the honest capacity picture between now and 14 September?

## Where things stand on the underlying research

Relevant because it is the live worked example, and because its state constrains
what can be claimed in any near-term submission.

- **NSW is answered.** Resource-efficiency targets published August 2026 are
  non-statutory guidance from Infrastructure NSW. Absent from the SEPP, the
  EP&A Regulation and the published assessment-requirements template. What gets
  conditioned is the proponent's own EIS, not the guideline's numbers. The
  Marsden Park consent contains zero occurrences of PUE or WUE. The only binding
  instruments made that week narrowed objection rights — the threshold to reach
  the Independent Planning Commission doubled from 50 to 100, and council
  objections no longer trigger referral at all.
- **Victoria is now partly answered.** Permit PA2504032 (Oroya Drive,
  Truganina), issued 6 May 2026 by the Minister for Planning: no numeric
  resource condition; sustainability handled by endorsing the proponent's own
  management plan; water referred out of the permit entirely into a Greater
  Western Water agreement — the instrument class that carries the only confirmed
  numeric cap and is not public.
- **Not yet answered:** Queensland, Northern Territory, Western Australia, South
  Australia, Tasmania. No national claim should be made until these close.

Full detail: `docs/enforcement-research-recovered-2026-08-18.md`.

## Files worth opening

| File | Why |
|---|---|
| `docs/METHODOLOGY.md` | The existing citable method statement — the spine of any output |
| `docs/enforcement-research-recovered-2026-08-18.md` | The live worked example, full evidence |
| `content updates/senate-submission-DRAFT.md` | The influence artifact as it currently stands |
| `content updates/outreach-contacts.md` | The mapped field of actors |
| `docs/ROADMAP.md` | Planned visualisations and open data-model questions |
| `docs/DISCLOSURE-AUDIT.md` | A completed both-at-once piece of work, for reference |

## One caution

The tracker's credibility is its whole value in both registers. Anything that
trades verification standards for timeliness spends the asset that makes the
influence work land at all. The existing conventions — blank means unassessed,
`[PROPOSED]` rows stay invisible until a human reviews them, refuted claims
corrected everywhere — are not bureaucratic overhead. They are what lets the
same object serve both purposes.
