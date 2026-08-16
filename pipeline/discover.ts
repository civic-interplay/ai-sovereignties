// New-project discovery: propose candidate rows for the infra tracker.
//
// Two strands, both writing PROPOSALS ONLY — rows titled "[PROPOSED] …" with
// no Infrastructure Type and no coordinates, so they are invisible to the map
// and the data sheets until a human reviews them, fills the type/coords, and
// removes the prefix. Nothing agent-created enters published figures.
//
//   A. NSW ePlanning OnlineDA (structured, keyless API) — council DAs matching
//      data-centre terms or large industrial builds. No model call needed.
//   B. GDELT press sweep — announcements of new Australian data-centre
//      projects, classified by claude-sonnet-5 with a strict "propose, don't
//      invent" contract.
//
// Usage:
//   tsx pipeline/discover.ts                 # dry run — print proposals
//   tsx pipeline/discover.ts --write         # create [PROPOSED] rows in Notion
//   tsx pipeline/discover.ts --limit 20      # cap GDELT candidates classified

import Anthropic from '@anthropic-ai/sdk';
import { INFRA_DATABASE_ID, NOTION_VERSION } from './config.ts';
import { requireEnv, optionalEnv } from './lib/env.ts';
import { getInfraRows, type InfraRow } from './lib/notion.ts';
import { resolveSite, type Resolution } from './lib/resolve.ts';
import { fetchGdelt } from './retrieve/gdelt.ts';
import { fetchEplanning, type Discovery } from './retrieve/eplanning.ts';

const MODEL = optionalEnv('DISCOVERY_MODEL') ?? 'claude-sonnet-5';
const API = 'https://api.notion.com/v1';

const STATES = [
  'New South Wales', 'Victoria', 'Queensland', 'Western Australia',
  'South Australia', 'Tasmania', 'Northern Territory', 'ACT',
] as const;

// Announcement-tuned GDELT query — new-project language, not contestation.
const DISCOVERY_QUERY =
  '("data centre" OR "data center") (announced OR announces OR proposed OR planned OR lodged OR lodges OR approved OR "development application" OR "to build" OR construct OR hyperscale) sourcecountry:AS';

interface Proposal {
  title: string;
  state: (typeof STATES)[number] | null;
  sourceUrl: string | null;
  confidence: number;
  notes: string;
}

// --- Dedup helpers ---------------------------------------------------------

function existingKeys(rows: InfraRow[]) {
  const urls = new Set(rows.map((r) => r.source).filter(Boolean) as string[]);
  // PAN-like tokens anywhere in a row name or notes (PA2403416, PAN-45012, SSD-12345)
  const pans = new Set<string>();
  for (const r of rows) {
    for (const m of `${r.name} ${r.notes}`.matchAll(/\b(?:PAN?-?\d{5,}|SSD[-\s]?\d{3,})\b/gi)) {
      pans.add(m[0].replace(/[-\s]/g, '').toUpperCase());
    }
  }
  return { urls, pans };
}

function panKey(pan: string): string {
  return pan.replace(/[-\s]/g, '').toUpperCase();
}

// --- Strand A: NSW ePlanning ----------------------------------------------

function eplanningProposal(d: Discovery): Proposal {
  const cost = d.cost != null ? `$${(d.cost / 1e6).toFixed(1)}M` : 'cost n/a';
  const exhib = d.exhibited
    ? `exhibited ${d.exhibitionStart ?? '?'} → ${d.exhibitionEnd ?? '?'}`
    : 'no exhibition window recorded';
  const coords = d.lat != null && d.lon != null ? `${d.lat}, ${d.lon}` : 'no coords in feed';
  return {
    title: `[PROPOSED] Data centre DA — ${d.suburb ?? d.council} (${d.pan})`,
    state: 'New South Wales',
    sourceUrl: null,
    confidence: d.matchedOn === 'data-centre term' ? 0.5 : 0.35,
    notes: [
      `Discovered by the pipeline from the NSW ePlanning OnlineDA API (${d.matchedOn}).`,
      `${d.address} · ${d.council} · ${d.applicationType} · status: ${d.status}.`,
      `Types: ${d.developmentTypes.join('; ') || 'n/a'} · ${cost}${d.storeys != null ? ` · ${d.storeys} storeys` : ''}.`,
      `Lodged ${d.lodgementDate ?? 'n/a'} · ${exhib}.`,
      `Coordinates (paste to publish): ${coords}.`,
      'REVIEW: confirm it is a data centre, fill Infrastructure Type + coordinates, remove [PROPOSED].',
    ].join(' '),
  };
}

