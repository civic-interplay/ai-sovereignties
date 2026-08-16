// Shared chrome for the summary data sheets — same dark field and Civic
// Interplay furniture as the map overlay panels.
import React from 'react';

export const CI_PERIWINKLE = '#8E9BDD';
const FIELD = '#0a0c0b';
// Same panel chrome as the map's section rail (see Map.tsx `panel`).
const PANEL_BORDER = '1px solid #3f4744';
const INK = '#c8cfc4';
const DIM = '#6b7568';
const MID = '#9aa39b';

export const ACCENT = {
  green: '#00e08a',
  red: '#ff4d6d',
  yellow: '#ffd23f',
  blue: '#3fa9ff',
  cyan: '#00ffcc',
};

export function SheetShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        // html/body are overflow:hidden for the map (see globals.css), so the
        // sheet provides its own scroll context.
        height: '100dvh',
        overflowY: 'auto',
        background: FIELD,
        color: INK,
        fontFamily: 'var(--font-fira), system-ui, sans-serif',
        padding: '32px 20px 64px',
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto' }}>{children}</div>
    </div>
  );
}

export function SheetNav({ current }: { current: string }) {
  const link = (href: string, text: string, active = false) => (
    <a
      key={href}
      href={href}
      style={{
        color: active ? INK : CI_PERIWINKLE,
        textDecoration: 'none',
        fontSize: 11,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        borderBottom: active ? `1px solid ${INK}` : 'none',
        paddingBottom: 2,
      }}
    >
      {text}
    </a>
  );
  return (
    <nav style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 28 }}>
      {link('/', '← Map')}
      {link('/sheets', 'Data sheets', current === 'sheets')}
      {link('/glossary', 'Glossary & methods', current === 'glossary')}
      {link('https://civicinterplay.io/data-centres-map/', 'About ↗')}
    </nav>
  );
}

export function SheetTitle({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <header style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: DIM }}>{kicker}</div>
      <h1 style={{ fontSize: 30, fontWeight: 600, margin: '6px 0 4px', color: '#fff' }}>{title}</h1>
      {sub && <p style={{ color: MID, fontSize: 13, lineHeight: 1.6, maxWidth: 640, margin: 0 }}>{sub}</p>}
    </header>
  );
}

export function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#121618', border: PANEL_BORDER, borderRadius: 12, padding: '16px 18px', ...style }}>
      {children}
    </div>
  );
}

export function Stat({ value, label: text, note }: { value: string; label: string; note?: string }) {
  return (
    <div style={{ minWidth: 120 }}>
      <div style={{ fontSize: 26, fontWeight: 600, color: '#fff' }}>{value}</div>
      <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: MID, marginTop: 2 }}>
        {text}
      </div>
      {note && <div style={{ fontSize: 10.5, color: DIM, marginTop: 2, lineHeight: 1.5 }}>{note}</div>}
    </div>
  );
}

export function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 12,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: DIM,
        margin: '34px 0 10px',
      }}
    >
      {children}
    </h2>
  );
}

// A labelled horizontal distribution bar, e.g. register or country splits.
export function BarRow({
  label: text,
  count,
  total,
  color,
  suffix,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  suffix?: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '5px 0', fontSize: 12 }}>
      <div style={{ width: 190, color: INK, flexShrink: 0 }}>{text}</div>
      <div style={{ flex: 1, background: '#1a1e1c', borderRadius: 3, height: 12, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, opacity: 0.85 }} />
      </div>
      <div style={{ width: 90, textAlign: 'right', color: MID, flexShrink: 0 }}>
        {count}
        {suffix ?? ''} · {pct.toFixed(0)}%
      </div>
    </div>
  );
}

export const td: React.CSSProperties = {
  padding: '7px 10px',
  borderBottom: '1px solid #1e2321',
  fontSize: 11.5,
  color: INK,
  verticalAlign: 'top',
  lineHeight: 1.5,
};
export const th: React.CSSProperties = {
  ...td,
  color: DIM,
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  textAlign: 'left',
  borderBottom: PANEL_BORDER,
};

export function Footnote({ children }: { children: React.ReactNode }) {
  return <p style={{ color: DIM, fontSize: 11, lineHeight: 1.7, maxWidth: 720 }}>{children}</p>;
}

export function fmtMW(v: number | null): string {
  return v === null ? '—' : `${v} MW`;
}
