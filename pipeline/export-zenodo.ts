// Build the Zenodo deposit bundle: two CSVs and a datasheet, written to
// `zenodo/` for upload as a new version of the existing record (DOI
// 10.5281/zenodo.21026430).
//
// The tracker is a live Notion database; a Zenodo version is a frozen citable
// snapshot of it on a given day. Everything here is derived — never hand-typed
// — so a rerun reproduces the deposit exactly from the tracker's current state.
//
// Usage:
//   tsx pipeline/export-zenodo.ts            # write zenodo/ from the live tracker
//   tsx pipeline/export-zenodo.ts --out DIR  # write somewhere else

import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTESTATION_DATABASE_ID, INFRA_DATABASE_ID, NOTION_VERSION } from './config.ts';
import { requireEnv } from './lib/env.ts';

const API = 'https://api.notion.com/v1';

type NotionProp = Record<string, unknown>;
interface Page {
  id: string;
  last_edited_time?: string;
  properties: Record<string, NotionProp>;
}

function plain(p: NotionProp | undefined): string {
  const arr = (p?.title ?? p?.rich_text) as Array<{ plain_text?: string }> | undefined;
  if (!Array.isArray(arr)) return '';
  return arr.map((t) => t?.plain_text ?? '').join('').trim();
}
const sel = (p: NotionProp | undefined) => (p?.select as { name?: string } | null)?.name ?? '';
const multi = (p: NotionProp | undefined) =>
  ((p?.multi_select as Array<{ name?: string }>) ?? []).map((o) => o.name ?? '').filter(Boolean).join('; ');
const num = (p: NotionProp | undefined) => (typeof p?.number === 'number' ? String(p.number) : '');
const url = (p: NotionProp | undefined) => (typeof p?.url === 'string' ? p.url : '');
const date = (p: NotionProp | undefined) => (p?.date as { start?: string } | null)?.start ?? '';
const rel = (p: NotionProp | undefined) =>
  ((p?.relation as Array<{ id?: string }>) ?? []).map((r) => r.id ?? '').filter(Boolean).join('; ');
// Strip the leading emoji Notion option labels carry, so the CSV is plain text.
const label = (v: string) => v.replace(/^[^\p{L}\p{N}]+/u, '').trim() || v;

