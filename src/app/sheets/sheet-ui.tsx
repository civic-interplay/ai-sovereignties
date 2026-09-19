// Shared chrome for the reading pages — data sheets, glossary and news feed.
//
// These pages read on a LIGHT field. The map keeps its dark field (it is a
// full-bleed data surface where luminous marks on black carry the meaning), but
// the reading pages are documents: policy readers print them, read them beside
// other documents, and read them for long stretches. Dark-on-light is the
// convention those readers already have, and the page no longer fights the
// white of everything around it.
//
// Every value below is measured against the field (#f6f7f5) or the panel
// (#ffffff), and the three-step type hierarchy deliberately mirrors the ratios
// the dark theme had, so the pages read the same way they did before:
//
//            dark theme          light theme
//   INK      11.42:1             12.36:1
//   MID       7.01:1              6.54:1
//   DIM       5.05:1              5.24:1
//   links     6.83:1              7.09:1
//
// WCAG 2.1 AA wants 4.5:1 for normal text; the muted steps are used at 10–11px
// where the large-text exemption does not apply, so they clear it on body
// terms with margin to survive rounding.
import React from 'react';

// The link periwinkle darkened to carry the same hue at 7.09:1. The original
// #8E9BDD measures 2.13:1 on a light field — fine on black, unreadable here.
export const CI_PERIWINKLE = '#3f4aa8';
const FIELD = '#f6f7f5';
const PANEL = '#ffffff';
// 2.00:1 against the field, mirroring the dark theme's 2.05:1 border. Panel and
// field sit 1.07:1 apart (the dark pair was 1.08:1), so the border, not the
// fill, is what groups a panel — which is why it is the stronger value.
const PANEL_BORDER = '1px solid #aab3ac';
// Headings and emphasised words. Replaces the hardcoded #fff of the dark theme.
const STRONG = '#0a0c0b';
const INK = '#2b312e';
const DIM = '#5f6a64';
const MID = '#525b56';
// Non-text furniture: table rules and the bar-chart track. Grouping only — no
// value is identified by these, so 1.4.11's 3:1 does not apply (the same
// reasoning the dark theme recorded for its own rules).
const RULE = '#e3e6e1';
const TRACK = '#e3e6e1';
const SWATCH_UNKNOWN = '#aab3ac';

export { STRONG, MID, DIM, INK, RULE, TRACK, SWATCH_UNKNOWN, FIELD };

// Where a reader goes to add or correct something. Named "Contribute" rather
// than "Contact": the tracker asks to be corrected, and that is participation
// in the record rather than correspondence with its author.
export const CONTACT_URL = 'https://studio-esem.notion.site/a504252cf109454598a7b02e5024b10d';
// The compiler's institutional page. A named, affiliated researcher standing
// behind the data is part of the evidence, not decoration.
export const AUTHOR_URL = 'https://cur.org.au/people/dr-sarah-barns/';

// Accents, re-derived for the light field. The dark theme's accents are
// luminous (#00e08a reads 11.24:1 on black but 1.71:1 on this field), so each
// keeps its hue and gives up lightness. All five clear 4.5:1 as body text.
//   green 5.73:1 · red 5.98:1 · yellow 6.64:1 · blue 6.04:1 · cyan 5.96:1
export const ACCENT = {
  green: '#067044',
  red: '#b81b3f',
  yellow: '#6f5400',
  blue: '#0a5cb8',
  cyan: '#006b62',
};

// Category colours used in bars, swatches and inline labels across the sheets.
// Named here rather than repeated per page: the same country or energy source
// must not drift between the index, the state pages and the glossary.
export const CATEGORY = {
  japan: '#6e33c4', // 6.66:1
  switzerland: '#a84e00', // 5.20:1
  other: '#5f6a64', // 5.24:1
  unknown: SWATCH_UNKNOWN, // 2.00:1 — swatch/bar only, never text
  renewable: '#15753f', // 5.36:1
  coalGas: '#b03a00', // 5.66:1
  hyperscaler: '#991486', // 6.98:1
  closedLoop: '#15753f', // 5.36:1
  // Unreviewed items. At #8d5108 this was the one accent the dark theme never
  // cleared — 3.10:1 on the dark field, below AA at the 10.5px it is set in.
  // The same value reads 5.90:1 here, so moving to a light field fixes it.
  pending: '#8d5108', // 5.90:1
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
        // The root theme is dark for the map, so say so locally: this is what
        // makes the scrollbar, focus rings and any UA widget render light here
        // instead of inheriting the map's dark chrome onto a white page.
        colorScheme: 'light',
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
      {link('/news', 'News feed', current === 'news')}
      {link('https://civicinterplay.io/data-centres-map/', 'About ↗')}
      {link(CONTACT_URL, 'Contribute ↗')}
    </nav>
  );
}


// Scope statement for the foot of every public page. What the tracker covers is
// a claim in its own right, and leaving it unstated invites the reader to treat
// the tracker as an inventory — so it says what it is, and asks to be corrected.
export function ScopeNote() {
  return (
    <div
      style={{
        marginTop: 36,
        paddingTop: 14,
        borderTop: PANEL_BORDER,
        fontSize: 11.5,
        lineHeight: 1.7,
        color: DIM,
      }}
    >
      This tracker covers the build-out wave and its planning record, not the full historical inventory of
      data centres in Australia. It is not necessarily comprehensive.{' '}
      <a href={CONTACT_URL} style={{ color: CI_PERIWINKLE, textDecoration: 'none' }}>
        Contribute a correction or a missing site
      </a>
      . Compiled by{' '}
      <a href={AUTHOR_URL} style={{ color: CI_PERIWINKLE, textDecoration: 'none' }}>
        Dr Sarah Barns
      </a>
      , RMIT Centre for Urban Research.
    </div>
  );
}

export function SheetTitle({ kicker, title, sub }: { kicker: string; title: string; sub?: React.ReactNode }) {
  return (
    <header style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: DIM }}>{kicker}</div>
      <h1 style={{ fontSize: 30, fontWeight: 600, margin: '6px 0 4px', color: STRONG }}>{title}</h1>
      {sub && <p style={{ color: MID, fontSize: 13, lineHeight: 1.6, maxWidth: 640, margin: 0 }}>{sub}</p>}
    </header>
  );
}

export function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: PANEL, border: PANEL_BORDER, borderRadius: 12, padding: '16px 18px', ...style }}>
      {children}
    </div>
  );
}

export function Stat({ value, label: text, note }: { value: string; label: string; note?: string }) {
  return (
    <div style={{ minWidth: 120 }}>
      <div style={{ fontSize: 26, fontWeight: 600, color: STRONG }}>{value}</div>
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
      <div style={{ flex: 1, background: TRACK, borderRadius: 3, height: 12, overflow: 'hidden' }}>
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
  borderBottom: `1px solid ${RULE}`,
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

// "Last updated" stamp for sheet headers and footers. The sheets query the
// tracker live, so the stamp is the latest edit in the source data.
export function Updated({ date, style }: { date: string | null; style?: React.CSSProperties }) {
  if (!date) return null;
  const d = new Date(date).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Australia/Sydney',
  });
  return (
    <div style={{ fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: DIM, ...style }}>
      Data last updated {d}
    </div>
  );
}

export function Footnote({ children }: { children: React.ReactNode }) {
  return <p style={{ color: DIM, fontSize: 11, lineHeight: 1.7, maxWidth: 720 }}>{children}</p>;
}

export function fmtMW(v: number | null): string {
  return v === null ? '—' : `${v} MW`;
}
