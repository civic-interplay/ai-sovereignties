// Live GeoJSON feed for the map, sourced from the Notion
// "Critical Infrastructure Tracker — Australia" database.
//
// Every row that has both a Latitude and a Longitude becomes a map point.
// Edit the tracker in Notion → refresh the map → the change shows up.
//
// Required env vars (see README):
//   NOTION_TOKEN        – internal integration secret (starts with "ntn_" / "secret_")
//   NOTION_DATABASE_ID  – optional; defaults to the tracker below

const DEFAULT_DATABASE_ID = '8b537010f4cb4aa6b6df470f9d0d40c9';
const NOTION_VERSION = '2022-06-28';

// Always fetch fresh from Notion so edits appear on the next page load.
export const dynamic = 'force-dynamic';

type NotionProp = Record<string, unknown>;

// --- small helpers to read Notion property values safely ---------------------

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

// Strip the leading emoji/symbol from a Notion option label, e.g.
// "🖥️ Data Centre" -> "Data Centre".
function label(value: string | null): string | null {
  if (!value) return value;
  return value.replace(/^[^\p{L}\p{N}]+/u, '').trim() || value;
}

// Collapse the rich "Infrastructure Type" into a short key the map styles on.
function kindOf(infraType: string | null): string {
  if (!infraType) return 'other';
  if (infraType.includes('Data Centre')) return 'data_centre';
  if (infraType.includes('Mine')) return 'mine';
  if (infraType.includes('Refinery') || infraType.includes('Processing')) return 'refinery';
  if (infraType.includes('Energy') || infraType.includes('Grid')) return 'energy';
  if (infraType.includes('Water')) return 'water';
  if (infraType.includes('Policy')) return 'policy';
  if (infraType.includes('Geopolitical')) return 'geopolitical';
  return 'other';
}

function sovereigntyKey(value: string | null): string {
  if (!value) return 'other';
  if (value.includes('Australian')) return 'australian';
  if (value.includes('Foreign')) return 'foreign';
  if (value.includes('Joint')) return 'jv';
  if (value.includes('Government')) return 'government';
  if (value.includes('AUKUS') || value.includes('Defence')) return 'defence';
  return 'other';
}

// Collapse the "Water Risk" select into a short key the map styles on.
// Unset and "Not applicable" both fold into 'na'.
function waterRiskKey(value: string | null): string {
  if (!value) return 'na';
  if (value.includes('High')) return 'high';
  if (value.includes('Medium')) return 'medium';
  if (value.includes('Low')) return 'low';
  return 'na';
}

// Reduce the multi-value "Sovereignty register" to one key for colouring, by
// precedence: the most sovereign register present wins (a site that reaches
// Productive shows as Productive even if it is also Locational).
function registerKey(regs: string[]): string {
  if (regs.includes('Productive')) return 'productive';
  if (regs.includes('Operational')) return 'operational';
  if (regs.includes('Financial')) return 'financial';
  if (regs.includes('Rented') || regs.includes('Locational')) return 'rented';
  return 'none';
}

// Bucket the free-text "Ownership Country" into a short key the map styles on.
// A curated set aligned to the AI-infrastructure ownership landscape; extend as
// the tracker grows. Unset folds into 'other'.
function ownershipCountryKey(country: string): string {
  const c = country.toLowerCase();
  if (!c) return 'other';
  if (c.includes('australia')) return 'au';
  if (c.includes('united states') || c.includes('usa') || c.includes('u.s') || c === 'us' || c.includes('america')) return 'us';
  if (c.includes('china') || c.includes('hong kong') || c === 'prc') return 'cn';
  if (c.includes('singapore')) return 'sg';
  if (c.includes('japan')) return 'jp';
  if (c.includes('switzerland') || c === 'ch') return 'ch';
  return 'other';
}

// Bucket the "Owner Type" (structure of capital) into a short key. Match on
// keywords so the Notion option labels can carry an emoji / longer text. Order
// matters: more specific tests first (e.g. "private equity" before "private").
function ownerTypeKey(value: string | null): string {
  if (!value) return 'other';
  const v = value.toLowerCase();
  if (v.includes('hyperscaler') || v.includes('cloud')) return 'hyperscaler';
  if (v.includes('sovereign')) return 'swf';
  if (v.includes('pension') || v.includes('super')) return 'pension';
  if (v.includes('private equity') || v.includes('infra') || v.includes('fund')) return 'infra_fund';
  if (v.includes('reit') || v.includes('listed') || v.includes('public co')) return 'listed';
  if (v.includes('state') || v.includes('government') || v.includes('gov')) return 'state';
  if (v.includes('private') || v.includes('founder')) return 'private';
  return 'other';
}

