// GDELT DOC 2.0 retrieval. Free, no auth, already tone-indexed. A wide net,
// not a precise instrument: hyperlocal Australian coverage is thin, so treat
// this as one strand alongside planning portals and manual ingestion.

import type { Candidate } from './types.ts';

const ENDPOINT = 'https://api.gdeltproject.org/api/v2/doc/doc';

/**
 * GDELT could not be reached — as distinct from "GDELT was reached and had
 * nothing". Thrown only after every retry is spent.
 *
 * This distinction is the whole point of the class. Returning [] on a throttled
 * sweep makes an outage indistinguishable from a quiet fortnight, which is how
 * the 2026-09-15 run went green while retrieving nothing: the press strand had
 * in fact failed, and the tracker recorded that silence as "no news".
 */
export class GdeltUnavailableError extends Error {
  constructor(
    readonly reason: 'throttled' | 'network',
    readonly attempts: number,
    options?: { cause?: unknown },
  ) {
    super(
      reason === 'throttled'
        ? `GDELT throttled through all ${attempts} attempts (HTTP 429 / "limit requests" notice). ` +
            'No articles retrieved — this is an outage, not an empty result set.'
        : `GDELT unreachable through all ${attempts} attempts (network error). ` +
            'No articles retrieved — this is an outage, not an empty result set.',
      options,
    );
    this.name = 'GdeltUnavailableError';
  }
}

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

  // GDELT is flaky in three distinct ways, and a scheduled run only gets one
  // shot a fortnight, so retry through all of them:
  //   1. Throttling (~1 req / 5s): HTTP 429, or a 200 whose body is a
  //      plain-text "limit requests" notice.
  //   2. A thrown fetch error — connect timeout / dropped connection. This is
  //      NOT an HTTP status; it escapes any status check, and is what silently
  //      lost the 1 Jul 2026 scheduled run. Must be caught, not just inspected.
  //
  // Measured 2026-09-19 from a residential IP: one query in roughly ten got
  // through; six backoff attempts across three minutes did not. Throttling is
  // the norm, not the exception, so the backoff is generous — and running out
  // of attempts raises GdeltUnavailableError rather than returning [].
  const MAX_ATTEMPTS = 6;
  const BACKOFF_MS = [8000, 15000, 25000, 40000, 60000];
  let body = '';
  let lastNetworkError: unknown = null;
  let exhausted: 'throttled' | 'network' | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const last = attempt === MAX_ATTEMPTS - 1;

    let res: Response;
    try {
      res = await fetch(`${ENDPOINT}?${params}`);
    } catch (err) {
      // Network-level failure: transient, so back off and retry.
      lastNetworkError = err;
      if (last) {
        exhausted = 'network';
        break;
      }
      await new Promise((r) => setTimeout(r, BACKOFF_MS[attempt]));
      continue;
    }

    // Read the body whatever the status: a throttle notice arrives as
    // plain text under both 429 and 200, and discarding it on !ok loses the
    // only evidence of which failure this was.
    body = await res.text().catch(() => '');
    const throttled = res.status === 429 || body.includes('limit requests');
    if (!throttled) {
      if (!res.ok) throw new Error(`GDELT failed (${res.status})`);
      break;
    }
    if (last) {
      exhausted = 'throttled';
      break;
    }
    await new Promise((r) => setTimeout(r, BACKOFF_MS[attempt]));
  }

  if (exhausted) {
    throw new GdeltUnavailableError(exhausted, MAX_ATTEMPTS, {
      cause: lastNetworkError ?? undefined,
    });
  }

  // A reached-but-empty GDELT legitimately returns an empty or non-JSON body;
  // that is a real zero and stays a zero. Only an exhausted retry budget above
  // is treated as an outage.
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
