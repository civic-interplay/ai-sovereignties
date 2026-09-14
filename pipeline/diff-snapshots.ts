// What changed in the public record between two snapshots.
//
// export-zenodo.ts freezes STATE. This reports CHANGE, which is the thing the
// project is actually about: not what operators and planning registers say
// today, but how that moves — a capacity figure that firms up or quietly halves,
// an investment number that differs by a factor of two between the press release
// and the development application, a water figure superseded when a cooling
// design is amended, a document that was public when we recorded it and is not
// public now.
//
// Any single snapshot records a claim. A series records whether the claim held.
//
// Changes are sorted into four kinds, because they mean different things:
//
//   DISCLOSURE GAINED   a blank field acquires a value — the record improved
//   DISCLOSURE LOST     a value goes blank — rarer, and more interesting
//   CLAIM MOVED         a value is replaced by a different value. This is the
//                       finding: someone's number changed, and the old one was
//                       published
//   LIFECYCLE           status advanced (proposed -> approved -> operating).
//                       Expected, so reported separately rather than as drift
//
// `notes` and `last_edited` are excluded: both change on every touch and would
// bury the signal.
//
// Usage:
//   tsx pipeline/diff-snapshots.ts                  # working zenodo/ vs last commit
//   tsx pipeline/diff-snapshots.ts --base <ref>     # vs another git ref
//   tsx pipeline/diff-snapshots.ts --out FILE       # write the report to a file
//
// Exit 0 always: "nothing changed" is a valid, publishable result.

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const SNAPSHOT = 'zenodo/sites.csv';

// Fields whose movement is worth reporting. Order is the report order.
const WATCHED = [
  'capacity_mw',
  'announced_investment_aud',
  'status',
  'planning_pathway',
  'accelerated_via',
  'public_notice',
  'water_risk',
  'energy_source',
  'resource_conditions',
  'operator',
  'parent',
  'ultimate_owner',
  'owner_type',
  'ownership_country',
  'sovereignty_register',
  'governance_flags',
  'community_concern',
  'approval_body',
  'approval_date',
  'announcement_date',
  'confidence',
  'classified_by',
  'source_url',
  'infrastructure_type',
  'state',
];

// Lifecycle progression is expected movement, not drift, so it is reported on
// its own rather than mixed in with claims that changed under a static status.
const LIFECYCLE_FIELD = 'status';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

// Minimal RFC4180 reader, matching the writer in export-zenodo.ts: fields may be
// quoted, quotes are doubled inside, and a quoted field may contain newlines.
function parseCsv(text: string): Array<Record<string, string>> {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { quoted = false; }
      } else field += c;
      continue;
    }
    if (c === '"') { quoted = true; continue; }
    if (c === ',') { row.push(field); field = ''; continue; }
    if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
      continue;
    }
    field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  if (rows.length === 0) return [];
  const header = rows[0];
  return rows.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

interface Change { id: string; name: string; field: string; from: string; to: string; }

function main() {
  if (!existsSync(SNAPSHOT)) {
    console.error(`No ${SNAPSHOT}. Run: npx tsx pipeline/export-zenodo.ts`);
    process.exit(1);
  }
  const base = arg('base') ?? 'HEAD';
  let baseText = '';
  try {
    baseText = execSync(`git show ${base}:${SNAPSHOT}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    console.log(`# Snapshot diff\n\nNo previous snapshot at \`${base}:${SNAPSHOT}\`.`);
    console.log('This is the first snapshot in the series; there is nothing to compare it against yet.');
    return;
  }

  const before = new Map(parseCsv(baseText).map((r) => [r.site_id, r]));
  const afterRows = parseCsv(readFileSync(SNAPSHOT, 'utf8'));
  const after = new Map(afterRows.map((r) => [r.site_id, r]));

  const added = afterRows.filter((r) => !before.has(r.site_id));
  const removed = [...before.values()].filter((r) => !after.has(r.site_id));

  const gained: Change[] = [];
  const lost: Change[] = [];
  const moved: Change[] = [];
  const lifecycle: Change[] = [];

  for (const [id, now] of after) {
    const was = before.get(id);
    if (!was) continue;
    for (const f of WATCHED) {
      const a = (was[f] ?? '').trim();
      const b = (now[f] ?? '').trim();
      if (a === b) continue;
      const c: Change = { id, name: now.name || was.name || id, field: f, from: a, to: b };
      if (f === LIFECYCLE_FIELD && a && b) lifecycle.push(c);
      else if (!a && b) gained.push(c);
      else if (a && !b) lost.push(c);
      else moved.push(c);
    }
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const L: string[] = [];
  L.push(`# Snapshot diff — ${stamp}`);
  L.push('');
  L.push(`Comparing the working \`${SNAPSHOT}\` against \`${base}\`.`);
  L.push(`${before.size} rows then, ${after.size} now.`);
  L.push('');
  L.push('| | Count |');
  L.push('|---|---:|');
  L.push(`| Sites added | ${added.length} |`);
  L.push(`| Sites removed | ${removed.length} |`);
  L.push(`| **Claims moved** | **${moved.length}** |`);
  L.push(`| Disclosure gained | ${gained.length} |`);
  L.push(`| Disclosure lost | ${lost.length} |`);
  L.push(`| Lifecycle advanced | ${lifecycle.length} |`);
  L.push('');

  const section = (title: string, rows: Change[], note?: string) => {
    if (!rows.length) return;
    L.push(`## ${title}`);
    if (note) { L.push(''); L.push(note); }
    L.push('');
    L.push('| Site | Field | Was | Now |');
    L.push('|---|---|---|---|');
    for (const c of rows) {
      const cut = (s: string) => (s.length > 60 ? s.slice(0, 57) + '…' : s) || '—';
      L.push(`| ${cut(c.name)} | \`${c.field}\` | ${cut(c.from)} | ${cut(c.to)} |`);
    }
    L.push('');
  };

  // Claims moved comes first: it is the only category where something that was
  // published turned out to be different, which is the project's subject.
  section('Claims moved', moved,
    'A value that was published has been replaced by a different one. Each of these is a case where the earlier figure was on the public record and is no longer what the record says.');
  section('Disclosure lost', lost,
    'A field that carried a value now carries none. Worth checking whether the source document is still retrievable.');
  section('Disclosure gained', gained);
  section('Lifecycle advanced', lifecycle);

  if (added.length) {
    L.push('## Sites added');
    L.push('');
    for (const r of added) L.push(`- ${r.name}${r.state ? ` (${r.state})` : ''}${r.capacity_mw ? ` — ${r.capacity_mw} MW` : ''}`);
    L.push('');
  }
  if (removed.length) {
    L.push('## Sites removed');
    L.push('');
    for (const r of removed) L.push(`- ${r.name}${r.state ? ` (${r.state})` : ''}`);
    L.push('');
  }
  if (!moved.length && !gained.length && !lost.length && !lifecycle.length && !added.length && !removed.length) {
    L.push('No watched field changed between these snapshots.');
    L.push('');
  }

  const report = L.join('\n');
  const out = arg('out');
  if (out) { writeFileSync(out, report); console.log(`Wrote ${out}`); }
  else console.log(report);
}

main();
