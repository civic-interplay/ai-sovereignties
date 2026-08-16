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
- **kind: session** — interactive research/build sessions (Claude Code). These
  are **not automatically metered**; entries are added by hand from the
  Anthropic console's usage page, and the log is therefore a floor, not a
  ceiling. Sessions predating 2026-08-16 are unlogged.

The `/glossary` page reads this file from the repository at request time and
shows the running totals.

## What is deliberately not published

Cost in dollars and energy in joules. Per-token prices change and per-token
energy figures for hosted inference are not credibly public — converting tokens
through a speculative multiplier would manufacture exactly the false precision
the tracker exists to resist. Tokens and call counts are the honest primitive;
anyone can apply their own conversion and show their working.

## Models used

- `claude-sonnet-5` — contestation classifier (structured coding of press and
  planning sources).
- Claude Code sessions (Opus / Fable class models) — map and site development,
  data audits, verification passes. See the changelog and commit trailers for
  which sessions did what.