// --- Strand B: GDELT announcements (model-classified) ----------------------

const TOOL = {
  name: 'assess_announcement',
  description: 'Assess whether a headline announces a NEW Australian data-centre project.',
  input_schema: {
    type: 'object' as const,
    additionalProperties: false,
    properties: {
      is_new_australian_dc_project: {
        type: 'boolean',
        description:
          'True ONLY if this announces a specific new data-centre project or campus in Australia (announcement, DA lodged, approval, construction start). False for opinion pieces, policy stories, overseas projects, or coverage of already-operating sites.',
      },
      project_name: { type: 'string', description: 'Best short name, e.g. "AirTrunk MEL4 — Derrimut". Empty if not a new project.' },
      operator: { type: 'string', description: 'Company behind it, empty if unstated. Never guess.' },
      state: { type: 'string', enum: [...STATES, 'unknown'], description: 'Australian state, or unknown.' },
      location: { type: 'string', description: 'Suburb/locality if stated, else empty. Never guess.' },
      summary: { type: 'string', description: 'One sentence: what is announced, from the headline only.' },
      confidence: { type: 'number', description: '0..1 — the headline alone is thin evidence; be conservative.' },
    },
    required: ['is_new_australian_dc_project', 'project_name', 'operator', 'state', 'location', 'summary', 'confidence'],
  },
};

export interface DiscoveryUsage { calls: number; inputTokens: number; outputTokens: number }
const usage: DiscoveryUsage = { calls: 0, inputTokens: 0, outputTokens: 0 };

async function assess(client: Anthropic, headline: string, url: string) {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: 'disabled' },
    system:
      'You screen news headlines for NEW Australian data-centre projects for a public research tracker. ' +
      'Only the headline is available — extract, never infer or embellish. Empty strings beat guesses.',
    tools: [TOOL],
    tool_choice: { type: 'tool', name: 'assess_announcement' },
    messages: [{ role: 'user', content: `Headline: ${headline}\nURL: ${url}` }],
  });
  usage.calls += 1;
  usage.inputTokens += res.usage?.input_tokens ?? 0;
  usage.outputTokens += res.usage?.output_tokens ?? 0;
  const block = res.content.find((b) => b.type === 'tool_use');
  if (!block || block.type !== 'tool_use') throw new Error('no tool call');
  return block.input as {
    is_new_australian_dc_project: boolean;
    project_name: string;
    operator: string;
    state: string;
    location: string;
    summary: string;
    confidence: number;
  };
}

// --- Notion write ----------------------------------------------------------

