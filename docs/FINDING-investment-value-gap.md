# You cannot value Australia's data centre pipeline from the public record

**Finding, 19 September 2026.** Companion to
[`FINDING-supernode-legibility.md`](FINDING-supernode-legibility.md) — the same
argument at a different scale. Not yet adversarially verified.

## The question, and why it has no answer

A reasonable first question from a minister, a council or a journalist: *what is
the total value of data centres approved in Australia, and what is in the
pipeline?*

The tracker holds 94 data-centre rows. Against that question:

| | rows | share |
| --- | --- | --- |
| Have an **announced investment figure** | 6 | 6% |
| Have an **approval date** | 8 | 9% |
| Have **both** | **1** | **1%** |

The single row with both is Goodman's Project Apollo at Macquarie Park —
$1.36bn, approved 2 September 2026.

So "total value approved in 2026" is one row, and "2020–2025" is **zero
disclosed**: four rows carry 2025 approval dates and none carries a value.
Neither is a total. Publishing either as one would be the false precision this
project exists to criticise.

What is disclosed, in full, all of it press announcement rather than statutory:

| Site | Announced | Status |
| --- | --- | --- |
| Western Downs Digital Park (Dalby) | $31.90bn | application lodged |
| AirTrunk Kurri Kurri | $5.00bn | feasibility |
| AirTrunk Mamre Road | $5.00bn | application lodged |
| Stockland / Fife, 90 Aldington Rd | $3.94bn | feasibility |
| Goodman Project Apollo | $1.36bn | **approved** |
| CDC Maddington | $0.42bn | under construction |

$47.6bn across six sites — a total of the six that said anything, and nothing
more than that.

## Is the value missing from planning records, or just unharvested?

**Unharvested. And the distinction matters, because it changes who has to fix
it.**

The statutory figure exists and is mandatory. New South Wales requires a
**Capital Investment Value** on development applications. Queensland's material
change of use requires an estimated cost of development. Victoria's permit
applications state an estimated cost of works, and it is a named field in the
state's own planning-permit reporting data dictionary.

More than that — **this project is already receiving the NSW figure and
discarding it.**

`pipeline/retrieve/eplanning.ts` reads `CostOfDevelopment` from the NSW
ePlanning OnlineDA feed. It is not incidental: the relevance gate *depends* on
it, at line 151, where an industrial application qualifies only if its cost
clears a $20m floor. The value is fetched, used to make a decision, and then at
`pipeline/discover.ts:111` formatted into a prose string — `$12.4M` — inside a
Notes field. There is no numeric field in the tracker to put it in. The only
money fields are `Announced investment (AUD)` and `Investment Signal`, both of
which record the press number.

So the tracker carries the weak track and drops the strong one, having already
paid to retrieve it.

## The gap is the finding, not the number

The two figures are not the same measurement, and collapsing them would be its
own error:

- **Capital Investment Value** is defined by regulation. It generally excludes
  land, and depending on jurisdiction may exclude IT fit-out — which for a data
  centre is most of the capital.
- **Announced investment** is a company's own figure, typically covering land,
  buildings, equipment and every future stage, over a decade, at full build.

Dalby is announced at $31.9bn. Whatever its Queensland application states as
cost of development will be a different and probably far smaller number. **That
ratio, per site, is the measurement worth having** — and it is currently
unmeasurable because only one side of it is recorded.

It also has a policy edge. Investment-attraction announcements are made against
the large number; planning assessment, developer contributions and infrastructure
charges are calculated against the small one.

## What is needed to fix it

In rough order of effort:

1. **Add a `Statutory cost (AUD)` field** and a `Cost basis` field naming the
   instrument the figure comes from (NSW CIV, QLD estimated cost of development,
   VIC cost of works). Without the basis, two numbers from different states are
   not comparable.
2. **Store what the pipeline already fetches.** One line in
   `pipeline/discover.ts` — the value is in `d.cost` and currently only reaches a
   string. This is the cheapest real improvement available to the project.
3. **Backfill NSW** from the ePlanning feed for every row with a PAN. The feed
   is public and keyless; this is a crawl, not research.
4. **Harvest QLD and VIC from the application documents.** Not automatable in
   the same way — the figure is in a form or a covering report, not a feed.
5. **Publish the ratio**, per site, with both figures side by side and the basis
   named. Announced over statutory, as a number, with the assumption stated.

Steps 1–3 are days of work and would take the coverage from 6% to something
defensible for New South Wales alone.

## Why this sits with the legibility finding

Supernode cannot be found in its council's records because there is no term for
what it is. The pipeline's value cannot be totalled because only the
promotional number is captured. Both are failures of *the record as an
instrument* rather than of any individual disclosure — and both mean the
questions a policymaker asks first are the ones the public record cannot answer.

The difference is who can fix them. Legibility needs a use class, which needs a
planning regulator. The value gap needs a field and one line of code.

## Limits

- The 6% and 9% figures are coverage of **this tracker**, not proof that no
  figure exists in any record. They are a claim about what has been harvested.
- The claim that CIV excludes IT fit-out needs checking against each
  jurisdiction's regulation before publication. It is stated here as the reason
  to measure the ratio, not as an established quantity.
- Not adversarially verified.