// Bucket the Australian sovereign-wealth / super-fund exposure % (stored as a
// 0..1 fraction) into a short key. The activist lens: how much of a site is
// funded by Australians' own retirement/sovereign savings.
function exposureKey(v: number | null): string {
  if (v === null || v <= 0) return 'none';
  if (v < 0.15) return 'low';
  if (v < 0.4) return 'mid';
  return 'high';
}

// How the Australian super/sovereign money touches the site — the three channels
// the exposure lens colours by. Operator = owns the compute business; Land = owns
// the ground; Via-manager = funds the developer through an infra manager.
function exposureChannelKey(v: string | null): string {
  if (!v) return 'none';
  const s = v.toLowerCase();
  if (s.includes('operator')) return 'operator';
  if (s.includes('land')) return 'land';
  if (s.includes('manager') || s.includes('via')) return 'via_manager';
  return 'none';
}

async function queryNotion(token: string, databaseId: string) {
  const features: Array<Record<string, unknown>> = [];
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

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Notion query failed (${res.status}): ${detail}`);
    }

    const data = (await res.json()) as {
      results: Array<{ id: string; url?: string; properties: Record<string, NotionProp> }>;
      has_more: boolean;
      next_cursor: string | null;
    };

    for (const page of data.results) {
      const props = page.properties ?? {};
      const lat = num(props['Latitude']);
      const lng = num(props['Longitude']);
      if (lat === null || lng === null) continue; // no location → not on the map

      const infraType = selectName(props['Infrastructure Type']);

      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {
          name: plain(props['Company / Project']) || 'Untitled',
          kind: kindOf(infraType),
          infraType: label(infraType),
          sovereignty: sovereigntyKey(selectName(props['Sovereignty / Governance'])),
          sovereigntyLabel: selectName(props['Sovereignty / Governance']),
          register: registerKey(multiNames(props['Sovereignty register'])),
          registers: multiNames(props['Sovereignty register']).join(', '),
          contested:
            selectName(props['Community Concern']) === '🔴 Active Opposition' ||
            selectName(props['Community Concern']) === '🟡 Emerging Concern',
          fastTracked:
            multiNames(props['Governance Flags']).includes('Ministerial fast-track') ||
            multiNames(props['Governance Flags']).includes('NSW State Significant Development'),
          tenants: multiNames(props['Tenant / model served']).join(', '),
          status: selectName(props['Status']),
          // Ownership chain: operator → parent → ultimate owner → country/type.
          // Parent, Ultimate Owner and Owner Type are optional Notion fields; the
          // map renders each row only when present, so it degrades gracefully.
          operator: plain(props['Operator']),
          parent: plain(props['Parent']),
          ultimateOwner: plain(props['Ultimate Owner']),
          ownerType: label(selectName(props['Owner Type'])),
          ownerTypeKey: ownerTypeKey(selectName(props['Owner Type'])),
          ownershipCountry: plain(props['Ownership Country']),
          ownershipCountryKey: ownershipCountryKey(plain(props['Ownership Country'])),
          // Lifecycle / ownership-transfer view: who owns the land vs who ends up
          // owning the asset, plus the key dates. Drives the popup infographic.
          landowner: plain(props['Landowner']),
          announcementDate: dateVal(props['Announcement date']),
          approvalDate: dateVal(props['Approval date']),
          // Australian sovereign-wealth / super-fund exposure (0..1 fraction).
          superExposure: num(props['Sovereign/super exposure (%)']),
          superExposureKey: exposureKey(num(props['Sovereign/super exposure (%)'])),
          exposureChannel: selectName(props['Super exposure channel']),
          exposureChannelKey: exposureChannelKey(selectName(props['Super exposure channel'])),
          state: selectName(props['State / Region']),
          capacity: num(props['Capacity (MW)']),
          waterRisk: label(selectName(props['Water Risk'])),
          waterRiskKey: waterRiskKey(selectName(props['Water Risk'])),
          investmentSignal: selectName(props['Investment Signal']),
          mineralFocus: multiNames(props['Mineral Focus']),
          notes: plain(props['Notes']),
          source: urlVal(props['Source']),
          notionUrl: page.url ?? null,
        },
      });
    }

    cursor = data.has_more ? data.next_cursor ?? undefined : undefined;
  } while (cursor);

  return features;
}

export async function GET() {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID || DEFAULT_DATABASE_ID;

  // Without a token we still return a valid (empty) FeatureCollection so the
  // map renders instead of erroring. The `error` field is a hint for devs.
  if (!token) {
    return Response.json(
      { type: 'FeatureCollection', features: [], error: 'NOTION_TOKEN not set' },
      { status: 200 },
    );
  }

  try {
    const features = await queryNotion(token, databaseId);
    return Response.json(
      { type: 'FeatureCollection', features },
      {
        status: 200,
        headers: {
          // Serve cached for 60s, allow stale-while-revalidate for snappy loads.
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      },
    );
  } catch (err) {
    return Response.json(
      { type: 'FeatureCollection', features: [], error: String(err) },
      { status: 502 },
    );
  }
}
