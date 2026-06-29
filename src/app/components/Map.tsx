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

// --- Register lens: colour per sovereignty register (the `register` key from /api/sites) ---
// Green = sovereign capability owned here, red = onshore but rented. The thesis in colour.
const REGISTER_COLORS: Record<string, string> = {
  productive: '#00e08a',
  operational: '#3fa9ff',
  financial: '#ffd23f',
  locational: '#ff4d6d',
  none: '#6b7568',
};
const REGISTER_LABELS: Record<string, string> = {
  productive: 'Productive (builds / owns)',
  operational: 'Operational (gov-run)',
  financial: 'Financial (public capital)',
  locational: 'Locational (onshore, rented)',
  none: 'Not coded',
};
const REGISTER_ORDER = ['productive', 'operational', 'financial', 'locational', 'none'];

// Build a flattened ['key', '#colour', ..., fallback] list for a Mapbox `match`.
function matchList(colors: Record<string, string>, order: string[]): (string)[] {
  const out: string[] = [];
  for (const k of order) out.push(k, colors[k]);
  out.push(colors.other); // fallback
  return out;
}

type Lens = 'kind' | 'sovereignty' | 'water' | 'register';

// Colour expressions, one per lens. Switched at runtime via setPaintProperty.
const COLOR_EXPR: Record<Lens, mapboxgl.ExpressionSpecification> = {
  kind: ['match', ['get', 'kind'], ...matchList(KIND_COLORS, KIND_ORDER)] as unknown as mapboxgl.ExpressionSpecification,
  sovereignty: ['match', ['get', 'sovereignty'], ...matchList(SOV_COLORS, SOV_ORDER)] as unknown as mapboxgl.ExpressionSpecification,
  water: ['match', ['get', 'waterRiskKey'], ...matchList(WATER_COLORS, WATER_ORDER)] as unknown as mapboxgl.ExpressionSpecification,
  register: ['match', ['get', 'register'], ...matchList(REGISTER_COLORS, REGISTER_ORDER)] as unknown as mapboxgl.ExpressionSpecification,
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
  const [waters, setWaters] = useState<string[]>([]);
  const [regs, setRegs] = useState<string[]>([]);
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
      const waterSet = new Set(data.features.map((f) => (f.properties?.waterRiskKey as string) ?? 'na'));
      const registerSet = new Set(data.features.map((f) => (f.properties?.register as string) ?? 'none'));
      setKinds(KIND_ORDER.filter((k) => kindSet.has(k)));
      setSovs(SOV_ORDER.filter((k) => sovSet.has(k)));
      setWaters(WATER_ORDER.filter((k) => waterSet.has(k)));
      setRegs(REGISTER_ORDER.filter((k) => registerSet.has(k)));

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

      // Popup on click
      m.on('click', 'sites-core', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const p = feature.properties as Record<string, string>;
        // Accent the popup with the active lens colour.
        const lensNow = lensRef.current;
        const color = lensNow === 'sovereignty'
          ? (SOV_COLORS[p.sovereignty] ?? SOV_COLORS.other)
          : lensNow === 'water'
            ? (WATER_COLORS[p.waterRiskKey] ?? WATER_COLORS.other)
            : lensNow === 'register'
              ? (REGISTER_COLORS[p.register] ?? REGISTER_COLORS.none)
              : (KIND_COLORS[p.kind] ?? KIND_COLORS.other);
        const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];

        const sovereignty = p.sovereigntyLabel || '';
        const rows = [
          p.status && row('Status', p.status),
          p.operator && row('Operator', p.operator),
          p.capacity && row('Capacity', p.capacity + ' MW'),
          p.registers && row('Register', p.registers),
          p.tenants && row('Serves', p.tenants),
          p.waterRisk && row('Water risk', p.waterRisk),
          p.state && row('Region', p.state),
        ].filter(Boolean).join('');

        const link = p.source
          ? '<a href="' + p.source + '" target="_blank" rel="noreferrer" style="color:' + color + ';font-size:10px;text-decoration:none;">source ↗</a>'
          : '';

        new mapboxgl.Popup({ closeButton: false, className: 'sovereignty-popup' })
          .setLngLat(coords)
          .setHTML(
            '<div style="background:#0a0c0b;border:1px solid ' + color + ';border-radius:12px;padding:10px 14px;font-family:var(--font-fira),system-ui,sans-serif;font-size:11px;color:#c8cfc4;min-width:200px;">' +
            '<div style="color:' + color + ';font-size:10px;letter-spacing:0.15em;margin-bottom:6px;text-transform:uppercase;">' + (p.infraType || '') + '</div>' +
            '<div style="font-size:13px;margin-bottom:4px;">' + (p.name || '') + '</div>' +
            (sovereignty ? '<div style="color:#6b7568;font-size:10px;margin-bottom:6px;">' + sovereignty + '</div>' : '') +
            rows +
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

  // Legend config per lens — add a new lens here and it flows to legend + popups.
  const legend = {
    kind: { items: kinds, colors: KIND_COLORS, labels: KIND_LABELS, title: 'Infrastructure' },
    sovereignty: { items: sovs, colors: SOV_COLORS, labels: SOV_LABELS, title: 'Ownership' },
    water: { items: waters, colors: WATER_COLORS, labels: WATER_LABELS, title: 'Water risk' },
    register: { items: regs, colors: REGISTER_COLORS, labels: REGISTER_LABELS, title: 'Sovereignty register' },
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
        <div style={{ ...panel, padding: 4, display: 'flex', gap: 4 }}>
          <button type="button" style={tab(lens === 'kind')} onClick={() => setLens('kind')}>
            Layer
          </button>
          <button type="button" style={tab(lens === 'sovereignty')} onClick={() => setLens('sovereignty')}>
            Ownership
          </button>
          <button type="button" style={tab(lens === 'water')} onClick={() => setLens('water')}>
            Water
          </button>
          <button type="button" style={tab(lens === 'register')} onClick={() => setLens('register')}>
            Register
          </button>
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
