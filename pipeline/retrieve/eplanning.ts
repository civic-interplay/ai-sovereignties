// NSW ePlanning "Online" data APIs — project discovery.
//
// Unlike the contestation sources (gdelt/inbox/portals), which log *events*
// (a submission, an article) against sites that already exist in the tracker,
// this source discovers *projects*: it reads council Development Applications
// straight from the NSW ePlanning datawarehouse and surfaces the data-centre /
// critical-infra ones as candidate rows for the MAIN infra tracker.
//
// Endpoint (public, keyless — confirmed 2026-07-27):
//   https://api.apps1.nsw.gov.au/eplanning/data/v0/OnlineDA
// It is header-driven, not query-string driven: PageSize / PageNumber, and a
// JSON `filters` header. Response envelope is
//   { PageSize, PageNumber, TotalPages, TotalCount, Application: [ … ] }
//
// What the feed gives us (per DA):
//   - what's included: ApplicationType, DevelopmentType[], CostOfDevelopment,
//     storeys, subdivision, EPI-variation flag, DeterminationAuthority
//   - whether/when it goes on public exhibition:
//     AssessmentExhibitionStartDate / …EndDate  → derived Public notice
//   - real coordinates: Location[].X = longitude, Location[].Y = latitude (WGS84)
//   - CouncilName (→ LGA), FullAddress, LodgementDate, ApplicationStatus
// What it does NOT give us:
//   - the applicant / proponent ("who lodges") — no such field. Left for human
//     enrichment or the (future) SSD/Major-Projects source.
//   - State Significant Development. The flagship contested DCs (Mamre, Lane
//     Cove) are state-assessed and never appear here; this is the council tail.
//
// This module is intentionally read-only and self-contained: run it directly
//   tsx pipeline/retrieve/eplanning.ts [--councils N] [--pages N] [--since YYYY-MM-DD]
// to preview what the relevance gate catches before any write path is wired.

import { optionalEnv } from '../lib/env.ts';

const BASE = 'https://api.apps1.nsw.gov.au/eplanning/data/v0';

// Councils where NSW data-centre activity clusters (Western Sydney belt + the
// Lane Cove / Macquarie Park corridor). Names use the appendix-1 spelling in
// upper case, which the filter accepts. Trim or extend as coverage demands.
const DC_BELT_COUNCILS = [
  'PENRITH CITY COUNCIL',
  'BLACKTOWN CITY COUNCIL',
  'CUMBERLAND COUNCIL',
  'LIVERPOOL CITY COUNCIL',
  'FAIRFIELD CITY COUNCIL',
  'CAMDEN COUNCIL',
  'CAMPBELLTOWN CITY COUNCIL',
  'WOLLONDILLY SHIRE COUNCIL',
  'CITY OF PARRAMATTA COUNCIL',
  'RYDE CITY COUNCIL',
  'LANE COVE MUNICIPAL COUNCIL',
];

// A DA is relevant if its development type reads like a data centre, or if it
// is heavy industrial/warehouse AND large enough to plausibly be one (DCs are
// often lodged under generic industrial types). The cost floor keeps the
// long tail of ordinary sheds out. The final call is still a human's — these
// land as medium-confidence candidates.
const DC_TERMS = /data\s*cent(re|er)|data\s*storage|data\s*hall|hyperscale|server\s*farm/i;
const INDUSTRIAL_TERMS = /warehouse|distribution|logistics|industrial|high\s*tech|technology\s*facility/i;
const INDUSTRIAL_COST_FLOOR = 20_000_000; // AUD

const PAGE_SIZE = 100;
const DEFAULT_MAX_PAGES = 8; // per council; a safety cap on the probe

// ---- Raw API shapes (only the fields we read) -----------------------------

