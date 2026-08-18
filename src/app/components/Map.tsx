'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Public Mapbox token. If Next inlines NEXT_PUBLIC_MAPBOX_TOKEN at build time we
// use it; otherwise the token is fetched at runtime from /api/config (build-time
// inlining is unreliable on this Next + Turbopack + OpenNext stack). Publishable
// (pk.) token, restricted by URL in the Mapbox account.
if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

// Civic Interplay chrome tokens (light-touch: dark field kept, CI furniture).
const CI_FONT = 'var(--font-fira), system-ui, sans-serif';
const CI_PURPLE = '#7D50BD';
// CI periwinkle reads better than purple for a small link on the dark field.
const CI_PERIWINKLE = '#8E9BDD';

// --- Named map views, deep-linkable via ?view= -----------------------------
// So a specific city view can be sent to someone (a council, a journalist) as a
// URL that opens on that view rather than "zoom in and look at the west".
// Zoom levels frame the metro footprint, not the CBD — the sites cluster in
// outer industrial land (Truganina, Melton, Kemps Creek), so a tight CBD view
// would miss most of them.
type CityView = { label: string; center: [number, number]; zoom: number };
const CITY_VIEWS: Record<string, CityView> = {
  au: { label: 'Australia', center: [134.0, -25.0], zoom: 3.5 },
  melbourne: { label: 'Melbourne', center: [144.87, -37.81], zoom: 8.9 },
  sydney: { label: 'Sydney', center: [150.98, -33.83], zoom: 8.9 },
  brisbane: { label: 'Brisbane', center: [153.02, -27.47], zoom: 9.0 },
  perth: { label: 'Perth', center: [115.92, -31.95], zoom: 9.0 },
  adelaide: { label: 'Adelaide', center: [138.60, -34.93], zoom: 9.2 },
  canberra: { label: 'Canberra', center: [149.13, -35.28], zoom: 9.6 },
};
const DEFAULT_VIEW = 'au';

// Every layer drawn from the `sites` source, with the filter that defines what
// it draws. The stage filter is ANDed onto these rather than replacing them, so
// an overlay never survives a filter that hid the site underneath it.
const SITE_LAYER_FILTERS: Record<string, unknown[] | null> = {
  'sites-pulse': null,
  'sites-core': null,
  'sites-contested': ['==', ['get', 'contested'], true],
  'sites-fasttracked': ['==', ['get', 'fastTracked'], true],
  'sites-fasttracked-outer': ['==', ['get', 'fastTracked'], true],
  'sites-named-platform': ['==', ['get', 'namedPlatform'], true],
  'sites-named-platform-halo': ['==', ['get', 'namedPlatform'], true],
};

// Read the requested view from the URL. Unknown values fall back to the national
// view rather than erroring, so a mistyped link still lands somewhere sensible.
function viewFromUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_VIEW;
  const v = new URLSearchParams(window.location.search).get('view');
  return v && CITY_VIEWS[v] ? v : DEFAULT_VIEW;
}

// The public "publish to web" view of the Critical Infrastructure Tracker.
const NOTION_DATA_URL =
  'https://studio-esem.notion.site/8b537010f4cb4aa6b6df470f9d0d40c9?v=c9d0347781ec4900967cfff4d18a25a6';


// ---------------------------------------------------------------------------
// COLOUR SYSTEM
//
// Three separate jobs, never mixed — mixing them is what made yellow mean seven
// different things at once:
//
//   1. CATEGORICAL (identity: which kind of thing) — the seven slots below.
//      Layer / Ownership / Country / Capital.
//   2. ORDINAL (magnitude: how much, in one direction) — one hue, stepped by
//      lightness so the order is visible in the colour. Water (high→low risk)
//      and Super (direct→no link). Both previously wore identity hues, which is
//      why yellow kept landing on "the middle value".
//   3. DIVERGING (polarity: two poles that both matter) — two hues with a dim
//      middle. Energy (renewable ↔ coal/gas) and Register (owned here ↔ rented
//      offshore). These are NOT one-directional: collapsing them to a single
//      ramp forces one pole to recede, which buried `productive` — the thesis's
//      positive claim — at the dim end.
//
// OVERLAYS (contested / fast-tracked / named hyperscaler) are RESERVED: they
// never take a hue from any of the three sets, because they sit on top of
// whichever lens is active and would otherwise collide with its fills. Told
// apart by geometry rather than colour, since they are often on together:
// contested one ring, fast-tracked two rings, named hyperscaler a centre pip.
//
// Validated with the dataviz validator against this map's own surface
// (#0a0c0b), all-pairs (a dot map is an all-pairs form — any two sites can sit
// side by side). Categorical: CVD ΔE 6.4, normal-vision ΔE 17.0 (≥15 gate).
// Ordinal ramps: monotone L, adjacent ΔL ≥ 0.06, dim end ≥ 2:1 on surface.
// Slot ORDER is free to reassign for semantic fit — the all-pairs pairlist does
// not depend on order — but the SET must not change without re-validating.
// ---------------------------------------------------------------------------

// Categorical slots. Slots 4 and 5 are the Civic Interplay brand hues.
const C_OLIVE = '#929b0f';
const C_GREEN = '#067957';
const C_TEAL = '#38a1ba';
const C_PERI = '#4550b6'; // CI periwinkle hue
const C_PURPLE = '#a06cd6'; // CI purple hue
const C_ROSE = '#db687c';
const C_UMBER = '#8d5108';
// Off-scale / no-data. Deliberately outside both sets so it never reads as a
// category or as a rung on a scale.
const C_NEUTRAL = '#6b7568';

// Overlay ink — reserved, never a lens category.
// Contested is red because red means contested and nothing else on this map
// should claim it. Chosen at ΔE 9.3 from the water-high red, 10.4 from the rose
// categorical slot and 10.0 from energy-fossil, so it does not read as any of
// them; 5.5:1 on the field. Fast-tracked is white.
// Both keep their ring geometry (contested one ring, fast-tracked two) on top of
// the colour difference — redundant encoding, so the pair survives colourblind
// vision and a red-on-red fill alike.
const STATUS_CONTESTED = '#ff3b30';
const STATUS_INK_SOFT = '#ffffff';
// The named-hyperscaler pip. Was a lighter step of the CI purple (#c4a6f0),
// which read as too subtle in the field: luminance-close to several fills, so
// only the hairline separated it. Now a hot magenta — a hue no lens set uses,
// so it pops by chroma rather than luminance. Distinct from contested red
// (#ff3b30) by hue and by geometry (pip vs ring); the rose categorical slot is
// the nearest neighbour for CVD, where the pip-vs-fill geometry carries the
// difference. The dark hairline stays as the separator on bright fills, and a
// soft same-hue halo behind the pip gives it a small glow at metro zoom.
const OVERLAY_PIP = '#ff47e5';
// Emphasis for a "hot" figure inside a popup (e.g. a stressed water reading).
// Popup text only — never painted on the map, so it cannot collide with a lens
// fill. Kept as a named token so it is not mistaken for a spare category hue.
const STAT_HOT = '#ff8095';

// --- Layer lens: colour per infrastructure kind (the `kind` key from /api/sites) ---
// Categorical — slots chosen for semantic fit (water reads blue, mine earth).
const KIND_COLORS: Record<string, string> = {
  data_centre: C_TEAL,
  mine: C_UMBER,
  refinery: C_ROSE,
  energy: C_OLIVE,
  water: C_PERI,
  policy: C_PURPLE,
  geopolitical: C_GREEN,
  other: C_NEUTRAL,
};
const KIND_LABELS: Record<string, string> = {
  data_centre: 'Data centre',
  mine: 'Mine',
  refinery: 'Refinery / processing',
  energy: 'Energy / grid',
  water: 'Water',
  policy: 'Policy',
  geopolitical: 'Geopolitical',
  other: 'Other',
};
const KIND_ORDER = ['data_centre', 'mine', 'refinery', 'energy', 'water', 'policy', 'geopolitical', 'other'];

// --- Ownership lens: colour per sovereignty key (the `sovereignty` key from /api/sites) ---
// Categorical.
const SOV_COLORS: Record<string, string> = {
  australian: C_GREEN,
  foreign: C_ROSE,
  jv: C_OLIVE,
  government: C_PERI,
  defence: C_PURPLE,
  other: C_NEUTRAL,
};
const SOV_LABELS: Record<string, string> = {
  australian: 'Australian-owned',
  foreign: 'Foreign-owned',
  jv: 'Joint venture',
  government: 'Government-owned',
  defence: 'AUKUS / defence',
  other: 'Other / policy',
};
const SOV_ORDER = ['australian', 'foreign', 'jv', 'government', 'defence', 'other'];

