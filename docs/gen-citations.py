#!/usr/bin/env python3
"""Generate docs/citations.ris — every source cited across the tracker and the
research documents, as an RIS bibliography importable into Zotero, EndNote or
Mendeley.

Sources harvested:
  zenodo/contestation_items.csv  source_url        (news, statements, submissions)
  zenodo/sites.csv               source_url, notes (per-site evidence)
  docs/*.md                      markdown links and bare URLs in the research docs

Each record carries the project's own evidence weighting: the source-hierarchy
rung from FACT-CHECKING-GUIDE.md section 2 is written into the keywords, so the
bibliography inherits the tracker's view of what a source is worth.

Titles: where a source was cited in a markdown document with link text, that
text is the title. Otherwise the title is DERIVED from the tracker row or the
URL slug, and the record says so in N1. Derived titles are leads for a human to
correct, not the publisher's own headline.

Run:  python3 docs/gen-citations.py
"""

import csv
import re
import sys
from collections import OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "citations.ris"

URL_RE = re.compile(r"https?://[^\s;,)\]\'\"<>`]+")
MD_LINK_RE = re.compile(r"\[([^\]\n]{2,200})\]\((https?://[^)\s]+)\)")

DOC_SOURCES = [
    "docs/enforcement-research-recovered-2026-08-18.md",
    "docs/DISCLOSURE-AUDIT.md",
    "docs/METHODOLOGY.md",
    "docs/ROADMAP.md",
    "docs/disclosure-audit/verification-2026-08-17.md",
    "docs/disclosure-audit/verification-2026-08-10-partial.md",
]

# --- source hierarchy, FACT-CHECKING-GUIDE.md section 2 -------------------
# rung 1 primary record | 2 official register | 3 named-official statement
# 4 quality trade/local press | 5 operator materials | 6 directories

RUNG = [
    (1, "STAT", ["legislation.nsw.gov.au", "legislation.vic.gov.au",
                 "legislation.gov.au", "legislation.qld.gov.au",
                 "legislation.wa.gov.au", "legislation.sa.gov.au",
                 "legislation.tas.gov.au", "austlii.edu.au"]),
    (1, "RPRT", ["planningportal.nsw.gov.au", "planning.vic.gov.au",
                 "gazette.vic.gov.au", "planningalerts.org.au",
                 "connectonline.asic.gov.au", "landata.vic.gov.au",
                 "eplanning.nsw.gov.au", "majorprojects.planningportal.nsw.gov.au"]),
    (3, "HEAR", ["parliament.vic.gov.au", "parliament.nsw.gov.au",
                 "parliament.wa.gov.au", "parliament.sa.gov.au",
                 "aph.gov.au", "files.parliament.nsw.gov.au",
                 "hansardsearch.parliament.sa.gov.au", "parliament.qld.gov.au",
                 "parliament.tas.gov.au"]),
    (3, "RPRT", ["infrastructure.nsw.gov.au", "nsw.gov.au", "vic.gov.au",
                 "qld.gov.au", "wa.gov.au", "sa.gov.au", "tas.gov.au",
                 "minister.industry.gov.au", "industry.gov.au", "djsir.vic.gov.au",
                 "sydneywater.com.au", "watercorporation.com.au",
                 "gww.com.au", "burnie.tas.gov.au", "melbourne.vic.gov.au",
                 "wyndham.vic.gov.au", "hume.vic.gov.au", "accc.gov.au",
                 "aemo.com.au", "cleanenergyregulator.gov.au"]),
    (4, "NEWS", ["abc.net.au", "brisbanetimes.com.au", "smh.com.au", "theage.com.au",
                 "itnews.com.au", "itwire.com", "theurbandeveloper.com",
                 "datacenterdynamics.com", "datacentremagazine.com", "w.media",
                 "greenleft.org.au", "ia.acs.org.au", "starweekly.com.au",
                 "northern.starweekly.com.au", "pv-tech.org", "theenergy.co",
                 "afr.com", "theguardian.com", "capitalbrief.com",
                 "stocksdownunder.com", "reneweconomy.com.au", "crikey.com.au",
                 "michaelwest.com.au", "innovationaus.com"]),
    (5, "ELEC", ["airtrunk.com", "nextdc.com", "cdc.com", "stackinfra.com",
                 "microsoft.com", "news.microsoft.com", "local.microsoft.com",
                 "datacenters.microsoft.com", "equinix.com", "aws.amazon.com",
                 "amazon.com", "goodman.com", "vantage-dc.com", "digitalrealty.com",
                 "megaport.com", "vocus.com.au", "tpgtelecom.com.au",
                 "blackstone.com", "ispt.net.au", "leightonproperties.com.au"]),
    (6, "ELEC", ["datacentermap.com", "peeringdb.com", "datacenters.com",
                 "en.wikipedia.org", "wikipedia.org"]),
]

