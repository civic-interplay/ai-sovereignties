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
//     (local-government scale), access is gated via a data broker.
//   - VIC — the relevant permit/major-project data sits behind "The Data
//     Exchange" API (public-sector access); the open City of Melbourne feed is
//     the wrong scope. Realistically a normalised export.
//
// Rather than hardcode endpoints that may 404, this adapter reads one or more
// feed URLs from the environment and maps a small, documented JSON shape to
// candidates. Point it at confirmed portal feeds, or at feeds you export and
// normalise yourself.
//
// Configuration (both optional; if neither is set the adapter returns nothing
// so the cron stays green, and submissions come through the manual `inbox`):
//   - PORTAL_FEED_URLS — comma-separated list, one entry per jurisdiction. Each
//     entry may be a bare URL, or "LABEL=URL" (e.g. "NSW=https://…,VIC=https://…")
//     to tag every item from that feed with its jurisdiction. A failed feed is
//     warned about and skipped, so one state's outage can't lose the others.
//   - PORTAL_FEED_URL — single-feed back-compat; treated as one unlabelled feed.
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

interface Feed {
  url: string;
  label: string | null; // jurisdiction tag, e.g. "NSW"
}

// Parse the configured feeds, newest option first. An entry of the form
// "LABEL=URL" is split only when the part before the first "=" reads like a
// short label — so query strings ("...?status=Exhibition") stay intact.
function resolveFeeds(opts: { feedUrl?: string; feedUrls?: string }): Feed[] {
  const raw =
    opts.feedUrls ??
    opts.feedUrl ??
    optionalEnv('PORTAL_FEED_URLS') ??
    optionalEnv('PORTAL_FEED_URL');
  if (!raw) return [];

  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry): Feed => {
      const eq = entry.indexOf('=');
      const maybeLabel = eq !== -1 ? entry.slice(0, eq).trim() : '';
      if (eq !== -1 && /^[a-z0-9 _-]{1,12}$/i.test(maybeLabel)) {
        return { label: maybeLabel, url: entry.slice(eq + 1).trim() };
      }
      return { label: null, url: entry };
    })
    .filter((f) => f.url);
}

function mapItems(items: PortalItem[], domain: string): Candidate[] {
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
      // Carries the jurisdiction so downstream can tell NSW from VIC items.
      domain,
      // The submission/exhibition record is the event; the summary is what the
      // classifier reads. For full submission text, stage the PDF via inbox.
      text: `${it.title}. ${it.summary}`.trim(),
    }));
}

// Fetch and map one feed. Never throws: a network error or non-200 is warned
// about and turned into an empty result, so one bad feed can't fail the run or
// suppress the others.
async function fetchOneFeed(feed: Feed): Promise<Candidate[]> {
  const who = feed.label ?? feed.url;

  let res: Response;
  try {
    res = await fetch(feed.url);
  } catch (err) {
    console.warn(`portals: fetch failed for ${who} (${String(err)}); skipping this feed.`);
    return [];
  }
  if (!res.ok) {
    console.warn(`portals: feed ${who} returned ${res.status}; skipping.`);
    return [];
  }

  let items: PortalItem[];
  try {
    const data = (await res.json()) as PortalItem[] | { items?: PortalItem[]; results?: PortalItem[] };
    items = Array.isArray(data) ? data : (data.items ?? data.results ?? []);
  } catch {
    console.warn(`portals: feed ${who} did not return JSON; skipping.`);
    return [];
  }

  const domain = feed.label ? `planningportal:${feed.label.toLowerCase()}` : 'planningportal';
  return mapItems(items, domain);
}

export async function fetchPortals(
  opts: { feedUrl?: string; feedUrls?: string } = {},
): Promise<Candidate[]> {
  const feeds = resolveFeeds(opts);
  if (feeds.length === 0) {
    console.warn(
      'portals: no PORTAL_FEED_URLS / PORTAL_FEED_URL set, skipping. Point it at confirmed planning-portal feeds (comma-separated, optionally "NSW=https://…,VIC=https://…"), or use --source inbox for submissions.',
    );
    return [];
  }

  // Feeds are independent; fetch them concurrently and concatenate. fetchOneFeed
  // never rejects, so Promise.all is safe here.
  const perFeed = await Promise.all(feeds.map(fetchOneFeed));
  return perFeed.flat();
}
