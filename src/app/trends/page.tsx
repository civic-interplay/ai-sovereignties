// Trends: what the tracker holds, how it is split by state and stage, how
// much of it publishes a power figure, and how the record itself has grown.
// Fetched live from Notion, like the data sheets.
//
// Two histories are kept apart on purpose. The timeline here is the history
// of the RECORD (when entries were logged, when snapshots were frozen), which
// includes our own additions. The history of the BUILD-OUT needs approval
// dates, which most rows do not yet carry; that chart waits for the approvals
// pass rather than charting the gaps.
import { fetchTrackerRows, lastUpdated, isStateAssessed } from '@/lib/tracker';
import snapshots from '@/data/snapshots.json';
import { SheetShell, SheetNav, SheetTitle, Panel, Stat, SectionHead, Footnote, ScopeNote, Updated, CI_PERIWINKLE } from '../sheets/sheet-ui';
import { SERIES, Legend, StackedBars, PercentBars, PairedBars, CumulativeLine, Dumbbell, TableView, ChartNote, type Key } from './charts';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Trends — Australian Data Centres',
  description:
    'Operating versus proposed data centres by state, how many publish a power figure, and how the public record has changed over time.',
};

const OPERATING = new Set(['Producing']);
const PIPELINE = new Set(['Under Construction', 'Approved / permitted', 'Application lodged', 'Before the Minister', 'Feasibility', 'Exploration']);
const NOT_PROCEEDING = new Set(['Withdrawn', 'Refused', 'Approval revoked']);

type Stage = 'operating' | 'pipeline' | 'notProceeding' | 'unrecorded';
function stageOf(status: string | null): Stage {
  if (!status) return 'unrecorded';
  if (OPERATING.has(status)) return 'operating';
  if (PIPELINE.has(status)) return 'pipeline';
  if (NOT_PROCEEDING.has(status)) return 'notProceeding';
  return 'unrecorded';
}

const STAGE_KEYS: Key[] = [
  { key: 'operating', label: 'Operating', color: SERIES.operating },
  { key: 'pipeline', label: 'In pipeline (proposed to under construction)', color: SERIES.pipeline },
  { key: 'notProceeding', label: 'Not proceeding', color: SERIES.notProceeding },
  { key: 'unrecorded', label: 'Stage not recorded', color: SERIES.muted },
];

// Four equal columns, so tiles line up whatever the length of their notes.
const STAT_GRID = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 24 } as const;

// Held back until the October tracker review lands. The VIC approvals pass
// (docs/internal/approvals-2025-06) found most "Exempted" public-notice values
// unchecked or wrong, and two approval dates (Perri, South Morang) are
// amendment dates. Flip to true once those rows are corrected.
const SHOW_NOTICE_FIGURE = false;
const SHOW_APPROVAL_GAPS = false;

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