RUNG_LABEL = {
    1: "rung 1 - primary record",
    2: "rung 2 - official register entry",
    3: "rung 3 - named-official statement",
    4: "rung 4 - trade or local press",
    5: "rung 5 - operator materials (claim by an interested party)",
    6: "rung 6 - directory (location lead only)",
    0: "rung unassigned - classify by hand",
}

PUBLISHER = {
    "abc.net.au": "ABC News",
    "datacenterdynamics.com": "Datacenter Dynamics",
    "datacentremagazine.com": "Data Centre Magazine",
    "w.media": "W.Media",
    "theurbandeveloper.com": "The Urban Developer",
    "itnews.com.au": "iTnews",
    "itwire.com": "iTWire",
    "greenleft.org.au": "Green Left",
    "ia.acs.org.au": "ACS Information Age",
    "planning.vic.gov.au": "Victorian Government, Department of Transport and Planning",
    "planningportal.nsw.gov.au": "NSW Planning Portal",
    "legislation.nsw.gov.au": "NSW Legislation",
    "infrastructure.nsw.gov.au": "Infrastructure NSW",
    "parliament.vic.gov.au": "Parliament of Victoria",
    "parliament.nsw.gov.au": "Parliament of New South Wales",
    "files.parliament.nsw.gov.au": "Parliament of New South Wales",
    "parliament.wa.gov.au": "Parliament of Western Australia",
    "hansardsearch.parliament.sa.gov.au": "Parliament of South Australia",
    "datacentermap.com": "DataCenterMap",
    "peeringdb.com": "PeeringDB",
    "sydneywater.com.au": "Sydney Water",
    "watercorporation.com.au": "Water Corporation",
    "gww.com.au": "Greater Western Water",
    "burnie.tas.gov.au": "Burnie City Council",
    "djsir.vic.gov.au": "Victorian Department of Jobs, Skills, Industry and Regions",
    "minister.industry.gov.au": "Australian Government, Minister for Industry and Science",
    "brisbanetimes.com.au": "Brisbane Times",
    "northern.starweekly.com.au": "Star Weekly",
    "starweekly.com.au": "Star Weekly",
    "pv-tech.org": "PV Tech",
    "stocksdownunder.com": "Stocks Down Under",
    "theenergy.co": "The Energy",
    "en.wikipedia.org": "Wikipedia",
}


def norm(url: str) -> str:
    """Canonical form for deduplication."""
    u = url.strip().rstrip(".,);:`*_'\"")
    # r.jina.ai is a fetch proxy; recover the real target
    u = re.sub(r"^https?://r\.jina\.ai/", "", u)
    if not u.startswith("http"):
        u = "https://" + u
    u = re.sub(r"[?&](utm_[^=]+|fbclid|gclid)=[^&]*", "", u)
    u = re.sub(r"[?&]$", "", u)
    return u.rstrip("/")


def host(url: str) -> str:
    try:
        return re.sub(r"^www\.", "", url.split("/")[2].lower())
    except IndexError:
        return ""


