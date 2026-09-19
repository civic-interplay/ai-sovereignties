// Disclosure audit — the deterministic half, run over a stored document.
//
// This implements steps 2–5 of PRE-REGISTRATION.md §"The check", and nothing
// else. Those steps are deterministic over a fixed artifact: anyone holding the
// same PDF must get the same answer from this tool, which is the property that
// makes a pre-registered negative finding worth anything.
//
// What this tool does NOT do is decide. The protocol says agents orchestrate
// the work and do not adjudicate it, so every term hit comes out with its page
// and its surrounding text and an explicitly UNCLASSIFIED verdict, waiting for
// a person. A hit is only disclosure once someone has said so and signed for
// it.
//
// The record it writes is shaped as REGISTER.md's Document + Disclosure, so the
// sweep's output migrates into the register rather than being re-entered.
//
// Usage:
//   tsx pipeline/audit.ts --pdf docs/disclosure-audit/x.pdf \
//       --site "Western Downs Digital Park — Dalby" \
//       --instrument "MCU-2025-1234" --jurisdiction QLD \
//       --url https://… --retrieved 2026-09-19
//   tsx pipeline/audit.ts --recheck docs/disclosure-audit/records/x.json

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

// ---- The frozen term list -------------------------------------------------
//
// Frozen by PRE-REGISTRATION.md and NOT to be edited. Adding a term mid-sweep
// would mean the record set was searched with a list chosen after seeing some
// of the answers, which is the exact failure pre-registration exists to
// prevent. If it must change, that is a version 2 of the protocol with its own
// date and reason, and the sweep restarts under it.
export const FROZEN_TERMS = [
  'MW', 'megawatt', 'load', 'demand', 'kWh', 'MWh', 'PUE', 'WUE',
  'water', 'litres', 'ML', 'kL', 'm3', 'm³', 'cooling', 'evaporative',
  'potable', 'recycled',
] as const;

// Case-sensitive for the unit abbreviations, because "ML" is a unit and "ml"
// inside a word is not, and "MW" must not match "mw" in a filename.
const CASE_SENSITIVE = new Set(['MW', 'MWh', 'ML', 'kL', 'kWh', 'PUE', 'WUE']);

export type Classification =
  | 'UNCLASSIFIED'      // deterministic output; awaiting a human
  | 'OPERATIONAL'       // operational demand — this is what counts as disclosure
  | 'CONSTRUCTION'      // construction, stormwater, drainage, fire service
  | 'NOT-APPLICABLE';   // the string matched something unrelated (a name, an address)

export type Grade =
  | 'CONDITIONED-NUMERIC'
  | 'CONDITIONED-GENERIC'
  | 'EIS-ONLY'
  | 'NOT-ACCESSIBLE'
  | 'UNGRADED';

export interface Hit {
  term: string;
  page: number;
  context: string;           // the line the term appears in, trimmed
  classification: Classification;
  classifiedBy?: string;     // initials — a person, per the protocol
  classifiedDate?: string;
}

export interface AuditRecord {
  // --- Document (REGISTER.md entity 3) ---
  site: string;
  instrument: string;
  jurisdiction: string;
  docType: string;
  sourceUrl: string;
  retrieved: string;
  localCopy: string;
  sha256: string;            // so a re-run can prove it read the same artifact
  pagesSearched: number;
  accessStatus:
    | 'Public'
    | 'Public, script-blocked'
    | 'Redacted'
    | 'Removed from site'
    | 'Never public';
  extraction: 'pdftotext' | 'page-scan-only' | 'other';

  // --- The check (PRE-REGISTRATION §The check, steps 3–5) ---
  termsSearched: readonly string[];
  // Count per term, reported even when zero — "especially when it is zero".
  hitCounts: Record<string, number>;
  hits: Hit[];

  // --- Disclosure (REGISTER.md entity 4), filled after classification ---
  grade: Grade;
  gradedBy?: string;
  gradedDate?: string;
  notes?: string;

  // --- Provenance of this record itself ---
  toolVersion: string;
  scannedAt: string;
}

