// Record a human verification against a tracker row.
//
// This exists so the fact-checking protocol is enforced rather than remembered.
// FACT-CHECKING-GUIDE.md section 6 says a verification sets `Classified by`,
// sets `Confidence`, and appends a dated note with the source URL. Done by hand
// in Notion that is four fields, a date format and a judgement call about
// confidence, repeated across 131 rows by several people. Done here it is one
// command, and the rules cannot drift between research assistants.
//
// The rule this tool enforces, from the guide's source hierarchy:
//
//   rung 1-3 (primary record / official register / named official)
//       -> Classified by = Human-verified   (the row may now be quoted)
//   rung 4-6 (press / operator materials / directory)
//       -> Classified by = Human            (checked, but NOT quotable as verified)
//
// That boundary is the whole point. A research assistant who reads an operator
// press release has done real work, but the row is not verified, and the tool
// will not let them mark it so.
//
// Scope: this records verification at ROW level — has a person walked this
// row's load-bearing facts to a source. Claim-level adversarial verification
// (what was refuted, and how) lives in docs/VERIFICATION-RECORD.md and the
// per-run files in docs/disclosure-audit/. The two are complements: the record
// says which claims survived refutation, this says which rows a human has
// stood behind. Neither substitutes for the other.
//
// Usage:
//   tsx pipeline/verify.ts --queue                     # what needs doing, in order
//   tsx pipeline/verify.ts --queue --tier 1            # just the load-bearing rows
//   tsx pipeline/verify.ts --status                    # verification coverage summary
//   tsx pipeline/verify.ts --row "NEXTDC M4" --by SB --rung 2 \
//     --evidence https://... --note "permit PDF searched, no MW figure"
//   ... add --dry-run to preview the write.

import { INFRA_DATABASE_ID, NOTION_VERSION } from './config.ts';
import { requireEnv } from './lib/env.ts';

const API = 'https://api.notion.com/v1';

// Rung -> (Classified by, default Confidence). Mirrors FACT-CHECKING-GUIDE.md
// sections 2 and 6. Confidence is a default, overridable with --confidence.
const RUNGS: Record<string, { label: string; verified: boolean; confidence: number }> = {
  '1': { label: '1 — Primary record', verified: true, confidence: 0.95 },
  '2': { label: '2 — Official register', verified: true, confidence: 0.8 },
  '3': { label: '3 — Named official', verified: true, confidence: 0.7 },
  '4': { label: '4 — Trade or local press', verified: false, confidence: 0.5 },
  '5': { label: '5 — Operator materials', verified: false, confidence: 0.4 },
  '6': { label: '6 — Directory', verified: false, confidence: 0.3 },
};

