# Compute log

A reflexive record: an atlas of compute sovereignty accounting for the compute it
consumes to build itself. One entry per working session — model, work done, and
any token/energy figures available (exact figures usually need backfilling from
the Anthropic usage dashboard; they aren't visible in-session).

---

## 2026-07-26 — Claude Opus 4.8 (1M context), via Claude Code

**Work:**
- Pipeline: hardened GDELT retrieval (retry/backoff after a lost scheduled run);
  wired planning-portals as a multi-feed source (`PORTAL_FEED_URLS`); researched
  NSW ePlanning + VIC feed availability (NSW API is key-gated; no public VIC feed).
- Map: built ownership depth — Country + Capital lenses + ownership-chain popup;
  fixed the Type-lens `undefined` colour bug; added a Switzerland bucket; fixed the
  local-dev Notion token shadowing.
- Data: researched and wrote ownership for GreenSquare, KNBDC/AirTrunk (Blackstone
  shell structure), ANSTO, Larvotto etc.; created `Parent`/`Ultimate Owner`/`Owner
  Type` columns and backfilled 21 rows.
- Docs: consolidated `ROADMAP.md` (five visualisations, glossary, timeline);
  documented + enriched the Hume governance entry.
- Built: ownership-lifecycle infographic (AirTrunk prototype) and supply-chain map.
- Super-fund exposure: built the "Super $" lens (3 channels — operator/land/
  via-manager), added the Sovereign/super exposure % + Super exposure channel
  fields, ran a research sweep (AustralianSuper, Aware, ART, IFM, Rest) into a
  documented seed list, added the Lane Cove West cluster + Supernode + Vantage,
  and coded the CDC sovereign case. Map grew 36 → 47 sites.

**Compute figures (via Claude Code `/cost`):** **US$76.31** · API time 2h 26m · wall ~1 day.
Opus 4.8: 230.5k input / 597.9k output tokens, 88.9M cache read, 1.6M cache write, 18 web
searches (Haiku negligible, $0.009). Code: +1,088 / −182 lines.
Cost drivers (Claude Code's own read-out): 94% of usage at >150k context, 71% from a single
8h+ continuous session — the spend came from *length and context*, not waste. Lesson for next
time: `/compact` or `/clear` between phases (map / research / Notion / deploy / docs) would cut it.
Energy: Anthropic doesn't publish per-session energy; a token→kWh figure would be a crude guess,
so it's left unstated rather than faked — fittingly, the honesty rule the Energy lens itself follows.

---

## 2026-08-18 — Claude Opus 5 (1M context), via Claude Code

**Work:** research-strategy session — no map or pipeline code touched.
- Read the handoff brief against the repo and argued with its premise: both the
  influence and output tracks are already running; what is missing is closure.
- Wrote `docs/VERIFICATION-RECORD.md` — the aggregate of every adversarially
  verified claim (28 claims, 20 CONFIRMED / 2 PLAUSIBLE / 6 REFUTED, 21%),
  compiled from the two per-run records, with each refutation sorted against the
  claim-type taxonomy it failed under.
- Wrote `docs/PRE-REGISTRATION.md` — frozen protocol for the QLD/NT/WA/SA/TAS
  sweep, to be deposited before any record in scope is opened. Commits
  cross-family (non-Claude) verification for load-bearing claims, addressing the
  correlated-error limit of same-family skeptics.
- Wrote `docs/OUTPUTS-TODO.md` — six outputs, ordered, with the Senate inquiry's
  unrecorded closing date flagged as the first blocker.
- Built `docs/gen-citations.py` → `docs/citations.ris`: 262 unique sources
  harvested from `zenodo/*.csv` and the research documents, each carrying its
  FACT-CHECKING-GUIDE §2 source rung as a keyword. 236 of 262 titles are derived
  from tracker rows or URL slugs and are flagged as such in-record. Rewritten
  19 Aug after the first file failed to import: RIS has no comment syntax, so
  the provenance header at the top broke the first record; also switched to CRLF
  and stopped emitting empty tags. The generator now self-checks conformance and
  exits non-zero on failure.
- Audited the Zenodo deposit against its own README: every published statistic
  reconciles (89/37/94/1/11/33 and the jurisdiction table). Found one blocking
  defect — 16 `[REJECTED]` pipeline-triage rows shipping unexplained — plus the
  "37 other infrastructure rows" description, blank `confidence` on 40 of 89
  data-centre rows, and `zenodo/` being gitignored.

**Compute figures:** not captured in-session — `/cost` was not run before the
session ended. To backfill from the Anthropic usage dashboard for 2026-08-18, or
from this session's transcript into `docs/compute-log.jsonl` per `COMPUTE.md`.
Recorded as unmeasured rather than estimated, on the same rule the Energy lens
applies to operators: a blank means unassessed, not zero.

## 2026-08-18 (evening) — recovery, vocabulary migration, deposit v0.2.0

Session resumed after a crash killed an eight-agent research run mid-flight.

- **Recovered the enforcement research** from agent transcripts on disk: three
  agents had written complete reports before the crash, five had done the
  reading but not the synthesis. Recovered to
  `docs/enforcement-research-recovered-2026-08-18.md`.
- **Relaunched the jurisdiction strands.** 21 agents ran (3 launched, 18
  self-delegated), 611 tool calls, all terminated on a monthly spend limit
  before writing reports. After the limit reset, three completed: Victorian
  parliamentary record, Tasmania, and WA/SA water utilities. 61 cached primary
  sources preserved to `docs/evidence-cache/vic-parliament-2026-08-18/`.
- **Read one instrument directly** rather than delegating: planning permit
  PA2504032 (Oroya Drive, Truganina). Born-digital, published as 300dpi page
  scans, so unreadable to any text search.
- **Vocabulary migration**: governance flags 11 → 3; First Nations flag retired;
  Planning pathway made state-neutral. See `CHANGELOG.md`.
- **Deployed** to both domains, then **published Zenodo v0.2.0**
  (`10.5281/zenodo.21994643`) — nine files, dataset type, method and
  verification records travelling with the data for the first time.

**Two operational lessons, recorded because both cost real time:**

1. *Deploy code before migrating the data it depends on.* The live site derived
   "State fast-tracked" from two governance flags. Retiring those flags before
   deploying the pathway-based replacement dropped the figure to zero on the
   live sheets and emptied the map overlay — silently, for about an hour, with
   no error anywhere. The failure had been predicted in the same session and the
   ordering was not followed.
2. *Definitions live in more than one file.* Correcting the "State fast-tracked"
   wording in the glossary left the map's own copy untouched and stale. Grep for
   duplicates before assuming a definition has one home.

**Compute figures:** not captured in-session — `/cost` was not run. Backfill from
the Anthropic usage dashboard for 2026-08-18 into `docs/compute-log.jsonl` per
`COMPUTE.md`. Recorded as unmeasured rather than estimated.
