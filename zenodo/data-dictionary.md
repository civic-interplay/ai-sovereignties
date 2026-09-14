# Data dictionary

Snapshot 2026-09-14. Blank means not recorded or not disclosed — never zero.

## sites.csv

| Column | Definition |
|---|---|
| `site_id` | Stable Notion page UUID. Join key for contestation_items.site_id. |
| `name` | Company / project name as recorded. A "[PROPOSED]" prefix marks an unreviewed pipeline discovery. |
| `infrastructure_type` | Data centre, mine, refinery, etc. Blank on unreviewed proposals. |
| `state` | Australian state or territory, or National / Federal. |
| `latitude` | Decimal degrees, WGS84. Re-anchored to G-NAF address points 2026-08-17 where an address was known. |
| `longitude` | Decimal degrees, WGS84. |
| `status` | Lifecycle stage (operating, under construction, proposed, etc.). |
| `capacity_mw` | Capacity in MW where a figure is on the public record OR published by the operator. BLANK MEANS NOT DISCLOSED, not zero — see the disclosure caveat in this datasheet. |
| `operator` | Operating company. |
| `parent` | Immediate parent entity. |
| `ultimate_owner` | Ultimate beneficial owner where traced. |
| `owner_type` | Hyperscaler, wholesale developer, infrastructure fund, REIT, telco, etc. |
| `ownership_country` | Country of the ultimate owner. |
| `tenants` | Named platform tenants / models served, semicolon-separated. |
| `energy_source` | Recorded energy arrangement. See the renewables caveat in this datasheet. |
| `planning_pathway` | Statutory route: Local council, State assessed, Ministerial fast-track, Federal assessment, Not applicable. Deliberately state-neutral — "State assessed" covers NSW State Significant Development, WA Part 17 and equivalents, because each state names its routes differently. It records WHO decides, not whether the application was exhibited (see public_notice). |
| `accelerated_via` | Acceleration mechanism applied on top of the statutory route: NSW IDA, VIC DFP, Ministerial call-in, or None. Blank means not assessed. Separate from planning_pathway because a project can be accelerated without changing who consents. |
| `resource_conditions` | Whether the legal instrument of approval imposes any obligation on energy or water use: Numeric; Generic — via endorsed document; Claim only — unconditioned; Not accessible. Graded ONLY from the instrument itself, never the EIS, assessment report or a media release. Blank means the instrument has not been read. Added 2026-08-18; most rows are honestly blank. |
| `public_notice` | Whether the application was publicly exhibited, exempted, or unknown. |
| `approval_body` | Consent authority. |
| `announcement_date` | Date first publicly announced (the "announcement track"). |
| `approval_date` | Date approved (the "approval track"). |
| `announced_investment_aud` | Investment figure from press/promotion. LOW CONFIDENCE — not a statutory capital investment value. |
| `governance_flags` | Analyst findings about how an approval was handled. Vocabulary as at this snapshot: Transparency deficit; Community consultation lacking; FIRB scrutiny. An absent flag means the row was NOT ASSESSED on that dimension, not that it passed. Flags that merely restated the statutory route were retired 2026-08-18, as was a First Nations engagement flag whose distribution recorded where an analyst looked rather than where engagement is unclear — see METHODOLOGY.md. |
| `community_concern` | Recorded level of community contestation. |
| `sovereignty_register` | Sovereignty classification(s). |
| `campus_group` | Groups multiple rows belonging to one campus. |
| `confidence` | 0-1. Analyst/model confidence in the row as a whole. |
| `classified_by` | Human-verified, Agent, or blank. Agent rows are unreviewed. |
| `source_url` | Primary source for the row. |
| `notes` | Evidence trail, including dated verification and correction notes. |
| `last_edited` | ISO timestamp of the last edit in the live tracker. |

## contestation_items.csv

| Column | Definition |
|---|---|
| `item_id` | Stable Notion page UUID. |
| `date` | Date of the source event (publication, submission, motion). |
| `item` | Headline / description of the item. |
| `site_id` | Related site UUID(s); joins to sites.site_id. Blank where no site could be resolved. |
| `stance` | Supporting, opposing, conditional, or neutral/informational. |
| `actor` | Who is speaking or acting. |
| `actor_type` | Resident group, council, government, industry, etc. |
| `source_type` | Local press, national press, government statement, submission, etc. |
| `grounds` | Grounds of the argument, semicolon-separated (water use, energy load, process, etc.). |
| `frame_summary` | One-sentence summary of how the item frames the issue. |
| `representative_quote` | Verbatim quote from the source. |
| `confidence` | 0-1. Below 0.6 the item is shown as "pending review" and has not been human-checked. |
| `classified_by` | Human-verified or Agent. |
| `source_url` | Source URL. |