const TOOL_VERSION = 'audit.ts/1.0.0';

function sha256(path: string): string {
  return execFileSync('shasum', ['-a', '256', path], { encoding: 'utf8' }).split(/\s+/)[0];
}

/** Extract text with page markers. pdftotext emits \f between pages. */
function extractPages(pdf: string): string[] {
  const txt = execFileSync('pdftotext', ['-layout', pdf, '-'], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  return txt.split('\f');
}

/**
 * Count and locate every frozen term. Deterministic: same PDF, same output.
 *
 * Word-boundary matched so `ML` does not fire inside `HTML` and `load` does not
 * fire inside `download` — an inflated hit count is worse than none, because it
 * buries the real hits under noise a human then has to clear.
 */
export function scanPages(pages: string[]): { hitCounts: Record<string, number>; hits: Hit[] } {
  const hitCounts: Record<string, number> = {};
  const hits: Hit[] = [];
  for (const term of FROZEN_TERMS) hitCounts[term] = 0;

  pages.forEach((pageText, i) => {
    const lines = pageText.split('\n');
    for (const term of FROZEN_TERMS) {
      const flags = CASE_SENSITIVE.has(term) ? 'g' : 'gi';
      const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // \b is unreliable next to ³ and digits, so bound on non-letter instead.
      const re = new RegExp(`(?<![A-Za-z])${esc}(?![A-Za-z])`, flags);
      for (const line of lines) {
        const matches = line.match(re);
        if (!matches) continue;
        hitCounts[term] += matches.length;
        hits.push({
          term,
          page: i + 1,
          context: line.trim().replace(/\s+/g, ' ').slice(0, 300),
          classification: 'UNCLASSIFIED',
        });
      }
    }
  });
  return { hitCounts, hits };
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const RECORDS_DIR = 'docs/disclosure-audit/records';

/**
 * Adjudication pass. Separate entry point on purpose: scanning is deterministic
 * and repeatable, classifying is a judgement that has to carry a name and a
 * date. Nothing here can run without --by.
 *
 *   --classify "1-13=CONSTRUCTION"   ranges or single indices, comma-separated
 *   --grade CONDITIONED-GENERIC      the four-level ladder, or NOT-ACCESSIBLE
 */
function adjudicate(recordPath: string) {
  const by = arg('by');
  if (!by) {
    console.error('--by <initials> is required: a classification has to be signed.');
    process.exit(1);
  }
  const rec = JSON.parse(readFileSync(recordPath, 'utf8')) as AuditRecord;
  const today = new Date().toISOString().slice(0, 10);

  const spec = arg('classify');
  if (spec) {
    for (const part of spec.split(',')) {
      const [range, verdict] = part.split('=').map((x) => x.trim());
      const valid: Classification[] = ['OPERATIONAL', 'CONSTRUCTION', 'NOT-APPLICABLE', 'UNCLASSIFIED'];
      if (!valid.includes(verdict as Classification)) {
        console.error(`Not a classification: "${verdict}". Use ${valid.join(' / ')}.`);
        process.exit(1);
      }
      const [lo, hi] = range.includes('-')
        ? range.split('-').map((n) => Number(n))
        : [Number(range), Number(range)];
      for (let i = lo; i <= hi; i++) {
        const h = rec.hits[i - 1];
        if (!h) continue;
        h.classification = verdict as Classification;
        h.classifiedBy = by;
        h.classifiedDate = today;
      }
    }
  }

  const grade = arg('grade');
  if (grade) {
    rec.grade = grade as Grade;
    rec.gradedBy = by;
    rec.gradedDate = today;
  }
  const notes = arg('notes');
  if (notes) rec.notes = notes;

  writeFileSync(recordPath, JSON.stringify(rec, null, 2) + '\n');

  const unclassified = rec.hits.filter((h) => h.classification === 'UNCLASSIFIED').length;
  const operational = rec.hits.filter((h) => h.classification === 'OPERATIONAL').length;
  console.log(`${recordPath}`);
  console.log(`  grade: ${rec.grade}${rec.gradedBy ? ` (${rec.gradedBy}, ${rec.gradedDate})` : ''}`);
  console.log(`  ${operational} operational, ${rec.hits.length - unclassified - operational} not disclosure, ${unclassified} still unclassified`);
  if (unclassified) console.log('  NOT FINISHED — every hit must be classified before this record supports a claim.');
  else if (operational === 0) {
    console.log('  Every hit classified, none operational: this document discloses nothing');
    console.log('  on the frozen term list. That is a finding, and it is now reproducible.');
  }
}

function main() {
  const recordPath = arg('record');
  if (recordPath) return adjudicate(recordPath);

  const pdf = arg('pdf');
  if (!pdf) {
    console.error(
      'Usage: tsx pipeline/audit.ts --pdf <file> --site <name> --instrument <id> \\\n' +
      '         --jurisdiction <QLD|NT|…> --url <source> [--retrieved YYYY-MM-DD]\n' +
      '         [--doc-type "Delegate report"] [--access Public]\n\n' +
      'Writes a protocol-shaped record to ' + RECORDS_DIR + '/.\n' +
      'Every hit lands UNCLASSIFIED: a person classifies and grades, not this tool.',
    );
    process.exit(1);
  }
  if (!existsSync(pdf)) {
    console.error(`No such file: ${pdf}`);
    process.exit(1);
  }

  const pages = extractPages(pdf);
  const textLength = pages.join('').replace(/\s/g, '').length;

  // A page-scan-only PDF yields almost no text. That is a RESULT under the
  // protocol — NOT-ACCESSIBLE — not a failure to be retried or worked around.
  const scanOnly = textLength < 200;

  const { hitCounts, hits } = scanPages(pages);

  const record: AuditRecord = {
    site: arg('site') ?? '',
    instrument: arg('instrument') ?? '',
    jurisdiction: arg('jurisdiction') ?? '',
    docType: arg('doc-type') ?? '',
    sourceUrl: arg('url') ?? '',
    retrieved: arg('retrieved') ?? new Date().toISOString().slice(0, 10),
    localCopy: pdf,
    sha256: sha256(pdf),
    pagesSearched: pages.length,
    accessStatus: (arg('access') as AuditRecord['accessStatus']) ?? 'Public',
    extraction: scanOnly ? 'page-scan-only' : 'pdftotext',
    termsSearched: FROZEN_TERMS,
    hitCounts,
    hits,
    grade: scanOnly ? 'NOT-ACCESSIBLE' : 'UNGRADED',
    toolVersion: TOOL_VERSION,
    scannedAt: new Date().toISOString(),
  };

  mkdirSync(RECORDS_DIR, { recursive: true });
  const out = join(RECORDS_DIR, basename(pdf).replace(/\.pdf$/i, '') + '.json');
  writeFileSync(out, JSON.stringify(record, null, 2) + '\n');

  // --- Report ---
  console.log(`${pdf}`);
  console.log(`  ${record.pagesSearched} pages, sha256 ${record.sha256.slice(0, 12)}…`);
  if (scanOnly) {
    console.log('  PAGE-SCAN ONLY — no extractable text. Graded NOT-ACCESSIBLE.');
    console.log('  This is a result, not a gap: record it and say so.');
  }
  console.log('\n  Term counts (zeros are the point):');
  for (const t of FROZEN_TERMS) {
    const n = hitCounts[t];
    console.log(`    ${t.padEnd(12)} ${String(n).padStart(4)}${n === 0 ? '   ← zero' : ''}`);
  }
  const total = Object.values(hitCounts).reduce((a, b) => a + b, 0);
  console.log(`\n  ${total} hit(s) across ${hits.length} line(s), all UNCLASSIFIED.`);
  console.log(`  Written to ${out}`);
  console.log('\n  Next: classify each hit OPERATIONAL / CONSTRUCTION / NOT-APPLICABLE,');
  console.log('  then grade the record and sign it. The protocol does not let this');
  console.log('  tool do either.');
}

if (process.argv[1] && import.meta.url.endsWith(basename(process.argv[1]))) {
  main();
}