// --- Country lens: colour per owner-country key (the `ownershipCountryKey` from /api/sites) ---
// The ultimate-owner country: where the capital behind the site actually sits.
// Categorical.
const COUNTRY_COLORS: Record<string, string> = {
  au: C_GREEN,
  us: C_PERI,
  cn: C_ROSE,
  sg: C_TEAL,
  jp: C_PURPLE,
  ch: C_UMBER,
  other: C_NEUTRAL,
};
const COUNTRY_LABELS: Record<string, string> = {
  au: 'Australia',
  us: 'United States',
  cn: 'China',
  sg: 'Singapore',
  jp: 'Japan',
  ch: 'Switzerland',
  other: 'Other / unknown',
};
const COUNTRY_ORDER = ['au', 'us', 'cn', 'sg', 'jp', 'ch', 'other'];

// Flags for the lifecycle infographic — the ownership-transfer "flag flip".
const COUNTRY_FLAG: Record<string, string> = {
  au: '🇦🇺', us: '🇺🇸', cn: '🇨🇳', sg: '🇸🇬', jp: '🇯🇵', ch: '🇨🇭', other: '🌐',
};

// --- Capital lens: colour per owner-type key (the `ownerTypeKey` from /api/sites) ---
// The *structure* of the capital, not just its flag: who this kind of owner is.
// Categorical — exactly seven real buckets plus the no-data neutral, so this
// lens fits the slot set without folding anything into "Other".
const CAPITAL_COLORS: Record<string, string> = {
  hyperscaler: C_TEAL,
  infra_fund: C_UMBER,
  pension: C_PERI,
  swf: C_ROSE,
  listed: C_OLIVE,
  state: C_PURPLE,
  private: C_GREEN,
  other: C_NEUTRAL,
};
const CAPITAL_LABELS: Record<string, string> = {
  hyperscaler: 'Hyperscaler',
  infra_fund: 'Private equity / infra fund',
  pension: 'Pension / super',
  swf: 'Sovereign wealth fund',
  listed: 'Listed / REIT',
  state: 'State-owned',
  private: 'Private / founder',
  other: 'Other / unknown',
};
const CAPITAL_ORDER = ['hyperscaler', 'infra_fund', 'pension', 'swf', 'listed', 'state', 'private', 'other'];

// --- Water-risk lens: colour per water-risk key (the `waterRiskKey` from /api/sites) ---
// STATUS, not a neutral ramp. Water stress is severity, and severity has a
// learned vocabulary: red means in trouble. A single-hue blue ramp was
// internally consistent and said nothing — a bright blue "high" reads as more
// water, not as a problem. Red is available precisely because the contested
// overlay no longer uses it (status rings are neutral now), so the alarm
// meaning is free again.
//
// Only 8 of 91 sites read `high`, which is the sparse-alarm shape red is good
// at. Bright blue is the ideal state — closed-loop, drawing nothing potable.
// Steps are the documented status scale (critical / warning) plus that blue;
// they sit outside the categorical lightness band on purpose, so a status
// colour can never be mistaken for a lens category.
// Validated all-pairs on this surface: CVD ΔE 24.4, normal-vision ΔE 28.4.
const WATER_COLORS: Record<string, string> = {
  high: '#d03b3b',
  medium: '#fab219',
  low: '#4db8ff',
  na: C_NEUTRAL,
  other: C_NEUTRAL,
};
const WATER_LABELS: Record<string, string> = {
  high: 'High — potable stressed',
  medium: 'Medium — some pressure',
  low: 'Low — closed-loop',
  // 42 of the 44 sites carrying this value are data centres, which always draw
  // water — so this is "we haven't looked yet", not "doesn't apply". Labelling
  // it "Not applicable" overstated the coverage: it read as an assessed
  // negative when it is an absence of assessment.
  na: 'Not yet assessed',
  other: 'Unknown',
};
const WATER_ORDER = ['high', 'medium', 'low', 'na'];

// --- Energy lens: colour per energy source (the `energyKey` from /api/sites) ---
// As material as water for a data centre — power draw, grid strain, emissions.
// DIVERGING — renewable and fossil are opposite poles, not two points on one
// ramp, so they get different hues: yellow for renewable, burnt orange-brown for
// coal/gas, with grid-mixed as the dim middle. A single-hue ramp made this lens
// too subtle, and on a near-black field it would have forced one pole to recede.
// Both poles stay bright so either is easy to pick out; the middle is what
// recedes. `nuclear` is a category rather than a point on the scale, so it sits
// off-scale on a categorical slot; `unknown` is neutral.
const ENERGY_COLORS: Record<string, string> = {
  renewable_onsite: '#e5cc1c',
  renewable_contracted: '#b08e00',
  grid_mixed: '#6a5339',
  grid_fossil: '#ce6234',
  nuclear: C_PURPLE,
  unknown: C_NEUTRAL,
};
const ENERGY_LABELS: Record<string, string> = {
  renewable_onsite: 'Renewable — on-site',
  renewable_contracted: 'Renewable — contracted',
  grid_mixed: 'Grid — mixed',
  grid_fossil: 'Grid — coal/gas heavy',
  nuclear: 'Nuclear (proposed)',
  unknown: 'Unknown',
};
const ENERGY_ORDER = ['renewable_onsite', 'renewable_contracted', 'grid_mixed', 'grid_fossil', 'nuclear', 'unknown'];

// --- Register lens: colour per sovereignty register (the `register` key from /api/sites) ---
// Green = capability owned/built here, red = rented to offshore tenants. The thesis in colour.
// NOT CURRENTLY SHOWN. The Type lens is hidden: `operational` has no sites,
// `financial` has two, and `rented` — the one category carrying signal — is not
// coded consistently against the tenant field, so the lens taught readers more
// about the gaps than about the argument. The evidenced version of that claim is
// now the Named hyperscaler overlay. Kept here, with the Notion field untouched,
// so the lens can come back when coverage justifies it.
//
// DIVERGING — green = capability owned and built here, rose = capacity rented to
// offshore tenants. The thesis in colour, with both poles bright because both
// matter: productive is the argument's positive claim, not a low rung on a
// scale, so it must not recede. `financial` and `operational` are the middle
// ground, each leaning toward its own pole. Poles separate at ΔE 31.2 and every
// step clears 4:1 on the field.
const REGISTER_COLORS: Record<string, string> = {
  productive: '#4ac06c',
  operational: '#11957c',
  financial: '#ac5859',
  rented: '#ec6480',
  none: C_NEUTRAL,
};
const REGISTER_LABELS: Record<string, string> = {
  productive: 'Productive (Aus-owned)',
  operational: 'Operational (public-run)',
  financial: 'Financial (≥30% public)',
  rented: 'Rented (offshore tenants)',
  none: 'Not coded',
};
const REGISTER_ORDER = ['productive', 'operational', 'financial', 'rented', 'none'];

// --- Pipeline stage: where a site sits in its build lifecycle (`status`) ---
// A FILTER, not a lens. Stage is orthogonal to every lens — you want to ask
// "which foreign-owned sites are under construction", which means stage narrows
// the set while the active lens still does the colouring. As a lens it would
// have competed for the one channel the lenses already use.
//
// The ramp below now only tints the filter chips, so the control reads in the
// same order as the pipeline: dim (earliest) to bright (operating).
// Keys mirror the tracker's own `status` wording; `unknown` is the 15 sites with
// no status recorded, held off the ramp in neutral so an absence never reads as
// an early stage.
const STAGE_COLORS: Record<string, string> = {
  Exploration: '#015e28',
  Feasibility: '#177739',
  'Application lodged': '#398e51',
  'Approved / permitted': '#55a769',
  'Under Construction': '#70c082',
  Producing: '#8bda9c',
  unknown: C_NEUTRAL,
};
const STAGE_LABELS: Record<string, string> = {
  Exploration: 'Exploration',
  Feasibility: 'Feasibility',
  'Application lodged': 'Application lodged',
  'Approved / permitted': 'Approved / permitted',
  'Under Construction': 'Under construction',
  Producing: 'Operating',
  unknown: 'Stage not recorded',
};
// The headline cut: what is operating versus what is still in the planning and
// build pipeline. Named after what `status` literally records — "here" and
// "coming" read as before/after the AI boom, which the data does not support
// (only 3 of the 38 operating sites carry any date at all). Both lists derive
// from the same field the Stage filter uses, so the coarse and fine controls
// stay in step rather than being two sources of truth.
const HERE_STAGES = ['Producing'];
const COMING_STAGES = [
  'Under Construction', 'Approved / permitted', 'Application lodged',
  'Feasibility', 'Exploration',
];

const STAGE_ORDER = [
  'Exploration', 'Feasibility', 'Application lodged',
  'Approved / permitted', 'Under Construction', 'Producing', 'unknown',
];

// --- Sovereign/super exposure lens: how much of a site is funded by Australian
// sovereign-wealth / super-fund capital (the `superExposureKey` from /api/sites).
// The activist question: is your retirement invested in the site you're fighting?
// Coloured by the *channel* through which Australian super/sovereign money
// touches the site — more telling than a single %, since exposure comes three ways.
// ORDINAL — one hue (teal), stepped by directness of exposure. Brightest is the
// most direct link (a >30% stake); `none` stays near-surface so the sites your
// super does touch are what the eye lands on.
const SUPER_COLORS: Record<string, string> = {
  operator: '#56d4d4',
  land: '#169696',
  via_manager: '#055959',
  none: '#3a3f3c',
};
const SUPER_LABELS: Record<string, string> = {
  operator: 'Direct stake (>30%)',
  land: 'Land owner',
  via_manager: 'Funded via third party',
  none: 'No known link',
};
const SUPER_ORDER = ['operator', 'land', 'via_manager', 'none'];

