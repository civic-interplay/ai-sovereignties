// RSS 2.0 feed of the news tracker, so others can subscribe to the same
// stream the /news page renders — same live Notion read, latest 50 dated items.
import { fetchNews } from '@/lib/news';
import { fetchTrackerRows } from '@/lib/tracker';

export const dynamic = 'force-dynamic';

const SITE = 'https://datacentres.civicinterplay.io';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET() {
  const [news, trackerRows] = await Promise.all([fetchNews(), fetchTrackerRows()]);
  const stateBySite = new Map(trackerRows.map((r) => [r.id, r.state]));

  const items = news
    .filter((i) => i.title !== 'Untitled' && i.date)
    .slice(0, 50)
    .map((i) => {
      const state = i.siteId ? stateBySite.get(i.siteId) : null;
      const desc = [
        i.frameSummary,
        i.quote ? `“${i.quote}”` : '',
        [
          i.actor && `${i.actor}${i.actorType ? ` (${i.actorType})` : ''}`,
          i.stance && `Stance: ${i.stance}`,
          i.grounds.length > 0 && `Grounds: ${i.grounds.join(', ')}`,
          state,
        ]
          .filter(Boolean)
          .join(' · '),
      ]
        .filter(Boolean)
        .join('\n\n');
      return [
        '    <item>',
        `      <title>${esc(i.title)}</title>`,
        `      <link>${esc(i.source ?? `${SITE}/news`)}</link>`,
        `      <guid isPermaLink="false">${esc(i.id)}</guid>`,
        `      <pubDate>${new Date(`${i.date}T00:00:00Z`).toUTCString()}</pubDate>`,
        i.sourceType ? `      <category>${esc(i.sourceType)}</category>` : '',
        `      <description>${esc(desc)}</description>`,
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>Australian Data Centres — News Feed</title>',
    `    <link>${SITE}/news</link>`,
    `    <atom:link href="${SITE}/news/feed.xml" rel="self" type="application/rss+xml"/>`,
    '    <description>Press coverage, planning submissions, council motions and public statements around tracked Australian data-centre sites, collected fortnightly and coded by stance and grounds.</description>',
    '    <language>en-au</language>',
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
    },
  });
}
