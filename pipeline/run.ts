// Orchestrator: retrieve candidates -> classify -> resolve site -> write.
//
// Usage:
//   tsx pipeline/run.ts --source gdelt --dry-run            # no key, no writes
//   tsx pipeline/run.ts --source gdelt --limit 5            # classify, print only
//   tsx pipeline/run.ts --source inbox --limit 5 --write    # classify + write to Notion
//
// Flags:
//   --source gdelt|inbox   where candidates come from (default gdelt)
//   --limit N              cap items processed (default 10)
//   --dry-run             retrieve + resolve only; never calls the model or writes
//   --write               actually create rows in Notion (otherwise prints)

import { REVIEW_THRESHOLD, type Classification } from './config.ts';
import { getSites, getExistingSourceUrls, createContestationItem, type Site } from './lib/notion.ts';
import { resolveSite } from './lib/resolve.ts';
import { fetchGdelt } from './retrieve/gdelt.ts';
import { fetchInbox } from './retrieve/inbox.ts';
import { fetchPortals } from './retrieve/portals.ts';
import type { Candidate } from './retrieve/types.ts';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}
function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

async function getCandidates(source: string): Promise<Candidate[]> {
  if (source === 'inbox') return fetchInbox();
  if (source === 'gdelt') return fetchGdelt();
  if (source === 'portals') return fetchPortals();
  throw new Error(`Unknown source "${source}" (use gdelt, inbox or portals)`);
}

async function main() {
  const source = arg('source') ?? 'gdelt';
  const limit = Number(arg('limit') ?? 10);
  const dryRun = flag('dry-run');
  const write = flag('write');

  console.log(`source=${source} limit=${limit} dryRun=${dryRun} write=${write}\n`);

  const [sites, seen] = await Promise.all([getSites(), getExistingSourceUrls()]);
  console.log(`Loaded ${sites.length} infra sites, ${seen.size} existing contestation items.`);

  const all = await getCandidates(source);
  const newUrls = all.filter((c) => !seen.has(c.sourceUrl));

  // Syndication dedup: one wire story lands on many mastheads with many URLs
  // (16 copies of one item on 2026-07-15), so URL dedup is not enough. Drop
  // candidates whose headline matches an already-tracked story, and keep only
  // one candidate per headline within this run.
  const { getExistingStoryTokens, looksLikeExistingStory, storyTokens } = await import('./lib/notion.ts');
  const existingStories = await getExistingStoryTokens();
  const seenHeadlines: Array<Set<string>> = [];
  const fresh = newUrls
    .filter((c) => {
      if (looksLikeExistingStory(c.title, existingStories)) return false;
      if (looksLikeExistingStory(c.title, seenHeadlines)) return false;
      seenHeadlines.push(storyTokens(c.title));
      return true;
    })
    .slice(0, limit);
  console.log(
    `${all.length} candidates from ${source}, ${newUrls.length} new URLs, ${fresh.length} after syndication dedup.\n`,
  );

  if (dryRun) return dry(fresh, sites);

  const { classify } = await import('./lib/classify.ts');
  let written = 0;
  const flagged: string[] = [];

  for (const c of fresh) {
    try {
      const raw = await classify(c.text, sites);
      const res = resolveSite(`${raw.site_name ?? ''} ${c.title}`, sites);
      const siteId = res.site?.id ?? null;
      // Site match is the riskiest field: fold its score into confidence and,
      // when no decisive site, cap confidence so the item must be reviewed.
      const confidence = siteId
        ? Math.min(raw.confidence, 0.4 + 0.6 * res.score)
        : Math.min(raw.confidence, 0.4);

      const item: Classification = {
        site_id: siteId,
        source_url: c.sourceUrl,
        source_type: raw.source_type as Classification['source_type'],
        // Prefer the source's own publication date (from inbox metadata or
        // GDELT) over the model's guess, which is unreliable when the text has
        // no explicit date.
        date: c.date || raw.date || '',
        actor: raw.actor,
        actor_type: raw.actor_type as Classification['actor_type'],
        stance: raw.stance as Classification['stance'],
        grounds: raw.grounds as Classification['grounds'],
        frame_summary: raw.frame_summary,
        intensity: raw.intensity as Classification['intensity'],
        quote: raw.quote,
        confidence,
      };

      const title = `[${item.date || 'n.d.'}] ${res.site?.name ?? raw.site_name ?? 'Unresolved site'}: ${item.stance} (${raw.actor || raw.actor_type})`;
      const low = confidence < REVIEW_THRESHOLD;
      if (low) flagged.push(title);

      if (write) {
        await createContestationItem(item, title);
        written++;
        console.log(`  wrote: ${title}  conf=${confidence.toFixed(2)}${low ? '  ⚠ review' : ''}`);
      } else {
        console.log(`  would write: ${title}  conf=${confidence.toFixed(2)} site=${siteId ? 'ok' : 'UNRESOLVED'}${low ? '  ⚠ review' : ''}`);
      }
    } catch (err) {
      console.error(`  error on ${c.sourceUrl}: ${String(err)}`);
    }
  }

  console.log(`\nDone. ${write ? `${written} written` : 'no writes (add --write)'}. ${flagged.length} flagged for review.`);

  // Compute transparency: append this run's model usage to the public log
  // (docs/compute-log.jsonl, committed by the workflow). See docs/COMPUTE.md.
  const { usageTally } = await import('./lib/classify.ts');
  const usage = usageTally();
  if (usage.calls > 0) {
    const entry = {
      date: new Date().toISOString().slice(0, 10),
      kind: 'pipeline',
      source,
      model: usage.model,
      calls: usage.calls,
      input_tokens: usage.inputTokens,
      output_tokens: usage.outputTokens,
    };
    const { appendFileSync } = await import('node:fs');
    appendFileSync(new URL('../docs/compute-log.jsonl', import.meta.url), JSON.stringify(entry) + '\n');
    console.log(`Compute: ${usage.calls} calls to ${usage.model}, ${usage.inputTokens} in / ${usage.outputTokens} out tokens (logged).`);
  }
}

function dry(fresh: Candidate[], sites: Site[]) {
  console.log('DRY RUN — resolving each candidate against the site list (no model, no writes):\n');
  let resolved = 0;
  for (const c of fresh) {
    const res = resolveSite(c.title, sites);
    if (res.site) resolved++;
    const top = res.candidates.map((x) => `${x.site.name}=${x.score.toFixed(2)}`).join(', ');
    console.log(`• ${c.date ?? 'n.d.'}  ${c.title.slice(0, 90)}`);
    console.log(`    ${c.sourceUrl}`);
    console.log(`    -> ${res.site ? `RESOLVED: ${res.site.name}` : 'unresolved (would flag)'}  [${top}]\n`);
  }
  console.log(`Resolved ${resolved}/${fresh.length} by headline alone (the model will do better on full text).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