// Build a flattened ['key', '#colour', ..., fallback] list for a Mapbox `match`.
function matchList(colors: Record<string, string>, order: string[]): string[] {
  const out: string[] = [];
  for (const k of order) out.push(k, colors[k]);
  // Fallback for any value not in `order`. The register lens uses 'none' as its
  // catch-all rather than 'other', so fall through both to a hard default —
  // Mapbox rejects an `undefined` here ("'undefined' value invalid. Use null instead").
  out.push(colors.other ?? colors.none ?? C_NEUTRAL);
  return out;
}

type Lens = 'kind' | 'sovereignty' | 'country' | 'capital' | 'water' | 'energy' | 'register' | 'super';

// Colour expressions, one per lens. Switched at runtime via setPaintProperty.
const COLOR_EXPR: Record<Lens, mapboxgl.ExpressionSpecification> = {
  kind: ['match', ['get', 'kind'], ...matchList(KIND_COLORS, KIND_ORDER)] as unknown as mapboxgl.ExpressionSpecification,
  sovereignty: ['match', ['get', 'sovereignty'], ...matchList(SOV_COLORS, SOV_ORDER)] as unknown as mapboxgl.ExpressionSpecification,
  country: ['match', ['get', 'ownershipCountryKey'], ...matchList(COUNTRY_COLORS, COUNTRY_ORDER)] as unknown as mapboxgl.ExpressionSpecification,
  capital: ['match', ['get', 'ownerTypeKey'], ...matchList(CAPITAL_COLORS, CAPITAL_ORDER)] as unknown as mapboxgl.ExpressionSpecification,
  water: ['match', ['get', 'waterRiskKey'], ...matchList(WATER_COLORS, WATER_ORDER)] as unknown as mapboxgl.ExpressionSpecification,
  energy: ['match', ['get', 'energyKey'], ...matchList(ENERGY_COLORS, ENERGY_ORDER)] as unknown as mapboxgl.ExpressionSpecification,
  register: ['match', ['get', 'register'], ...matchList(REGISTER_COLORS, REGISTER_ORDER)] as unknown as mapboxgl.ExpressionSpecification,
  super: ['match', ['get', 'exposureChannelKey'], ...matchList(SUPER_COLORS, SUPER_ORDER)] as unknown as mapboxgl.ExpressionSpecification,
};

