// Manual ingestion. The licensed/PDF material (Factiva exports via RMIT,
// council minutes, town-hall notes) can't be crawled, so you drop files here
// and the pipeline reads them like any other candidate.
//
// Supported files in pipeline/inbox/:
//   *.json  -> { "source_url": "...", "date": "YYYY-MM-DD", "text": "..." }
//             (or an array of such objects)
//   *.txt   -> raw article/submission text; source_url defaults to inbox://<file>

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Candidate } from './types.ts';

const INBOX = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'inbox');

interface InboxJson {
  source_url?: string;
  date?: string;
  title?: string;
  text: string;
}

function fromJson(file: string, raw: string): Candidate[] {
  const parsed = JSON.parse(raw) as InboxJson | InboxJson[];
  const items = Array.isArray(parsed) ? parsed : [parsed];
  return items.map((it) => ({
    sourceUrl: it.source_url ?? `inbox://${file}`,
    title: it.title ?? it.text.slice(0, 120),
    date: it.date ?? null,
    domain: null,
    text: it.text,
  }));
}

export function fetchInbox(): Candidate[] {
  let files: string[];
  try {
    files = readdirSync(INBOX);
  } catch {
    return []; // no inbox dir yet
  }
  const out: Candidate[] = [];
  for (const file of files) {
    if (file.startsWith('.') || file === 'README.md') continue;
    const raw = readFileSync(join(INBOX, file), 'utf8');
    if (file.endsWith('.json')) {
      out.push(...fromJson(file, raw));
    } else if (file.endsWith('.txt')) {
      out.push({
        sourceUrl: `inbox://${file}`,
        title: raw.slice(0, 120),
        date: null,
        domain: null,
        text: raw,
      });
    }
  }
  return out;
}
