# Coding rules for the QLD/NT sweep

**Decided 19 September 2026, before any hit was classified.** Recorded here
rather than backported into `PRE-REGISTRATION.md`, which is frozen: the protocol
says departures and interpretations are recorded in the results, not folded into
the instrument.

These are not changes to the question. They are answers to two ambiguities in
it that the first confirmatory document exposed, settled before the coding
started so the coding could not settle them by drift.

---

## Rule 1 — Connection capacity and energy consumption are separate items

**Decision: record both, graded independently.**

The pre-registered question asks whether the record discloses "the facility's
expected electrical load". The Western Downs Infrastructure Services Report
showed that phrase holds two different quantities:

| | What it states | Dalby |
| --- | --- | --- |
| **Connection capacity** | how much the grid must be able to supply | 540 MVA per building, ~2,160 MVA campus |
| **Energy consumption** | how much the facility will actually draw | *nothing* |

A connection size is the diameter of the pipe. It is not the flow. And because
the document states **no PUE, no WUE, no kWh and no MWh** across 113 pages,
consumption cannot be derived from capacity either — there is no efficiency
figure to multiply by, and no load factor.

Collapsing the two would force a single verdict that is wrong whichever way it
falls. "Discloses its electrical load" implies the campus told the public what
it will consume, which it did not. "Discloses no electrical load" implies the
record is silent on electricity, which is plainly false across 75 lines of
MVA and kV.

So the register carries two items where it previously carried one:

- `Connection capacity (MVA/MW)` — Dalby: **Disclosed — numeric**
- `Energy consumption (kWh/MWh/yr)` — Dalby: **Not found**
- `PUE` — Dalby: **Not found**

This is the per-item Disclosure schema in `REGISTER.md` doing the work it was
designed for: a grade per item, not a verdict per document.

**Consequence for the headline claim.** It becomes two claims, and the sharper
of them survives: a $32bn campus on an impact-assessable pathway, publicly
notified, with a 113-page engineering report, **states how large its grid
connection must be and never states how much electricity it will use.** That is
a narrower claim than "does not disclose", and much harder to rebut.

---

## Rule 2 — Operational water only, per §3 as written

**Decision: keep the existing rule. Construction-phase water is not disclosure.**

`FACT-CHECKING-GUIDE` §3 classifies hits as *operational demand* (disclosure)
against *construction / stormwater / drainage / fire-service* (not). That rule
is kept unchanged, so Queensland is coded the same way Victoria was.

It has a visible cost here and the cost is stated rather than hidden. At Dalby
the excluded construction figures are far larger than the retained operational
one:

| Phase | Figure | Coded |
| --- | --- | --- |
| Construction supply | 322 kL/day (270 potable + 52 non-potable), ~117 ML/yr | excluded |
| Construction dust suppression | ~200 kL/day | excluded |
| Commissioning, one-off per building | 26.9 ML | excluded |
| **Operational** | **16.5 kL/day** | **Disclosed — numeric** |

So the audit records this site as disclosing 16.5 kL/day while the record
discusses water demand an order of magnitude larger. **Any published figure
must say so.** The comparison is legitimate — operational demand is what a
facility imposes for decades, construction demand is temporary — but a reader
who saw only "16.5 kL/day disclosed" would not know that ~522 kL/day was also
on the record and deliberately set aside.

The construction figures are therefore **recorded in the Disclosure notes** even
though they do not count toward the grade. Excluded is not the same as unseen.

**Flagged for a possible v3, not acted on now.** §3's binary was written against
Victorian permits, where "water" almost always meant drainage. A 113-page
infrastructure report is a different genre and the binary fits it less well.
Changing it now would mean re-coding Victoria, so it waits — but it is on the
record as a known limitation rather than discovered later by a critic.

---

## What these rules do not decide

Neither rule says anything about **enforceability**. Dalby's application is
still under assessment: there is no instrument of approval, so nothing here is
conditioned, and `Resource conditions` stays blank rather than being graded from
applicant material. Disclosure and conditioning are separate findings and the
sweep must not let a good result on one imply anything about the other.

Supernode at Brendale is already approved, so it is the first site in the sweep
where both questions can be asked of the same facility.
