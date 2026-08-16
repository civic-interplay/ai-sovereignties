// Shared server-side access to the Notion "Critical Infrastructure Tracker —
// Australia" database, for the summary data sheets (/sheets, /glossary).
//
// Unlike /api/sites (the map feed, which drops rows without coordinates and
// flattens to GeoJSON), this module returns every row with the fields the
// sheets need — planning pathway, public notice, confidence, classification
// status — plus the analysis-subset flag used for published statistics.

const DEFAULT_DATABASE_ID = '8b537010f4cb4aa6b6df470f9d0d40c9';
const NOTION_VERSION = '2022-06-28';

type NotionProp = Record<string, unknown>;

function num(p: NotionProp | undefined): number | null {
  const v = p?.number;
  return typeof v === 'number' ? v : null;
}
function plain(p: NotionProp | undefined): string {
  const arr = (p?.title ?? p?.rich_text) as Array<{ plain_text?: string }> | undefined;
  if (!Array.isArray(arr)) return '';
  return arr.map((t) => t?.plain_text ?? '').join('').trim();
}
function selectName(p: NotionProp | undefined): string | null {
  const s = p?.select as { name?: string } | null | undefined;
  return s?.name ?? null;
}
function multiNames(p: NotionProp | undefined): string[] {
  const m = p?.multi_select as Array<{ name?: string }> | undefined;
  return Array.isArray(m) ? m.map((o) => o.name ?? '').filter(Boolean) : [];
}
function urlVal(p: NotionProp | undefined): string | null {
  const v = p?.url;
  return typeof v === 'string' && v ? v : null;
}
function dateVal(p: NotionProp | undefined): string | null {
  const d = p?.date as { start?: string } | null | undefined;
  return d?.start ?? null;
}
// Strip the leading emoji/symbol from a Notion option label.
function label(value: string | null): string | null {
  if (!value) return value;
  return value.replace(/^[^\p{L}\p{N}]+/u, '').trim() || value;
}

export interface TrackerRow {
  name: string;
  infraType: string | null;
  isDataCentre: boolean;
  state: string | null;
  pathway: string | null;
  publicNotice: string | null;
  confidence: number | null;
  classifiedBy: string | null;
  capacity: number | null;
  operator: string;
  parent: string;
  ultimateOwner: string;
  ownerType: string | null;
  ownershipCountry: string;
  registers: string[];
  tenants: string[];
  status: string | null;
  governanceFlags: string[];
  communityConcern: string | null;
  announcementDate: string | null;
  approvalDate: string | null;
  approvalBody: string;
  campusGroup: string;
  mineralFocus: string[];
  source: string | null;
  notionPublicUrl: string;
  hasCoords: boolean;
  notes: string;
  inSubset: boolean;
  subsetReasons: string[];
}

// --- Analysis subset -----------------------------------------------------
// Published statistics are computed on this subset only (stated rule, see
// /glossary). Three prongs; the legacy small-colo inventory from the 2026-08
// bulk-add (no public planning trail, no named hyperscaler or wholesale
// developer) is excluded.
const HYPERSCALER_RE = /amazon|aws|microsoft|azure|google|meta\b|oracle|apple/i;
// Named wholesale / hyperscale data-centre developers whose campuses are in
// scope even where the planning trail is not yet captured in the tracker.
const WHOLESALE_RE =
  /nextdc|cdc|canberra data|airtrunk|stack infra|digital realty|equinix|global switch|macquarie data|goodman|vantage data|keppel|supernode|quinbrook/i;
const PLANNING_RE = /\bPA\d{6,}|\bSSD[-\s]?\d+|\bEIS\b/;

function subsetReasons(r: Omit<TrackerRow, 'inSubset' | 'subsetReasons'>): string[] {
  if (!r.isDataCentre) return [];
  const reasons: string[] = [];
  if (PLANNING_RE.test(`${r.name} ${r.notes}`) || r.pathway || r.approvalBody) {
    reasons.push('planning trail');
  }
  const ownerBlob = [r.operator, r.parent, r.ultimateOwner, ...r.tenants].join(' ');
  if (HYPERSCALER_RE.test(ownerBlob) || (r.ownerType ?? '').toLowerCase().includes('hyperscaler')) {
    reasons.push('hyperscaler-linked');
  }
  if (WHOLESALE_RE.test(`${r.name} ${r.operator} ${r.parent}`)) {
    reasons.push('wholesale developer');
  }
  return reasons;
}