function headers() {
  return {
    Authorization: `Bearer ${requireEnv('NOTION_TOKEN')}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}
function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

type Prop = Record<string, unknown>;
type Row = { id: string; url?: string; properties: Record<string, Prop> };

function plain(p: Prop | undefined): string {
  const arr = (p?.title ?? p?.rich_text) as Array<{ plain_text?: string }> | undefined;
  return Array.isArray(arr) ? arr.map((t) => t?.plain_text ?? '').join('').trim() : '';
}
function sel(p: Prop | undefined): string | null {
  return (p?.select as { name?: string } | null)?.name ?? null;
}
function num(p: Prop | undefined): number | null {
  return typeof p?.number === 'number' ? p.number : null;
}

async function allRows(): Promise<Row[]> {
  const out: Row[] = [];
  let cursor: string | undefined;
  do {
    const res = await fetch(`${API}/databases/${INFRA_DATABASE_ID}/query`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
    });
    if (!res.ok) throw new Error(`Notion query failed (${res.status}): ${await res.text()}`);
    const data = (await res.json()) as { results: Row[]; has_more: boolean; next_cursor: string | null };
    out.push(...data.results);
    cursor = data.has_more ? data.next_cursor ?? undefined : undefined;
  } while (cursor);
  return out;
}

// The tiering from docs/VERIFICATION-TRACKER.md, so the queue and the handoff
// document cannot drift apart.
const TIER1 = [
  'Marsden Park Hyperscale', 'Project Mars', 'Mamre Road', 'NEXTDC M4', 'AirTrunk MEL2',
  'CDC — Laverton North', 'Cherry Lane', 'Cobblebank', 'Brooklyn Campus', 'NEXTDC M2',
  'South Morang', 'Perri Projects', 'Truganina Data Centre',
];

function tierOf(r: Row): number {
  const name = plain(r.properties['Company / Project']);
  const isDC = (sel(r.properties['Infrastructure Type']) ?? '').includes('Data Centre');
  if (name.startsWith('[REJECTED]')) return 4;
  if (TIER1.some((t) => name.includes(t))) return 1;
  if (sel(r.properties['Classified by']) === 'Agent' && num(r.properties['Latitude']) !== null) return 2;
  if (['Renewable (contracted)', 'Renewable (on-site)'].includes(sel(r.properties['Energy Source']) ?? '')) return 3;
  return isDC ? 4 : 5;
}

function isDone(r: Row): boolean {
  return sel(r.properties['Classified by']) === 'Human-verified';
}

async function showQueue(rows: Row[]) {
  const want = arg('tier');
  const pending = rows
    .filter((r) => !isDone(r))
    .map((r) => ({ r, tier: tierOf(r) }))
    .filter((x) => !want || String(x.tier) === want)
    .sort((a, b) => a.tier - b.tier);

  let tier = -1;
  for (const { r, tier: t } of pending) {
    if (t !== tier) {
      tier = t;
      console.log(`\n=== Tier ${t} — ${pending.filter((x) => x.tier === t).length} rows ===`);
    }
    const p = r.properties;
    const gaps: string[] = [];
    if (num(p['Capacity (MW)']) === null) gaps.push('no MW');
    if (!sel(p['Public notice'])) gaps.push('no Public notice');
    if (!sel(p['Planning Pathway'])) gaps.push('no pathway');
    console.log(
      `  ${(sel(p['Classified by']) ?? 'blank').padEnd(15)} ${plain(p['Company / Project']).slice(0, 52).padEnd(54)} ${gaps.join(', ')}`,
    );
  }
  console.log(`\n${pending.length} rows pending.`);
}

async function showStatus(rows: Row[]) {
  const by = new Map<string, number>();
  for (const r of rows) {
    const k = sel(r.properties['Classified by']) ?? 'blank';
    by.set(k, (by.get(k) ?? 0) + 1);
  }
  console.log(`\n# Verification coverage — ${rows.length} rows\n`);
  for (const [k, v] of [...by].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(16)} ${String(v).padStart(3)}  ${((100 * v) / rows.length).toFixed(0)}%`);
  }
  const rung = new Map<string, number>();
  for (const r of rows) {
    const k = sel(r.properties['Evidence rung']);
    if (k) rung.set(k, (rung.get(k) ?? 0) + 1);
  }
  if (rung.size) {
    console.log('\n  By evidence rung:');
    for (const [k, v] of [...rung].sort()) console.log(`    ${k.padEnd(26)} ${v}`);
  }
  console.log('\n  Pending by tier:');
  const tiers = new Map<number, number>();
  for (const r of rows) if (!isDone(r)) tiers.set(tierOf(r), (tiers.get(tierOf(r)) ?? 0) + 1);
  for (const [t, v] of [...tiers].sort()) console.log(`    tier ${t}  ${v}`);
}

async function record(rows: Row[]) {
  const query = arg('row');
  const by = arg('by');
  const rung = arg('rung');
  const evidence = arg('evidence');
  const note = arg('note');

  if (!query || !by || !rung) {
    console.error('Need --row, --by and --rung. See the usage block at the top of this file.');
    process.exit(1);
  }
  const spec = RUNGS[rung];
  if (!spec) {
    console.error(`--rung must be 1-6 (see FACT-CHECKING-GUIDE.md section 2). Got "${rung}".`);
    process.exit(1);
  }
  // A rung 1-3 verification is a claim that someone reached a primary or
  // official source. Requiring the URL makes that claim checkable by the next
  // person, which is the difference between a record and an assertion.
  if (spec.verified && !evidence) {
    console.error(`Rung ${rung} marks the row Human-verified, so --evidence <url> is required.`);
    process.exit(1);
  }

  const matches = rows.filter((r) =>
    plain(r.properties['Company / Project']).toLowerCase().includes(query.toLowerCase()),
  );
  if (matches.length === 0) {
    console.error(`No row matching "${query}".`);
    process.exit(1);
  }
  if (matches.length > 1) {
    console.error(`"${query}" matches ${matches.length} rows — be more specific:`);
    for (const m of matches) console.error(`   - ${plain(m.properties['Company / Project'])}`);
    process.exit(1);
  }

  const row = matches[0];
  const name = plain(row.properties['Company / Project']);
  const today = new Date().toISOString().slice(0, 10);
  const confidence = arg('confidence') ? Number(arg('confidence')) : spec.confidence;

  // Notes are append-only (METHODOLOGY.md: "notes are append-only with dates, so
  // the state of knowledge at any time is reconstructable"). Never overwrite.
  const existing = plain(row.properties['Notes']);
  const line =
    `Verified ${today} (${by}): rung ${rung} — ${spec.label.split('— ')[1]}.` +
    (note ? ` ${note}.` : '') +
    (evidence ? ` Source: ${evidence}` : '');
  const notes = existing ? `${existing} || ${line}` : line;

  const props: Record<string, unknown> = {
    'Classified by': { select: { name: spec.verified ? 'Human-verified' : 'Human' } },
    Confidence: { number: confidence },
    'Verified by': { rich_text: [{ text: { content: by } }] },
    'Verified date': { date: { start: today } },
    'Evidence rung': { select: { name: spec.label } },
    Notes: { rich_text: [{ text: { content: notes.slice(0, 1990) } }] },
  };
  if (evidence) props.Source = { url: evidence };

  console.log(`\nRow:            ${name}`);
  console.log(`Classified by:  ${sel(row.properties['Classified by']) ?? 'blank'} -> ${spec.verified ? 'Human-verified' : 'Human'}`);
  console.log(`Confidence:     ${num(row.properties['Confidence']) ?? 'blank'} -> ${confidence}`);
  console.log(`Evidence rung:  ${spec.label}`);
  console.log(`Note appended:  ${line}`);
  if (!spec.verified) {
    console.log(`\nNOTE: rung ${rung} is below the quotable threshold. The row is marked Human,`);
    console.log('      NOT Human-verified. Reach a register or primary document to clear it.');
  }

  if (flag('dry-run')) {
    console.log('\n--dry-run: nothing written.');
    return;
  }
  const res = await fetch(`${API}/pages/${row.id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ properties: props }),
  });
  if (!res.ok) throw new Error(`Write failed (${res.status}): ${await res.text()}`);
  console.log('\nWritten.');
}

async function main() {
  const rows = await allRows();
  if (flag('status')) return showStatus(rows);
  if (flag('queue')) return showQueue(rows);
  return record(rows);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
