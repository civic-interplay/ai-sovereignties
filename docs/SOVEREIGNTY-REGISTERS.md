# Sovereignty registers — what the field means, and what it does not

**Decided 22 September 2026.** Settles a divergence that had been live since
June and was papered over in code rather than resolved.

## The vocabulary

Four registers, coded per site, a site may hold several. Map colour uses
precedence: the most sovereign register present wins.

| Register | Means |
| --- | --- |
| **Productive** | The facility is owned and built by Australian interests — the capability itself accrues onshore. |
| **Operational** | Run by an Australian public body. |
| **Financial** | ≥30% of ultimate ownership held by Australian public capital — sovereign wealth, government, or superannuation (pooled retirement savings, counted as public capital here). |
| **Rented** | Compute capacity rented to companies headquartered offshore. Local usage benefit unknown. |

A row with none of these coded is **Not coded** — the coding pass has not
reached it. Excluded from published register statistics. Blank is not a finding.

## What was wrong

The same four-word frame was doing two different jobs in two documents, with
different definitions, and the Notion field carried a fifth option belonging to
neither.

| | *Data for Policy* abstract (June) | Project explainer (July) |
| --- | --- | --- |
| Registers | **Locational** · Financial · Operational · Productive | **Rented** · Financial · Operational · Productive |
| Financial | public equity under commercial rather than public-benefit mandates | ≥30% public capital, super included |
| Operational | a state runs its own stack for internal use | operation by an Australian public body |
| Productive | builds and **openly publishes models as public goods** (Apertus) | **built and owned by Australian interests** |

Productive is the clearest break. "Publishes models as public goods" and "built
and owned by Australian interests" are different claims. An Australian-owned
facility running foreign proprietary models is Productive under one and not
under the other.

So these were never two labellings of one framework. They were **two frameworks
sharing four words**:

- The **abstract's** is a typology of *national strategy* — what kind of
  sovereignty a state is constructing. It is what the critique of the
  10 Principles turns on.
- The **explainer's** is a per-site *ownership and benefit* lens — who gains
  from the investment model behind this building.

Both are sound. They answer different questions, and only one of them is a
property of a site.

## The decision

**The field is the per-site ownership lens.** The explainer's four, as defined
above.

**The national typology is not a column.** It is an argument made *about* the
data — in the book, the journal article, the abstract — and it belongs in the
writing, where Locational can be defined properly alongside the comparative
cases it depends on. It does not reduce to a per-site tag without losing what
makes it an argument.

One field, one question.

## What was changed

- `Locational` removed from the Notion field options. It had two uses, both
  added on 19 September by an agent reading the abstract and assuming the field
  matched it. Western Downs is now `Rented`; Supernode is `Financial + Rented`.
  Neither lost information.
- The **workaround removed from three places.** `registerKey()` in
  `api/sites/route.ts`, the equivalent in `sheets/[state]/page.tsx`, and the
  `Locational` term in the glossary all folded Locational into Rented. That
  fold was the symptom: someone had already noticed the field carried two
  frameworks and made the map render anyway.

## Why this is recorded rather than just fixed

A silent fix leaves the abstract, the explainer and the book each still saying
something slightly different, with nothing to point at. The register is the
analytical core of the project; anyone joining will pick whichever definition
they meet first.

The remaining work is not in this repo: **the *Data for Policy* abstract and
the project explainer still disagree**, and one of them should be amended to
name the other's scope. This file fixes the data and the code. It does not fix
the writing.
