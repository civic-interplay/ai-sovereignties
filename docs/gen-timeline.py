#!/usr/bin/env python3
"""Generate docs/ai-sovereignty-timeline.svg: an annotated line chart of how
much global news coverage mentions "sovereign AI" / "AI sovereignty" over time.

Data source: GDELT DOC 2.0 TimelineVol mode (free, no key). To refresh the
`data` dict below, run (note the OR terms must be parenthesised):

  curl -s -G "https://api.gdeltproject.org/api/v2/doc/doc" \\
    --data-urlencode 'query=("sovereign AI" OR "AI sovereignty")' \\
    --data-urlencode 'mode=TimelineVol' --data-urlencode 'format=json' \\
    --data-urlencode 'startdatetime=20220101000000' \\
    --data-urlencode 'enddatetime=20260629000000'

Then take the monthly maximum of each {date,value} point (value x1000) into the
dict. Values are relative news-coverage intensity, not absolute counts.

Usage:  python3 docs/gen-timeline.py   (writes the SVG next to this file)
"""
import os

# Monthly relative intensity (x1000), Jan 2022 -> Jun 2026. Captured 2026-06-29.
data = {
 "2022-01":0.3,"2022-02":0.3,"2022-03":0.3,"2022-05":1.2,"2022-06":0.9,"2022-07":0.9,
 "2022-08":0.3,"2022-09":2.5,"2022-11":0.9,
 "2023-01":0.3,"2023-02":27.2,"2023-03":1.0,"2023-04":0.6,"2023-05":2.1,"2023-06":0.8,
 "2023-07":0.6,"2023-08":0.5,"2023-09":0.8,"2023-10":1.6,"2023-11":2.3,"2023-12":6.5,
 "2024-01":5.6,"2024-02":3.7,"2024-03":6.8,"2024-04":7.4,"2024-05":12.8,"2024-06":3.4,
 "2024-07":8.8,"2024-08":2.9,"2024-09":5.7,"2024-10":5.6,"2024-11":6.1,"2024-12":4.2,
 "2025-01":6.1,"2025-02":45.7,"2025-03":5.4,"2025-04":5.1,"2025-05":9.5,"2025-06":14.8,
 "2025-07":11.6,"2025-08":12.6,"2025-09":13.4,"2025-10":12.8,"2025-11":16.7,"2025-12":20.7,
 "2026-01":15.2,"2026-02":80.3,"2026-03":48.2,"2026-04":20.5,"2026-05":70.4,"2026-06":64.0,
}

def idx(key):
    y,m = key.split("-"); return (int(y)-2022)*12 + (int(m)-1)

W,H = 1000,540
L,R,T,B = 58,30,92,56
plotW, plotH = W-L-R, H-T-B
base = T+plotH
maxv = 85.0
span = 53.0  # Jan2022..Jun2026

def X(i): return L + i/span*plotW
def Y(v): return base - v/maxv*plotH

pts = sorted(((idx(k),v) for k,v in data.items()))
line = " ".join(("M" if n==0 else "L")+f"{X(i):.1f} {Y(v):.1f}" for n,(i,v) in enumerate(pts))
area = f"M{X(pts[0][0]):.1f} {base:.1f} " + " ".join(f"L{X(i):.1f} {Y(v):.1f}" for i,v in pts) + f" L{X(pts[-1][0]):.1f} {base:.1f} Z"

# annotations: key, label, label_dy (px from point), text anchor
ann = [
 ("2023-02","Isolated early spike",-16,"middle"),
 ("2024-05","Nvidia sells 'sovereign AI'",-16,"middle"),
 ("2025-02","Davos / WEF 2025",-16,"middle"),
 ("2025-12","AU National AI Plan",34,"end"),
 ("2026-02","Peak coverage (Feb 2026)",-14,"middle"),
]

s = []
s.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Helvetica, Arial, sans-serif">')
s.append(f'<rect width="{W}" height="{H}" fill="#fafafa"/>')
s.append(f'<text x="{L}" y="34" font-size="21" font-weight="bold" fill="#222">The rise of &#8220;AI sovereignty&#8221;</text>')
s.append(f'<text x="{L}" y="56" font-size="12.5" fill="#555">Share of global news coverage mentioning &#8220;sovereign AI&#8221; or &#8220;AI sovereignty&#8221;. GDELT, monthly, relative volume.</text>')
s.append(f'<line x1="{L}" y1="{base:.1f}" x2="{L+plotW}" y2="{base:.1f}" stroke="#ccc" stroke-width="1"/>')
for yr in range(2022,2027):
    xi = X((yr-2022)*12)
    s.append(f'<line x1="{xi:.1f}" y1="{base:.1f}" x2="{xi:.1f}" y2="{base+5:.1f}" stroke="#ccc"/>')
    s.append(f'<text x="{xi:.1f}" y="{base+22:.1f}" font-size="12" fill="#777" text-anchor="middle">{yr}</text>')
s.append(f'<text x="{L}" y="{T-12}" font-size="11" fill="#999">more coverage &#8593;</text>')
s.append(f'<path d="{area}" fill="#7D50BD" fill-opacity="0.12"/>')
s.append(f'<path d="{line}" fill="none" stroke="#7D50BD" stroke-width="2.2"/>')
for k,lab,dy,anc in ann:
    i = idx(k); v = data[k]; x=X(i); y=Y(v); ly=y+dy
    s.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3.5" fill="#D16D54"/>')
    s.append(f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x:.1f}" y2="{ly+(4 if dy>0 else -4):.1f}" stroke="#D16D54" stroke-width="1" stroke-dasharray="2 2"/>')
    tx = x + (6 if anc=="start" else -6 if anc=="end" else 0)
    s.append(f'<text x="{tx:.1f}" y="{ly:.1f}" font-size="11.5" fill="#9c3b22" text-anchor="{anc}" font-weight="bold">{lab}</text>')
s.append(f'<text x="{L}" y="{H-14}" font-size="12" fill="#444">&#8220;After AI Sovereignty&#8221; asks what the term relocates, and to whom. The curve is still climbing, so the &#8220;after&#8221; is analytical, not chronological.</text>')
s.append('</svg>')

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ai-sovereignty-timeline.svg")
with open(out, "w") as f:
    f.write("\n".join(s))
print("wrote", out)