def classify(url: str):
    h = host(url)
    for rung, ty, domains in RUNG:
        for d in domains:
            if h == d or h.endswith("." + d):
                return rung, ty
    return 0, "ELEC"


def publisher(url: str) -> str:
    h = host(url)
    if h in PUBLISHER:
        return PUBLISHER[h]
    for d, name in PUBLISHER.items():
        if h.endswith("." + d):
            return name
    return h


def title_from_url(url: str) -> str:
    """Readable title derived from the URL slug. A lead, not a headline."""
    path = url.split("?")[0].rstrip("/").split("/")
    slug = ""
    for part in reversed(path[3:]):
        if part and not re.fullmatch(r"\d{1,4}|index|default|home|en|au", part):
            slug = part
            break
    slug = re.sub(r"\.(html?|pdf|aspx|php)$", "", slug, flags=re.I)
    slug = re.sub(r"[-_+]+", " ", slug)
    slug = re.sub(r"\s+", " ", slug).strip()
    if not slug or len(slug) < 4:
        return publisher(url) + " - " + host(url)
    if re.fullmatch(r"[0-9a-f\-]{12,}", slug):
        return publisher(url) + " - " + host(url)
    return slug[:1].upper() + slug[1:]


def year_of(*candidates) -> str:
    for c in candidates:
        if not c:
            continue
        m = re.search(r"(19|20)\d{2}", c)
        if m:
            return m.group(0)
    return ""


def ris_date(d: str) -> str:
    """RIS DA field: YYYY/MM/DD/."""
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})", d or "")
    return f"{m.group(1)}/{m.group(2)}/{m.group(3)}/" if m else ""


