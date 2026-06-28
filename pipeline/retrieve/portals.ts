// Planning-portal retrieval.
//
// Planning portals and inquiry submissions are the richest, most explicitly
// framed contestation source: public objections and submissions, already
// structured. The catch is that each jurisdiction exposes them differently and
// not always as a clean public JSON feed:
//
//   - NSW Major Projects (State Significant Development) — each project has a
//     page (e.g. /major-projects/projects/huntingwood-data-centre) with public
//     submissions. A consolidated exhibition feed exists behind the hub but the
//     public JSON endpoint / access needs confirming.
//   - NSW Online DA Data API — documented JSON of DAs lodged since 2019
//     (local-government scale), may require registration.
//   - VIC / QLD / WA — separate systems again.
//
// Rather than hardcode an endpoint that may 404, this adapter reads a feed URL
// from PORTAL_FEED_URL and maps a small, documented JSON shape to candidates.
// Point it at a confirmed portal feed, or at a feed you export/normalise
// yourself. Until it is set, it returns nothing (so the cron stays green) and
// submissions can come through the manual `inbox` source instead.
//
// Expected feed shape (array of objects); field names are configurable below:
//   [{ "title": "...", "url": "https://...", "status": "On Exhibition",
//      "date": "2026-03-14", "summary": "..." }, ...]

import { optionalEnv } from '../lib/env.ts';
import type { Candidate } from './types.ts';

// Only items whose status looks like an open exhibition / submission window are
// worth pulling (that is where contestation is recorded).
const LIVE_STATUS = /exhibition|submission|consultation|comment/i;

// Keep the infrastructure relevant to this project.
const RELEVANT = /data\s*cent|rare\s*earth|ref_?inery|refinery|critical\s*mineral|processing|gigawatt|hyperscale/i;

interface PortalItem {
  title?: string;
  name?: string;
  url?: string;
  link?: string;
  status?: string;
  date?: string;
  exhibitionStart?: string;
  summary?: string;
  description?: string;
}

export async function fetchPortals(
  opts: { feedUrl?: string } = {},
): Promise<Candidate[]> {
  const feedUrl = opts.feedUrl ?? optionalEnv('PORTAL_FEED_URL');
  if (!feedUrl) {
    console.warn(
      'portals: PORTAL_FEED_URL not set, skipping. Point it at a confirmed planning-portal feed, or use --source inbox for submissions.',
    );
    return [];
  }

  const res = await fetch(feedUrl);
  if (!res.ok) throw new Error(`Portal feed failed (${res.status})`);

  let items: PortalItem[];
  try {
    const data = await res.json();
    items = Array.isArray(data) ? data : (data.items ?? data.results ?? []);
  } catch {
    return [];
  }

  return items
    .map((it) => {
      const title = it.title ?? it.name ?? '';
      const url = it.url ?? it.link ?? '';
      const status = it.status ?? '';
      const date = it.date ?? it.exhibitionStart ?? null;
      const summary = it.summary ?? it.description ?? title;
      return { title, url, status, date, summary };
    })
    .filter((it) => it.url && RELEVANT.test(`${it.title} ${it.summary}`))
    .filter((it) => !it.status || LIVE_STATUS.test(it.status))
    .map((it) => ({
      sourceUrl: it.url,
      title: it.title,
      date: it.date,
      domain: 'planningportal',
      // The submission/exhibition record is the event; the summary is what the
      // classifier reads. For full submission text, stage the PDF via inbox.
      text: `${it.title}. ${it.summary}`.trim(),
    }));
}