interface RawLot {
  Lot?: string;
  PlanLabel?: string;
}
interface RawLocation {
  FullAddress?: string;
  X?: string; // longitude
  Y?: string; // latitude
  Suburb?: string;
  Postcode?: string;
  Lot?: RawLot[];
}
interface RawDevType {
  DevelopmentType?: string;
}
interface RawApplication {
  PlanningPortalApplicationNumber?: string;
  ApplicationType?: string;
  ApplicationStatus?: string;
  CostOfDevelopment?: number;
  NumberOfStoreys?: number;
  DateLastUpdated?: string;
  LodgementDate?: string;
  DeterminationAuthority?: string;
  EPIVariationProposedFlag?: string;
  AssessmentExhibitionStartDate?: string;
  AssessmentExhibitionEndDate?: string;
  Council?: { CouncilName?: string };
  DevelopmentType?: RawDevType[];
  Location?: RawLocation[];
}
interface RawResponse {
  TotalPages?: number;
  TotalCount?: number;
  Application?: RawApplication[];
}

// ---- Normalised discovery record ------------------------------------------

export interface Discovery {
  pan: string; // PlanningPortalApplicationNumber — the natural key
  council: string;
  address: string;
  suburb: string | null;
  lat: number | null;
  lon: number | null;
  applicationType: string;
  developmentTypes: string[];
  status: string;
  cost: number | null;
  storeys: number | null;
  lodgementDate: string | null; // ISO
  lastUpdated: string | null; // ISO
  determinationAuthority: string | null;
  epiVariation: boolean; // proposes a variation to a planning standard
  exhibited: boolean | null; // true if it has an exhibition window
  exhibitionStart: string | null;
  exhibitionEnd: string | null;
  matchedOn: 'data-centre term' | 'industrial + cost';
}

function iso(d: string | undefined | null): string | null {
  if (!d) return null;
  // The feed mixes ISO datetimes ("2022-08-02T02:42:55") and DD/MM/YYYY.
  const s = d.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return null;
}

