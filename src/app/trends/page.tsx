// Trends: what the tracker holds, how it is split by state and stage, how
// much of it publishes a power figure, and how the record itself has grown.
// Fetched live from Notion, like the data sheets.
//
// Two histories are kept apart on purpose. The timeline here is the history
// of the RECORD (when entries were logged, when snapshots were frozen), which
// includes our own additions. The history of the BUILD-OUT needs approval
// dates, which most rows do not yet carry; that chart waits for the approvals
// pass rather than charting the gaps.
import { fetchTrackerRows, lastUpdated } from '@/lib/tracker';
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

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

export default async function TrendsPage() {
  const rows = await fetchTrackerRows();
  const dc = rows.filter((r) => r.isDataCentre);
  const subset = dc.filter((r) => r.inSubset);

  // 1. What the tracker holds.
  const typed = rows.filter((r) => r.infraType);
  const untyped = rows.length - typed.length;
  const extraction = typed.filter((r) => /Mine|Refinery|Processing/i.test(r.infraType ?? '')).length;
  const otherTyped = typed.length - dc.length - extraction;
  const compositionKeys: Key[] = [
    { key: 'dc', label: 'Data centres', color: SERIES.operating },
    { key: 'extraction', label: 'Mines and refineries', color: '#7d8781' },
    { key: 'other', label: 'Policy and other signals', color: '#a9b1ab' },
    { key: 'untyped', label: 'Not yet typed (proposed by the discovery agent)', color: '#dde1dc' },
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
  // A ratio of two sums is only worth printing when both sides rest on enough sites.
  const ratioOK = all.opN >= 5 && all.pipeN >= 5;
  const ratio = ratioOK && all.opMW ? all.pipeMW / all.opMW : null;

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
  const withAnnounce = dc.filter((r) => r.announcementDate).length;
  const withApproval = dc.filter((r) => r.approvalDate).length;

  return (
    <SheetShell>
      <SheetNav current="trends" />
      <SheetTitle
        kicker="Trends"
        title="What is operating, what is proposed, and what gets disclosed"
        sub={
          <>
            Counts and capacity by state, how many sites publish a power figure, and how the public record has changed
            since the tracker began.
          </>
        }
      />
      <Updated date={lastUpdated(rows)} style={{ margin: '-8px 0 18px' }} />

      <Panel style={{ display: 'flex', flexWrap: 'wrap', gap: 28 }}>
        <Stat value={String(rows.length)} label="Tracker entries" note={`${dc.length} are data centres`} />
        <Stat value={`${pct(dc.length, typed.length)}%`} label="Data centres" note={`of the ${typed.length} entries with a type`} />
        <Stat value={`${pct(all.withMW, all.total)}%`} label="Report MW" note={`${all.withMW} of ${all.total} data centres publish any power figure`} />
        <Stat value={String(snapshots.length)} label="Snapshots" note={`frozen since ${snapshots[0]?.date ?? '—'}`} />
      </Panel>

      <SectionHead>What the tracker holds</SectionHead>
      <Panel>
        <Legend keys={compositionKeys} />
        <StackedBars
          rows={[{ label: 'All entries', values: { dc: dc.length, extraction, other: otherTyped, untyped } }]}
          keys={compositionKeys}
          labelWidth={110}
        />
        <ChartNote>
          {pct(dc.length, typed.length)}% of typed entries are data centres. The rest trace the supply chain behind them
          (mines and refineries) and the policy around them. Entries the discovery agent proposes stay untyped until a
          person reviews them, so they are counted here but kept out of every chart below.
        </ChartNote>
        <TableView
          head={['Category', 'Entries', 'Share of all']}
          rows={[
            ['Data centres', dc.length, `${pct(dc.length, rows.length)}%`],
            ['Mines and refineries', extraction, `${pct(extraction, rows.length)}%`],
            ['Policy and other signals', otherTyped, `${pct(otherTyped, rows.length)}%`],
            ['Not yet typed', untyped, `${pct(untyped, rows.length)}%`],
          ]}
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
          Read this as what the tracker has found, not a census. Victoria&rsquo;s operating count is high because the City
          of Melbourne shared its full list of existing sites; elsewhere, coverage was built mostly from planning
          applications, so existing sites are under-counted. Pipeline counts were gathered the same way in every state and
          compare more fairly. Counts use the analysis subset (see{' '}
          <a href="/glossary" style={{ color: CI_PERIWINKLE }}>
            glossary
          </a>
          ): {dc.length - subset.length} small legacy sites with no planning trail are left out.
        </ChartNote>
        <TableView
          head={['State', 'Operating', 'In pipeline', 'Not proceeding', 'Not recorded', 'Total']}
          rows={[...byState, { state: 'All states', ...all }].map((r) => [r.state, r.operating, r.pipeline, r.notProceeding, r.unrecorded, r.total])}
        />
      </Panel>

      <SectionHead>How many sites publish a power figure</SectionHead>
      <Panel>
        <PercentBars
          rows={[...byState.map((r) => ({ label: r.state, count: r.withMW, total: r.total })), { label: 'All states', count: all.withMW, total: all.total }]}
          color={SERIES.operating}
        />
        <ChartNote>
          Share of data centre sites with any public megawatt figure, from a planning document, a company release or
          credible reporting. Where there is no figure the tracker records a blank, not a zero. Many of these figures come from
          company announcements, not the planning record. In the planning record the gap is wider: in Victoria, none of
          the 12 approvals whose documents could be checked disclosed a megawatt or water figure.
        </ChartNote>
        <TableView
          head={['State', 'Sites with a MW figure', 'Sites', 'Share']}
          rows={[...byState, { state: 'All states', ...all }].map((r) => [r.state, r.withMW, r.total, `${pct(r.withMW, r.total)}%`])}
        />
      </Panel>

      <SectionHead>Disclosed capacity: operating and proposed</SectionHead>
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
          Totals add only the sites that publish a figure, and every bar says how many that is. They are a floor, not
          an estimate of the real total.{' '}
          {ratio
            ? `On published figures, proposed capacity is about ${ratio.toFixed(1)} times operating capacity (${all.pipeMW.toLocaleString('en-AU')} MW from ${all.pipeN} sites, against ${all.opMW.toLocaleString('en-AU')} MW from ${all.opN}). Treat that as an indication: it rests on the sites that chose to publish.`
            : 'Too few sites publish a figure to compare proposed with operating capacity.'}
        </ChartNote>
        <TableView
          head={['State', 'Operating MW', 'from sites', 'Pipeline MW', 'from sites']}
          rows={[...byState, { state: 'All states', ...all }].map((r) => [r.state, r.opMW, `${r.opN} of ${r.operating}`, r.pipeMW, `${r.pipeN} of ${r.pipeline}`])}
        />
      </Panel>

      <SectionHead>How the record has grown</SectionHead>
      <Panel>
        <CumulativeLine points={timeline} events={snapshots} color={SERIES.operating} unit="entries" />
        <ChartNote>
          Entries in the tracker by the month they were logged, with the dates the full dataset was frozen as a
          snapshot. This is the history of the record, not of the build-out: the August jump is the City of
          Melbourne&rsquo;s list arriving, not 70 new data centres. Each snapshot is kept in the public repository, so
          any figure on this site can be checked against what the record said on that date.
        </ChartNote>
        <TableView head={['Month', 'Logged', 'Total']} rows={timeline.map((p) => [p.month, p.added, p.total])} />
      </Panel>

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
          Only {dated.length} data centres carry both dates ({withAnnounce} have an announcement date, {withApproval} an
          approval date), so this shows the few cases the record can document, not a pattern. Where a project was
          marketed long before it was assessed, the gap shows it. A fuller approvals record from June 2025, with each
          approval&rsquo;s pathway and whether it went on public exhibition, is being compiled from the state planning
          registers and will be added here.
        </ChartNote>
        <TableView head={['Site', 'Announced', 'Approved']} rows={dated.map((r) => [r.label, r.a, r.b])} />
      </Panel>

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
