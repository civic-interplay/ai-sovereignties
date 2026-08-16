// Per-state summary sheet: statistics plus the full site table, with
// analysis-subset membership marked per row.
import { notFound } from 'next/navigation';
import {
  fetchTrackerRows,
  STATE_SLUGS,
  countryBucket,
  type TrackerRow,
} from '@/lib/tracker';
import {
  SheetShell,
  SheetNav,
  SheetTitle,
  Panel,
  Stat,
  SectionHead,
  BarRow,
  Footnote,
  ACCENT,
  CI_PERIWINKLE,
  td,
  th,
  fmtMW,
} from '../sheet-ui';

export const dynamic = 'force-dynamic';

const REGISTER_COLORS: Record<string, string> = {
  Productive: ACCENT.green,
  Operational: ACCENT.blue,
  Financial: ACCENT.yellow,
  Rented: ACCENT.red,
  'Not coded': '#4a534e',
};

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const name = STATE_SLUGS[state];
  return {
    title: `${name ?? 'State'} — data sheet — Australian Data Centres`,
    description: `Data-centre build-out summary for ${name ?? 'this state'} from the live tracker.`,
  };
}

function registerBucket(r: TrackerRow): string {
  // Same precedence as the map: the most sovereign register present wins.
  if (r.registers.includes('Productive')) return 'Productive';
  if (r.registers.includes('Operational')) return 'Operational';
  if (r.registers.includes('Financial')) return 'Financial';
  if (r.registers.includes('Rented') || r.registers.includes('Locational')) return 'Rented';
  return 'Not coded';
}

