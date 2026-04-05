'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const SITES = {
  type: 'FeatureCollection' as const,
  features: [
    { type: 'Feature' as const, properties: { name: 'AirTrunk Sydney', type: 'data_centre', sovereignty: 'foreign', capacity: 400 }, geometry: { type: 'Point' as const, coordinates: [150.9, -33.8] } },
    { type: 'Feature' as const, properties: { name: 'NextDC S1', type: 'data_centre', sovereignty: 'australian', capacity: 30 }, geometry: { type: 'Point' as const, coordinates: [151.2, -33.87] } },
    { type: 'Feature' as const, properties: { name: 'Lynas Rare Earths — Mt Weld', type: 'mine', sovereignty: 'australian', capacity: 100 }, geometry: { type: 'Point' as const, coordinates: [121.47, -28.73] } },
    { type: 'Feature' as const, properties: { name: 'Arafura Resources — Nolans', type: 'mine', sovereignty: 'australian', capacity: 60 }, geometry: { type: 'Point' as const, coordinates: [133.67, -22.5] } },
  ],
};

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

    m.on('load', () => {
      m.addSource('sites', { type: 'geojson', data: SITES });

      // Outer pulse ring
      m.addLayer({
        id: 'sites-pulse',
        type: 'circle',
        source: 'sites',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'capacity'], 30, 20, 400, 50],
          'circle-color': ['match', ['get', 'type'], 'data_centre', '#00ffcc', 'mine', '#ff6b35', '#ffffff'],
          'circle-opacity': 0.15,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': ['match', ['get', 'type'], 'data_centre', '#00ffcc', 'mine', '#ff6b35', '#ffffff'],
          'circle-stroke-opacity': 0.6,
        },
      });

      // Inner glow node
      m.addLayer({
        id: 'sites-core',
        type: 'circle',
        source: 'sites',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'capacity'], 30, 8, 400, 20],
          'circle-color': ['match', ['get', 'type'], 'data_centre', '#00ffcc', 'mine', '#ff6b35', '#ffffff'],
          'circle-opacity': 0.9,
          'circle-blur': 0.3,
        },
      });

      // Popup on click
      m.on('click', 'sites-core', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const props = feature.properties!;
        const color = props.type === 'data_centre' ? '#00ffcc' : '#ff6b35';
        const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];

        new mapboxgl.Popup({ closeButton: false, className: 'sovereignty-popup' })
          .setLngLat(coords)
          .setHTML(
            '<div style="background:#0a0c0b;border:1px solid ' + color + ';padding:10px 14px;font-family:Courier New,monospace;font-size:11px;color:#c8cfc4;min-width:180px;">' +
            '<div style="color:' + color + ';font-size:10px;letter-spacing:0.15em;margin-bottom:6px;text-transform:uppercase;">' + props.type.replace('_', ' ') + '</div>' +
            '<div style="font-size:13px;margin-bottom:4px;">' + props.name + '</div>' +
            '<div style="color:#6b7568;font-size:10px;">' + (props.sovereignty === 'foreign' ? '🌐 Foreign-owned' : '🇦🇺 Australian-owned') + '</div>' +
            '</div>'
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