// Notion REST helpers for the contestation pipeline.
//
// Reuses the same conventions as src/app/api/sites/route.ts: raw fetch, the
// 2022-06-28 API version, and small safe property readers. This module reads
// the infra tracker (for the site list) and reads/writes the Contestation
// Tracker.

import {
  CONTESTATION_DATABASE_ID,
  INFRA_DATABASE_ID,
  NOTION_VERSION,
  type Classification,
} from '../config.ts';
import { requireEnv } from './env.ts';

const API = 'https://api.notion.com/v1';

function headers() {
  return {
    Authorization: `Bearer ${requireEnv('NOTION_TOKEN')}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

type NotionProp = Record<string, unknown>;

function plain(p: NotionProp | undefined): string {
  const arr = (p?.title ?? p?.rich_text) as Array<{ plain_text?: string }> | undefined;
  if (!Array.isArray(arr)) return '';
  return arr.map((t) => t?.plain_text ?? '').join('').trim();
}

function selectName(p: NotionProp | undefined): string | null {
  const s = p?.select as { name?: string } | null | undefined;
  return s?.name ?? null;
}

function urlVal(p: NotionProp | undefined): string | null {
  const v = p?.url;
  return typeof v === 'string' && v ? v : null;
}

export interface Site {
  id: string;
  name: string;
  operator: string;
  state: string | null;
  infraType: string | null;
}

async function queryAll(
  databaseId: string,
  body: Record<string, unknown> = {},
): Promise<Array<{ id: string; url?: string; properties: Record<string, NotionProp> }>> {
  const out: Array<{ id: string; url?: string; properties: Record<string, NotionProp> }> = [];
  let cursor: string | undefined;
  do {
    const res = await fetch(`${API}/databases/${databaseId}/query`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ page_size: 100, start_cursor: cursor, ...body }),
    });
    if (!res.ok) throw new Error(`Notion query failed (${res.status}): ${await res.text()}`);
    const data = (await res.json()) as {
      results: typeof out;
      has_more: boolean;
      next_cursor: string | null;
    };
    out.push(...data.results);
    cursor = data.has_more ? data.next_cursor ?? undefined : undefined;
  } while (cursor);
  return out;
}

// The spine: every infra-tracker row becomes a resolvable site.
export async function getSites(): Promise<Site[]> {
  const rows = await queryAll(INFRA_DATABASE_ID);
  return rows.map((r) => ({
    id: r.id,
    name: plain(r.properties['Company / Project']) || 'Untitled',
    operator: plain(r.properties['Operator']),
    state: selectName(r.properties['State / Region']),
    infraType: selectName(r.properties['Infrastructure Type']),
  }));
}

// Source URLs already in the Contestation Tracker, for dedup (grain = one
// record per source-event, so the source URL is the natural key).
export async function getExistingSourceUrls(): Promise<Set<string>> {
  const rows = await queryAll(CONTESTATION_DATABASE_ID);
  const urls = new Set<string>();
  for (const r of rows) {
    const u = urlVal(r.properties['Source']);
    if (u) urls.add(u);
  }
  return urls;
}

// Write one classified item into the Contestation Tracker.
export async function createContestationItem(
  item: Classification,
  title: string,
): Promise<string> {
  const properties: Record<string, unknown> = {
    Item: { title: [{ text: { content: title.slice(0, 2000) } }] },
    Source: { url: item.source_url },
    'Source type': { select: { name: item.source_type } },
    Actor: { rich_text: [{ text: { content: item.actor.slice(0, 2000) } }] },
    'Actor type': { select: { name: item.actor_type } },
    Stance: { select: { name: item.stance } },
    Grounds: { multi_select: item.grounds.map((g) => ({ name: g })) },
    'Frame summary': { rich_text: [{ text: { content: item.frame_summary.slice(0, 2000) } }] },
    Intensity: { select: { name: item.intensity } },
    'Representative quote': { rich_text: [{ text: { content: item.quote.slice(0, 2000) } }] },
    Confidence: { number: item.confidence },
    'Classified by': { select: { name: 'Agent' } },
  };
  if (item.site_id) properties.Site = { relation: [{ id: item.site_id }] };
  if (item.date) properties.Date = { date: { start: item.date } };

  const res = await fetch(`${API}/pages`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      parent: { database_id: CONTESTATION_DATABASE_ID },
      properties,
    }),
  });
  if (!res.ok) throw new Error(`Notion create failed (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as { id: string };
  return data.id;
}
