// Second press strand, so one outage cannot empty the news feed. GDELT has
// become unreliable (HTTP 429 from GitHub runners and residential IPs alike,
// Sept to Oct 2026), and Google News RSS is ruled out: its feed terms permit
// only "a personal feed reader for personal, non-commercial use".
//
// Two kinds of source, chosen for what their terms allow:
//
//   1. Publisher feeds whose licence permits reuse. On by default:
//        The Conversation's data centres topic feed, Creative Commons BY-ND.
//      Off by default, pending a decision on their feed terms (headline +
//      link use only): Data Center Dynamics, ABC News. Turn on with
//      PRESS_FEEDS=conversation,dcd,abc
//
//   2. The Guardian Open Platform API, whose developer key is for
//      non-commercial projects. Used only when GUARDIAN_API_KEY is set, and
//      it returns the article's standfirst and opening text, so the
//      classifier reads more than a headline.
//
// Feeds carry every story, so items are kept only if they match the tracker's
// subject (data centres and the minerals and energy behind them) AND look
// Australian. The classifier still decides stance and relevance after this.

import type { Candidate } from './types.ts';

// `topical` feeds are already about data centres, so the Australia filter is
// skipped for them and the classifier judges relevance.
const FEEDS: Record<string, { url: string; label: string; topical?: boolean }> = {
  conversation: { url: 'https://theconversation.com/topics/data-centres-111647/articles.atom', label: 'The Conversation (data centres topic)', topical: true },
  dcd: { url: 'https://www.datacenterdynamics.com/en/rss/', label: 'Data Center Dynamics' },
  abc: { url: 'https://www.abc.net.au/news/feed/51120/rss.xml', label: 'ABC News (Just In)' },
};
const DEFAULT_FEEDS = ['conversation'];

const SUBJECT = /data ?cent(re|er)s?|hyperscale|\bAI factor(y|ies)\b|rare earths?|gallium|critical minerals?|refinery/i;
const AUSTRALIAN =
  /australia|\bNSW\b|new south wales|victoria|queensland|tasmania|western australia|\bACT\b|canberra|sydney|melbourne|brisbane|perth|adelaide|hobart|darwin|northern territory|south australia/i;

const UA = 'civicinterplay-contestation-pipeline/1.0 (+https://civicinterplay.io/sovereignties/)';

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&rsquo;|&lsquo;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decode(m[1]) : '';
}
function isoDate(s: string): string | null {
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t).toISOString().slice(0, 10);
}
function domainOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// RSS <item> and Atom <entry>, parsed without a dependency.
function parseFeed(xml: string): Candidate[] {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  return blocks.map((b) => {
    const atomLink = b.match(/<link[^>]*href="([^"]+)"/i)?.[1];
    const url = atomLink ?? tag(b, 'link');
    const title = tag(b, 'title');
    const summary = tag(b, 'description') || tag(b, 'summary') || tag(b, 'content');
    const date = isoDate(tag(b, 'pubDate') || tag(b, 'published') || tag(b, 'updated'));
    return { sourceUrl: url, title, date, domain: domainOf(url), text: summary ? `${title}. ${summary}`.slice(0, 2000) : title };
  });
}

async function fetchFeed(key: string): Promise<Candidate[]> {
  const feed = FEEDS[key];
  if (!feed) {
    console.log(`press: unknown feed "${key}", skipping`);
    return [];
  }
  try {
    const res = await fetch(feed.url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) });
    if (!res.ok) {
      console.log(`press: ${feed.label} returned HTTP ${res.status}, skipping`);
      return [];
    }
    const items = parseFeed(await res.text());
    const kept = items.filter((c) => c.sourceUrl && SUBJECT.test(c.text) && (feed.topical || AUSTRALIAN.test(c.text)));
    console.log(`press: ${feed.label}: ${items.length} items, ${kept.length} on topic`);
    return kept;
  } catch (e) {
    console.log(`press: ${feed.label} unreachable (${(e as Error).message}), skipping`);
    return [];
  }
}

async function fetchGuardian(apiKey: string): Promise<Candidate[]> {
  const from = new Date(Date.now() - 31 * 86400000).toISOString().slice(0, 10);
  const params = new URLSearchParams({
    q: '("data centre" OR "data centres" OR "data center" OR hyperscale OR "rare earths") AND (Australia OR NSW OR Victoria OR Queensland OR Tasmania)',
    'from-date': from,
    'order-by': 'newest',
    'page-size': '50',
    'show-fields': 'trailText,bodyText',
    'api-key': apiKey,
  });
  try {
    const res = await fetch(`https://content.guardianapis.com/search?${params}`, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) {
      console.log(`press: Guardian API returned HTTP ${res.status}, skipping`);
      return [];
    }
    const data = (await res.json()) as {
      response?: { results?: Array<{ webUrl: string; webTitle: string; webPublicationDate: string; fields?: { trailText?: string; bodyText?: string } }> };
    };
    const results = data.response?.results ?? [];
    const kept = results
      .map((r) => ({
        sourceUrl: r.webUrl,
        title: r.webTitle,
        date: r.webPublicationDate?.slice(0, 10) ?? null,
        domain: 'theguardian.com',
        text: `${r.webTitle}. ${decode(r.fields?.trailText ?? '')} ${(r.fields?.bodyText ?? '').slice(0, 1500)}`.trim(),
      }))
      .filter((c) => SUBJECT.test(c.text) && AUSTRALIAN.test(c.text));
    console.log(`press: Guardian API: ${results.length} results, ${kept.length} on topic`);
    return kept;
  } catch (e) {
    console.log(`press: Guardian API unreachable (${(e as Error).message}), skipping`);
    return [];
  }
}

export async function fetchPress(): Promise<Candidate[]> {
  const keys = (process.env.PRESS_FEEDS ?? DEFAULT_FEEDS.join(','))
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const batches = await Promise.all(keys.map(fetchFeed));
  const guardianKey = process.env.GUARDIAN_API_KEY;
  if (guardianKey) batches.push(await fetchGuardian(guardianKey));
  else console.log('press: GUARDIAN_API_KEY not set, Guardian strand skipped');
  // One candidate per URL across feeds.
  const byUrl = new Map<string, Candidate>();
  for (const c of batches.flat()) if (!byUrl.has(c.sourceUrl)) byUrl.set(c.sourceUrl, c);
  return [...byUrl.values()];
}