export async function fetchTrackerRows(): Promise<TrackerRow[]> {
  const token = process.env.NOTION_TOKEN;
  if (!token) return [];
  const databaseId = process.env.NOTION_DATABASE_ID || DEFAULT_DATABASE_ID;

  const rows: TrackerRow[] = [];
  let cursor: string | undefined;
  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Notion query failed (${res.status}): ${await res.text()}`);
    const data = (await res.json()) as {
      results: Array<{ id: string; properties: Record<string, NotionProp> }>;
      has_more: boolean;
      next_cursor: string | null;
    };

    for (const page of data.results) {
      const p = page.properties ?? {};
      const infraType = label(selectName(p['Infrastructure Type']));
      const base = {
        name: plain(p['Company / Project']) || 'Untitled',
        infraType,
        isDataCentre: (infraType ?? '').includes('Data Centre'),
        state: label(selectName(p['State / Region'])),
        pathway: label(selectName(p['Planning Pathway'])),
        publicNotice: label(selectName(p['Public notice'])),
        confidence: num(p['Confidence']),
        classifiedBy: label(selectName(p['Classified by'])),
        capacity: num(p['Capacity (MW)']),
        operator: plain(p['Operator']),
        parent: plain(p['Parent']),
        ultimateOwner: plain(p['Ultimate Owner']),
        ownerType: label(selectName(p['Owner Type'])),
        ownershipCountry: plain(p['Ownership Country']),
        registers: multiNames(p['Sovereignty register']),
        tenants: multiNames(p['Tenant / model served']),
        status: label(selectName(p['Status'])),
        governanceFlags: multiNames(p['Governance Flags']),
        communityConcern: label(selectName(p['Community Concern'])),
        announcementDate: dateVal(p['Announcement date']),
        approvalDate: dateVal(p['Approval date']),
        approvalBody: plain(p['State approval body']),
        campusGroup: plain(p['Campus group']),
        mineralFocus: multiNames(p['Mineral Focus']),
        source: urlVal(p['Source']),
        notionPublicUrl: 'https://studio-esem.notion.site/' + page.id.replace(/-/g, ''),
        hasCoords: num(p['Latitude']) !== null && num(p['Longitude']) !== null,
        notes: plain(p['Notes']),
      };
      const reasons = subsetReasons(base);
      rows.push({ ...base, inSubset: reasons.length > 0, subsetReasons: reasons });
    }
    cursor = data.has_more ? data.next_cursor ?? undefined : undefined;
  } while (cursor);

  return rows;
}

// --- State slugs for /sheets/[state] ------------------------------------
export const STATE_SLUGS: Record<string, string> = {
  vic: 'Victoria',
  nsw: 'New South Wales',
  qld: 'Queensland',
  wa: 'Western Australia',
  sa: 'South Australia',
  tas: 'Tasmania',
  nt: 'Northern Territory',
  act: 'ACT',
  national: 'National / Federal',
};

export function slugForState(state: string | null): string | null {
  if (!state) return null;
  const hit = Object.entries(STATE_SLUGS).find(([, name]) => name === state);
  return hit ? hit[0] : null;
}

// Bucket an Ownership Country string the same way the map does.
export function countryBucket(country: string): string {
  const c = country.toLowerCase();
  if (!c) return 'Unknown';
  if (c.includes('australia')) return 'Australia';
  if (c.includes('united states') || c.includes('usa') || c.includes('u.s') || c === 'us' || c.includes('america')) return 'United States';
  if (c.includes('china') || c.includes('hong kong') || c === 'prc') return 'China';
  if (c.includes('singapore')) return 'Singapore';
  if (c.includes('japan')) return 'Japan';
  if (c.includes('switzerland') || c === 'ch') return 'Switzerland';
  return 'Other';
}