def main():
    records = OrderedDict()

    def add(url, **kw):
        u = norm(url)
        if not u.startswith("http") or "." not in host(u):
            return
        rec = records.setdefault(u, {"url": u, "kw": set(), "n1": [], "cited_in": set()})
        for k, v in kw.items():
            if not v:
                continue
            if k == "kw":
                rec["kw"].update(v)
            elif k == "n1":
                rec["n1"].append(v)
            elif k == "cited_in":
                rec["cited_in"].add(v)
            elif k == "title":
                # a real link text beats a derived one
                if not rec.get("title") or rec.get("title_derived"):
                    rec["title"] = v
                    rec["title_derived"] = False
            else:
                rec.setdefault(k, v)

    # --- contestation items: news, statements, submissions ---------------
    ci = ROOT / "zenodo" / "contestation_items.csv"
    for r in csv.DictReader(ci.open()):
        url = r.get("source_url") or ""
        if not url.strip():
            continue
        item = re.sub(r"^\[\d{4}-\d{2}-\d{2}\]\s*", "", r.get("item") or "").strip()
        kw = {"contestation item"}
        for g in (r.get("grounds") or "").split(";"):
            if g.strip():
                kw.add(g.strip())
        if r.get("stance"):
            kw.add("stance: " + r["stance"])
        if r.get("source_type"):
            kw.add(r["source_type"])
        note = (f"Tracker contestation item {r.get('item_id','')[:8]}. "
                f"Confidence {r.get('confidence') or 'unrecorded'}; "
                f"classified by {r.get('classified_by') or 'unrecorded'}.")
        if (r.get("classified_by") or "") == "Agent":
            note += " NOT human-verified - do not quote without walking to source."
        add(url,
            title=None,
            derived_title=item or None,
            author=r.get("actor") or "",
            date=r.get("date") or "",
            kw=kw, n1=note, cited_in="contestation_items.csv")

    # --- sites: per-site evidence ----------------------------------------
    sc = ROOT / "zenodo" / "sites.csv"
    for r in csv.DictReader(sc.open()):
        urls = URL_RE.findall((r.get("source_url") or "") + " " + (r.get("notes") or ""))
        if not urls:
            continue
        kw = {"site evidence"}
        for f in ("state", "infrastructure_type", "operator", "planning_pathway"):
            if r.get(f):
                kw.add(r[f])
        note = (f"Cited for tracker site: {r.get('name','')}"
                + (f" ({r.get('state')})" if r.get("state") else "") + ". "
                f"Confidence {r.get('confidence') or 'unrecorded'}; "
                f"classified by {r.get('classified_by') or 'unrecorded'}.")
        for u in urls:
            add(u,
                derived_title=r.get("name") or None,
                date=r.get("approval_date") or r.get("announcement_date") or "",
                kw=kw, n1=note, cited_in="sites.csv")

    # --- research documents: markdown links win, bare URLs still counted --
    for rel in DOC_SOURCES:
        p = ROOT / rel
        if not p.exists():
            continue
        text = p.read_text(errors="ignore")
        linked = set()
        for label, url in MD_LINK_RE.findall(text):
            linked.add(norm(url))
            add(url, title=label.strip(), kw={"cited in research documents"},
                cited_in=Path(rel).name)
        for url in URL_RE.findall(text):
            if norm(url) not in linked:
                add(url, kw={"cited in research documents"}, cited_in=Path(rel).name)

    # --- emit -------------------------------------------------------------
    out = []
    stats = {"total": 0, "derived": 0, "by_rung": {}}
    for u, rec in sorted(records.items(), key=lambda kv: (host(kv[0]), kv[0])):
        rung, ty = classify(u)
        title = rec.get("title")
        derived = False
        if not title:
            title = rec.get("derived_title") or title_from_url(u)
            derived = True
        stats["total"] += 1
        stats["derived"] += derived
        stats["by_rung"][rung] = stats["by_rung"].get(rung, 0) + 1

        lines = [f"TY  - {ty}", f"TI  - {title}"]
        if rec.get("author"):
            lines.append(f"AU  - {rec['author']}")
        pub = publisher(u)
        if pub:
            lines.append(f"PB  - {pub}")
        py = year_of(rec.get("date"), u)
        if py:
            lines.append(f"PY  - {py}")
        da = ris_date(rec.get("date", ""))
        if da:
            lines.append(f"DA  - {da}")
        lines.append(f"UR  - {u}")
        lines.append("Y2  - 2026/08/18/")
        for k in sorted(rec["kw"]):
            lines.append(f"KW  - {k}")
        lines.append(f"KW  - {RUNG_LABEL[rung]}")
        notes = list(dict.fromkeys(rec["n1"]))
        if derived:
            notes.insert(0, "TITLE DERIVED by gen-citations.py from the tracker row "
                            "or URL slug - not the publisher's own title; correct by hand "
                            "before quoting.")
        notes.append("Harvested from: " + ", ".join(sorted(rec["cited_in"])) + ".")
        if rung >= 5:
            notes.append("Per FACT-CHECKING-GUIDE.md section 2 this is a low rung: "
                         "treat as a claim or a lead, never as a record.")
        lines.append("N1  - " + "  ".join(notes))
        lines.append("DB  - AI Sovereignties tracker (doi.org/10.5281/zenodo.21026430)")
        lines.append("ER  - ")
        out.append("\n".join(lines))

    header = (
        "Provider: AI Sovereignties - a living atlas of contesting and curating\n"
        "AI sovereignties (Australian view), Sarah Barns, Civic Interplay, 2026.\n"
        "doi.org/10.5281/zenodo.21026430\n"
        "Generated by docs/gen-citations.py on 2026-08-18. Do not hand-edit;\n"
        "correct the tracker or the research documents and re-run.\n"
    )
    OUT.write_text("\n".join("%" + l for l in header.strip().split("\n"))
                   + "\n\n" + "\n\n".join(out) + "\n")

    print(f"wrote {OUT.relative_to(ROOT)}")
    print(f"  {stats['total']} records; {stats['derived']} with DERIVED titles "
          f"({stats['total'] - stats['derived']} with real link text)")
    for rung in sorted(stats["by_rung"]):
        print(f"  {stats['by_rung'][rung]:4d}  {RUNG_LABEL[rung]}")


if __name__ == "__main__":
    sys.exit(main())
