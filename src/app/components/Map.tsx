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

// The public "publish to web" view of the Critical Infrastructure Tracker.
const NOTION_DATA_URL =
  'https://studio-esem.notion.site/8b537010f4cb4aa6b6df470f9d0d40c9?v=c9d0347781ec4900967cfff4d18a25a6';


// --- Layer lens: colour per infrastructure kind (the `kind` key from /api/sites) ---
const KIND_COLORS: Record<string, string> = {
  data_centre: '#00ffcc',
  mine: '#ff6b35',
  refinery: '#b478ff',
  energy: '#ffd23f',
  water: '#3fa9ff',
  policy: '#9aa5a0',
  geopolitical: '#ff4d6d',
  other: '#ffffff',
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
const SOV_COLORS: Record<string, string> = {
  australian: '#00e08a',
  foreign: '#ff4d6d',
  jv: '#ffd23f',
  government: '#3fa9ff',
  defence: '#b478ff',
  other: '#9aa5a0',
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
const COUNTRY_COLORS: Record<string, string> = {
  au: '#00e08a',
  us: '#3fa9ff',
  cn: '#ff4d6d',
  sg: '#ffd23f',
  jp: '#b478ff',
  ch: '#ff8c42',
  other: '#9aa5a0',
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
const CAPITAL_COLORS: Record<string, string> = {
  hyperscaler: '#00ffcc',
  infra_fund: '#ff6b35',
  pension: '#3fa9ff',
  swf: '#ff4d6d',
  listed: '#ffd23f',
  state: '#b478ff',
  private: '#8e9bdd',
  other: '#9aa5a0',
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
const WATER_COLORS: Record<string, string> = {
  high: '#ff4d6d',
  medium: '#ffd23f',
  low: '#3fd17a',
  na: '#6b7568',
  other: '#9aa5a0',
};
const WATER_LABELS: Record<string, string> = {
  high: 'High — potable stressed',
  medium: 'Medium — some pressure',
  low: 'Low — closed-loop',
  na: 'Not applicable',
  other: 'Unknown',
};
const WATER_ORDER = ['high', 'medium', 'low', 'na'];

// --- Energy lens: colour per energy source (the `energyKey` from /api/sites) ---
// As material as water for a data centre — power draw, grid strain, emissions.
const ENERGY_COLORS: Record<string, string> = {
  renewable_onsite: '#00e08a',
  renewable_contracted: '#3fd17a',
  grid_mixed: '#ffd23f',
  grid_fossil: '#ff6b35',
  nuclear: '#b478ff',
  unknown: '#6b7568',
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
const REGISTER_COLORS: Record<string, string> = {
  productive: '#00e08a',
  operational: '#3fa9ff',
  financial: '#ffd23f',
  rented: '#ff4d6d',
  none: '#6b7568',
};
const REGISTER_LABELS: Record<string, string> = {
  productive: 'Productive (Aus-owned)',
  operational: 'Operational (public-run)',
  financial: 'Financial (≥30% public)',
  rented: 'Rented (offshore tenants)',
  none: 'Not coded',
};
const REGISTER_ORDER = ['productive', 'operational', 'financial', 'rented', 'none'];

// --- Sovereign/super exposure lens: how much of a site is funded by Australian
// sovereign-wealth / super-fund capital (the `superExposureKey` from /api/sites).
// The activist question: is your retirement invested in the site you're fighting?
// Coloured by the *channel* through which Australian super/sovereign money
// touches the site — more telling than a single %, since exposure comes three ways.
const SUPER_COLORS: Record<string, string> = {
  operator: '#00e08a',
  land: '#ffcf5c',
  via_manager: '#3fd1a0',
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
  out.push(colors.other ?? colors.none ?? '#9aa5a0');
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
  // Highlight overlays: contested + state-fast-tracked sites (toggles).
  const [showContested, setShowContested] = useState(false);
  const [showFastTracked, setShowFastTracked] = useState(false);
  // Supply-chain mode: illustrative rare-earth flows to offshore separation.
  const [showSupplyChain, setShowSupplyChain] = useState(false);
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

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [134.0, -25.0],
      zoom: 3.5,
    });

    m.on('load', async () => {
      // Pull the live GeoJSON from the Notion-backed API route.
      let data: GeoJSON.FeatureCollection = EMPTY;
      try {
        const res = await fetch('/api/sites');
        if (res.ok) data = await res.json();
      } catch {
        // Leave the map empty on failure rather than crashing.
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
      setKinds(KIND_ORDER.filter((k) => kindSet.has(k)));
      setSovs(SOV_ORDER.filter((k) => sovSet.has(k)));
      setCountries(COUNTRY_ORDER.filter((k) => countrySet.has(k)));
      setCapitals(CAPITAL_ORDER.filter((k) => capitalSet.has(k)));
      setWaters(WATER_ORDER.filter((k) => waterSet.has(k)));
      setEnergies(ENERGY_ORDER.filter((k) => energySet.has(k)));
      setRegs(REGISTER_ORDER.filter((k) => registerSet.has(k)));
      setSupers(SUPER_ORDER.filter((k) => superSet.has(k)));

      m.addSource('sites', { type: 'geojson', data });

      const color = COLOR_EXPR[lensRef.current];
      const capacity = ['coalesce', ['get', 'capacity'], 30] as unknown as mapboxgl.ExpressionSpecification;

      // Outer pulse ring
      m.addLayer({
        id: 'sites-pulse',
        type: 'circle',
        source: 'sites',
        paint: {
          'circle-radius': ['interpolate', ['linear'], capacity, 30, 20, 400, 50] as unknown as mapboxgl.ExpressionSpecification,
          'circle-color': color,
          'circle-opacity': 0.15,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': color,
          'circle-stroke-opacity': 0.6,
        },
      });

      // Inner glow node
      m.addLayer({
        id: 'sites-core',
        type: 'circle',
        source: 'sites',
        paint: {
          'circle-radius': ['interpolate', ['linear'], capacity, 30, 8, 400, 20] as unknown as mapboxgl.ExpressionSpecification,
          'circle-color': color,
          'circle-opacity': 0.9,
          'circle-blur': 0.3,
        },
      });

      // Highlight overlay: contested sites (red ring). Toggled on demand.
      m.addLayer({
        id: 'sites-contested',
        type: 'circle',
        source: 'sites',
        filter: ['==', ['get', 'contested'], true] as unknown as mapboxgl.FilterSpecification,
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], capacity, 30, 16, 400, 44] as unknown as mapboxgl.ExpressionSpecification,
          'circle-opacity': 0,
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#ff4d6d',
          'circle-stroke-opacity': 0.9,
        },
      });

      // Highlight overlay: state-fast-tracked sites (amber ring). Toggled on demand.
      m.addLayer({
        id: 'sites-fasttracked',
        type: 'circle',
        source: 'sites',
        filter: ['==', ['get', 'fastTracked'], true] as unknown as mapboxgl.FilterSpecification,
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], capacity, 30, 23, 400, 53] as unknown as mapboxgl.ExpressionSpecification,
          'circle-opacity': 0,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffd23f',
          'circle-stroke-opacity': 0.85,
        },
      });

      // --- Supply-chain mode (illustrative): where Australian AI compute's inputs sit ---
      // Australia mines the raw inputs and hosts the buildings, but the three things
      // that actually make compute — chips (Taiwan), servers/hardware (China), and
      // rare-earth separation & magnets (China) — are all offshore. Lines carry each
      // dependency out; domestic processors (green rings) are the "closing the loop".
      const OFFSHORE_NODES = [
        { dep: 'rare_earth', label: 'Rare-earth separation (China) — contested', lng: 108, lat: 34, color: '#ff4d6d' },
        { dep: 'malaysia', label: 'Lynas separation (Malaysia · non-China)', lng: 103.3, lat: 3.8, color: '#ffd23f' },
        { dep: 'chips', label: 'AI chips (Taiwan · TSMC)', lng: 121, lat: 23.8, color: '#3fd1ff' },
        { dep: 'hardware', label: 'Servers & hardware (China)', lng: 114, lat: 22.5, color: '#ff9a3f' },
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
      const depColor = ['match', ['get', 'dep'], 'rare_earth', '#ff4d6d', 'malaysia', '#ffd23f', 'chips', '#3fd1ff', 'hardware', '#ff9a3f', '#ff4d6d'] as unknown as mapboxgl.ExpressionSpecification;
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
          'circle-radius': 15, 'circle-color': '#00e08a', 'circle-opacity': 0,
          'circle-stroke-width': 2, 'circle-stroke-color': '#00e08a', 'circle-stroke-opacity': 0.9,
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
    m.setLayoutProperty('sites-fasttracked', 'visibility', showFastTracked ? 'visible' : 'none');
  }, [showFastTracked]);

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

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          alignItems: 'flex-start',
        }}
      >
        {/* Current scope. The Australia view of a map meant to grow global and networked. */}
        <div style={panel}>
          <div style={{ fontSize: 15, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Australia
          </div>
          <div style={{ fontSize: 10, color: '#6b7568', marginTop: 4, maxWidth: 190, lineHeight: 1.5 }}>
            One region of a networked map in progress. More coming.
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
            href="https://civicinterplay.io/ai-sovereignties/"
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
            ← Civic Interplay
          </a>
        </div>

        {/* Lens toggle: colour the map by infrastructure layer, or by who owns it. */}
        <div style={{ ...panel, padding: 4, display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 232 }}>
          <button type="button" style={tab(lens === 'kind')} onClick={() => setLens('kind')}>
            Layer
          </button>
          <button type="button" style={tab(lens === 'sovereignty')} onClick={() => setLens('sovereignty')}>
            Ownership
          </button>
          <button type="button" style={tab(lens === 'country')} onClick={() => setLens('country')}>
            Country
          </button>
          <button type="button" style={tab(lens === 'capital')} onClick={() => setLens('capital')}>
            Capital
          </button>
          <button type="button" style={tab(lens === 'water')} onClick={() => setLens('water')}>
            Water
          </button>
          <button type="button" style={tab(lens === 'energy')} onClick={() => setLens('energy')}>
            Energy
          </button>
          <button type="button" style={tab(lens === 'register')} onClick={() => setLens('register')}>
            Type
          </button>
          <button type="button" style={tab(lens === 'super')} onClick={() => setLens('super')}>
            Super $
          </button>
        </div>

        {/* Highlight overlays: surface the state-vs-local conflict. */}
        <div style={{ ...panel, padding: 4, display: 'flex', gap: 4 }}>
          <button type="button" style={tab(showContested)} onClick={() => setShowContested((v) => !v)}>
            Contested
          </button>
          <button type="button" style={tab(showFastTracked)} onClick={() => setShowFastTracked((v) => !v)}>
            State fast-tracked
          </button>
        </div>

        {/* Explainer for the two overlays — what "contested" and "fast-tracked" mean. */}
        {(showContested || showFastTracked) && (
          <div style={{ ...panel, maxWidth: 226, fontSize: 9.5, lineHeight: 1.6, color: '#9aa39b' }}>
            {showContested && (
              <div>
                <span style={{ color: '#ff4d6d' }}>Contested</span> — active or emerging community opposition.
                The level of contestation is tracked through the planning pathways: public-exhibition submissions
                &amp; objections, council minutes and motions, merit appeals (Land &amp; Environment Court / VCAT),
                parliamentary petitions, and media / FOI.
              </div>
            )}
            {showFastTracked && (
              <div style={{ marginTop: showContested ? 6 : 0 }}>
                <span style={{ color: '#ffd23f' }}>State fast-tracked</span> — not subject to normal public
                consultation: assessed as State Significant Development, or approved without public exhibition
                (e.g. via the NSW Investment Delivery Authority or ministerial call-in).
              </div>
            )}
          </div>
        )}

        {/* Supply-chain mode: illustrative rare-earth flows to offshore separation. */}
        <div style={{ ...panel, padding: 4, display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 232 }}>
          <button type="button" style={tab(showSupplyChain)} onClick={() => setShowSupplyChain((v) => !v)}>
            Supply chain
          </button>
          {showSupplyChain && (
            <div style={{ fontSize: 9, color: '#6b7568', lineHeight: 1.5, padding: '2px 6px' }}>
              Illustrative: chips (Taiwan) and hardware (China) are offshore for every data centre. Rare earths
              are more sovereign — Lynas separates in Malaysia (non-China), Browns Range is the contested China
              link, Iluka Eneabba / ANSTO process onshore (green rings).
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div style={{ ...panel, minWidth: 140 }}>
            <div
              style={{
                fontSize: 10,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#6b7568',
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

        {/* Sovereignty-type explainer: why the lens exists + what each register means. */}
        {lens === 'register' && (
          <div style={{ ...panel, maxWidth: 226, fontSize: 9.5, lineHeight: 1.6, color: '#9aa39b' }}>
            <div style={{ color: '#c8cfc4', marginBottom: 5 }}>
              Who stands to benefit, over time, from each site&rsquo;s investment model. Low onshore ownership
              or productivity means the benefits flow offshore. A site can be several.
            </div>
            <div><span style={{ color: '#00e08a' }}>Productive</span> — owned &amp; built by Australian interests.</div>
            <div><span style={{ color: '#3fa9ff' }}>Operational</span> — run by an Australian public body.</div>
            <div><span style={{ color: '#ffd23f' }}>Financial</span> — ≥30% public capital (sovereign-wealth, government or super*).</div>
            <div><span style={{ color: '#ff4d6d' }}>Rented</span> — capacity rented to offshore hyperscalers.</div>
            <div style={{ color: '#6b7568', marginTop: 4 }}>
              *super = pooled Australian retirement savings, counted as public here.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Shared panel chrome for the overlay blocks.
const panel: React.CSSProperties = {
  background: '#0a0c0b',
  border: '1px solid #333',
  borderRadius: 12,
  padding: '10px 14px',
  fontFamily: CI_FONT,
  fontSize: 11,
  color: '#c8cfc4',
};

// A single segmented-control button, highlighted in CI purple when active.
function tab(active: boolean): React.CSSProperties {
  return {
    background: active ? CI_PURPLE : 'transparent',
    border: 'none',
    borderRadius: 8,
    color: active ? '#fff' : '#6b7568',
    fontFamily: CI_FONT,
    fontSize: 10,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    padding: '5px 10px',
    cursor: 'pointer',
  };
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
      '<div style="font-size:10px;color:' + (s.hot ? '#ff4d6d' : '#c8cfc4') + ';line-height:1.3;">' + s.val + '</div>' +
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