export default async function StateSheet({ params }: { params: Promise<{ state: string }> }) {
  const { state: slug } = await params;
  const stateName = STATE_SLUGS[slug];
  if (!stateName) notFound();

  const rows = await fetchTrackerRows();
  const dc = rows.filter((r) => r.isDataCentre && r.state === stateName);
  if (dc.length === 0) notFound();
  const subset = dc.filter((r) => r.inSubset);
  const other = rows.filter((r) => !r.isDataCentre && r.state === stateName);

  const knownMW = subset.filter((r) => r.capacity !== null && r.capacity > 0);
  const totalMW = knownMW.reduce((s, r) => s + (r.capacity ?? 0), 0);

  const exhibited = subset.filter((r) => r.publicNotice?.toLowerCase().includes('exhibit')).length;
  const exempted = subset.filter((r) => r.publicNotice?.toLowerCase().includes('exempt')).length;
  const noticeUnknown = subset.length - exhibited - exempted;
  const mwDisclosed = subset.filter((r) => r.capacity !== null && r.capacity > 0).length;

  const regCounts = new Map<string, number>();
  for (const r of subset) regCounts.set(registerBucket(r), (regCounts.get(registerBucket(r)) ?? 0) + 1);

  const countryCounts = new Map<string, number>();
  for (const r of subset) {
    const b = r.ownershipCountry ? countryBucket(r.ownershipCountry) : 'Unknown';
    countryCounts.set(b, (countryCounts.get(b) ?? 0) + 1);
  }

  const sorted = [...dc].sort((a, b) => {
    if (a.inSubset !== b.inSubset) return a.inSubset ? -1 : 1;
    return (b.capacity ?? -1) - (a.capacity ?? -1);
  });

  return (
    <SheetShell>
      <SheetNav current="sheets" />
      <SheetTitle kicker="Australian Data Centres · state sheet" title={stateName} />

      <Panel style={{ display: 'flex', gap: 36, flexWrap: 'wrap' }}>
        <Stat value={`${subset.length}`} label="Subset sites" note={`${dc.length - subset.length} legacy colo excluded`} />
        <Stat
          value={`${Math.round(totalMW).toLocaleString()} MW`}
          label="Known capacity"
          note={`public for ${knownMW.length} of ${subset.length}`}
        />
        <Stat
          value={`${mwDisclosed}/${subset.length}`}
          label="Disclose capacity"
          note="sites with any public MW figure"
        />
        <Stat
          value={`${exempted}`}
          label="Notice-exempted"
          note={`${exhibited} exhibited · ${noticeUnknown} not recorded`}
        />
      </Panel>

      <SectionHead>Sovereignty registers (analysis subset)</SectionHead>
      <Panel>
        {['Productive', 'Operational', 'Financial', 'Rented', 'Not coded']
          .filter((k) => (regCounts.get(k) ?? 0) > 0)
          .map((k) => (
            <BarRow key={k} label={k} count={regCounts.get(k) ?? 0} total={subset.length} color={REGISTER_COLORS[k]} />
          ))}
        <Footnote>
          Register definitions and the precedence rule are in the{' '}
          <a href="/glossary" style={{ color: CI_PERIWINKLE }}>glossary</a>. &ldquo;Not coded&rdquo; rows are
          pending the register coding pass and are excluded from any published register statistic.
        </Footnote>
      </Panel>

      <SectionHead>Ultimate-owner country, by site count (analysis subset)</SectionHead>
      <Panel>
        {[...countryCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([country, n]) => (
            <BarRow key={country} label={country} count={n} total={subset.length} color={
              {
                Australia: ACCENT.green,
                'United States': ACCENT.blue,
                China: ACCENT.red,
                Singapore: ACCENT.yellow,
                Japan: '#b478ff',
                Switzerland: '#ff8c42',
                Other: '#9aa5a0',
                Unknown: '#4a534e',
              }[country] ?? '#9aa5a0'
            } />
          ))}
      </Panel>

      <SectionHead>All tracked sites</SectionHead>
      <Panel style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 760 }}>
          <thead>
            <tr>
              <th style={th}>Site</th>
              <th style={th}>Operator → ultimate owner</th>
              <th style={th}>MW</th>
              <th style={th}>Pathway / notice</th>
              <th style={th}>Registers</th>
              <th style={th}>Subset</th>
              <th style={th}>Links</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.notionPublicUrl} style={{ opacity: r.inSubset ? 1 : 0.55 }}>
                <td style={td}>{r.name}</td>
                <td style={td}>
                  {r.operator || '—'}
                  {r.ultimateOwner && r.ultimateOwner !== r.operator ? ` → ${r.ultimateOwner}` : ''}
                  {r.ownershipCountry ? ` (${countryBucket(r.ownershipCountry)})` : ''}
                </td>
                <td style={td}>{fmtMW(r.capacity)}</td>
                <td style={td}>
                  {r.pathway ?? '—'}
                  {r.publicNotice ? ` · ${r.publicNotice}` : ''}
                </td>
                <td style={td}>{r.registers.length ? r.registers.join(', ') : '—'}</td>
                <td style={{ ...td, color: r.inSubset ? ACCENT.green : '#4a534e' }}>{r.inSubset ? '●' : '○'}</td>
                <td style={td}>
                  <a href={r.notionPublicUrl} style={{ color: CI_PERIWINKLE, textDecoration: 'none' }}>
                    entry↗
                  </a>
                  {r.source && (
                    <>
                      {' '}
                      <a href={r.source} style={{ color: CI_PERIWINKLE, textDecoration: 'none' }}>
                        source↗
                      </a>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <Footnote>
        ● in analysis subset · ○ excluded (legacy colocation / enterprise inventory, no public planning trail).
        &ldquo;—&rdquo; means not publicly recorded, never zero.
      </Footnote>

      {other.length > 0 && (
        <>
          <SectionHead>Related infrastructure in {stateName}</SectionHead>
          <Panel>
            {other.map((r) => (
              <div key={r.notionPublicUrl} style={{ fontSize: 12, lineHeight: 1.9 }}>
                <span style={{ color: '#6b7568' }}>{r.infraType ?? 'Other'}</span> — {r.name}{' '}
                <a href={r.notionPublicUrl} style={{ color: CI_PERIWINKLE, textDecoration: 'none' }}>
                  ↗
                </a>
              </div>
            ))}
          </Panel>
        </>
      )}
    </SheetShell>
  );
}
