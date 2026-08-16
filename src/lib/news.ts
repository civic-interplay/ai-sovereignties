// Live read of the Contestation Tracker (Notion) for the /news page — the
// press coverage, submissions, council motions and statements the fortnightly
// pipeline collects around tracked sites.

const CONTESTATION_DATABASE_ID = '52ffd0917ab14bc29cc54344c524af3a';
const NOTION_VERSION = '2022-06-28';

type NotionProp = Record<string, unknown>;

function plain(p: NotionProp | undefined): string {
  const arr = (p?.title ?? p?.rich_text) as Array<{ plain_text?: string }> | undefined;
  if (!Array.isArray(arr)) return '';
  return arr.map((t) => t?.plain_text ?? '').join('').trim();
}
function sel(p: NotionProp | undefined): string | null {
  const s = p?.select as { name?: string } | null | undefined;
  return s?.name ?? null;
}
function multi(p: NotionProp | undefined): string[] {
  const m = p?.multi_select as Array<{ name?: string }> | undefined;
  return Array.isArray(m) ? m.map((o) => o.name ?? '').filter(Boolean) : [];
}

export interface NewsItem {
  id: string;
  title: string;
  date: string | null;
  stance: string | null;
  actor: string;
  actorType: string | null;
  sourceType: string | null;
  grounds: string[];
  frameSummary: string;
  quote: string;
  confidence: number | null;
  classifiedBy: string | null;
  source: string | null;
  siteId: string | null;
}

export async function fetchNews(): Promise<NewsItem[]> {
  const token = process.env.NOTION_TOKEN;
  if (!token) return [];
  const items: NewsItem[] = [];
  let cursor: string | undefined;
  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${CONTESTATION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_size: 100,
        start_cursor: cursor,
        sorts: [{ property: 'Date', direction: 'descending' }],
      }),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Notion query failed (${res.status})`);
    const data = (await res.json()) as {
      results: Array<{ id: string; properties: Record<string, NotionProp> }>;
      has_more: boolean;
      next_cursor: string | null;
    };
    for (const r of data.results) {
      const p = r.properties;
      const d = (p['Date'] as { date?: { start?: string } | null } | undefined)?.date;
      items.push({
        id: r.id,
        title: plain(p['Item']) || 'Untitled',
        date: d?.start ?? null,
        stance: sel(p['Stance']),
        actor: plain(p['Actor']),
        actorType: sel(p['Actor type']),
        sourceType: sel(p['Source type']),
        grounds: multi(p['Grounds']),
        frameSummary: plain(p['Frame summary']),
        quote: plain(p['Representative quote']),
        confidence: (p['Confidence'] as { number?: number } | undefined)?.number ?? null,
        classifiedBy: sel(p['Classified by']),
        source: (p['Source'] as { url?: string } | undefined)?.url ?? null,
        siteId:
          ((p['Site'] as { relation?: Array<{ id?: string }> } | undefined)?.relation ?? [])[0]?.id ?? null,
      });
    }
    cursor = data.has_more ? data.next_cursor ?? undefined : undefined;
  } while (cursor);
  return items;
}