function num(v: string | number | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

// Decide relevance and, if relevant, why. Returns null for the long tail.
function classifyRelevance(app: RawApplication): Discovery['matchedOn'] | null {
  const devTypes = (app.DevelopmentType ?? [])
    .map((d) => d.DevelopmentType ?? '')
    .join(' ');
  const cost = num(app.CostOfDevelopment) ?? 0;
  if (DC_TERMS.test(devTypes)) return 'data-centre term';
  if (INDUSTRIAL_TERMS.test(devTypes) && cost >= INDUSTRIAL_COST_FLOOR) {
    return 'industrial + cost';
  }
  return null;
}

function normalise(app: RawApplication, matchedOn: Discovery['matchedOn']): Discovery {
  const loc = app.Location?.[0] ?? {};
  const exStart = iso(app.AssessmentExhibitionStartDate);
  const exEnd = iso(app.AssessmentExhibitionEndDate);
  return {
    pan: app.PlanningPortalApplicationNumber ?? '',
    council: app.Council?.CouncilName ?? '',
    address: loc.FullAddress ?? '',
    suburb: loc.Suburb ?? null,
    lat: num(loc.Y),
    lon: num(loc.X),
    applicationType: app.ApplicationType ?? '',
    developmentTypes: (app.DevelopmentType ?? [])
      .map((d) => d.DevelopmentType ?? '')
      .filter(Boolean),
    status: app.ApplicationStatus ?? '',
    cost: num(app.CostOfDevelopment),
    storeys: num(app.NumberOfStoreys),
    lodgementDate: iso(app.LodgementDate),
    lastUpdated: iso(app.DateLastUpdated),
    determinationAuthority: app.DeterminationAuthority ?? null,
    epiVariation: (app.EPIVariationProposedFlag ?? '').toUpperCase() === 'Y',
    exhibited: exStart || exEnd ? true : null,
    exhibitionStart: exStart,
    exhibitionEnd: exEnd,
    matchedOn,
  };
}

// Fetch one page of one council's DAs. Never throws: a network error or non-200
// is warned about and returns an empty page so one council can't fail the run.
async function fetchPage(
  council: string,
  pageNumber: number,
  since: string | null,
): Promise<RawResponse> {
  const filters: Record<string, unknown> = {
    CouncilName: [council],
    // Narrow to the categories a data centre would sit under before we even
    // page — this cuts thousands of residential DAs out server-side.
    DevelopmentCategory: ['Industrial', 'Commercial'],
  };
  if (since) filters.ApplicationLastUpdatedFrom = since;

  const headers: Record<string, string> = {
    PageSize: String(PAGE_SIZE),
    PageNumber: String(pageNumber),
    filters: JSON.stringify({ filters }),
  };
  // Optional: only sent if set. The datawarehouse is public, but the api.nsw.gov.au
  // gateway (or future rate limits) may want a key — future-proof, no-op today.
  const key = optionalEnv('EPLANNING_API_KEY');
  if (key) headers.apikey = key;

  let res: Response;
  try {
    res = await fetch(`${BASE}/OnlineDA`, { headers });
  } catch (err) {
    console.warn(`eplanning: fetch failed for ${council} p${pageNumber} (${String(err)}); skipping.`);
    return {};
  }
  if (!res.ok) {
    console.warn(`eplanning: ${council} p${pageNumber} returned ${res.status}; skipping.`);
    return {};
  }
  try {
    return (await res.json()) as RawResponse;
  } catch {
    console.warn(`eplanning: ${council} p${pageNumber} did not return JSON; skipping.`);
    return {};
  }
}

export async function fetchEplanning(
  opts: { councils?: string[]; maxPages?: number; since?: string | null } = {},
): Promise<Discovery[]> {
  const councils = opts.councils ?? DC_BELT_COUNCILS;
  const maxPages = opts.maxPages ?? DEFAULT_MAX_PAGES;
  const since = opts.since ?? null;

  const out: Discovery[] = [];
  for (const council of councils) {
    let page = 1;
    let totalPages = 1;
    do {
      const data = await fetchPage(council, page, since);
      totalPages = data.TotalPages ?? 0;
      for (const app of data.Application ?? []) {
        const matchedOn = classifyRelevance(app);
        if (matchedOn) out.push(normalise(app, matchedOn));
      }
      page += 1;
    } while (page <= Math.min(totalPages, maxPages));
  }
  // Dedup by PAN (a DA can recur across pages if the set shifts mid-crawl).
  const seen = new Set<string>();
  return out.filter((d) => (d.pan && !seen.has(d.pan) ? (seen.add(d.pan), true) : false));
}

// ---- Standalone preview ----------------------------------------------------

function fmt(d: Discovery): string {
  const cost = d.cost != null ? `$${(d.cost / 1e6).toFixed(1)}M` : 'cost n/a';
  const coords = d.lat != null && d.lon != null ? `${d.lat.toFixed(4)},${d.lon.toFixed(4)}` : 'no coords';
  const exhib = d.exhibited
    ? `EXHIBITED ${d.exhibitionStart ?? '?'}→${d.exhibitionEnd ?? '?'}`
    : 'no exhibition window';
  const flags = [d.epiVariation ? 'EPI-variation' : '', `via ${d.matchedOn}`].filter(Boolean).join(', ');
  return [
    `• ${d.pan}  [${d.status}]  ${cost}`,
    `    ${d.address}  (${d.council})`,
    `    type: ${d.developmentTypes.join('; ') || 'n/a'}`,
    `    ${exhib}  |  ${coords}  |  ${flags}`,
  ].join('\n');
}

async function main() {
  const argv = process.argv;
  const argOf = (n: string) => {
    const i = argv.indexOf(`--${n}`);
    return i !== -1 ? argv[i + 1] : undefined;
  };
  const councilCap = argOf('councils') ? Number(argOf('councils')) : undefined;
  const maxPages = argOf('pages') ? Number(argOf('pages')) : DEFAULT_MAX_PAGES;
  const since = argOf('since') ?? null;

  const councils = councilCap ? DC_BELT_COUNCILS.slice(0, councilCap) : DC_BELT_COUNCILS;
  console.log(
    `eplanning preview — ${councils.length} council(s), up to ${maxPages} pages each` +
      `${since ? `, updated since ${since}` : ', all history'} (read-only, no writes)\n`,
  );

  const hits = await fetchEplanning({ councils, maxPages, since });
  hits.sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0));

  for (const d of hits) console.log(fmt(d));
  const onEx = hits.filter((d) => d.exhibited).length;
  console.log(
    `\n${hits.length} relevant DA(s) across ${councils.length} council(s); ` +
      `${onEx} with an exhibition window. ` +
      `${hits.filter((d) => d.matchedOn === 'data-centre term').length} matched a data-centre term.`,
  );
}

// Run directly (tsx pipeline/retrieve/eplanning.ts …) but stay importable.
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop() ?? '')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