async function createProposal(p: Proposal): Promise<void> {
  const properties: Record<string, unknown> = {
    'Company / Project': { title: [{ text: { content: p.title.slice(0, 2000) } }] },
    Notes: { rich_text: [{ text: { content: p.notes.slice(0, 2000) } }] },
    Confidence: { number: Math.round(p.confidence * 100) / 100 },
    'Classified by': { select: { name: 'Agent' } },
    'Date Logged': { date: { start: new Date().toISOString().slice(0, 10) } },
  };
  if (p.state) properties['State / Region'] = { select: { name: p.state } };
  if (p.sourceUrl) properties.Source = { url: p.sourceUrl };

  const res = await fetch(`${API}/pages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${requireEnv('NOTION_TOKEN')}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ parent: { database_id: INFRA_DATABASE_ID }, properties }),
  });
  if (!res.ok) throw new Error(`Notion create failed (${res.status}): ${await res.text()}`);
}

// --- Main ------------------------------------------------------------------

async function main() {
  const argv = process.argv;
  const write = argv.includes('--write');
  const limitArg = argv.indexOf('--limit');
  const limit = limitArg !== -1 ? Number(argv[limitArg + 1]) : 25;

  const rows = await getInfraRows();
  const { urls, pans } = existingKeys(rows);
  // The resolver needs the Site shape; proposals must not match existing rows.
  const sites = rows.map((r) => ({ id: r.id, name: r.name.replace(/^\[PROPOSED\]\s*/, ''), operator: '', state: r.state, infraType: r.infraType }));
  console.log(`Loaded ${rows.length} tracker rows (${pans.size} planning numbers, ${urls.size} source URLs) for dedup.\n`);

  const proposals: Proposal[] = [];

  // Strand A — NSW ePlanning, last 60 days of updates.
  const since = new Date(Date.now() - 60 * 86400_000).toISOString().slice(0, 10);
  console.log(`Strand A: NSW ePlanning OnlineDA (updated since ${since})…`);
  try {
    const das = await fetchEplanning({ since, maxPages: 3 });
    for (const d of das) {
      if (pans.has(panKey(d.pan))) continue; // already tracked or proposed
      const res: Resolution = resolveSite(`${d.address} ${d.suburb ?? ''} data centre`, sites);
      if (res.site) continue; // decisively an existing site
      proposals.push(eplanningProposal(d));
      pans.add(panKey(d.pan));
    }
    console.log(`  ${das.length} relevant DA(s) in window → ${proposals.length} new proposal(s).`);
  } catch (err) {
    console.warn(`  ePlanning strand failed (${String(err)}); continuing with press sweep.`);
  }

  // Strand B — GDELT announcement sweep.
  console.log(`\nStrand B: GDELT announcement sweep (limit ${limit})…`);
  const client = new Anthropic({ apiKey: requireEnv('ANTHROPIC_API_KEY') });
  const articles = await fetchGdelt({ query: DISCOVERY_QUERY, timespan: '6weeks', maxRecords: 75 });
  const fresh = articles
    .filter((a) => /data\s*cent(re|er)/i.test(a.title))
    .filter((a) => !urls.has(a.sourceUrl))
    .filter((a) => !resolveSite(a.title, sites).site) // skip known sites
    .slice(0, limit);
  console.log(`  ${articles.length} articles → ${fresh.length} candidate headline(s) after dedup.`);

  for (const c of fresh) {
    try {
      const a = await assess(client, c.title, c.sourceUrl);
      if (!a.is_new_australian_dc_project || !a.project_name) continue;
      // Re-check the model's proposed name against known sites and this run.
      if (resolveSite(`${a.project_name} ${a.operator} ${a.location}`, sites).site) continue;
      if (proposals.some((p) => resolveSite(a.project_name, [{ id: '', name: p.title.replace(/^\[PROPOSED\]\s*/, ''), operator: '', state: null, infraType: null }]).site)) continue;
      proposals.push({
        title: `[PROPOSED] ${a.project_name}${a.location && !a.project_name.includes(a.location) ? ` — ${a.location}` : ''}`,
        state: (STATES as readonly string[]).includes(a.state) ? (a.state as Proposal['state']) : null,
        sourceUrl: c.sourceUrl,
        confidence: Math.min(a.confidence, 0.5),
        notes: [
          `Discovered by the pipeline from press coverage (headline only — verify against primary sources).`,
          a.summary,
          a.operator ? `Operator per headline: ${a.operator}.` : '',
          `Source date: ${c.date ?? 'n/a'}.`,
          'REVIEW: verify against the planning record, fill Infrastructure Type + coordinates, remove [PROPOSED].',
        ].filter(Boolean).join(' '),
      });
      urls.add(c.sourceUrl);
    } catch (err) {
      console.warn(`  error on ${c.sourceUrl}: ${String(err)}`);
    }
  }

  // Report + write.
  console.log(`\n${proposals.length} proposal(s):`);
  for (const p of proposals) console.log(`  • ${p.title}  conf=${p.confidence.toFixed(2)}${p.state ? `  [${p.state}]` : ''}`);

  let written = 0;
  if (write) {
    for (const p of proposals) {
      try {
        await createProposal(p);
        written++;
      } catch (err) {
        console.error(`  write failed for "${p.title}": ${String(err)}`);
      }
    }
  }
  console.log(`\nDone. ${write ? `${written} proposal(s) written to the tracker` : 'no writes (add --write)'}.`);

  // Compute transparency — same public log as the classifier (docs/COMPUTE.md).
  if (usage.calls > 0) {
    const entry = {
      date: new Date().toISOString().slice(0, 10),
      kind: 'pipeline',
      source: 'discovery',
      model: MODEL,
      calls: usage.calls,
      input_tokens: usage.inputTokens,
      output_tokens: usage.outputTokens,
    };
    const { appendFileSync } = await import('node:fs');
    appendFileSync(new URL('../docs/compute-log.jsonl', import.meta.url), JSON.stringify(entry) + '\n');
    console.log(`Compute: ${usage.calls} calls to ${MODEL}, ${usage.inputTokens} in / ${usage.outputTokens} out tokens (logged).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
