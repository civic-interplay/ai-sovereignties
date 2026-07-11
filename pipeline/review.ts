// Fortnightly QA self-review of the Critical Infrastructure Tracker.
//
// Reads the infra spine and reports rows that need a human eye before the data
// is trusted in print or on the public map. It writes NOTHING — it prints a
// Markdown report and, in CI, appends it to the GitHub Actions step summary.
//
// Usage:
//   tsx pipeline/review.ts              # print the report
//
// Checks (each row can raise several):
//   - unverified sourcing: Notes flag "SOURCE TO VERIFY" / "to confirm"
//   - low provenance:      Classified by = Agent/blank AND confidence low/blank
//   - foreclosure gap:     ministerial-pathway row with Public notice unconfirmed
//   - date gap:            Status "Approved / permitted" but no Approval date
//   - stale:               logged > STALE_DAYS ago and still in a non-terminal status
//   - capacity double-count: >1 row sharing a Campus group (surfaced, not an error)

import { REVIEW_THRESHOLD } from './config.ts';
import { getInfraRows, type InfraRow } from './lib/notion.ts';

const STALE_DAYS = 60;
const VERIFY_RE = /source to verify|to confirm|verify on|to be confirmed|pathway to confirm/i;
const MINISTERIAL_RE = /ministerial|fast-track/i;
const TERMINAL = new Set(['Producing', 'Withdrawn', 'Refused']);

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return null;
  return Math.round((Date.now() - then) / 86_400_000);
}

interface Finding {
  row: InfraRow;
  issues: string[];
}

function reviewRows(rows: InfraRow[]): { findings: Finding[]; dupes: Map<string, InfraRow[]> } {
  const findings: Finding[] = [];

  for (const r of rows) {
    const issues: string[] = [];

    if (VERIFY_RE.test(r.notes)) issues.push('sourcing marked "to verify" in Notes');

    const lowConf = r.confidence != null && r.confidence < REVIEW_THRESHOLD;
    const unverified = r.classifiedBy == null || r.classifiedBy === 'Agent';
    if (unverified && (lowConf || r.confidence == null)) {
      issues.push(
        `unverified (Classified by=${r.classifiedBy ?? 'blank'}, confidence=${r.confidence ?? 'blank'})`,
      );
    }

    const ministerial =
      MINISTERIAL_RE.test(r.planningPathway ?? '') ||
      r.governanceFlags.some((f) => MINISTERIAL_RE.test(f));
    if (ministerial && (r.publicNotice == null || r.publicNotice === 'Unknown')) {
      issues.push('ministerial pathway but Public notice not yet confirmed');
    }

    if (r.status === 'Approved / permitted' && !r.approvalDate) {
      issues.push('Status = Approved / permitted but no Approval date');
    }

    const age = daysSince(r.dateLogged);
    if (age != null && age > STALE_DAYS && r.status && !TERMINAL.has(r.status)) {
      issues.push(`stale (${age}d since logged, status=${r.status})`);
    }

    if (issues.length) findings.push({ row: r, issues });
  }

  // Campus groups with more than one member: not an error, but flag so capacity
  // is not summed twice across a campus family.
  const byCampus = new Map<string, InfraRow[]>();
  for (const r of rows) {
    if (!r.campusGroup) continue;
    const key = r.campusGroup.toLowerCase();
    const list = byCampus.get(key) ?? [];
    list.push(r);
    byCampus.set(key, list);
  }
  const dupes = new Map([...byCampus].filter(([, list]) => list.length > 1));

  return { findings, dupes };
}

function report(findings: Finding[], dupes: Map<string, InfraRow[]>, total: number): string {
  const lines: string[] = [];
  lines.push(`# Tracker review — ${findings.length} of ${total} rows need attention`);
  lines.push('');

  if (findings.length === 0) {
    lines.push('All rows verified. Nothing to review.');
  } else {
    for (const f of findings) {
      const where = f.row.state ? ` (${f.row.state})` : '';
      lines.push(`## ${f.row.name}${where}`);
      if (f.row.url) lines.push(f.row.url);
      for (const i of f.issues) lines.push(`- ${i}`);
      lines.push('');
    }
  }

  if (dupes.size) {
    lines.push('## Campus groups to check for capacity double-count');
    for (const [group, members] of dupes) {
      lines.push(`- **${group}**: ${members.map((m) => m.name).join('; ')}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

async function main() {
  const rows = await getInfraRows();
  const { findings, dupes } = reviewRows(rows);
  const md = report(findings, dupes, rows.length);
  console.log(md);

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    const { appendFileSync } = await import('node:fs');
    appendFileSync(summaryPath, md + '\n');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
