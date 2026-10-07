// Server-rendered SVG charts for /trends. No chart library: the sheets are
// server components fetched live from Notion, and these charts are small
// enough that plain SVG keeps them in the same render with no client bundle.
//
// Conventions (from the project's dataviz method):
//   - bars at most 18px thick, 4px rounded data-end, square at the baseline
//   - a 2px surface gap between stacked segments, never a stroke around them
//   - text in ink tokens, never the series colour; identity sits in swatches
//   - every mark carries a data-tip (value|label), shown by ChartFrame on hover,
//     tap or keyboard focus, and an aria-label; every chart also has a table
//     view beneath it, so nothing is hover-only
//   - palette from the Civic Interplay brand, validated all-pairs on #ffffff:
//     purple #7D50BD / terracotta #D16D54 / teal-blue #1f8aa8 pass every
//     check (worst CVD ΔE 9.4, normal-vision 18.3, all >= 3:1). The brand's
//     periwinkle and forest failed (too light / too grey), so the third slot
//     is a deeper teal-blue that sits between them

import type { ReactNode } from 'react';
import ChartFrame from './ChartFrame';

// Props that make an SVG mark interactive: tooltip, focusable, labelled.
function tip(value: string, label: string) {
  return { 'data-tip': `${value}|${label}`, tabIndex: 0, 'aria-label': `${label}: ${value}` } as const;
}

export const SERIES = {
  operating: '#7D50BD', // brand purple
  pipeline: '#D16D54', // brand terracotta
  notProceeding: '#1f8aa8', // deep teal-blue (validated third slot)
  muted: '#d8d0c4', // sand-tinted neutral: "not recorded"
  forest: '#454E41', // brand forest: context categories
  track: '#efebe4',
};

const INK = '#2b312e';
const MID = '#525b56';
const DIM = '#5f6a64';
const GRID = '#e3e6e1';
const SURFACE = '#ffffff';
const BAR = 18;

// A bar rect with only its data-end (right) corners rounded.
function barPath(x: number, y: number, w: number, h: number, round: boolean): string {
  if (w <= 0) return '';
  const r = round ? Math.min(4, w / 2, h / 2) : 0;
  return `M${x},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} H${x} Z`;
}

export type Key = { key: string; label: string; color: string };

export function Legend({ keys }: { keys: Key[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: 11.5, color: MID, margin: '2px 0 10px' }}>
      {keys.map((k) => (
        <span key={k.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span aria-hidden style={{ width: 10, height: 10, borderRadius: 2, background: k.color }} />
          {k.label}
        </span>
      ))}
    </div>
  );
}

// Horizontal stacked bars, one per row, scaled to the largest row total.
export function StackedBars({
  rows,
  keys,
  labelWidth = 150,
  unit = '',
}: {
  rows: { label: string; values: Record<string, number>; note?: string }[];
  keys: Key[];
  labelWidth?: number;
  unit?: string;
}) {
  const W = 900;
  const plotW = W - labelWidth - 70;
  const rowH = 32;
  const H = rows.length * rowH + 4;
  const max = Math.max(1, ...rows.map((r) => keys.reduce((s, k) => s + (r.values[k.key] ?? 0), 0)));
  return (
    <ChartFrame>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="group" style={{ display: 'block', overflow: 'visible' }}>
      {rows.map((r, i) => {
        const y = i * rowH + (rowH - BAR) / 2;
        const total = keys.reduce((s, k) => s + (r.values[k.key] ?? 0), 0);
        let x = labelWidth;
        const present = keys.filter((k) => (r.values[k.key] ?? 0) > 0);
        return (
          <g key={r.label}>
            <text x={labelWidth - 10} y={y + BAR / 2 + 4} textAnchor="end" fontSize={12.5} fill={INK}>
              {r.label}
            </text>
            {present.map((k, j) => {
              const v = r.values[k.key] ?? 0;
              const full = (v / max) * plotW;
              const last = j === present.length - 1;
              const w = Math.max(1, full - (last ? 0 : 2));
              const d = barPath(x, y, w, BAR, last);
              x += full;
              return (
                <path key={k.key} d={d} fill={k.color} {...tip(`${v.toLocaleString('en-AU')}${unit}`, `${r.label} · ${k.label}`)} />
              );
            })}
            <text x={labelWidth + (total / max) * plotW + 8} y={y + BAR / 2 + 4} fontSize={12} fill={MID}>
              {total.toLocaleString('en-AU')}
              {unit}
              {r.note ? <tspan fill={DIM}>{`  ${r.note}`}</tspan> : null}
            </text>
          </g>
        );
      })}
    </svg>
    </ChartFrame>
  );
}

