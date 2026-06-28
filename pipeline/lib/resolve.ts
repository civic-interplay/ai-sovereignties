// Site resolver: map a site name mentioned in a source to an infra-tracker
// page ID. Misattributing an item to the wrong site is the most damaging error
// here, so the resolver is deliberately conservative: it returns a score and
// the caller treats a low score as "flag for review", not "guess".

import type { Site } from './notion.ts';

// Words that carry no disambiguating signal for Australian infra sites.
const STOP = new Set([
  'the', 'and', 'of', 'for', 'a', 'an', 'to', 'in', 'on', 'at', 'by',
  'project', 'projects', 'data', 'centre', 'center', 'mine', 'refinery',
  'facility', 'plant', 'campus', 'australia', 'australian', 'pty', 'ltd',
  'limited', 'group', 'resources', 'energy', 'rare', 'earths', 'minerals',
]);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

export interface Resolution {
  site: Site | null;
  score: number; // 0..1
  candidates: Array<{ site: Site; score: number }>;
}

// Score = how much of a site's distinctive tokens appear in the query text,
// with a bonus when the operator name also appears. A site that shares no
// distinctive token scores 0.
export function resolveSite(query: string, sites: Site[]): Resolution {
  const q = new Set(tokens(query));
  const scored = sites
    .map((site) => {
      const nameToks = tokens(site.name);
      const opToks = tokens(site.operator);
      if (nameToks.length === 0) return { site, score: 0 };
      const nameHits = nameToks.filter((t) => q.has(t)).length / nameToks.length;
      const opHit = opToks.length > 0 && opToks.some((t) => q.has(t)) ? 0.2 : 0;
      return { site, score: Math.min(1, nameHits + opHit) };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  // Require a clear winner: the top score must also beat the runner-up,
  // otherwise it is ambiguous between two sites and should be flagged.
  const runnerUp = scored[1]?.score ?? 0;
  const decisive = best && best.score >= 0.5 && best.score - runnerUp >= 0.2;

  return {
    site: decisive ? best.site : null,
    score: best?.score ?? 0,
    candidates: scored.slice(0, 3),
  };
}
