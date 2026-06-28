// GDELT DOC 2.0 retrieval. Free, no auth, already tone-indexed. A wide net,
// not a precise instrument: hyperlocal Australian coverage is thin, so treat
// this as one strand alongside planning portals and manual ingestion.

import type { Candidate } from './types.ts';

const ENDPOINT = 'https://api.gdeltproject.org/api/v2/doc/doc';

// Infrastructure terms AND debate terms, biased to Australian sources. The
// debate terms deliberately include BOTH opposition and support framing, so the
// tracker captures the whole structure of the debate (the classifier records
// stance) rather than only the objections. Opposition-only retrieval would skew
// the picture and miss the benefits case (jobs, investment, strategic value).
// GDELT's sourcecountry uses FIPS 10-4 codes; Australia is "AS" (not "australia").
const DEFAULT_QUERY =
  '("data centre" OR "data center" OR "rare earths" OR refinery OR "rare earth refinery") (opposition OR objection OR protest OR "community concern" OR submission OR "water use" OR support OR welcomes OR jobs OR investment OR backs) sourcecountry:AS';

function toIsoDate(seendate: string | undefined): string | null {
  // GDELT format: 20260615T103000Z
  if (!seendate || seendate.length < 8) return null;
  return `${seendate.slice(0, 4)}-${seendate.slice(4, 6)}-${seendate.slice(6, 8)}`;
}

export async function fetchGdelt(
  opts: { query?: string; maxRecords?: number; timespan?: string } = {},
): Promise<Candidate[]> {
  const params = new URLSearchParams({
    query: opts.query ?? DEFAULT_QUERY,
    mode: 'ArtList',
    format: 'json',
    maxrecords: String(opts.maxRecords ?? 75),
    timespan: opts.timespan ?? '3months',
    sort: 'datedesc',
  });

  // GDELT throttles to ~1 request / 5s. Over-limit it answers either with HTTP
  // 429 or a 200 whose body is a plain-text notice. Back off and retry on both.
  let body = '';
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`${ENDPOINT}?${params}`);
    body = res.ok ? await res.text() : '';
    const throttled = res.status === 429 || body.includes('limit requests');
    if (!throttled) {
      if (!res.ok) throw new Error(`GDELT failed (${res.status})`);
      break;
    }
    await new Promise((r) => setTimeout(r, 7000));
  }

  // On no results GDELT can return empty or a throttle notice; guard the parse.
  let data: { articles?: Array<Record<string, string>> };
  try {
    data = JSON.parse(body);
  } catch {
    return [];
  }

  const articles = data.articles ?? [];
  return articles
    .filter((a) => a.url)
    .map((a) => ({
      sourceUrl: a.url,
      title: a.title ?? '',
      date: toIsoDate(a.seendate),
      domain: a.domain ?? null,
      // GDELT gives no body; the headline is the only text at this stage.
      text: a.title ?? '',
    }));
}