// One bar per row on a fixed 0–100% track, labelled "n of N".
export function PercentBars({
  rows,
  color,
  labelWidth = 150,
}: {
  rows: { label: string; count: number; total: number }[];
  color: string;
  labelWidth?: number;
}) {
  const W = 900;
  const plotW = W - labelWidth - 120;
  const rowH = 32;
  const H = rows.length * rowH + 22;
  return (
    <ChartFrame>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="group" style={{ display: 'block', overflow: 'visible' }}>
      {[0, 25, 50, 75, 100].map((t) => {
        const x = labelWidth + (t / 100) * plotW;
        return (
          <g key={t}>
            <line x1={x} x2={x} y1={0} y2={H - 18} stroke={GRID} strokeWidth={1} />
            <text x={x} y={H - 4} textAnchor="middle" fontSize={10.5} fill={DIM}>
              {t}%
            </text>
          </g>
        );
      })}
      {rows.map((r, i) => {
        const y = i * rowH + (rowH - BAR) / 2;
        const pct = r.total ? (r.count / r.total) * 100 : 0;
        const w = (pct / 100) * plotW;
        return (
          <g key={r.label}>
            <text x={labelWidth - 10} y={y + BAR / 2 + 4} textAnchor="end" fontSize={12.5} fill={INK}>
              {r.label}
            </text>
            <path
              d={barPath(labelWidth, y, Math.max(w, r.count ? 2 : 0), BAR, true)}
              fill={color}
              {...tip(`${pct.toFixed(0)}%`, `${r.label} · ${r.count} of ${r.total} sites`)}
            />
            <text x={labelWidth + w + 8} y={y + BAR / 2 + 4} fontSize={12} fill={MID}>
              {pct.toFixed(0)}%<tspan fill={DIM}>{`  ${r.count} of ${r.total}`}</tspan>
            </text>
          </g>
        );
      })}
    </svg>
    </ChartFrame>
  );
}

// Two bars per row (operating, pipeline), each labelled with its value and
// the number of sites that value rests on.
export function PairedBars({
  rows,
  keys,
  labelWidth = 150,
  unit = '',
  fixedMax,
}: {
  rows: { label: string; a: number; an: number; aOf: number; b: number; bn: number; bOf: number }[];
  keys: [Key, Key];
  labelWidth?: number;
  unit?: string;
  fixedMax?: number; // e.g. 100 for percentages
}) {
  const W = 900;
  const plotW = W - labelWidth - 170;
  const pair = BAR * 2 + 4;
  const rowH = pair + 16;
  const H = rows.length * rowH;
  const max = fixedMax ?? Math.max(1, ...rows.flatMap((r) => [r.a, r.b]));
  const bar = (r: (typeof rows)[number], which: 'a' | 'b', y: number) => {
    const v = which === 'a' ? r.a : r.b;
    const n = which === 'a' ? r.an : r.bn;
    const of = which === 'a' ? r.aOf : r.bOf;
    const k = which === 'a' ? keys[0] : keys[1];
    const w = (v / max) * plotW;
    return (
      <g>
        {v > 0 && (
          <path
            d={barPath(labelWidth, y, Math.max(w, 2), BAR, true)}
            fill={k.color}
            {...tip(`${v.toLocaleString('en-AU')}${unit}`, `${r.label} · ${k.label} · from ${n} of ${of} sites`)}
          />
        )}
        <text x={labelWidth + (v > 0 ? w : 0) + 8} y={y + BAR / 2 + 4} fontSize={11.5} fill={MID}>
          {of === 0 ? 'no sites at this stage' : v > 0 || fixedMax ? `${v.toLocaleString('en-AU')}${unit}` : 'no figure published'}
          {of > 0 && <tspan fill={DIM}>{`  ${n} of ${of} sites`}</tspan>}
        </text>
      </g>
    );
  };
  return (
    <ChartFrame>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="group" style={{ display: 'block', overflow: 'visible' }}>
      {rows.map((r, i) => {
        const y = i * rowH + 6;
        return (
          <g key={r.label}>
            <text x={labelWidth - 10} y={y + pair / 2 + 4} textAnchor="end" fontSize={12.5} fill={INK}>
              {r.label}
            </text>
            {bar(r, 'a', y)}
            {bar(r, 'b', y + BAR + 4)}
          </g>
        );
      })}
    </svg>
    </ChartFrame>
  );
}

