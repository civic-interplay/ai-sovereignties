'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

// Colour per infrastructure kind (matches the `kind` key from /api/sites).
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

// Flattened ['data_centre', '#..', 'mine', '#..', ..., fallback] for a Mapbox `match`.
const KIND_MATCH = [
  'data_centre', KIND_COLORS.data_centre,
  'mine', KIND_COLORS.mine,
  'refinery', KIND_COLORS.refinery,
  'energy', KIND_COLORS.energy,
  'water', KIND_COLORS.water,
  'policy', KIND_COLORS.policy,
  'geopolitical', KIND_COLORS.geopolitical,
  KIND_COLORS.other, // fallback
];

const EMPTY: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
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

      m.addSource('sites', { type: 'geojson', data });

      const kindColor = ['match', ['get', 'kind'], ...KIND_MATCH] as unknown as mapboxgl.ExpressionSpecification;
      const capacity = ['coalesce', ['get', 'capacity'], 30] as unknown as mapboxgl.ExpressionSpecification;

      // Outer pulse ring
      m.addLayer({
        id: 'sites-pulse',
        type: 'circle',
        source: 'sites',
        paint: {
          'circle-radius': ['interpolate', ['linear'], capacity, 30, 20, 400, 50] as unknown as mapboxgl.ExpressionSpecification,
          'circle-color': kindColor,
          'circle-opacity': 0.15,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': kindColor,
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
          'circle-color': kindColor,
          'circle-opacity': 0.9,
          'circle-blur': 0.3,
        },
      });

      // Popup on click
      m.on('click', 'sites-core', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const p = feature.properties as Record<string, string>;
        const color = KIND_COLORS[p.kind] ?? KIND_COLORS.other;
        const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];

        const sovereignty = p.sovereigntyLabel || '';
        const rows = [
          p.status && row('Status', p.status),
          p.operator && row('Operator', p.operator),
          p.capacity && row('Capacity', p.capacity + ' MW'),
          p.waterRisk && row('Water risk', p.waterRisk),
          p.state && row('Region', p.state),
        ].filter(Boolean).join('');

        const link = p.source
          ? '<a href="' + p.source + '" target="_blank" rel="noreferrer" style="color:' + color + ';font-size:10px;text-decoration:none;">source ↗</a>'
          : '';

        new mapboxgl.Popup({ closeButton: false, className: 'sovereignty-popup' })
          .setLngLat(coords)
          .setHTML(
            '<div style="background:#0a0c0b;border:1px solid ' + color + ';padding:10px 14px;font-family:Courier New,monospace;font-size:11px;color:#c8cfc4;min-width:200px;">' +
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
  }, []);

  return <div ref={mapContainer} style={{ width: '100vw', height: '100vh' }} />;
}

function row(key: string, value: string): string {
  return (
    '<div style="display:flex;justify-content:space-between;gap:12px;font-size:10px;line-height:1.6;">' +
    '<span style="color:#6b7568;">' + key + '</span>' +
    '<span style="color:#c8cfc4;text-align:right;">' + value + '</span>' +
    '</div>'
  );
}
