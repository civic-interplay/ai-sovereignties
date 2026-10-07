'use client';

// Interactive layer for the server-rendered SVG charts. Any mark carrying a
// `data-tip` attribute ("value|label") shows a tooltip on hover, on keyboard
// focus, and on tap/click, so it works on phones where there is no hover.
// A click pins the tooltip until you click elsewhere or press Escape.
// The tooltip enhances, never gates: every value is also in the chart's
// direct labels or its table view.
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

type Tip = { value: string; label: string; x: number; y: number; pinned: boolean };

export default function ChartFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);

  const place = useCallback((el: Element, pinned: boolean) => {
    const frame = ref.current;
    const raw = el.getAttribute('data-tip');
    if (!frame || !raw) return;
    const [value, label = ''] = raw.split('|');
    const f = frame.getBoundingClientRect();
    const m = el.getBoundingClientRect();
    setTip({ value, label, x: m.left - f.left + m.width / 2, y: m.top - f.top, pinned });
  }, []);

  const markOf = (t: EventTarget | null) => (t instanceof Element ? t.closest('[data-tip]') : null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setTip(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setTip(null);
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="chart-frame"
      style={{ position: 'relative' }}
      onPointerOver={(e) => {
        const m = markOf(e.target);
        if (m && !tip?.pinned) place(m, false);
      }}
      onPointerOut={(e) => {
        if (markOf(e.target) && !markOf(e.relatedTarget) && !tip?.pinned) setTip(null);
      }}
      onFocus={(e) => {
        const m = markOf(e.target);
        if (m) place(m, false);
      }}
      onBlur={() => !tip?.pinned && setTip(null)}
      onClick={(e) => {
        const m = markOf(e.target);
        if (m) place(m, true);
        else setTip(null);
      }}
    >
      {children}
      {tip && (
        <div
          role="status"
          style={{
            position: 'absolute',
            left: tip.x,
            top: tip.y - 10,
            transform: 'translate(-50%, -100%)',
            background: '#22201f',
            color: '#f7f4ef',
            borderRadius: 6,
            padding: '7px 10px',
            fontSize: 12,
            lineHeight: 1.35,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '2px 2px 0 rgba(34,32,31,0.18)',
            zIndex: 5,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600 }}>{tip.value}</div>
          {tip.label && <div style={{ opacity: 0.8 }}>{tip.label}</div>}
        </div>
      )}
      <style>{`
        .chart-frame [data-tip] { cursor: pointer; transition: opacity 120ms ease-out; }
        .chart-frame [data-tip]:hover, .chart-frame [data-tip]:focus-visible { opacity: 0.78; }
        .chart-frame [data-tip]:focus-visible { outline: 2px solid #22201f; outline-offset: 2px; }
        .chart-frame [data-tip]:focus:not(:focus-visible) { outline: none; }
        @media (prefers-reduced-motion: reduce) { .chart-frame [data-tip] { transition: none; } }
      `}</style>
    </div>
  );
}