// Cumulative line by month, with labelled event ticks on the time axis.
export function CumulativeLine({
  points,
  events,
  color,
  unit,
}: {
  points: { month: string; added: number; total: number }[];
  events: { date: string; label: string }[];
  color: string;
  unit: string;
}) {
  const W = 900;
  const H = 260;
  const L = 44;
  const R = 20;
  const T = 16;
  const B = 64;
  const plotW = W - L - R;
  const plotH = H - T - B;
  const max = Math.max(1, ...points.map((p) => p.total));
  const step = max > 100 ? 50 : max > 40 ? 20 : 10;
  const top = Math.ceil(max / step) * step;
  const n = points.length;
  const xOf = (i: number) => L + (n > 1 ? (i / (n - 1)) * plotW : plotW / 2);
  const yOf = (v: number) => T + plotH - (v / top) * plotH;
  // Event dates sit inside their month, proportionally.
  const xOfDate = (d: string) => {
    const m = d.slice(0, 7);
    const i = points.findIndex((p) => p.month === m);
    if (i < 0) return null;
    const day = Number(d.slice(8, 10));
    const frac = (day - 1) / 31;
    const next = i < n - 1 ? xOf(i + 1) : xOf(i) + plotW / Math.max(1, n - 1);
    return xOf(i) + (next - xOf(i)) * frac;
  };
  const mon = (m: string, first = false) =>
    new Date(m + '-01T00:00:00Z').toLocaleDateString('en-AU', { month: 'short', timeZone: 'UTC' }) +
    (first || m.endsWith('-01') ? ` ${m.slice(0, 4)}` : '');
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${xOf(i)},${yOf(p.total)}`).join(' ');
  const ticks: number[] = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);
  return (
    <ChartFrame>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="group" style={{ display: 'block', overflow: 'visible' }}>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={yOf(v)} y2={yOf(v)} stroke={GRID} strokeWidth={1} />
          <text x={L - 8} y={yOf(v) + 4} textAnchor="end" fontSize={10.5} fill={DIM}>
            {v}
          </text>
        </g>
      ))}
      <path d={`${d} L${xOf(n - 1)},${yOf(0)} L${xOf(0)},${yOf(0)} Z`} fill={color} opacity={0.1} />
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={p.month}>
          <circle cx={xOf(i)} cy={yOf(p.total)} r={12} fill="transparent" {...tip(`${p.total} ${unit}`, `${mon(p.month, true)} · ${p.added} logged that month`)} />
          <circle cx={xOf(i)} cy={yOf(p.total)} r={4} fill={color} stroke={SURFACE} strokeWidth={2} pointerEvents="none" />
          <text x={xOf(i)} y={T + plotH + 16} textAnchor="middle" fontSize={10.5} fill={DIM}>
            {mon(p.month, i === 0)}
          </text>
        </g>
      ))}
      <text x={xOf(n - 1)} y={yOf(points[n - 1]?.total ?? 0) - 10} textAnchor="end" fontSize={12} fill={INK}>
        {points[n - 1]?.total ?? 0}
      </text>
      {events.map((e, i) => {
        const x = xOfDate(e.date);
        if (x === null) return null;
        return (
          <g key={e.date}>
            <line x1={x} x2={x} y1={T + plotH + 22} y2={T + plotH + 30} stroke={INK} strokeWidth={1.5} />
            <circle cx={x} cy={T + plotH + 26} r={10} fill="transparent" {...tip(e.date, `Snapshot · ${e.label}`)} />
            {i === 0 && (
              <text x={x - 4} y={T + plotH + 44} textAnchor="end" fontSize={10.5} fill={MID}>
                snapshots ▸
              </text>
            )}
          </g>
        );
      })}
    </svg>
    </ChartFrame>
  );
}

// One row per site: a dot at announcement, a dot at approval, joined.
export function Dumbbell({
  rows,
  colorA,
  colorB,
  labelWidth = 260,
}: {
  rows: { label: string; a: string; b: string }[];
  colorA: string;
  colorB: string;
  labelWidth?: number;
}) {
  const W = 900;
  const plotW = W - labelWidth - 90;
  const rowH = 30;
  const H = rows.length * rowH + 24;
  const ts = rows.flatMap((r) => [Date.parse(r.a), Date.parse(r.b)]);
  const lo = new Date(Math.min(...ts));
  const hi = new Date(Math.max(...ts));
  const y0 = lo.getUTCFullYear();
  const y1 = hi.getUTCFullYear() + 1;
  const t0 = Date.UTC(y0, 0, 1);
  const t1 = Date.UTC(y1, 0, 1);
  const xOf = (s: string) => labelWidth + ((Date.parse(s) - t0) / (t1 - t0)) * plotW;
  const years: number[] = [];
  for (let y = y0; y <= y1; y++) years.push(y);
  const months = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / (30.44 * 86400000));
  return (
    <ChartFrame>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="group" style={{ display: 'block', overflow: 'visible' }}>
      {years.map((y) => {
        const x = labelWidth + ((Date.UTC(y, 0, 1) - t0) / (t1 - t0)) * plotW;
        return (
          <g key={y}>
            <line x1={x} x2={x} y1={0} y2={H - 20} stroke={GRID} strokeWidth={1} />
            <text x={x} y={H - 6} textAnchor="middle" fontSize={10.5} fill={DIM}>
              {y}
            </text>
          </g>
        );
      })}
      {rows.map((r, i) => {
        const y = i * rowH + rowH / 2;
        const xa = xOf(r.a);
        const xb = xOf(r.b);
        const m = months(r.a, r.b);
        return (
          <g key={r.label}>
            <text x={labelWidth - 10} y={y + 4} textAnchor="end" fontSize={12} fill={INK}>
              {r.label}
            </text>
            <line x1={xa} x2={xb} y1={y} y2={y} stroke={MID} strokeWidth={2} />
            <circle cx={xa} cy={y} r={5} fill={colorA} stroke={SURFACE} strokeWidth={2} pointerEvents="none" />
            <circle cx={xb} cy={y} r={5} fill={colorB} stroke={SURFACE} strokeWidth={2} pointerEvents="none" />
            <circle cx={xa} cy={y} r={12} fill="transparent" {...tip(`Announced ${r.a}`, r.label)} />
            <circle cx={xb} cy={y} r={12} fill="transparent" {...tip(`Approved ${r.b}`, `${r.label} · ${m} months after announcement`)} />
            <text x={Math.max(xa, xb) + 10} y={y + 4} fontSize={11.5} fill={MID}>
              {m === 0 ? 'same month' : m > 0 ? `${m} mo` : `approved ${-m} mo before announced`}
            </text>
          </g>
        );
      })}
    </svg>
    </ChartFrame>
  );
}

// A collapsed table under each chart: the values without hovering.
// CSV for a table, quoted so commas and quotes in names survive.
function toCSV(head: string[], rows: (string | number)[][]): string {
  const q = (v: string | number) => {
    const t = String(v);
    return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  return [head, ...rows].map((r) => r.map(q).join(',')).join('\n') + '\n';
}

export function TableView({ head, rows, csv }: { head: string[]; rows: (string | number)[][]; csv?: string }) {
  return (
    <details style={{ marginTop: 8, fontSize: 12, color: MID }}>
      <summary style={{ cursor: 'pointer', color: DIM }}>
        Show as table
        {csv && (
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(toCSV(head, rows))}`}
            download={`${csv}.csv`}
            style={{ marginLeft: 14, color: '#3f4aa8', textDecoration: 'none' }}
          >
            Download CSV ↓
          </a>
        )}
      </summary>
      <table style={{ borderCollapse: 'collapse', marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} style={{ textAlign: 'left', padding: '4px 12px 4px 0', color: DIM, fontWeight: 500, borderBottom: `1px solid ${GRID}` }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} style={{ padding: '4px 12px 4px 0', color: INK, borderBottom: `1px solid ${GRID}` }}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

export function ChartNote({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 12, color: DIM, lineHeight: 1.6, margin: '8px 0 0', maxWidth: 760 }}>{children}</p>;
}
