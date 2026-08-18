// News tracker: the press coverage, submissions, council motions and public
// statements the fortnightly pipeline collects around tracked sites, read
// live from the Contestation Tracker.
import { fetchNews } from '@/lib/news';
import { fetchTrackerRows } from '@/lib/tracker';
import {
  SheetShell,
  SheetNav,
  SheetTitle,
  Panel,
  Footnote,
  ACCENT,
  CI_PERIWINKLE,
} from '../sheets/sheet-ui';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'News Feed — Australian Data Centres',
  description: 'Press coverage, submissions and public statements around tracked data-centre sites, updated fortnightly.',
  alternates: { types: { 'application/rss+xml': '/news/feed.xml' } },
};

function stanceColor(stance: string | null): string {
  if (!stance) return '#9aa5a0';
  if (stance.includes('Oppos')) return ACCENT.red;
  if (stance.includes('Support')) return ACCENT.green;
  if (stance.includes('Conditional')) return ACCENT.yellow;
  return '#9aa5a0';
}

const STATE_SHORT: Record<string, string> = {
  'New South Wales': 'NSW',
  Victoria: 'VIC',
  Queensland: 'QLD',
  'Western Australia': 'WA',
  'South Australia': 'SA',
  Tasmania: 'TAS',
  'Northern Territory': 'NT',
  ACT: 'ACT',
  'National / Federal': 'Federal',
};

export default async function News() {
  const [newsItems, trackerRows] = await Promise.all([fetchNews(), fetchTrackerRows()]);
  // Jurisdiction comes from the linked tracker site, via the relation.
  const stateBySite = new Map(trackerRows.map((r) => [r.id, r.state]));
  const items = newsItems.filter((i) => i.title !== 'Untitled');
  // Collapse syndicated copies: one wire story appears on many mastheads. Group
  // same-day items sharing enough distinctive words; show the first with a count.
  const tokens = (s: string) =>
    new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((t) => t.length > 3));
  const kept: Array<(typeof items)[number] & { syndicated: number; toks: Set<string> }> = [];
  for (const i of items.filter((x) => x.date)) {
    const t = tokens(`${i.quote} ${i.frameSummary}`);
    const dup = kept.find((k) => {
      if (k.date !== i.date) return false;
      let hits = 0;
      for (const w of t) if (k.toks.has(w)) hits++;
      return hits >= 4;
    });
    if (dup) dup.syndicated += 1;
    else kept.push({ ...i, syndicated: 1, toks: t });
  }
  const dated = kept.slice(0, 80);

  return (
    <SheetShell>
      <SheetNav current="news" />
      <SheetTitle
        kicker="Australian Data Centres"
        title="News Feed"
        sub="Press coverage, planning submissions, council motions and public statements around tracked sites — collected fortnightly, coded by stance and grounds."
      />

      {/* Subscribe affordance. The <link rel="alternate"> tag lets readers
          auto-detect the feed, but only if someone already pointed a reader at
          the page — so the URL is also visible and copyable here. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
          margin: '0 0 16px',
          padding: '8px 12px',
          border: '1px solid #2a322c',
          borderRadius: 10,
          fontSize: 12,
          color: '#9aa39b',
        }}
      >
        <span aria-hidden style={{ color: CI_PERIWINKLE, fontSize: 13 }}>⇩</span>
        <span>Follow this feed in any news reader:</span>
        <a
          href="/news/feed.xml"
          style={{ color: CI_PERIWINKLE, textDecoration: 'none', fontFamily: 'ui-monospace, monospace' }}
        >
          /news/feed.xml
        </a>
        <span style={{ color: '#6b7568' }}>· RSS 2.0, updated fortnightly</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {dated.map((i) => (
          <Panel key={i.id}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10.5, color: '#6b7568', letterSpacing: '0.06em' }}>{i.date}</span>
              {i.stance && (
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: stanceColor(i.stance),
                    border: `1px solid ${stanceColor(i.stance)}`,
                    borderRadius: 8,
                    padding: '1px 8px',
                  }}
                >
                  {i.stance}
                </span>
              )}
              {i.siteId && stateBySite.get(i.siteId) && (
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: CI_PERIWINKLE,
                    border: `1px solid ${CI_PERIWINKLE}`,
                    borderRadius: 8,
                    padding: '1px 8px',
                  }}
                >
                  {STATE_SHORT[stateBySite.get(i.siteId) ?? ''] ?? stateBySite.get(i.siteId)}
                </span>
              )}
              {i.sourceType && <span style={{ fontSize: 10.5, color: '#6b7568' }}>{i.sourceType}</span>}
              {i.syndicated > 1 && (
                <span style={{ fontSize: 10.5, color: '#6b7568' }}>syndicated ×{i.syndicated}</span>
              )}
              {(i.confidence ?? 1) < 0.6 && (
                <span style={{ fontSize: 10, color: '#8d5108', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  pending review
                </span>
              )}
            </div>
            <div style={{ fontSize: 13.5, color: '#fff', margin: '6px 0 2px', lineHeight: 1.5 }}>{i.title}</div>
            {i.frameSummary && (
              <div style={{ fontSize: 12, color: '#9aa39b', lineHeight: 1.6 }}>{i.frameSummary}</div>
            )}
            {i.quote && (
              <div style={{ fontSize: 12, color: '#8a938c', fontStyle: 'italic', marginTop: 4, lineHeight: 1.6 }}>
                &ldquo;{i.quote}&rdquo;
              </div>
            )}
            <div style={{ marginTop: 6, fontSize: 11, color: '#6b7568' }}>
              {i.actor && <>{i.actor}{i.actorType ? ` (${i.actorType})` : ''} · </>}
              {i.grounds.length > 0 && <>{i.grounds.join(' · ')} · </>}
              {i.source && (
                <a href={i.source} style={{ color: CI_PERIWINKLE, textDecoration: 'none' }}>
                  source ↗
                </a>
              )}
            </div>
          </Panel>
        ))}
      </div>

      <Footnote>
        Items are collected by the fortnightly pipeline and coded by a language model for stance, actor and
        grounds; items marked <span style={{ color: '#8d5108' }}>pending review</span> have not yet been checked
        by a human. Jurisdiction tags come from the tracked site each item relates to. Coding rules are in the{' '}
        <a href="/glossary" style={{ color: CI_PERIWINKLE }}>glossary &amp; methods</a>.
      </Footnote>
      <Footnote>
        <span style={{ color: '#c8cfc4' }}>Search terms, stated:</span> the press sweep queries the GDELT news
        index (Australian sources) for <em>data centre / data center / rare earths / refinery</em> combined with
        debate terms in both directions — <em>opposition, objection, protest, community concern, submission,
        water use</em> and <em>support, welcomes, jobs, investment, backs</em> — so the feed captures the whole
        structure of the debate, not only objections. A second sweep searches new-project language
        (<em>announced, proposed, planned, lodged, approved, development application, to build, hyperscale</em>).
        Forums, conference panels and broadcast appearances are not indexed by this sweep — they are added
        manually.
      </Footnote>
    </SheetShell>
  );
}
