// Build a time series from the committed dataset snapshots, for the charts on
// /trends.
//
// export-zenodo.ts writes zenodo/sites.csv and zenodo/contestation_items.csv,
// and the pipeline commits them on every run. Each commit is a dated snapshot of
// the public record. This script reads every committed version of those two
// files, counts the same things in each, and writes src/data/series.json.
//
// Each point is computed from the files as they were committed. Nothing is
// recomputed with today's rules: if a row was later corrected, the earlier point
// still shows what the record said then.
//
// If the working copy of zenodo/sites.csv differs from the last commit (as it
// does in CI, after export and before the commit step), it is added as today's
// point.
//
// Usage:
//   tsx pipeline/build-series.ts            # write src/data/series.json
//   tsx pipeline/build-series.ts --print    # print the series, write nothing

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const SITES = 'zenodo/sites.csv';
const ITEMS = 'zenodo/contestation_items.csv';
const OUT = 'src/data/series.json';

// The same stage groupings as src/app/trends/page.tsx. Keep the two in step.
const OPERATING = new Set(['Producing']);
const PIPELINE = new Set(['Under Construction', 'Approved / permitted', 'Application lodged', 'Before the Minister', 'Feasibility', 'Exploration']);

export type SeriesPoint = {
  date: string;
  commit: string;
  dataCentres: number; // reviewed data-centre rows
  operating: number;
  pipeline: number;
  withMw: number; // data centres with a capacity figure
  mwOperating: number;
  mwPipeline: number;
  proposedSites: number; // [PROPOSED] rows awaiting review
  newsItems: number;
  newsHumanChecked: number;
};

// Minimal RFC 4180 parser: quoted fields, doubled quotes, newlines in quotes.
function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}

const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const show = (commit: string, path: string) => {
  try { return git('show', `${commit}:${path}`); } catch { return null; }
};

function measure(date: string, commit: string, sitesCsv: string, itemsCsv: string | null): SeriesPoint {
  const sites = parseCSV(sitesCsv);
  const proposed = sites.filter((r) => r.name.startsWith('[PROPOSED]'));
  const reviewed = sites.filter((r) => !r.name.startsWith('[PROPOSED]') && !r.name.startsWith('[REJECTED]'));
  const dc = reviewed.filter((r) => r.infrastructure_type === 'Data Centre');
  const mw = (r: Record<string, string>) => Number(r.capacity_mw) || 0;
  const op = dc.filter((r) => OPERATING.has(r.status));
  const pipe = dc.filter((r) => PIPELINE.has(r.status));
  const items = itemsCsv ? parseCSV(itemsCsv) : [];
  return {
    date,
    commit,
    dataCentres: dc.length,
    operating: op.length,
    pipeline: pipe.length,
    withMw: dc.filter((r) => mw(r) > 0).length,
    mwOperating: Math.round(op.reduce((s, r) => s + mw(r), 0)),
    mwPipeline: Math.round(pipe.reduce((s, r) => s + mw(r), 0)),
    proposedSites: proposed.length,
    newsItems: items.length,
    newsHumanChecked: items.filter((r) => r.classified_by.startsWith('Human')).length,
  };
}

const log = git('log', '--reverse', '--format=%H %ad', '--date=short', '--', SITES).trim().split('\n').filter(Boolean);
const byDate = new Map<string, SeriesPoint>();
for (const line of log) {
  const [commit, date] = line.split(' ');
  const sites = show(commit, SITES);
  if (!sites) continue; // the commit that deleted or renamed the file
  byDate.set(date, measure(date, commit.slice(0, 7), sites, show(commit, ITEMS))); // last commit of a day wins
}

// Today's export, before it is committed.
const head = show('HEAD', SITES);
if (existsSync(SITES)) {
  const working = readFileSync(SITES, 'utf8');
  if (working !== head) {
    const today = new Date().toISOString().slice(0, 10);
    byDate.set(today, measure(today, 'working', working, existsSync(ITEMS) ? readFileSync(ITEMS, 'utf8') : null));
  }
}

const series = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
if (process.argv.includes('--print')) console.table(series);
else {
  writeFileSync(OUT, JSON.stringify(series, null, 2) + '\n');
  console.log(`${OUT}: ${series.length} snapshots, ${series[0]?.date} to ${series.at(-1)?.date}`);
}
