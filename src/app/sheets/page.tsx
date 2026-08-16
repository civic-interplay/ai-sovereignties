// National summary sheet: the tracker's headline numbers, by state, with the
// analysis-subset rule applied and stated. Data is fetched live from Notion.
import { fetchTrackerRows, slugForState, countryBucket } from '@/lib/tracker';
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
} from './sheet-ui';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Data sheets — Australian Data Centres',
  description: 'Summary statistics for the Australian data-centre build-out, by state, from the live tracker.',
};

const COUNTRY_COLORS: Record<string, string> = {
  Australia: ACCENT.green,
  'United States': ACCENT.blue,
  China: ACCENT.red,
  Singapore: ACCENT.yellow,
  Japan: '#b478ff',
  Switzerland: '#ff8c42',
  Other: '#9aa5a0',
  Unknown: '#4a534e',
};

export default async function SheetsIndex() {
  const rows = await fetchTrackerRows();
  const dc = rows.filter((r) => r.isDataCentre);
  const subset = dc.filter((r) => r.inSubset);

  const knownMW = subset.filter((r) => r.capacity !== null && r.capacity > 0);
  const totalMW = knownMW.reduce((s, r) => s + (r.capacity ?? 0), 0);

  // Capacity-weighted ownership, on subset rows with both MW and a country.
  const mwByCountry = new Map<string, number>();
  for (const r of knownMW) {
    const b = r.ownershipCountry ? countryBucket(r.ownershipCountry) : 'Unknown';
    mwByCountry.set(b, (mwByCountry.get(b) ?? 0) + (r.capacity ?? 0));
  }

  const states = [...new Set(dc.map((r) => r.state).filter(Boolean))] as string[];
  states.sort((a, b) => dc.filter((r) => r.state === b).length - dc.filter((r) => r.state === a).length);

  const contested = subset.filter(
    (r) => r.communityConcern?.includes('Active Opposition') || r.communityConcern?.includes('Emerging Concern'),
  ).length;
  const fastTracked = subset.filter(
    (r) =>
      r.governanceFlags.includes('Ministerial fast-track') ||
      r.governanceFlags.includes('NSW State Significant Development'),
  ).length;

  return (
    <SheetShell>
      <SheetNav current="sheets" />
      <SheetTitle
        kicker="Australian Data Centres · summary sheets"
        title="The build-out in numbers"
        sub="Live figures from the Critical Infrastructure Tracker."
      />

      <Panel style={{ display: 'flex', gap: 36, flexWrap: 'wrap' }}>
        <Stat value={`${dc.length}`} label="Data centres tracked" />
        <Stat
          value={`${subset.length}`}
          label="In analysis subset"
          note="planning trail, hyperscaler-linked, or wholesale-developer campus"
        />
        <Stat
          value={`${Math.round(totalMW).toLocaleString()} MW`}
          label="Known planned capacity"
          note={`capacity public for ${knownMW.length} of ${subset.length} subset sites`}
        />
        <Stat value={`${fastTracked}`} label="Fast-tracked / SSD" note="subset sites approved outside normal exhibition" />
        <Stat value={`${contested}`} label="Contested" note="active or emerging community opposition" />
      </Panel>

      <SectionHead>Known capacity by ultimate-owner country (analysis subset)</SectionHead>
      <Panel>
        {[...mwByCountry.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([country, mw]) => (
            <BarRow
              key={country}
              label={country}
              count={Math.round(mw)}
              total={totalMW}
              color={COUNTRY_COLORS[country] ?? '#9aa5a0'}
              suffix=" MW"
            />
          ))}
        <Footnote>
          Capacity-weighted split covers only subset sites with a publicly stated MW figure and a coded
          ultimate-owner country ({knownMW.length} of {subset.length} sites). Unknown ≠ zero: sites without
          public capacity figures are excluded from this chart, not counted as zero.
        </Footnote>
      </Panel>

      <SectionHead>By state</SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {states.map((state) => {
          const inState = dc.filter((r) => r.state === state);
          const sub = inState.filter((r) => r.inSubset);
          const mw = sub.reduce((s, r) => s + (r.capacity ?? 0), 0);
          const slug = slugForState(state);
          const noticeExempt = sub.filter((r) => r.publicNotice?.toLowerCase().includes('exempt')).length;
          return (
            <Panel key={state}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{state}</div>
                <div style={{ fontSize: 12, color: '#6b7568' }}>{inState.length} sites</div>
              </div>
              <div style={{ fontSize: 12, color: '#9aa39b', marginTop: 6, lineHeight: 1.7 }}>
                {sub.length} in analysis subset · {Math.round(mw).toLocaleString()} MW known
                {noticeExempt > 0 && (
                  <>
                    <br />
                    {noticeExempt} approved without public exhibition
                  </>
                )}
              </div>
              {slug && (
                <a
                  href={`/sheets/${slug}`}
                  style={{
                    display: 'inline-block',
                    marginTop: 10,
                    fontSize: 10.5,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: CI_PERIWINKLE,
                    textDecoration: 'none',
                  }}
                >
                  State sheet →
                </a>
              )}
            </Panel>
          );
        })}
      </div>

      <SectionHead>Analysis subset — the rule</SectionHead>
      <Panel>
        <Footnote>
          A data-centre row is in the analysis subset when any of the following holds: (a) it has a planning
          application on the public record — a PA / SSD number, EIS, recorded planning pathway or state approval
          body; (b) a named hyperscaler (Amazon/AWS, Microsoft, Google, Meta, Oracle, Apple) appears as owner,
          parent, tenant or operator; or (c) it is a campus of a named wholesale data-centre developer (NEXTDC,
          CDC, AirTrunk, STACK, Digital Realty, Equinix, Global Switch, Macquarie Data Centres, Goodman, Vantage,
          Keppel, Supernode/Quinbrook). Excluded: the legacy small-colocation and enterprise/telco inventory with
          no public planning trail. Full coding rules are in the <a href="/glossary" style={{ color: CI_PERIWINKLE }}>glossary &amp; methods</a>.
        </Footnote>
      </Panel>

      <Footnote>
        Source: Critical Infrastructure Tracker (Notion), queried live at page load. Rows and coding are
        continuously revised; figures on this sheet may differ from earlier captures. Cite this project:{' '}
        <a href="https://doi.org/10.5281/zenodo.21026430" style={{ color: CI_PERIWINKLE }}>
          doi.org/10.5281/zenodo.21026430
        </a>
        .{' '}
        <a
          href="https://studio-esem.notion.site/8b537010f4cb4aa6b6df470f9d0d40c9?v=c9d0347781ec4900967cfff4d18a25a6"
          style={{ color: CI_PERIWINKLE }}
        >
          Browse the source data ↗
        </a>
      </Footnote>
    </SheetShell>
  );
}
