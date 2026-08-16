// Per-state summary sheet: statistics plus the full site table, with
// analysis-subset membership marked per row.
import { notFound } from 'next/navigation';
import {
  fetchTrackerRows,
  STATE_SLUGS,
  countryBucket,
  energyBucket,
  ENERGY_BUCKET_ORDER,
  lastUpdated,
  DATA_ACCESS,
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
  Updated,
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
  const mwDisclosedPct = subset.length > 0 ? Math.round((mwDisclosed / subset.length) * 100) : 0;

  const fastTracked = subset.filter(
    (r) =>
      r.governanceFlags.includes('Ministerial fast-track') ||
      r.governanceFlags.includes('NSW State Significant Development'),
  ).length;
  const contested = subset.filter(
    (r) => r.communityConcern?.includes('Active Opposition') || r.communityConcern?.includes('Emerging Concern'),
  ).length;

  const energyCounts = new Map<string, number>();
  for (const r of subset) {
    const b = energyBucket(r.energySource);
    energyCounts.set(b, (energyCounts.get(b) ?? 0) + 1);
  }

  const updated = lastUpdated(dc);
  const dataAccess = DATA_ACCESS[stateName] ?? [];

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
      <Updated date={updated} style={{ margin: '-16px 0 20px' }} />

      <Panel style={{ display: 'flex', gap: 36, flexWrap: 'wrap' }}>
        <Stat
          value={`${subset.length}`}
          label="Subset sites"
          note={
            dc.length - subset.length > 0
              ? `${dc.length - subset.length} legacy colocation sites excluded`
              : 'all tracked sites qualify'
          }
        />
        <Stat
          value={`${Math.round(totalMW).toLocaleString()} MW`}
          label="Known capacity"
          note={`public for ${knownMW.length} of ${subset.length}`}
        />
        <Stat
          value={`${mwDisclosed}/${subset.length} · ${mwDisclosedPct}%`}
          label="Disclose capacity"
          note="sites with any public MW figure"
        />
        <Stat value={`${fastTracked}`} label="Fast-tracked" note="SSD / ministerial fast-track" />
        <Stat value={`${contested}`} label="Contested" note="active or emerging opposition" />
        <Stat
          value={`${exempted}`}
          label="Notice-exempted"
          note={`${exhibited} exhibited · ${noticeUnknown} not recorded`}
        />
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

      <SectionHead>Energy sourcing — on-grid / off-grid / not tracked (analysis subset)</SectionHead>
      <Panel>
        {ENERGY_BUCKET_ORDER.filter((k) => (energyCounts.get(k) ?? 0) > 0).map((k) => (
          <BarRow
            key={k}
            label={k}
            count={energyCounts.get(k) ?? 0}
            total={subset.length}
            color={
              {
                'Off-grid — on-site renewable': ACCENT.green,
                'On-grid — renewable contracted': '#3fd17a',
                'On-grid — mixed': ACCENT.yellow,
                'On-grid — coal/gas heavy': '#ff6b35',
                'Nuclear (proposed)': '#b478ff',
                'Not tracked': '#4a534e',
              }[k] ?? '#9aa5a0'
            }
          />
        ))}
        <Footnote>
          &ldquo;Not tracked&rdquo; means no public statement of the site&rsquo;s energy sourcing has been
          found.
        </Footnote>
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

      <SectionHead>Machine readability of the planning record</SectionHead>
      <Panel>
        <Footnote>
          Whether this state&rsquo;s planning record can be monitored programmatically — the open-data
          infrastructure behind these figures, and how this tracker actually accessed it.
        </Footnote>
        {dataAccess.length === 0 ? (
          <div style={{ fontSize: 12, color: '#9aa39b' }}>Not yet assessed for this state.</div>
        ) : (
          dataAccess.map((d) => (
            <div key={d.source} style={{ fontSize: 12.5, lineHeight: 1.7, margin: '8px 0' }}>
              <span
                aria-hidden
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  marginRight: 8,
                  background: d.access === 'api' ? ACCENT.green : d.access === 'manual' ? ACCENT.yellow : ACCENT.red,
                }}
              />
              <span style={{ color: '#fff', fontWeight: 600 }}>{d.source}</span>{' '}
              <span style={{ color: '#6b7568', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.08em' }}>
                {d.access === 'api' ? 'API' : d.access === 'manual' ? 'Machine readable, no feed' : 'No API'}
              </span>
              <div style={{ color: '#9aa39b', marginLeft: 16 }}>{d.note}</div>
            </div>
          ))
        )}
      </Panel>

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

      <Updated date={updated} style={{ marginTop: 28 }} />
    </SheetShell>
  );
}