async function queryAll(databaseId: string): Promise<Page[]> {
  const out: Page[] = [];
  let cursor: string | undefined;
  do {
    const res = await fetch(`${API}/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${requireEnv('NOTION_TOKEN')}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
    });
    if (!res.ok) throw new Error(`Notion query failed (${res.status}): ${await res.text()}`);
    const data = (await res.json()) as { results: Page[]; has_more: boolean; next_cursor: string | null };
    out.push(...data.results);
    cursor = data.has_more ? data.next_cursor ?? undefined : undefined;
  } while (cursor);
  return out;
}

function csv(rows: Array<Record<string, string>>, columns: string[]): string {
  const esc = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [
    columns.join(','),
    ...rows.map((r) => columns.map((c) => esc(r[c] ?? '')).join(',')),
  ].join('\n') + '\n';
}

// --- Column definitions, doubling as the published data dictionary ---------

const SITE_COLUMNS: Array<[string, (p: Record<string, NotionProp>, page: Page) => string, string]> = [
  ['site_id', (_p, page) => page.id, 'Stable Notion page UUID. Join key for contestation_items.site_id.'],
  ['name', (p) => plain(p['Company / Project']), 'Company / project name as recorded. A "[PROPOSED]" prefix marks an unreviewed pipeline discovery.'],
  ['infrastructure_type', (p) => label(sel(p['Infrastructure Type'])), 'Data centre, mine, refinery, etc. Blank on unreviewed proposals.'],
  ['state', (p) => label(sel(p['State / Region'])), 'Australian state or territory, or National / Federal.'],
  ['latitude', (p) => num(p['Latitude']), 'Decimal degrees, WGS84. Re-anchored to G-NAF address points 2026-08-17 where an address was known.'],
  ['longitude', (p) => num(p['Longitude']), 'Decimal degrees, WGS84.'],
  ['status', (p) => label(sel(p['Status'])), 'Lifecycle stage (operating, under construction, proposed, etc.).'],
  ['capacity_mw', (p) => num(p['Capacity (MW)']), 'Capacity in MW where a figure is on the public record OR published by the operator. BLANK MEANS NOT DISCLOSED, not zero — see the disclosure caveat in this datasheet.'],
  ['operator', (p) => plain(p['Operator']), 'Operating company.'],
  ['parent', (p) => plain(p['Parent']), 'Immediate parent entity.'],
  ['ultimate_owner', (p) => plain(p['Ultimate Owner']), 'Ultimate beneficial owner where traced.'],
  ['owner_type', (p) => label(sel(p['Owner Type'])), 'Hyperscaler, wholesale developer, infrastructure fund, REIT, telco, etc.'],
  ['ownership_country', (p) => plain(p['Ownership Country']), 'Country of the ultimate owner.'],
  ['tenants', (p) => multi(p['Tenant / model served']), 'Named platform tenants / models served, semicolon-separated.'],
  ['energy_source', (p) => label(sel(p['Energy Source'])), 'Recorded energy arrangement. See the renewables caveat in this datasheet.'],
  ['planning_pathway', (p) => label(sel(p['Planning Pathway'])), 'Statutory route: Local council, State assessed, Ministerial fast-track, Federal assessment, Not applicable. Deliberately state-neutral — "State assessed" covers NSW State Significant Development, WA Part 17 and equivalents, because each state names its routes differently. It records WHO decides, not whether the application was exhibited (see public_notice).'],
  ['accelerated_via', (p) => label(sel(p['Accelerated via'])), 'Acceleration mechanism applied on top of the statutory route: NSW IDA, VIC DFP, Ministerial call-in, or None. Blank means not assessed. Separate from planning_pathway because a project can be accelerated without changing who consents.'],
  ['resource_conditions', (p) => label(sel(p['Resource conditions'])), 'Whether the legal instrument of approval imposes any obligation on energy or water use: Numeric; Generic — via endorsed document; Claim only — unconditioned; Not accessible. Graded ONLY from the instrument itself, never the EIS, assessment report or a media release. Blank means the instrument has not been read. Added 2026-08-18; most rows are honestly blank.'],
  ['public_notice', (p) => label(sel(p['Public notice'])), 'Whether the application was publicly exhibited, exempted, or unknown.'],
  ['approval_body', (p) => plain(p['State approval body']), 'Consent authority.'],
  ['announcement_date', (p) => date(p['Announcement date']), 'Date first publicly announced (the "announcement track").'],
  ['approval_date', (p) => date(p['Approval date']), 'Date approved (the "approval track").'],
  ['announced_investment_aud', (p) => num(p['Announced investment (AUD)']), 'Investment figure from press/promotion. LOW CONFIDENCE — not a statutory capital investment value.'],
  ['governance_flags', (p) => multi(p['Governance Flags']), 'Analyst findings about how an approval was handled. Vocabulary as at this snapshot: Transparency deficit; Community consultation lacking; FIRB scrutiny. An absent flag means the row was NOT ASSESSED on that dimension, not that it passed. Flags that merely restated the statutory route were retired 2026-08-18, as was a First Nations engagement flag whose distribution recorded where an analyst looked rather than where engagement is unclear — see METHODOLOGY.md.'],
  ['community_concern', (p) => label(sel(p['Community Concern'])), 'Recorded level of community contestation.'],
  ['sovereignty_register', (p) => multi(p['Sovereignty register']), 'Sovereignty classification(s).'],
  ['campus_group', (p) => plain(p['Campus group']), 'Groups multiple rows belonging to one campus.'],
  ['confidence', (p) => num(p['Confidence']), '0-1. Analyst/model confidence in the row as a whole.'],
  ['classified_by', (p) => label(sel(p['Classified by'])), 'Human-verified, Agent, or blank. Agent rows are unreviewed.'],
  ['source_url', (p) => url(p['Source']), 'Primary source for the row.'],
  ['notes', (p) => plain(p['Notes']), 'Evidence trail, including dated verification and correction notes.'],
  ['last_edited', (_p, page) => page.last_edited_time ?? '', 'ISO timestamp of the last edit in the live tracker.'],
];

const ITEM_COLUMNS: Array<[string, (p: Record<string, NotionProp>, page: Page) => string, string]> = [
  ['item_id', (_p, page) => page.id, 'Stable Notion page UUID.'],
  ['date', (p) => date(p['Date']), 'Date of the source event (publication, submission, motion).'],
  ['item', (p) => plain(p['Item']), 'Headline / description of the item.'],
  ['site_id', (p) => rel(p['Site']), 'Related site UUID(s); joins to sites.site_id. Blank where no site could be resolved.'],
  ['stance', (p) => label(sel(p['Stance'])), 'Supporting, opposing, conditional, or neutral/informational.'],
  ['actor', (p) => plain(p['Actor']), 'Who is speaking or acting.'],
  ['actor_type', (p) => label(sel(p['Actor type'])), 'Resident group, council, government, industry, etc.'],
  ['source_type', (p) => label(sel(p['Source type'])), 'Local press, national press, government statement, submission, etc.'],
  ['grounds', (p) => multi(p['Grounds']), 'Grounds of the argument, semicolon-separated (water use, energy load, process, etc.).'],
  ['frame_summary', (p) => plain(p['Frame summary']), 'One-sentence summary of how the item frames the issue.'],
  ['representative_quote', (p) => plain(p['Representative quote']), 'Verbatim quote from the source.'],
  ['confidence', (p) => num(p['Confidence']), '0-1. Below 0.6 the item is shown as "pending review" and has not been human-checked.'],
  ['classified_by', (p) => label(sel(p['Classified by'])), 'Human-verified or Agent.'],
  ['source_url', (p) => url(p['Source']), 'Source URL.'],
];

// --- Main -------------------------------------------------------------------

async function main() {
  const argv = process.argv;
  const outArg = argv.indexOf('--out');
  const outDir = outArg !== -1 ? argv[outArg + 1] : fileURLToPath(new URL('../zenodo/', import.meta.url));
  mkdirSync(outDir, { recursive: true });

  const [sitePages, itemPages] = await Promise.all([
    queryAll(INFRA_DATABASE_ID),
    queryAll(CONTESTATION_DATABASE_ID),
  ]);

  const siteRows = sitePages.map((page) =>
    Object.fromEntries(SITE_COLUMNS.map(([c, f]) => [c, f(page.properties ?? {}, page)])),
  );
  const itemRows = itemPages.map((page) =>
    Object.fromEntries(ITEM_COLUMNS.map(([c, f]) => [c, f(page.properties ?? {}, page)])),
  );

  // Sort for a stable diff between versions: sites by state then name.
  siteRows.sort((a, b) => (a.state + a.name).localeCompare(b.state + b.name));
  itemRows.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  writeFileSync(join(outDir, 'sites.csv'), csv(siteRows, SITE_COLUMNS.map(([c]) => c)));
  writeFileSync(join(outDir, 'contestation_items.csv'), csv(itemRows, ITEM_COLUMNS.map(([c]) => c)));

  // --- Derived counts for the datasheet (never hand-typed) ---
  const stamp = new Date().toISOString().slice(0, 10);
  const dcs = siteRows.filter((r) => r.infrastructure_type.includes('Data Centre'));
  const withCap = dcs.filter((r) => r.capacity_mw !== '');
  const withCoords = siteRows.filter((r) => r.latitude !== '' && r.longitude !== '');
  const proposed = siteRows.filter((r) => r.name.startsWith('[PROPOSED]'));
  const byState = new Map<string, number>();
  for (const r of dcs) byState.set(r.state || '(unstated)', (byState.get(r.state || '(unstated)') ?? 0) + 1);
  const stateTable = [...byState.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([s, n]) => `| ${s} | ${n} |`)
    .join('\n');
  const pending = itemRows.filter((r) => r.confidence !== '' && Number(r.confidence) < 0.6);

  const readme = `# AI Sovereignties — Australian data centre tracker (summary data)

**Snapshot: ${stamp}** · Sarah Barns (RMIT University), Civic Interplay
· Concept DOI [10.5281/zenodo.21026430](https://doi.org/10.5281/zenodo.21026430)
· Live version: <https://datacentres.civicinterplay.io> · Code: <https://github.com/civic-interplay/ai-sovereignties>
· Licence: CC-BY-4.0

A frozen, citable snapshot of a live research tracker mapping the physical
infrastructure behind AI in Australia: data centres and related extractive and
processing sites, their ownership chains, approval pathways, disclosed energy
and water arrangements, and the public contestation forming around them.

## Files

| File | Rows | Grain |
|---|---|---|
| \`sites.csv\` | ${siteRows.length} | One row per tracked site or project. |
| \`contestation_items.csv\` | ${itemRows.length} | One row per source event (article, submission, motion, statement). Joins to sites on \`site_id\`. |
| \`data-dictionary.md\` | — | Every column, defined. |

## What is in this snapshot

- **${dcs.length}** data-centre rows; **${siteRows.length - dcs.length}** other infrastructure rows.
- **${withCoords.length}** rows carry coordinates and appear on the published map.
- **${proposed.length}** ${proposed.length === 1 ? 'row is an unreviewed pipeline discovery' : 'rows are unreviewed pipeline discoveries'}, prefixed \`[PROPOSED]\`, excluded from all published statistics.
- **${pending.length}** of ${itemRows.length} contestation items are below the 0.6 confidence threshold and have not been human-checked.

Data-centre rows by jurisdiction:

| Jurisdiction | Data-centre rows |
|---|---|
${stateTable}

## Caveats a reuser must carry

**1. A blank is an absence of disclosure, not a zero.** Only **${withCap.length} of ${dcs.length}**
data-centre rows carry a capacity figure, and where one exists it frequently
comes from operator marketing rather than the planning record. Our August 2026
audit of Victorian approvals found that of the twelve records that remain
publicly checkable, none disclosed expected electricity demand and none stated
a water demand; one described its cooling method without a volume. Do not
compute sector totals from \`capacity_mw\` and do not treat blanks as small.

**2. Announced investment is not a statutory value.** \`announced_investment_aud\`
is drawn from press releases and government investment promotion. It is not the
capital investment value in the planning record, and the gap between the two is
itself one of this project's findings.

**3. Renewable-energy fields describe claims, not physical supply.**
\`energy_source\` records what is claimed or contracted. Certificate matching,
carbon offsets and 2030 targets are routinely presented as renewable supply.
Read the field with the source hierarchy in \`docs/FACT-CHECKING-GUIDE.md\`.

**4. Some rows are machine-generated.** \`classified_by = Agent\` marks rows or
items proposed by the discovery pipeline and not yet verified by a human;
\`confidence\` carries the estimate. Nothing marked Agent should be quoted to a
council, journalist or parliament without walking it back to source.

**5. The public record itself is unstable.** At least one audited application's
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
documents; verification records are published in \`docs/disclosure-audit/\`.
Full methods: \`docs/METHODOLOGY.md\`, \`docs/FACT-CHECKING-GUIDE.md\`,
\`docs/CONTESTATION-PIPELINE.md\`. Model compute is logged in \`docs/COMPUTE.md\`.

Coverage is not uniform: it is deepest in Victoria and New South Wales, and
paywalled mastheads (notably the Australian Financial Review) are not indexed
by the automated sweep and enter only through manual ingestion.

## Citation

> Barns, S. (${stamp.slice(0, 4)}). *A living atlas of contesting and curating AI
> sovereignties (Australian view)* [Data set]. Zenodo.
> https://doi.org/10.5281/zenodo.21026430

Corrections are part of the method. If you find an error, please open an issue
on the repository — dated corrections are recorded in the row's \`notes\`.
`;

  const dict = `# Data dictionary

Snapshot ${stamp}. Blank means not recorded or not disclosed — never zero.

## sites.csv

| Column | Definition |
|---|---|
${SITE_COLUMNS.map(([c, , d]) => `| \`${c}\` | ${d} |`).join('\n')}

## contestation_items.csv

| Column | Definition |
|---|---|
${ITEM_COLUMNS.map(([c, , d]) => `| \`${c}\` | ${d} |`).join('\n')}
`;

  writeFileSync(join(outDir, 'README.md'), readme);
  writeFileSync(join(outDir, 'data-dictionary.md'), dict);

  // The datasheet tells a reuser how the data was verified and points at the
  // records that prove it. Those documents have to travel with the deposit —
  // without them the README cites things the download does not contain, and a
  // reader cannot tell an unassessed blank from an assessed absence.
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
  const COMPANION_DOCS = [
    'docs/METHODOLOGY.md',        // how the atlas is compiled, verified, corrected
    'docs/FACT-CHECKING-GUIDE.md', // the working verification protocol
    'docs/VERIFICATION-RECORD.md', // adversarial results, including refuted claims
    'docs/DISCLOSURE-AUDIT.md',    // a completed audit, method and findings together
    'docs/CHANGELOG.md',           // what changed between deposited versions
  ];
  for (const rel of COMPANION_DOCS) {
    copyFileSync(join(repoRoot, rel), join(outDir, basename(rel)));
  }

  console.log(`Wrote to ${outDir}`);
  console.log(`  sites.csv               ${siteRows.length} rows`);
  console.log(`  contestation_items.csv  ${itemRows.length} rows`);
  console.log(`  README.md, data-dictionary.md`);
  console.log(`  + ${COMPANION_DOCS.length} companion docs: ${COMPANION_DOCS.map((d) => basename(d)).join(', ')}`);
  console.log(`\nData centres: ${dcs.length}; with capacity: ${withCap.length}; mapped: ${withCoords.length}; [PROPOSED]: ${proposed.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