export default async function TrendsPage() {
  const rows = await fetchTrackerRows();
  const dc = rows.filter((r) => r.isDataCentre);
  const subset = dc.filter((r) => r.inSubset);

  // 1. AI infrastructure tracked, by type.
  const typed = rows.filter((r) => r.infraType);
  const extraction = typed.filter((r) => /Mine|Refinery|Processing/i.test(r.infraType ?? '')).length;
  const compositionKeys: Key[] = [
    { key: 'dc', label: 'Data centres', color: SERIES.operating },
    { key: 'extraction', label: 'Mines and refineries', color: SERIES.forest },
  ];

  // 2–4. By state, on the analysis subset.
  const states = [...new Set(subset.map((r) => r.state).filter(Boolean))] as string[];
  states.sort((a, b) => subset.filter((r) => r.state === b).length - subset.filter((r) => r.state === a).length);
  const byState = states.map((s) => {
    const inState = subset.filter((r) => r.state === s);
    const count = (st: Stage) => inState.filter((r) => stageOf(r.status) === st).length;
    const mw = (st: Stage) => inState.filter((r) => stageOf(r.status) === st && (r.capacity ?? 0) > 0);
    const op = mw('operating');
    const pipe = mw('pipeline');
    return {
      state: s,
      total: inState.length,
      operating: count('operating'),
      pipeline: count('pipeline'),
      notProceeding: count('notProceeding'),
      unrecorded: count('unrecorded'),
      withMW: inState.filter((r) => (r.capacity ?? 0) > 0).length,
      opMW: op.reduce((t, r) => t + (r.capacity ?? 0), 0),
      opN: op.length,
      pipeMW: pipe.reduce((t, r) => t + (r.capacity ?? 0), 0),
      pipeN: pipe.length,
    };
  });
  const all = byState.reduce(
    (t, r) => ({
      total: t.total + r.total,
      operating: t.operating + r.operating,
      pipeline: t.pipeline + r.pipeline,
      notProceeding: t.notProceeding + r.notProceeding,
      unrecorded: t.unrecorded + r.unrecorded,
      withMW: t.withMW + r.withMW,
      opMW: t.opMW + r.opMW,
      opN: t.opN + r.opN,
      pipeMW: t.pipeMW + r.pipeMW,
      pipeN: t.pipeN + r.pipeN,
    }),
    { total: 0, operating: 0, pipeline: 0, notProceeding: 0, unrecorded: 0, withMW: 0, opMW: 0, opN: 0, pipeMW: 0, pipeN: 0 },
  );
  // Sites with no published MW figure, approved (incl. under construction)
  // against proposed (not yet approved).
  const APPROVED = new Set(['Approved / permitted', 'Under Construction']);
  const PROPOSED = new Set(['Application lodged', 'Before the Minister', 'Feasibility', 'Exploration']);
  const noMW = (set: Set<string>) => {
    const inSet = subset.filter((r) => r.status && set.has(r.status));
    return { count: inSet.filter((r) => !((r.capacity ?? 0) > 0)).length, total: inSet.length };
  };
  const noMWApproved = noMW(APPROVED);
  const noMWProposed = noMW(PROPOSED);
  const noMWByState = [...states, 'All states'].map((st) => {
    const sel = (set: Set<string>) => {
      const inSet = subset.filter((r) => r.status && set.has(r.status) && (st === 'All states' || r.state === st));
      const count = inSet.filter((r) => !((r.capacity ?? 0) > 0)).length;
      return { pct: pct(count, inSet.length), count, total: inSet.length };
    };
    const a = sel(APPROVED);
    const b = sel(PROPOSED);
    return { label: st, a: a.pct, an: a.count, aOf: a.total, b: b.pct, bn: b.count, bOf: b.total };
  }).filter((r) => r.aOf + r.bOf > 0);
  // Where each published MW figure comes from.
  const sourceOf = (r: (typeof subset)[number]) =>
    r.mwSource === 'Planning document' ? 'planning' : r.mwSource === 'Company or news' ? 'press' : 'unrecorded';
  const mwSourceRows = [...states, 'All states'].map((st) => {
    const withFig = subset.filter((r) => (r.capacity ?? 0) > 0 && (st === 'All states' || r.state === st));
    return {
      label: st,
      values: {
        planning: withFig.filter((r) => sourceOf(r) === 'planning').length,
        press: withFig.filter((r) => sourceOf(r) === 'press').length,
        unrecorded: withFig.filter((r) => sourceOf(r) === 'unrecorded').length,
      },
    };
  }).filter((r) => r.values.planning + r.values.press + r.values.unrecorded > 0);
  const MW_SOURCE_KEYS: Key[] = [
    { key: 'planning', label: 'Planning document', color: SERIES.operating },
    { key: 'press', label: 'Company release or news report', color: SERIES.pipeline },
    { key: 'unrecorded', label: 'MW figure published, source not yet recorded', color: SERIES.muted },
  ];

  // 5. The record over time: entries logged per month, cumulative.
  const logged = rows.map((r) => r.dateLogged).filter(Boolean).sort() as string[];
  const months: string[] = [];
  if (logged.length) {
    const [y0, m0] = logged[0].split('-').map(Number);
    const now = new Date();
    for (let y = y0, m = m0; y < now.getUTCFullYear() || (y === now.getUTCFullYear() && m <= now.getUTCMonth() + 1); m === 12 ? (y++, (m = 1)) : m++) {
      months.push(`${y}-${String(m).padStart(2, '0')}`);
    }
  }
  let running = 0;
  const timeline = months.map((m) => {
    const added = logged.filter((d) => d.startsWith(m)).length;
    running += added;
    return { month: m, added, total: running };
  });

  // 6. Announcement vs approval, where a row has both.
  const dated = dc
    .filter((r) => r.announcementDate && r.approvalDate)
    .map((r) => ({ label: r.name.length > 42 ? r.name.slice(0, 40) + '…' : r.name, a: r.announcementDate!, b: r.approvalDate! }))
    .sort((x, y) => x.b.localeCompare(y.b));

  // Headline governance figures, all on the analysis subset so they share a
  // denominator with the charts below.
  const isContested = (r: (typeof subset)[number]) =>
    r.communityConcern === 'Active Opposition' || r.communityConcern === 'Emerging Concern';
  const withWater = subset.filter((r) => r.waterRisk && r.waterRisk !== 'Not applicable').length;
  const contested = subset.filter(isContested);
  // Not "withdrawn due to contestation": the record shows that a contested
  // site stopped, not why it stopped (see the Not proceeding glossary entry).
  const contestedStopped = contested.filter((r) => stageOf(r.status) === 'notProceeding').length;
  const fastTracked = subset.filter((r) => isStateAssessed(r.pathway));
  // Only rows whose notice status is recorded either way; "Unknown" and blank
  // stay out of the denominator rather than counting as either.
  const noticeKnown = fastTracked.filter((r) => r.publicNotice === 'Exhibited' || r.publicNotice === 'Exempted');
  const fastNoNotice = noticeKnown.filter((r) => r.publicNotice === 'Exempted').length;
  const fastContested = fastTracked.filter(isContested).length;

  // Is the site's planning record retrievable through a public API? Read from
  // the per-state data-access table (DATA_ACCESS in lib/tracker): NSW council
  // DAs come through the keyless ePlanning API; NSW State-assessed projects and
  // Victorian ministerial permits have no public API. Anything the table does
  // not cover is "not yet assessed", never counted as "no".
  const apiStatus = (r: (typeof subset)[number]): 'api' | 'none' | 'unassessed' => {
    if (r.state === 'New South Wales') {
      if (r.pathway === 'Local council') return 'api';
      if (r.pathway === 'State assessed' || r.pathway === 'Ministerial fast-track') return 'none';
    }
    if (r.state === 'Victoria' && r.pathway === 'Ministerial fast-track') return 'none';
    return 'unassessed';
  };
  const apiAssessed = subset.filter((r) => apiStatus(r) !== 'unassessed');
  const viaAPI = apiAssessed.filter((r) => apiStatus(r) === 'api').length;
  const apiByState = states
    .map((st) => {
      const inSt = subset.filter((r) => r.state === st);
      const assessed = inSt.filter((r) => apiStatus(r) !== 'unassessed');
      return { label: st, count: assessed.filter((r) => apiStatus(r) === 'api').length, total: assessed.length, unassessed: inSt.length - assessed.length };
    })
    .filter((r) => r.total > 0);

  return (
    <SheetShell>
      <SheetNav current="trends" />
      <SheetTitle
        kicker="Trends"
        title="Key Trends in Data Centre Approvals"
        sub={
          <>
            This Trends sheet covers information captured in the Data Centre Tracker, developed to assess the changing
            governance landscape of infrastructural AI as it reshapes urban planning frameworks and concepts of digital
            public value and digital sovereignty.
          </>
        }
      />
      <div style={{ color: '#525b56', fontSize: 13, lineHeight: 1.6, maxWidth: 640, margin: '-16px 0 24px' }}>
        <p style={{ margin: '0 0 10px', fontWeight: 600, color: '#0a0c0b' }}>
          Specifically, the framework examines the different ways infrastructural AI is being governed and reported
          across the Australian policy landscape, with a focus on data transparency and democratic accountability.
        </p>
        <p style={{ margin: 0, fontSize: 12.5 }}>
          <em>Please note:</em> to date, infrastructural AI is tracked through data centres, mines and refineries, and
          reporting against resource demands. Future editions will be expanded to include broader public inputs into AI
          infrastructure.
        </p>
        <p style={{ margin: '10px 0 0', fontSize: 12.5 }}>
          This Trends page captures information summarised by the Data Centre Tracker itself, and may not be a
          comprehensive summary of all data centre approvals during the period covered. Interested in the
          methodology for data gathering?{' '}
          <a href="/glossary" style={{ color: CI_PERIWINKLE }}>
            See the method and definitions
          </a>
          .
        </p>
      </div>
      <Updated date={lastUpdated(rows)} style={{ margin: '-8px 0 8px' }} />
      <p style={{ fontSize: 12.5, margin: '0 0 18px' }}>
        <a href="https://doi.org/10.5281/zenodo.21026429" style={{ color: CI_PERIWINKLE }}>
          Download the full tracker dataset (CSV, Zenodo)
        </a>
        <span style={{ color: '#5f6a64' }}> · every table below can also be downloaded as CSV</span>
      </p>

      <Panel style={STAT_GRID}>
        <Stat value={String(rows.length)} label="Total entries" note={`${dc.length} are data centres`} />
        <Stat value={`${pct(dc.length, typed.length)}%`} label="Are data centres" note={`of the ${typed.length} tracker entries with a type`} />
        <Stat value={`${pct(all.withMW, all.total)}%`} label="Report on energy" note={`${all.withMW} of ${all.total} data centres publish any power (MW) figure`} />
        <Stat value={`${pct(withWater, all.total)}%`} label="Water risk assessed" note={`${withWater} of ${all.total} have a water-risk rating, mostly from company cooling claims`} />
        <Stat value={`${pct(viaAPI, apiAssessed.length)}%`} label="Planning data via public API" note={`${viaAPI} of the ${apiAssessed.length} sites whose planning source has been assessed; ${all.total - apiAssessed.length} not yet assessed`} />
      </Panel>
      <Panel style={{ ...STAT_GRID, marginTop: 12 }}>
        <Stat value={`${pct(contested.length, all.total)}%`} label="Community contestation" note={`${contested.length} of ${all.total} data centres face active or emerging opposition`} />
        <Stat value={`${pct(contestedStopped, contested.length)}%`} label="Contested, not proceeding" note={`${contestedStopped} of ${contested.length} contested sites were withdrawn or refused. The record shows they stopped, not why.`} />
        {SHOW_NOTICE_FIGURE && <Stat value={noticeKnown.length ? `${pct(fastNoNotice, noticeKnown.length)}%` : '—'} label="Fast-tracked, no exhibition" note={`${fastNoNotice} of the ${noticeKnown.length} State fast-tracked sites whose notice status is known were exempted from public exhibition`} />}
        <Stat value={`${pct(fastContested, fastTracked.length)}%`} label="Fast-tracked and contested" note={`${fastContested} of ${fastTracked.length} State fast-tracked sites face community opposition`} />
      </Panel>

      <SectionHead>AI infrastructure tracked by type</SectionHead>
      <Panel>
        <Legend keys={compositionKeys} />
        <StackedBars
          rows={[{ label: 'Infrastructure', values: { dc: dc.length, extraction } }]}
          keys={compositionKeys}
          labelWidth={110}
        />
        <ChartNote>
          {dc.length} data centres and {extraction} mines and refineries, the supply chain behind them.
        </ChartNote>
        <TableView
          head={['Type', 'Sites', 'Share']}
          rows={[
            ['Data centres', dc.length, `${pct(dc.length, dc.length + extraction)}%`],
            ['Mines and refineries', extraction, `${pct(extraction, dc.length + extraction)}%`],
          ]}
          csv="infrastructure-by-type"
        />
      </Panel>

      <SectionHead>Operating and proposed, by state</SectionHead>
      <Panel>
        <Legend keys={STAGE_KEYS} />
        <StackedBars
          rows={[
            ...byState.map((r) => ({ label: r.state, values: r as unknown as Record<string, number> })),
            { label: 'All states', values: all as unknown as Record<string, number> },
          ]}
          keys={STAGE_KEYS}
        />
        <ChartNote>
          These counts report what the tracker has found, and should be checked against the planning documents for
          each site.
        </ChartNote>
        <TableView
          head={['State', 'Operating', 'In pipeline', 'Not proceeding', 'Not recorded', 'Total']}
          rows={[...byState, { state: 'All states', ...all }].map((r) => [r.state, r.operating, r.pipeline, r.notProceeding, r.unrecorded, r.total])}
          csv="sites-by-state-and-stage"
        />
      </Panel>

      <SectionHead>% reporting power capacity in the public domain</SectionHead>
      <Panel>
        <PercentBars
          rows={[...byState.map((r) => ({ label: r.state, count: r.withMW, total: r.total })), { label: 'All states', count: all.withMW, total: all.total }]}
          color={SERIES.operating}
        />
        <ChartNote>
          This chart shows the share of data centres tracked with a published megawatt (MW) figure.
        </ChartNote>
        <TableView
          head={['State', 'Sites with a MW figure', 'Sites', 'Share']}
          rows={[...byState, { state: 'All states', ...all }].map((r) => [r.state, r.withMW, r.total, `${pct(r.withMW, r.total)}%`])}
          csv="mw-reporting-by-state"
        />
      </Panel>

      <Panel style={{ marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0a0c0b', marginBottom: 6 }}>Data source reported</div>
        <Legend keys={MW_SOURCE_KEYS} />
        <StackedBars rows={mwSourceRows} keys={MW_SOURCE_KEYS} />
        <ChartNote>
          Total number of data centres with published MW figures, by publication source.
        </ChartNote>
        <TableView
          head={['State', 'Planning document', 'Company or news', 'Source not yet recorded']}
          rows={mwSourceRows.map((r) => [r.label, r.values.planning, r.values.press, r.values.unrecorded])}
          csv="mw-figure-source-by-state"
        />
      </Panel>

      <Panel style={{ marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0a0c0b', marginBottom: 6 }}>No MW figure: approved and proposed sites</div>
        <Legend
          keys={[
            { key: 'a', label: 'Approved (incl. under construction)', color: SERIES.operating },
            { key: 'b', label: 'Proposed (not yet approved)', color: SERIES.pipeline },
          ]}
        />
        <PairedBars
          rows={noMWByState}
          keys={[
            { key: 'a', label: 'Approved', color: SERIES.operating },
            { key: 'b', label: 'Proposed', color: SERIES.pipeline },
          ]}
          unit="%"
          fixedMax={100}
        />
        <ChartNote>
          Share of sites with no published MW figure.
        </ChartNote>
        <TableView
          head={['State', 'Approved: no MW figure', 'Approved sites', 'Proposed: no MW figure', 'Proposed sites']}
          rows={noMWByState.map((r) => [r.label, `${r.an} (${r.a}%)`, r.aOf, `${r.bn} (${r.b}%)`, r.bOf])}
          csv="no-mw-figure-by-state"
        />
      </Panel>

      <SectionHead>Total published power capacity (MW): operating and proposed</SectionHead>
      <Panel>
        <Legend keys={[STAGE_KEYS[0], STAGE_KEYS[1]]} />
        <PairedBars
          rows={[
            ...byState.map((r) => ({ label: r.state, a: r.opMW, an: r.opN, aOf: r.operating, b: r.pipeMW, bn: r.pipeN, bOf: r.pipeline })),
            { label: 'All states', a: all.opMW, an: all.opN, aOf: all.operating, b: all.pipeMW, bn: all.pipeN, bOf: all.pipeline },
          ]}
          keys={[STAGE_KEYS[0], STAGE_KEYS[1]]}
          unit=" MW"
        />
        <ChartNote>
          Total power capacity, according to published MW figures.
        </ChartNote>
        <TableView
          head={['State', 'Operating MW', 'from sites', 'Pipeline MW', 'from sites']}
          rows={[...byState, { state: 'All states', ...all }].map((r) => [r.state, r.opMW, `${r.opN} of ${r.operating}`, r.pipeMW, `${r.pipeN} of ${r.pipeline}`])}
          csv="published-capacity-by-state"
        />
      </Panel>

      <SectionHead>Planning data available via a public API</SectionHead>
      <Panel>
        <PercentBars
          rows={[...apiByState, { label: 'All assessed', count: viaAPI, total: apiAssessed.length, unassessed: 0 }]}
          color={SERIES.operating}
        />
        <ChartNote>
          A measure of how much governance data is machine-readable for civic AI evaluation: the share of data centres
          whose planning record can be retrieved through a publicly accessible API, among sites whose planning source
          has been assessed. Records that exist only as web pages and PDFs can still be read, but only by hand or by
          scraping, which is slower, more fragile and harder to audit. NSW council applications come through the keyless NSW ePlanning API;
          NSW State-assessed projects and Victorian ministerial permits are published only as web pages and documents.
          {' '}{all.total - apiAssessed.length} sites, including every site outside NSW and Victoria, are not yet assessed.
        </ChartNote>
        <TableView
          head={['State', 'Via public API', 'Sites assessed', 'Share', 'Not yet assessed']}
          rows={apiByState.map((r) => [r.label, r.count, r.total, `${pct(r.count, r.total)}%`, r.unassessed])}
          csv="planning-data-via-public-api"
        />
      </Panel>

      <SectionHead>How the record has grown</SectionHead>
      <Panel>
        <CumulativeLine points={timeline} events={snapshots} color={SERIES.operating} unit="entries" />
        <ChartNote>
          Entries in the tracker by the month they were logged, with the dates the full dataset was frozen as a
          snapshot. Each snapshot is kept in the public
          repository, so any figure on this site can be checked against what the record said on that date.
        </ChartNote>
        <TableView head={['Month', 'Logged', 'Total']} rows={timeline.map((p) => [p.month, p.added, p.total])} csv="tracker-entries-by-month" />
      </Panel>

      {SHOW_APPROVAL_GAPS && (
        <>
      <SectionHead>From announcement to approval</SectionHead>
      <Panel>
        {dated.length >= 2 ? (
          <>
            <Legend
              keys={[
                { key: 'a', label: 'Announced', color: SERIES.pipeline },
                { key: 'b', label: 'Approved', color: SERIES.operating },
              ]}
            />
            <Dumbbell rows={dated} colorA={SERIES.pipeline} colorB={SERIES.operating} />
          </>
        ) : null}
        <ChartNote>
          Summary of time from announcement to approval, based on information captured in the tracker.
        </ChartNote>
        <TableView head={['Site', 'Announced', 'Approved']} rows={dated.map((r) => [r.label, r.a, r.b])} csv="announcement-to-approval" />
      </Panel>
        </>
      )}

      <Footnote>
        Live from the tracker on each visit. Snapshot history:{' '}
        <a href="https://github.com/civic-interplay/ai-sovereignties/commits/main/zenodo/sites.csv" style={{ color: CI_PERIWINKLE }}>
          every frozen version
        </a>
        .
      </Footnote>
      <ScopeNote />
    </SheetShell>
  );
}