const EMPTY: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  // Which lens is active, and a ref so the (once-registered) popup handler can read it.
  const [lens, setLens] = useState<Lens>('kind');
  const lensRef = useRef<Lens>(lens);
  // Keys actually present in the live data, per lens, to drive the legend.
  const [kinds, setKinds] = useState<string[]>([]);
  const [sovs, setSovs] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [capitals, setCapitals] = useState<string[]>([]);
  const [waters, setWaters] = useState<string[]>([]);
  const [energies, setEnergies] = useState<string[]>([]);
  const [regs, setRegs] = useState<string[]>([]);
  const [supers, setSupers] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  // How much of the map is sized on a real number vs no disclosed capacity.
  const [capCount, setCapCount] = useState<{ known: number; total: number }>({ known: 0, total: 0 });
  // Stages currently included. Empty set means no filter (show everything),
  // which is also the initial state — the map should open unfiltered.
  const [stageFilter, setStageFilter] = useState<Set<string>>(new Set());
  // Collapsed by default: seven chips is a lot of column for a control that is
  // only reached for occasionally.
  const [stageOpen, setStageOpen] = useState(false);
  // One section open at a time; null means the rail is fully collapsed.
  const [openSection, setOpenSection] = useState<string | null>(null);
  // Phone only: the control stack collapses so the map is what you see first.
  // On desktop CSS keeps the stack visible regardless of this flag.
  const [chromeOpen, setChromeOpen] = useState(false);
  // Props for one rail row: open state plus whether the section currently holds
  // the active lens or a live toggle, so a collapsed rail still shows where the
  // map's state lives.
  const sectionProps = (id: string, active: boolean) => ({
    open: openSection === id,
    active,
    onToggle: () => setOpenSection((cur) => (cur === id ? null : id)),
  });
  // Highlight overlays: contested + state-fast-tracked sites (toggles).
  const [showContested, setShowContested] = useState(false);
  const [showFastTracked, setShowFastTracked] = useState(false);
  // Supply-chain mode: illustrative rare-earth flows to offshore separation.
  const [showSupplyChain, setShowSupplyChain] = useState(false);
  // Sites where a platform company is actually named as a tenant.
  const [showNamedPlatform, setShowNamedPlatform] = useState(false);
  // Which named view is active, mirrored into ?view= so it can be shared.
  const [view, setView] = useState<string>(DEFAULT_VIEW);
  // The Mapbox token may not be inlined at build time on this stack, so fetch it
  // at runtime from /api/config before initialising the map.
  const [tokenReady, setTokenReady] = useState<boolean>(!!mapboxgl.accessToken);

  useEffect(() => {
    if (mapboxgl.accessToken) { setTokenReady(true); return; }
    fetch('/api/config')
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => {
        const token = (c as { mapboxToken?: string } | null)?.mapboxToken;
        if (token) mapboxgl.accessToken = token;
      })
      .catch(() => {})
      .finally(() => setTokenReady(true));
  }, []);

  useEffect(() => {
    if (!tokenReady) return;
    if (map.current || !mapContainer.current) return;

    // Honour ?view= on first paint, so a shared link opens on its city rather
    // than flying there after the national view has already rendered.
    const initial = CITY_VIEWS[viewFromUrl()];

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: initial.center,
      zoom: initial.zoom,
    });

    // Zoom in/out and a compass. The map previously had no zoom affordance at
    // all — scroll/pinch only, which is undiscoverable on a shared link and
    // unusable when presenting from a trackpad.
    m.addControl(new mapboxgl.NavigationControl({ visualizePitch: false }), 'top-right');

    // Lift the basemap's geography without lifting its field. Roads, coastline
    // and place labels in dark-v11 are heavily muted, which reads as murky when
    // someone is trying to find their own suburb — but the near-black field is
    // load-bearing: every dot colour and both ordinal ramps were validated
    // against #0a0c0b, so brightening the background would invalidate them.
    // This lightens line and label layers only. BASEMAP_LIFT is the one dial:
    // 0 = untouched, 1 = white. Our own layers are skipped by id.
    const BASEMAP_LIFT = 0.34;
    const lighten = (hex: string, amount: number) => {
      const m2 = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
      if (!m2) return null;
      const n = parseInt(m2[1], 16);
      const mix = (c: number) => Math.round(c + (255 - c) * amount);
      return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255]
        .map((c) => mix(c).toString(16).padStart(2, '0'))
        .join('')}`;
    };
    const liftBasemap = () => {
      for (const layer of m.getStyle()?.layers ?? []) {
        if (layer.id.startsWith('sites-') || layer.id.startsWith('supply-')) continue;
        const props = layer.type === 'line' ? ['line-color']
          : layer.type === 'symbol' ? ['text-color']
          : [];
        // Mapbox types these per-layer-type; we are walking layers generically,
        // so the property name is only known at runtime.
        const getPaint = m.getPaintProperty.bind(m) as (id: string, name: string) => unknown;
        const setPaint = m.setPaintProperty.bind(m) as (id: string, name: string, value: unknown) => void;
        for (const prop of props) {
          try {
            const cur = getPaint(layer.id, prop);
            if (typeof cur !== 'string') continue;
            const next = lighten(cur, BASEMAP_LIFT);
            if (next) setPaint(layer.id, prop, next);
          } catch {
            // Layer does not carry this property — skip it rather than bail.
          }
        }
      }
    };

    m.on('load', async () => {
      liftBasemap();
      // Pull the live GeoJSON from the Notion-backed API route.
      let data: GeoJSON.FeatureCollection = EMPTY;
      try {
        const res = await fetch('/api/sites');
        if (res.ok) data = await res.json();
      } catch {
        // Leave the map empty on failure rather than crashing.
      }

      // Derive `namedPlatform`: does the tracker name an AI model or company as a
      // user of this site? The `tenants` field lists things like "OpenAI (GPT)"
      // and "Anthropic (Claude)" — who runs on the compute, not who leases floor
      // space, which is why "user" is the accurate word rather than "tenant".
      // "Multiple / colocation" and "Unknown" name nobody, and a government user
      // is not a hyperscaler, so neither counts. Derived here rather than read
      // from `register`, whose values do not track the tenant field consistently.
      for (const feat of data.features ?? []) {
        const raw = String((feat.properties as Record<string, unknown>)?.tenants ?? '');
        const named = raw
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t && !/^(multiple\s*\/?\s*colocation|unknown|australian government)$/i.test(t));
        (feat.properties as Record<string, unknown>).namedPlatform = named.length > 0;

        // Stage key: the tracker's `status`, or an explicit `unknown` so sites
        // with no recorded stage are visible as an absence rather than silently
        // taking the match fallback.
        const st = String((feat.properties as Record<string, unknown>)?.status ?? '').trim();
        (feat.properties as Record<string, unknown>).stageKey = st in STAGE_COLORS ? st : 'unknown';
      }

      // Drive each legend from the keys present in the data, in canonical order.
      const kindSet = new Set(data.features.map((f) => (f.properties?.kind as string) ?? 'other'));
      const sovSet = new Set(data.features.map((f) => (f.properties?.sovereignty as string) ?? 'other'));
      const countrySet = new Set(data.features.map((f) => (f.properties?.ownershipCountryKey as string) ?? 'other'));
      const capitalSet = new Set(data.features.map((f) => (f.properties?.ownerTypeKey as string) ?? 'other'));
      const waterSet = new Set(data.features.map((f) => (f.properties?.waterRiskKey as string) ?? 'na'));
      const energySet = new Set(data.features.map((f) => (f.properties?.energyKey as string) ?? 'unknown'));
      const registerSet = new Set(data.features.map((f) => (f.properties?.register as string) ?? 'none'));
      const superSet = new Set(data.features.map((f) => (f.properties?.exposureChannelKey as string) ?? 'none'));
      const stageSet = new Set(data.features.map((f) => (f.properties?.stageKey as string) ?? 'unknown'));
      setKinds(KIND_ORDER.filter((k) => kindSet.has(k)));
      setSovs(SOV_ORDER.filter((k) => sovSet.has(k)));
      setCountries(COUNTRY_ORDER.filter((k) => countrySet.has(k)));
      setCapitals(CAPITAL_ORDER.filter((k) => capitalSet.has(k)));
      setWaters(WATER_ORDER.filter((k) => waterSet.has(k)));
      setEnergies(ENERGY_ORDER.filter((k) => energySet.has(k)));
      setRegs(REGISTER_ORDER.filter((k) => registerSet.has(k)));
      setSupers(SUPER_ORDER.filter((k) => superSet.has(k)));
      setStages(STAGE_ORDER.filter((k) => stageSet.has(k)));
      setCapCount({
        known: data.features.filter((f) => typeof f.properties?.capacity === 'number').length,
        total: data.features.length,
      });

      m.addSource('sites', { type: 'geojson', data });

      const color = COLOR_EXPR[lensRef.current];

      // Radius carries disclosed capacity (MW) — so it must not invent one.
      // Most tracked sites have no MW figure in any public record (that absence
      // is the disclosure finding), and the previous `coalesce(capacity, 30)`
      // drew every one of them at the size of a real 30MW site. Undisclosed now
      // gets its own fixed, deliberately small radius, and the scale runs on to
      // 1200MW so the gigawatt campuses stop clamping to the same dot as 400MW.
      const capValue = ['coalesce', ['get', 'capacity'], -1] as unknown as mapboxgl.ExpressionSpecification;
      const capKnown = ['>', capValue, -1] as unknown as mapboxgl.ExpressionSpecification;
      const radius = (unknown: number, r30: number, r400: number, r1200: number) =>
        [
          'case',
          capKnown,
          ['interpolate', ['linear'], capValue, 30, r30, 400, r400, 1200, r1200],
          unknown,
        ] as unknown as mapboxgl.ExpressionSpecification;

      // Outer pulse ring
      m.addLayer({
        id: 'sites-pulse',
        type: 'circle',
        source: 'sites',
        paint: {
          'circle-radius': radius(13, 20, 50, 68),
          'circle-color': color,
          'circle-opacity': 0.15,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': color,
          'circle-stroke-opacity': 0.6,
        },
      });

      // Inner node. Operating sites are solid; sites still in the planning and
      // build pipeline are drawn hollow — a ring in the lens colour with an
      // almost-empty middle. That way both are on screen at once and the
      // difference is legible without spending the colour channel, which the
      // active lens already owns. Sites with no recorded stage sit between the
      // two, dimmed, so an absence never passes as either.
      const isOperating = ['==', ['get', 'stageKey'], 'Producing'];
      const isPipeline = ['in', ['get', 'stageKey'], ['literal', COMING_STAGES]];
      m.addLayer({
        id: 'sites-core',
        type: 'circle',
        source: 'sites',
        paint: {
          'circle-radius': radius(5, 8, 20, 27),
          'circle-color': color,
          'circle-opacity': ['case', isOperating, 0.9, isPipeline, 0.12, 0.4] as unknown as mapboxgl.ExpressionSpecification,
          // A sharp edge reads as "outline"; the glow is what makes a dot look solid.
          'circle-blur': ['case', isPipeline, 0, 0.3] as unknown as mapboxgl.ExpressionSpecification,
          'circle-stroke-width': ['case', isPipeline, 2, 0] as unknown as mapboxgl.ExpressionSpecification,
          'circle-stroke-color': color,
          'circle-stroke-opacity': 0.95,
        },
      });

      // Highlight overlay: contested sites. Reserved status ink, never a lens
      // hue — this ring overlays whichever lens is active, so a hue here would
      // collide with the fills (it used to be the same red as several
      // categories). Distinguished from fast-tracked by radius and weight.
      m.addLayer({
        id: 'sites-contested',
        type: 'circle',
        source: 'sites',
        filter: ['==', ['get', 'contested'], true] as unknown as mapboxgl.FilterSpecification,
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': radius(10, 16, 44, 60),
          'circle-opacity': 0,
          'circle-stroke-width': 2.5,
          'circle-stroke-color': STATUS_CONTESTED,
          'circle-stroke-opacity': 0.95,
        },
      });

      // Highlight overlay: state-fast-tracked sites. Also reserved status ink.
      // Drawn as a DOUBLE ring (two concentric circles) against contested's
      // single one: with both statuses neutral so neither collides with the lens
      // fills, ring *count* is what tells them apart — and the two overlays are
      // often on together, which is the point of the map. Both rings sit outside
      // contested's radius so a site carrying both reads as one bright inner
      // ring plus two softer outer ones.
      for (const [id, rU, r0, r1, r2] of [
        ['sites-fasttracked', 15, 23, 53, 72],
        ['sites-fasttracked-outer', 19, 28, 60, 81],
      ] as const) {
        m.addLayer({
          id,
          type: 'circle',
          source: 'sites',
          filter: ['==', ['get', 'fastTracked'], true] as unknown as mapboxgl.FilterSpecification,
          layout: { visibility: 'none' },
          paint: {
            'circle-radius': radius(rU, r0, r1, r2),
            'circle-opacity': 0,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': STATUS_INK_SOFT,
            'circle-stroke-opacity': 0.9,
          },
        });
      }

      // Highlight overlay: a platform company is actually named as a tenant.
      // Filtered on the derived `namedPlatform` flag rather than on `register`,
      // because the register value did not follow the tenant data consistently —
      // this marks only what the tracker can evidence.
      //
      // Drawn as a filled centre pip rather than another ring: contested and
      // fast-tracked already use one and two rings, and a third would be
      // unreadable. A pip is a different channel, so all three can be on at once.
      // Soft halo behind the pip — same hue, blurred — so the marked sites glow
      // slightly at metro zoom without claiming another geometry channel.
      m.addLayer({
        id: 'sites-named-platform-halo',
        type: 'circle',
        source: 'sites',
        filter: ['==', ['get', 'namedPlatform'], true] as unknown as mapboxgl.FilterSpecification,
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': radius(5, 7, 13, 17),
          'circle-color': OVERLAY_PIP,
          'circle-opacity': 0.3,
          'circle-blur': 1,
        },
      });
      m.addLayer({
        id: 'sites-named-platform',
        type: 'circle',
        source: 'sites',
        filter: ['==', ['get', 'namedPlatform'], true] as unknown as mapboxgl.FilterSpecification,
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': radius(2.5, 3, 6.5, 8.5),
          'circle-color': OVERLAY_PIP,
          'circle-opacity': 0.95,
          'circle-stroke-width': 1.75,
          'circle-stroke-color': '#0a0c0b',
          'circle-stroke-opacity': 0.8,
        },
      });

      // --- Supply-chain mode (illustrative): where Australian AI compute's inputs sit ---
      // Australia mines the raw inputs and hosts the buildings, but the three things
      // that actually make compute — chips (Taiwan), servers/hardware (China), and
      // rare-earth separation & magnets (China) — are all offshore. Lines carry each
      // dependency out; domestic processors (green rings) are the "closing the loop".
      const OFFSHORE_NODES = [
        { dep: 'rare_earth', label: 'Rare-earth separation (China) — contested', lng: 108, lat: 34, color: C_ROSE },
        { dep: 'malaysia', label: 'Lynas separation (Malaysia · non-China)', lng: 103.3, lat: 3.8, color: C_OLIVE },
        { dep: 'chips', label: 'AI chips (Taiwan · TSMC)', lng: 121, lat: 23.8, color: C_TEAL },
        { dep: 'hardware', label: 'Servers & hardware (China)', lng: 114, lat: 22.5, color: C_UMBER },
      ];
      const nodeOf = (dep: string) => OFFSHORE_NODES.find((n) => n.dep === dep)!;
      // Rare-earth routing is per-mine, not a blanket "→ China". Lynas separates in
      // Malaysia (non-China); Browns Range is the contested China link (FIRB forced
      // the Chinese stake to divest); Arafura and others process onshore, so no
      // offshore line. Larvotto is antimony, not rare earths — excluded here.
      const reeRoute = (name: string): string | null => {
        if (name.includes('Browns Range')) return 'rare_earth';
        if (name.includes('Mt Weld')) return 'malaysia';
        return null;
      };
      const lineFeatures: GeoJSON.Feature[] = [];
      for (const f of data.features) {
        if (f.geometry?.type !== 'Point') continue;
        const from = (f.geometry as GeoJSON.Point).coordinates;
        const name = (f.properties?.name as string) ?? '';
        const link = (dep: string) => {
          const n = nodeOf(dep);
          lineFeatures.push({
            type: 'Feature', properties: { dep },
            geometry: { type: 'LineString', coordinates: [from, [n.lng, n.lat]] },
          });
        };
        if (f.properties?.kind === 'mine') { const r = reeRoute(name); if (r) link(r); }
        if (f.properties?.kind === 'data_centre') { link('chips'); link('hardware'); }
      }
      m.addSource('supply-lines', { type: 'geojson', data: { type: 'FeatureCollection', features: lineFeatures } });
      m.addSource('supply-offshore', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: OFFSHORE_NODES.map((n) => ({
            type: 'Feature' as const,
            properties: { label: n.label, color: n.color },
            geometry: { type: 'Point' as const, coordinates: [n.lng, n.lat] },
          })),
        },
      });
      const depColor = ['match', ['get', 'dep'], 'rare_earth', C_ROSE, 'malaysia', C_OLIVE, 'chips', C_TEAL, 'hardware', C_UMBER, C_ROSE] as unknown as mapboxgl.ExpressionSpecification;
      m.addLayer({
        id: 'supply-lines', type: 'line', source: 'supply-lines',
        layout: { visibility: 'none', 'line-cap': 'round' },
        paint: { 'line-color': depColor, 'line-width': 0.8, 'line-opacity': 0.35, 'line-dasharray': [2, 2] },
      });
      m.addLayer({
        id: 'supply-domestic', type: 'circle', source: 'sites',
        filter: ['==', ['get', 'kind'], 'refinery'] as unknown as mapboxgl.FilterSpecification,
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': 15, 'circle-color': C_GREEN, 'circle-opacity': 0,
          'circle-stroke-width': 2, 'circle-stroke-color': C_GREEN, 'circle-stroke-opacity': 0.9,
        },
      });
      m.addLayer({
        id: 'supply-offshore-core', type: 'circle', source: 'supply-offshore',
        layout: { visibility: 'none' },
        paint: { 'circle-radius': 10, 'circle-color': ['get', 'color'] as unknown as mapboxgl.ExpressionSpecification, 'circle-opacity': 0.85, 'circle-blur': 0.3 },
      });
      m.addLayer({
        id: 'supply-offshore-label', type: 'symbol', source: 'supply-offshore',
        layout: {
          visibility: 'none',
          'text-field': ['get', 'label'] as unknown as mapboxgl.ExpressionSpecification,
          'text-size': 10, 'text-offset': [0, 1.4], 'text-anchor': 'top',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Regular'],
        },
        paint: { 'text-color': '#e6ebe6', 'text-halo-color': '#0a0c0b', 'text-halo-width': 1.2 },
      });

      // Popup on click
      m.on('click', 'sites-core', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const p = feature.properties as Record<string, string>;
        // Accent the popup with the active lens colour.
        const lensNow = lensRef.current;
        const colorByLens: Record<Lens, string> = {
          kind: KIND_COLORS[p.kind] ?? KIND_COLORS.other,
          sovereignty: SOV_COLORS[p.sovereignty] ?? SOV_COLORS.other,
          country: COUNTRY_COLORS[p.ownershipCountryKey] ?? COUNTRY_COLORS.other,
          capital: CAPITAL_COLORS[p.ownerTypeKey] ?? CAPITAL_COLORS.other,
          water: WATER_COLORS[p.waterRiskKey] ?? WATER_COLORS.other,
          energy: ENERGY_COLORS[p.energyKey] ?? ENERGY_COLORS.unknown,
          register: REGISTER_COLORS[p.register] ?? REGISTER_COLORS.none,
          super: SUPER_COLORS[p.exposureChannelKey] ?? SUPER_COLORS.none,
        };
        const color = colorByLens[lensNow];
        const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];

        const sovereignty = p.sovereigntyLabel || '';
        const rows = [
          p.status && row('Status', p.status),
          // Ownership chain, most-proximate to ultimate. Each row appears only
          // when the field is populated in Notion.
          p.operator && row('Operator', p.operator),
          p.parent && row('Parent', p.parent),
          p.ultimateOwner && row('Ultimate owner', p.ultimateOwner),
          p.ownerType && row('Owner type', p.ownerType),
          p.ownershipCountry && row('Owner country', p.ownershipCountry),
          (p.exposureChannelKey && p.exposureChannelKey !== 'none')
            ? row('Super exposure', (SUPER_LABELS[p.exposureChannelKey] ?? '') +
                (Number(p.superExposure) > 0 ? ' · ' + Math.round(Number(p.superExposure) * 100) + '%' : ''))
            : '',
          p.capacity && row('Capacity', p.capacity + ' MW'),
          // Pathway, then any governance flags directly beneath it: the flags
          // are findings about how this approval was handled, so they read as
          // an annotation on the pathway rather than a separate attribute.
          (p.pathway || p.publicNotice) &&
            row('Pathway', [p.pathway, p.publicNotice].filter(Boolean).join(' · ')),
          flagsHtml(p.governanceFlags),
          p.registers && row('Register', p.registers),
          p.tenants && row('Serves', p.tenants),
          p.waterRisk && row('Water risk', p.waterRisk),
          p.energySource && row('Energy', p.energySource),
          p.state && row('Region', p.state),
        ].filter(Boolean).join('');

        // Link to the full Notion entry (its Source field carries the report link),
        // rather than jumping straight to a raw external URL.
        const link = p.notionPublicUrl
          ? '<a href="' + p.notionPublicUrl + '" target="_blank" rel="noreferrer" style="color:' + color + ';font-size:10px;text-decoration:none;">details ↗</a>'
          : '';

        new mapboxgl.Popup({ closeButton: false, className: 'sovereignty-popup' })
          .setLngLat(coords)
          .setHTML(
            '<div style="background:#0a0c0b;border:1px solid ' + color + ';border-radius:12px;padding:10px 14px;font-family:var(--font-fira),system-ui,sans-serif;font-size:11px;color:#c8cfc4;min-width:200px;">' +
            '<div style="color:' + color + ';font-size:10px;letter-spacing:0.15em;margin-bottom:6px;text-transform:uppercase;">' + (p.infraType || '') + '</div>' +
            '<div style="font-size:13px;margin-bottom:4px;">' + (p.name || '') + '</div>' +
            (sovereignty ? '<div style="color:#6b7568;font-size:10px;margin-bottom:6px;">' + sovereignty + '</div>' : '') +
            rows +
            lifecycleHtml(p) +
            (link ? '<div style="margin-top:6px;">' + link + '</div>' : '') +
            '</div>',
          )
          .addTo(m);
      });

      m.on('mouseenter', 'sites-core', () => { m.getCanvas().style.cursor = 'pointer'; });
      m.on('mouseleave', 'sites-core', () => { m.getCanvas().style.cursor = ''; });
    });

    map.current = m;
  }, [tokenReady]);

  // Recolour the nodes when the lens changes (layers exist only after load).
  useEffect(() => {
    lensRef.current = lens;
    const m = map.current;
    if (!m || !m.getLayer('sites-core')) return;
    const color = COLOR_EXPR[lens];
    m.setPaintProperty('sites-core', 'circle-color', color);
    m.setPaintProperty('sites-pulse', 'circle-color', color);
    m.setPaintProperty('sites-pulse', 'circle-stroke-color', color);
  }, [lens]);

  // Toggle the highlight overlays when their buttons change.
  useEffect(() => {
    const m = map.current;
    if (!m || !m.getLayer('sites-contested')) return;
    m.setLayoutProperty('sites-contested', 'visibility', showContested ? 'visible' : 'none');
  }, [showContested]);
  useEffect(() => {
    const m = map.current;
    if (!m || !m.getLayer('sites-fasttracked')) return;
    // Both rings of the double-ring overlay toggle together.
    for (const id of ['sites-fasttracked', 'sites-fasttracked-outer']) {
      if (m.getLayer(id)) m.setLayoutProperty(id, 'visibility', showFastTracked ? 'visible' : 'none');
    }
  }, [showFastTracked]);

  useEffect(() => {
    const m = map.current;
    if (!m || !m.getLayer('sites-named-platform')) return;
    m.setLayoutProperty('sites-named-platform', 'visibility', showNamedPlatform ? 'visible' : 'none');
    m.setLayoutProperty('sites-named-platform-halo', 'visibility', showNamedPlatform ? 'visible' : 'none');
  }, [showNamedPlatform]);

  // Re-apply the stage filter to every site layer whenever the selection changes.
  useEffect(() => {
    const m = map.current;
    if (!m || !m.getLayer('sites-core')) return;
    const keys = [...stageFilter];
    for (const [id, base] of Object.entries(SITE_LAYER_FILTERS)) {
      if (!m.getLayer(id)) continue;
      const stageExpr = keys.length
        ? ['in', ['get', 'stageKey'], ['literal', keys]]
        : null;
      const combined = stageExpr && base ? ['all', base, stageExpr] : (stageExpr ?? base);
      m.setFilter(id, (combined ?? null) as unknown as mapboxgl.FilterSpecification);
    }
  }, [stageFilter]);

  // Adopt the view named in the URL on mount, and keep the two in step when the
  // reader uses the browser's back/forward buttons.
  useEffect(() => {
    setView(viewFromUrl());
    const onPop = () => {
      const key = viewFromUrl();
      setView(key);
      map.current?.flyTo({ ...CITY_VIEWS[key], duration: 900 });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Fly to a named view and write it into the URL, so the address bar is always
  // a shareable link to whatever is on screen. pushState (not replaceState) so
  // Back returns to the previous view — useful when presenting.
  function goToView(key: string) {
    const v = CITY_VIEWS[key];
    if (!v) return;
    setView(key);
    map.current?.flyTo({ center: v.center, zoom: v.zoom, duration: 900 });
    const url = new URL(window.location.href);
    if (key === DEFAULT_VIEW) url.searchParams.delete('view');
    else url.searchParams.set('view', key);
    window.history.pushState({ view: key }, '', url);
  }

  // Supply-chain mode: show/hide the offshore-dependency layers and zoom out to
  // frame Australia + the offshore node together.
  useEffect(() => {
    const m = map.current;
    if (!m || !m.getLayer('supply-lines')) return;
    const vis = showSupplyChain ? 'visible' : 'none';
    ['supply-lines', 'supply-domestic', 'supply-offshore-core', 'supply-offshore-label'].forEach(
      (id) => m.getLayer(id) && m.setLayoutProperty(id, 'visibility', vis),
    );
    if (showSupplyChain) {
      m.fitBounds([[100, -44], [155, 40]], { padding: 60, duration: 900 });
    } else {
      m.flyTo({ center: [134.0, -25.0], zoom: 3.5, duration: 900 });
    }
  }, [showSupplyChain]);

  // Legend config per lens — add a new lens here and it flows to legend + popups.
  const legend = {
    kind: { items: kinds, colors: KIND_COLORS, labels: KIND_LABELS, title: 'Infrastructure' },
    sovereignty: { items: sovs, colors: SOV_COLORS, labels: SOV_LABELS, title: 'Ownership' },
    country: { items: countries, colors: COUNTRY_COLORS, labels: COUNTRY_LABELS, title: 'Owner country' },
    capital: { items: capitals, colors: CAPITAL_COLORS, labels: CAPITAL_LABELS, title: 'Capital type' },
    water: { items: waters, colors: WATER_COLORS, labels: WATER_LABELS, title: 'Water risk' },
    energy: { items: energies, colors: ENERGY_COLORS, labels: ENERGY_LABELS, title: 'Energy source' },
    register: { items: regs, colors: REGISTER_COLORS, labels: REGISTER_LABELS, title: 'Sovereignty type' },
    super: { items: supers, colors: SUPER_COLORS, labels: SUPER_LABELS, title: 'Super / sovereign link' },
  }[lens];
  const { items, colors, labels, title: legendTitle } = legend;

  // Which rail section set the lens that is currently colouring the map.
  const LENS_SECTION: Record<string, string> = {
    kind: 'infra',
    sovereignty: 'invest', country: 'invest', capital: 'invest', super: 'invest',
    water: 'resource', energy: 'resource',
  };
  const legendOwner = LENS_SECTION[lens];
  // Overlay definitions. These live in their section's pop-out, not the rail —
  // a definition floating under a collapsed section reads as loose commentary,
  // and it was rendering whenever the toggle was on regardless of the section.
  const defBlock = (children: React.ReactNode) => (
    <div style={{ width: '100%', borderTop: '1px solid #2a302e', marginTop: 4, paddingTop: 6,
                  padding: '7px 6px 3px', fontSize: 11, lineHeight: 1.65, color: INK_MUTED }}>
      {children}
    </div>
  );
  const contestedDef = showContested ? defBlock(
    <>
      <RingGlyph rings={1} color={STATUS_CONTESTED} />
      <span style={{ color: STATUS_CONTESTED }}>Contested</span> — active or emerging community opposition,
      tracked through the planning pathways: public-exhibition submissions and objections, council
      minutes and motions, merit appeals, parliamentary petitions, and media or FOI.
    </>,
  ) : null;
  const fastTrackedDef = showFastTracked ? defBlock(
    <>
      <RingGlyph rings={2} color={STATUS_INK_SOFT} />
      <span style={{ color: STATUS_INK_SOFT }}>State fast-tracked</span> — not subject to normal public
      consultation: assessed as State Significant Development, or approved without public exhibition.
    </>,
  ) : null;
  const namedDef = showNamedPlatform ? defBlock(
    <>
      <span
        aria-hidden
        style={{
          display: 'inline-block', width: 6, height: 6, marginRight: 5, borderRadius: '50%',
          background: OVERLAY_PIP, border: '1px solid rgba(10,12,11,0.55)',
          verticalAlign: 'middle', transform: 'translateY(-1px)',
        }}
      />
      <span style={{ color: OVERLAY_PIP }}>Named hyperscaler</span> — AI model or company is named as a user.
    </>,
  ) : null;

  const statusDef = defBlock(
    <>
      <span
        aria-hidden
        style={{
          display: 'inline-block', width: 8, height: 8, marginRight: 5, borderRadius: '50%',
          background: '#c8cfc4', verticalAlign: 'middle', transform: 'translateY(-1px)',
        }}
      />
      <span style={{ color: '#c8cfc4' }}>Solid</span> — operating.{' '}
      <span
        aria-hidden
        style={{
          display: 'inline-block', width: 8, height: 8, marginLeft: 4, marginRight: 5,
          borderRadius: '50%', border: '2px solid #c8cfc4', verticalAlign: 'middle',
          transform: 'translateY(-1px)',
        }}
      />
      <span style={{ color: '#c8cfc4' }}>Hollow</span> — in the planning or build pipeline. Both are
      drawn at once; the buttons above narrow to one.
    </>,
  );

  const legendNode = items.length ? (
    <div style={{ width: '100%', borderTop: '1px solid #2a302e', marginTop: 4, paddingTop: 6 }}>
      <div
        style={{
          fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: INK_MUTED, marginBottom: 6, padding: '0 6px',
        }}
      >
        {legendTitle}
      </div>
      {items.map((k) => (
        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, lineHeight: 1.9, padding: '0 6px' }}>
          <span
            style={{
              width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
              background: colors[k], boxShadow: `0 0 6px ${colors[k]}`,
            }}
          />
          <span style={{ fontSize: 11.5 }}>{labels[k]}</span>
        </div>
      ))}
    </div>
  ) : null;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      <div
        className="ci-column"
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          alignItems: 'flex-start',
          // The column grew past the viewport once it carried a masthead, city
          // jumps, eight lenses, three overlays and a legend — so it scrolls
          // within the screen rather than running off the bottom. Wheel events
          // over the column never reach the map canvas, so this does not fight
          // scroll-zoom.
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: 6,
          scrollbarWidth: 'thin',
          scrollbarColor: '#3f4744 transparent',
        }}
      >
        {/* Masthead. Names what the map covers and links out to the source data. */}
        <div style={panel}>
          <div style={{ fontSize: 15, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Australian Data Centres
          </div>
          <div style={{ fontSize: 11.5, color: INK_MUTED, marginTop: 5, maxWidth: 210, lineHeight: 1.55 }}>
            Monitoring data centre investments as a super cycle urban transition.
          </div>
          <a
            href={NOTION_DATA_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-block',
              marginTop: 8,
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: CI_PERIWINKLE,
              textDecoration: 'none',
            }}
          >
            Source data ↗
          </a>
          <a
            href="/sheets"
            style={{
              display: 'inline-block',
              marginTop: 8,
              marginLeft: 14,
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: CI_PERIWINKLE,
              textDecoration: 'none',
            }}
          >
            Data sheets
          </a>
          <a
            href="https://civicinterplay.io/data-centres-map/"
            target="_top"
            rel="noreferrer"
            style={{
              display: 'inline-block',
              marginTop: 8,
              marginLeft: 14,
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: CI_PERIWINKLE,
              textDecoration: 'none',
            }}
          >
            About ↗
          </a>
        </div>

        <button
          type="button"
          className="ci-menu-btn"
          aria-expanded={chromeOpen}
          onClick={() => setChromeOpen((v) => !v)}
          style={{
            ...panel,
            padding: '10px 12px',
            width: '100%',
            cursor: 'pointer',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#e6ebe6',
            borderColor: chromeOpen ? CI_PURPLE : '#3f4744',
          }}
        >
          <span aria-hidden style={{ fontSize: 13, lineHeight: 1 }}>{chromeOpen ? '\u2715' : '\u2261'}</span>
          <span style={{ flex: 1, textAlign: 'left' }}>{chromeOpen ? 'Close' : 'Lenses & filters'}</span>
        </button>

        <div
          className="ci-controls"
          data-open={chromeOpen ? 'true' : 'false'}
        >
        <Section title="Jump to city" {...sectionProps('city', view !== DEFAULT_VIEW)}>
          {Object.entries(CITY_VIEWS).map(([key, v]) => (
            <button
              key={key}
              type="button"
              style={tab(view === key)}
              onClick={() => goToView(key)}
              aria-pressed={view === key}
            >
              {v.label}
            </button>
          ))}
        </Section>

        {/* Lenses recolour the map (one at a time); the overlay toggles sit on
            top of whichever lens is active. Both live here because they answer
            the same question — who owns and funds this. */}
        <Section title="Investment model" {...sectionProps('invest', ['sovereignty', 'country', 'capital', 'super'].includes(lens) || showNamedPlatform)} footer={<>{legendOwner === 'invest' ? legendNode : null}{namedDef}</>}>
          <button type="button" style={tab(lens === 'sovereignty')} onClick={() => setLens('sovereignty')}>
            Ownership
          </button>
          <button type="button" style={tab(lens === 'country')} onClick={() => setLens('country')}>
            Country
          </button>
          <button type="button" style={tab(lens === 'capital')} onClick={() => setLens('capital')}>
            Capital
          </button>
          <button type="button" style={tab(lens === 'super')} onClick={() => setLens('super')}>
            Super $
          </button>
          <button
            type="button"
            style={tab(showNamedPlatform)}
            aria-pressed={showNamedPlatform}
            onClick={() => setShowNamedPlatform((v) => !v)}
          >
            Named hyperscaler
          </button>
        </Section>

        <Section title="Resource use" {...sectionProps('resource', ['water', 'energy'].includes(lens))} footer={legendOwner === 'resource' ? legendNode : null}>
          <button type="button" style={tab(lens === 'water')} onClick={() => setLens('water')}>
            Water
          </button>
          <button type="button" style={tab(lens === 'energy')} onClick={() => setLens('energy')}>
            Energy
          </button>
        </Section>

        <Section title="Planning priority" {...sectionProps('planning', showContested || showFastTracked)} footer={<>{contestedDef}{fastTrackedDef}</>}>
          <button
            type="button"
            style={tab(showContested)}
            aria-pressed={showContested}
            onClick={() => setShowContested((v) => !v)}
          >
            Contested
          </button>
          <button
            type="button"
            style={tab(showFastTracked)}
            aria-pressed={showFastTracked}
            onClick={() => setShowFastTracked((v) => !v)}
          >
            State fast-tracked
          </button>
        </Section>

        {/* The coarse cut. Mutually exclusive by construction: selecting one
            replaces the filter, so "Not recorded" can never be held alongside
            Operating or In pipeline. */}
        <Section title="Development status" {...sectionProps('status', stageFilter.size > 0)} footer={statusDef}>
          {([
            ['Operating', HERE_STAGES],
            ['In pipeline', COMING_STAGES],
            ['Not recorded', ['unknown']],
          ] as const).map(([label, keys]) => {
            const present = keys.filter((k) => stages.includes(k));
            if (!present.length) return null;
            const on = present.length === stageFilter.size
              && present.every((k) => stageFilter.has(k));
            return (
              <button
                key={label}
                type="button"
                aria-pressed={on}
                onClick={() => setStageFilter(on ? new Set() : new Set(present))}
                style={{ ...tab(on), letterSpacing: '0.06em' }}
              >
                {label}
              </button>
            );
          })}
          <button
            type="button"
            aria-expanded={stageOpen}
            onClick={() => setStageOpen((v) => !v)}
            style={{ ...tab(false), color: CI_PERIWINKLE, letterSpacing: '0.06em' }}
          >
            {stageOpen ? 'Less' : 'By stage'}
          </button>
          {stageOpen && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, width: '100%', paddingTop: 2 }}>
              {stages.map((k) => {
                const on = stageFilter.has(k);
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setStageFilter((prev) => {
                        const next = new Set(prev);
                        if (next.has(k)) next.delete(k);
                        else next.add(k);
                        return next;
                      })
                    }
                    style={{ ...tab(on), display: 'flex', alignItems: 'center', gap: 5, letterSpacing: '0.06em' }}
                  >
                    <span
                      aria-hidden
                      style={{ width: 6, height: 6, borderRadius: '50%', background: STAGE_COLORS[k], flex: '0 0 auto' }}
                    />
                    {STAGE_LABELS[k]}
                  </button>
                );
              })}
            </div>
          )}
        </Section>

        {/* Layer asks "what kind of thing is this" — sited next to the supply
            chain, where the mines and refineries it distinguishes are the ones
            that matter. */}
        <Section title="Infrastructure type" {...sectionProps('infra', lens === 'kind')} footer={legendOwner === 'infra' ? legendNode : null}>
          <button type="button" style={tab(lens === 'kind')} onClick={() => setLens('kind')}>
            Layer
          </button>
        </Section>

        <Section title="Global supply chain" {...sectionProps('supply', showSupplyChain)}>
          <button
            type="button"
            style={tab(showSupplyChain)}
            aria-pressed={showSupplyChain}
            onClick={() => setShowSupplyChain((v) => !v)}
          >
            Supply chain
          </button>
          {showSupplyChain && (
            <div style={{ fontSize: 11, color: INK_MUTED, lineHeight: 1.6, padding: '5px 6px 3px', width: '100%' }}>
              Illustrative flows from each site to where its inputs are made or processed. Green rings mark
              onshore processing.
            </div>
          )}
        </Section>

        </div>

        {/* What is currently on. The rail collapses to stay short, which means
              the controls no longer show their own state — so this says it
              instead, with the same mark each thing wears on the map. It sits at
              the foot of the column rather than pinned bottom-left, where Mapbox's
              own logo and compass sat on top of it and a tall list ran off screen. */}
        <div
          style={{
            ...panel,
            padding: '8px 12px',
            maxWidth: 232,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}
        >
          <div
            style={{
              fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: INK_MUTED, marginBottom: 1,
            }}
          >
            Selected
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
            <span
              aria-hidden
              style={{
                width: 9, height: 9, borderRadius: '50%', flex: '0 0 auto',
                background: items.length ? colors[items[0]] : C_NEUTRAL,
              }}
            />
            <span>Colour: {legendTitle}</span>
          </div>

          {/* Size key. Radius carries disclosed capacity, and most sites have no
              disclosed capacity at all — so the key has to name the absence,
              not just the scale, or a reader reads "small" for "unrecorded". */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
            <span aria-hidden style={{ display: 'flex', alignItems: 'center', gap: 3, width: 9, flex: '0 0 auto' }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: C_NEUTRAL, flex: '0 0 auto' }} />
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: C_NEUTRAL, flex: '0 0 auto' }} />
            </span>
            <span style={{ marginLeft: 6 }}>Size: capacity (MW)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: INK_MUTED }}>
            <span
              aria-hidden
              style={{
                width: 9, height: 9, borderRadius: '50%', flex: '0 0 auto',
                border: `1px dashed ${INK_MUTED}`,
              }}
            />
            <span>
              Smallest dot: no capacity disclosed
              {capCount.total > 0 && ` (${capCount.total - capCount.known} of ${capCount.total})`}
            </span>
          </div>

          {view !== DEFAULT_VIEW && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: INK_MUTED }}>
              <span aria-hidden style={{ width: 9, textAlign: 'center', flex: '0 0 auto' }}>◎</span>
              <span>{CITY_VIEWS[view].label}</span>
            </div>
          )}

          {stageFilter.size > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: INK_MUTED }}>
              <span aria-hidden style={{ width: 9, textAlign: 'center', flex: '0 0 auto' }}>▣</span>
              <span>
                {(() => {
                  // Name the coarse selection rather than spelling out its five
                  // stages, which wrapped to three lines on a phone.
                  const sel = [...stageFilter];
                  const same = (set: readonly string[]) =>
                    sel.length === set.length && set.every((k) => stageFilter.has(k));
                  if (same(HERE_STAGES)) return 'Operating';
                  if (same(COMING_STAGES)) return 'In pipeline';
                  return sel.map((k) => STAGE_LABELS[k] ?? k).join(', ');
                })()}
              </span>
            </div>
          )}

          {showContested && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
              <RingGlyph rings={1} color={STATUS_CONTESTED} />
              <span>Contested</span>
            </div>
          )}
          {showFastTracked && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
              <RingGlyph rings={2} color={STATUS_INK_SOFT} />
              <span>State fast-tracked</span>
            </div>
          )}
          {showNamedPlatform && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
              <span
                aria-hidden
                style={{
                  width: 9, height: 9, borderRadius: '50%', flex: '0 0 auto',
                  background: OVERLAY_PIP, border: '1px solid rgba(10,12,11,0.55)',
                }}
              />
              <span>Named hyperscaler</span>
            </div>
          )}
          {showSupplyChain && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: INK_MUTED }}>
              <span aria-hidden style={{ width: 9, textAlign: 'center', flex: '0 0 auto' }}>↗</span>
              <span>Supply chain</span>
            </div>
          )}
        </div>

        {/* legend now lives inside the owning section's pop-out (see legendNode) */}
        {false && (
          <div style={{ ...panel, minWidth: 140 }}>
            <div
              style={{
                fontSize: 10,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: INK_MUTED,
                marginBottom: 8,
              }}
            >
              {legendTitle}
            </div>
            {items.map((k) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, lineHeight: 1.9 }}>
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: colors[k],
                    boxShadow: `0 0 6px ${colors[k]}`,
                  }}
                />
                <span>{labels[k]}</span>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}

// Shared panel chrome for the overlay blocks.
// Muted ink for secondary copy inside the chrome. Lifted with the panel so it
// keeps roughly the same relationship to the background.
const INK_MUTED = '#8a938c';

const panel: React.CSSProperties = {
  // A step lighter than the map field so the column reads as chrome sitting
  // over the map rather than a hole cut in it. Held at #121618: the next step
  // up drops the dimmest ordinal swatch (renewable on-site) below the 2:1
  // floor it needs against its own background.
  background: '#121618',
  border: '1px solid #3f4744',
  borderRadius: 12,
  padding: '10px 14px',
  fontFamily: CI_FONT,
  fontSize: 11,
  color: '#c8cfc4',
};

// A single segmented-control button, highlighted in CI purple when active.
// Legend glyph mirroring how a status reads on the map: contested is one ring,
// fast-tracked is two. Both statuses are neutral ink so they never impersonate a
// lens colour, which makes ring count the thing that distinguishes them — so the
// legend has to show the count, not just name the status.
function RingGlyph({ rings, color }: { rings: 1 | 2; color: string }) {
  const size = rings === 2 ? 13 : 9;
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block', width: size, height: size, marginRight: 5,
        borderRadius: '50%', border: `1.5px solid ${color}`,
        boxShadow: rings === 2 ? `inset 0 0 0 1.5px transparent, 0 0 0 0 ${color}` : undefined,
        outline: rings === 2 ? `1.5px solid ${color}` : undefined,
        outlineOffset: rings === 2 ? 1.5 : undefined,
        verticalAlign: 'middle', transform: 'translateY(-1px)',
      }}
    />
  );
}

// A row in the control column: the section name on the rail, and — when open —
// its controls popped out to the right, anchored to that row. Collapsed by
// default so the column stays short; the rail carries an active dot so you can
// see which section holds the current lens or a live toggle without opening it.
function Section({
  title, open, active, onToggle, children, footer,
}: {
  title: string;
  open: boolean;
  active: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  // The legend for whichever lens this section owns. It belongs beside the
  // control that set it — stranded at the bottom of the column the eye skips it.
  footer?: React.ReactNode;
}) {
  return (
    <div className="ci-section-row">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="ci-rail-btn"
        style={{
          ...panel,
          padding: '8px 10px',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          fontSize: 12,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: open ? '#e6ebe6' : INK_MUTED,
          borderColor: open ? CI_PURPLE : '#3f4744',
        }}
      >
        <span
          aria-hidden
          style={{
            width: 5, height: 5, borderRadius: '50%', flex: '0 0 auto',
            background: active ? CI_PURPLE : 'transparent',
            border: active ? 'none' : '1px solid #3f4744',
          }}
        />
        <span style={{ flex: 1 }}>{title}</span>
        <span aria-hidden style={{ fontSize: 8, opacity: 0.7 }}>{open ? '\u2039' : '\u203a'}</span>
      </button>
      {open && (
        <div
          className="ci-popout"
          style={{ ...panel, padding: 4, display: 'flex', flexWrap: 'wrap', gap: 5 }}
        >
          {children}
          {footer}
        </div>
      )}
    </div>
  );
}

function tab(active: boolean): React.CSSProperties {
  return {
    background: active ? CI_PURPLE : 'transparent',
    border: 'none',
    borderRadius: 8,
    // #6b7568 measured 3.79:1 on the panel — below the 4.5:1 AA floor for normal
    // text, and it was the most common text in the chrome. #9aa39b is 7.01:1 and
    // still reads as unselected next to the white-on-purple active state.
    color: active ? '#fff' : '#9aa39b',
    fontFamily: CI_FONT,
    fontSize: 12,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '8px 12px',
    cursor: 'pointer',
  };
}

// Governance flags, rendered under the Pathway row as a yellow dot per flag.
// Right-aligned to sit under the pathway value, and in the same status yellow
// the sheets use, so a flag reads as a caveat on the approval above it.
function flagsHtml(flags: string | undefined): string {
  const list = (flags ?? '').split(',').map((f) => f.trim()).filter(Boolean);
  if (!list.length) return '';
  return (
    '<div style="display:flex;flex-wrap:wrap;gap:4px 10px;justify-content:flex-end;margin:1px 0 2px;">' +
    list
      .map(
        (f) =>
          '<span style="display:inline-flex;align-items:center;gap:4px;font-size:9.5px;color:#ffd23f;">' +
          '<span style="width:5px;height:5px;border-radius:50%;background:#ffd23f;display:inline-block;"></span>' +
          f +
          '</span>',
      )
      .join('') +
    '</div>'
  );
}

function row(key: string, value: string): string {
  return (
    '<div style="display:flex;justify-content:space-between;gap:12px;font-size:10px;line-height:1.6;">' +
    '<span style="color:#6b7568;">' + key + '</span>' +
    '<span style="color:#c8cfc4;text-align:right;">' + value + '</span>' +
    '</div>'
  );
}

// Ownership-transfer lifecycle infographic (AirTrunk prototype). Shown only for
// sites where the land→owner journey is mapped (a Landowner is set), so it reads
// as the *transfer* story — Australian land, offshore owner — not clutter. The
// point is the flag flip between the Land stage (🇦🇺) and the Owner stage.
function lifecycleHtml(p: Record<string, string>): string {
  if (!p.landowner) return '';
  const ownerKey = p.ownershipCountryKey || 'other';
  const ownerFlag = COUNTRY_FLAG[ownerKey] ?? '🌐';
  const offshore = ownerKey !== 'au' && ownerKey !== 'other';
  const owner = p.ultimateOwner || p.ownershipCountry || '—';

  type Stage = { flag: string; label: string; val: string; hot?: boolean };
  const stages: Stage[] = [{ flag: '🇦🇺', label: 'Land', val: p.landowner }];
  if (p.operator) stages.push({ flag: '🏢', label: 'Operator', val: p.operator });
  stages.push({ flag: ownerFlag, label: offshore ? 'Owner — offshore' : 'Owner', val: owner, hot: offshore });

  const steps = stages
    .map((s, i) =>
      '<div style="display:flex;align-items:flex-start;gap:7px;">' +
      '<span style="font-size:12px;line-height:1.25;">' + s.flag + '</span>' +
      '<div style="flex:1;min-width:0;">' +
      '<span style="font-size:8px;letter-spacing:0.1em;text-transform:uppercase;color:#6b7568;">' + s.label + '</span>' +
      '<div style="font-size:10px;color:' + (s.hot ? STAT_HOT : '#c8cfc4') + ';line-height:1.3;">' + s.val + '</div>' +
      '</div></div>' +
      (i < stages.length - 1 ? '<div style="height:9px;border-left:1px solid #333;margin-left:6px;"></div>' : ''),
    )
    .join('');

  const dates = [
    p.announcementDate && 'announced ' + p.announcementDate,
    p.approvalDate && 'approved ' + p.approvalDate,
  ].filter(Boolean).join('  ·  ');
  const dateLine = dates
    ? '<div style="font-size:9px;color:#6b7568;margin-top:6px;">' + dates + '</div>'
    : '';

  return (
    '<div style="margin-top:8px;padding-top:8px;border-top:1px solid #333;">' +
    '<div style="font-size:8px;letter-spacing:0.15em;text-transform:uppercase;color:#6b7568;margin-bottom:6px;">Ownership lifecycle</div>' +
    steps + dateLine +
    '</div>'
  );
}
