'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { Theme } from './components/Map';

const Map = dynamic(() => import('./components/Map'), { ssr: false });

// Light is the default view (Sarah, 12 Nov 2026). A reader's choice is remembered on their device,
// and ?theme=light or ?theme=dark in the URL overrides it, so a link can open
// in a given view (useful for slides and screenshots).
const KEY = 'ci-map-theme';

function initialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const fromUrl = new URLSearchParams(window.location.search).get('theme');
  if (fromUrl === 'light' || fromUrl === 'dark') return fromUrl;
  try {
    return window.localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export default function Home() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, theme);
    } catch {
      // Private browsing can refuse storage; the toggle still works for the visit.
    }
    document.body.style.background = theme === 'light' ? '#ffffff' : '';
  }, [theme]);

  // key={theme}: switching remounts the map with the other basemap. Restyling
  // a live Mapbox map drops every layer the site adds, so a clean remount is
  // the safer switch. The camera is carried across inside the component.
  return <Map key={theme} theme={theme} onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))} />;
}
