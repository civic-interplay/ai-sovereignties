# Compute disclosure

This project asks data centres to disclose their energy and water draw. It
should hold itself to the same standard for the compute it consumes, so the
model usage behind the tracker is logged publicly here.

## What is logged

`docs/compute-log.jsonl` — one JSON line per model-using run:

```json
{"date":"2026-09-01","kind":"pipeline","source":"gdelt","model":"claude-sonnet-5","calls":40,"input_tokens":180000,"output_tokens":22000}
```

- **kind: pipeline** — the fortnightly contestation classifier (GitHub Actions).
  Token counts come from the API's own `usage` block, tallied in
  `pipeline/lib/classify.ts` and appended by `pipeline/run.ts`; the workflow
  commits the log after each run.
- **kind: session** — interactive research/build sessions (Claude Code).
  Harvested from the sessions' own transcripts, which record the API's `usage`
  block per call (aggregated per day and model; `cache_read_tokens` are
  previously-processed context re-read from cache, kept separate because they
  are not fresh computation on the same scale). Sessions run on machines whose
  transcripts are not available here — e.g. web sessions — remain uncounted,
  so the log is a floor, not a ceiling.

The `/glossary` page reads this file from the repository at request time and
shows the running totals.

## Conversions: indicative, with assumptions stated

Tokens and call counts are the honest primitive. On top of them the glossary
shows **indicative** conversions, each with its assumption stated so anyone can
redo the arithmetic:

- **Cost** — priced at Anthropic's published per-MTok list rates (June 2026:
  Opus 4.8 $5/$25, Fable 5 $10/$50, Sonnet 5 $3/$15; cache reads ≈ 0.1× input),
  as if every token were billed at API prices. Actual spend ran partly on
  subscription plans, so this is a counterfactual list-price figure, not a
  billing record.
- **Energy** — no credible per-token figure for hosted inference is public, so
  the shown range applies commonly cited per-query estimates (~0.3–3 Wh) to the
  call count, with the caveat that these agentic calls are far larger than
  typical queries and the true figure is plausibly higher. Order-of-magnitude
  only: days of one household's electricity, not a data centre's.

## Models used

- `claude-sonnet-5` — contestation classifier (structured coding of press and
  planning sources).
- Claude Code sessions (Opus / Fable class models) — map and site development,
  data audits, verification passes. See the changelog and commit trailers for
  which sessions did what.
