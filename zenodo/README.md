# AI Sovereignties — Australian data centre tracker (summary data)

**Snapshot: 2026-09-14** · Sarah Barns (RMIT University), Civic Interplay
· Concept DOI [10.5281/zenodo.21026429](https://doi.org/10.5281/zenodo.21026429) (always resolves to the latest version)
· Live version: <https://datacentres.civicinterplay.io> · Code: <https://github.com/civic-interplay/ai-sovereignties>
· Licence: CC-BY-4.0

A frozen, citable snapshot of a live research tracker mapping the physical
infrastructure behind AI in Australia: data centres and related extractive and
processing sites, their ownership chains, approval pathways, disclosed energy
and water arrangements, and the public contestation forming around them.

## Files

| File | Rows | Grain |
|---|---|---|
| `sites.csv` | 136 | One row per tracked site or project. |
| `contestation_items.csv` | 37 | One row per source event (article, submission, motion, statement). Joins to sites on `site_id`. |
| `data-dictionary.md` | — | Every column, defined. |

## What is in this snapshot

- **94** data-centre rows; **42** other infrastructure rows.
- **99** rows carry coordinates and appear on the published map.
- **2** rows are unreviewed pipeline discoveries, prefixed `[PROPOSED]`, excluded from all published statistics.
- **11** of 37 contestation items are below the 0.6 confidence threshold and have not been human-checked.

Data-centre rows by jurisdiction:

| Jurisdiction | Data-centre rows |
|---|---|
| Victoria | 59 |
| New South Wales | 26 |
| Tasmania | 3 |
| Western Australia | 3 |
| Queensland | 2 |
| National / Federal | 1 |

## Caveats a reuser must carry

**1. A blank is an absence of disclosure, not a zero.** Only **36 of 94**
data-centre rows carry a capacity figure, and where one exists it frequently
comes from operator marketing rather than the planning record. Our August 2026
audit of Victorian approvals found that of the twelve records that remain
publicly checkable, none disclosed expected electricity demand and none stated
a water demand; one described its cooling method without a volume. Do not
compute sector totals from `capacity_mw` and do not treat blanks as small.

**2. Announced investment is not a statutory value.** `announced_investment_aud`
is drawn from press releases and government investment promotion. It is not the
capital investment value in the planning record, and the gap between the two is
itself one of this project's findings.

**3. Renewable-energy fields describe claims, not physical supply.**
`energy_source` records what is claimed or contracted. Certificate matching,
carbon offsets and 2030 targets are routinely presented as renewable supply.
Read the field with the source hierarchy in `docs/FACT-CHECKING-GUIDE.md`.

**4. Some rows are machine-generated.** `classified_by = Agent` marks rows or
items proposed by the discovery pipeline and not yet verified by a human;
`confidence` carries the estimate. Nothing marked Agent should be quoted to a
council, journalist or parliament without walking it back to source.

**5. Water risk is not evidenced alike at each level.** `water_risk` = Low
records that a closed-loop, air-cooled or recycled-water design is *claimed*,
usually by the operator. High is drawn mostly from exhibited environmental
impact statements, which carry annual volumes. So the evidence is asymmetric in
the direction that understates water draw, and Low should never be read as a
measured result. Each row's `notes` state the provenance of its claim.

**6. The public record itself is unstable.** At least one audited application's
exhibited documents were removed from the live Victorian planning site after
the decision and survive only in web archives. Source URLs in this dataset may
resolve to nothing even where the document was public when recorded.

## Method

Sites are compiled from planning registers (NSW ePlanning/OnlineDA via its
public API; NSW Major Projects and the Victorian ministerial permits register
manually), council lists, operator disclosures and press coverage. Contestation
items are collected fortnightly by an automated pipeline that sweeps the GDELT
news index and accepts manual ingestion for paywalled and non-crawlable
material, then classified for stance, actor and grounds by a language model
under a strict extract-don't-infer contract. Claims underpinning published
findings are checked by adversarial verification and by humans against primary
documents; verification records are published in `docs/disclosure-audit/`.
Full methods: `docs/METHODOLOGY.md`, `docs/FACT-CHECKING-GUIDE.md`,
`docs/CONTESTATION-PIPELINE.md`. Model compute is logged in `docs/COMPUTE.md`.

Coverage is not uniform: it is deepest in Victoria and New South Wales, and
paywalled mastheads (notably the Australian Financial Review) are not indexed
by the automated sweep and enter only through manual ingestion.

## Citation

> Barns, S. (2026). *A living atlas of contesting and curating AI
> sovereignties (Australian view)* [Data set]. Zenodo.
> https://doi.org/10.5281/zenodo.21026429

Corrections are part of the method. If you find an error, please open an issue
on the repository — dated corrections are recorded in the row's `notes`.
