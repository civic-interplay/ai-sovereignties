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

**Compute figures:** _to backfill from the Anthropic usage dashboard._
Tokens: — · Est. energy: — · Notes: long multi-hour session, Opus 4.8 1M-context.
