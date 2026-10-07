// Act on the Review dropdown, so approving an agent's proposal is one click.
//
// Tracker (sites), Review =
//   Approve        [PROPOSED] row: strip the prefix, mark Classified by =
//                  Human, infer the type from its name and notes, and find map
//                  coordinates from the address (OpenStreetMap Nominatim).
//                  If the type or the coordinates cannot be worked out
//                  reliably, set Review = Needs details with a note saying
//                  what is missing, rather than guess. Any other row: mark
//                  Classified by = Human.
//   Reject         rename [PROPOSED] -> [REJECTED] (kept as the false-positive
//                  log), Review = Rejected.
// News (Contestation Tracker), Review =
//   Approve        Classified by = Human, Review = Approved (the feed drops the
//                  "flagged for review" marker).
//   Remove         archive the page (recoverable from Notion's trash).
//
// Every change appends a dated line to the row's Notes, so the record shows
// who decided and what the script filled in.
//
// Usage:
//   tsx pipeline/apply-reviews.ts            # print what would happen
//   tsx pipeline/apply-reviews.ts --write    # do it

import { CONTESTATION_DATABASE_ID, INFRA_DATABASE_ID, NOTION_VERSION } from './config.ts';
import { requireEnv } from './lib/env.ts';

type Prop = Record<string, unknown>;
type Page = { id: string; properties: Record<string, Prop> };
const write = process.argv.includes('--write');
const today = new Date().toISOString().slice(0, 10);

function headers() {
  return {
    Authorization: `Bearer ${requireEnv('NOTION_TOKEN')}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}
async function query(db: string, filter: object): Promise<Page[]> {
  const out: Page[] = [];
  let cursor: string | undefined;
  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${db}/query`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ page_size: 100, start_cursor: cursor, filter }),
    });
    if (!res.ok) throw new Error(`Notion query failed (${res.status}): ${await res.text()}`);
    const d = (await res.json()) as { results: Page[]; has_more: boolean; next_cursor: string | null };
    out.push(...d.results);
    cursor = d.has_more ? d.next_cursor ?? undefined : undefined;
  } while (cursor);
  return out;
}
async function patch(id: string, body: object): Promise<void> {
  if (!write) return;
  const res = await fetch(`https://api.notion.com/v1/pages/${id}`, { method: 'PATCH', headers: headers(), body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Notion update failed (${res.status}): ${await res.text()}`);
}
const plain = (p?: Prop) => (((p?.title ?? p?.rich_text) as Array<{ plain_text?: string }>) ?? []).map((t) => t.plain_text ?? '').join('');
const select = (p?: Prop) => ((p?.select as { name?: string } | null) ?? null)?.name ?? null;
// Append a line to Notes, keeping the existing text (and its links) intact.
function notesWith(p: Page, line: string) {
  const existing = ((p.properties['Notes']?.rich_text as unknown[]) ?? []) as object[];
  return { rich_text: [...existing, { type: 'text', text: { content: `${existing.length ? ' || ' : ''}[${today}] ${line}` } }].slice(-100) };
}

// --- Type: from the row's own words, never a default ---------------------
// The name decides first; notes only break a tie. Policy words are matched
// case-sensitively for "Act" so the territory (ACT) is not read as a statute.
const POLICY_WORDS = /\b(inquiry|consultation|framework|strategy|policy|expectations|guidelines|bill)\b/i;
const STATUTE = /\bAct\b/; // case-sensitive: "Act", not the territory "ACT"
const isPolicy = (t: string) => POLICY_WORDS.test(t) || STATUTE.test(t);
const DC = /data ?cent(re|er)|hyperscale|\bcampus\b|\bAI factory\b|\bDA\b|digital (park|campus)/i;
const OTHER: Array<[RegExp, string]> = [
  [/refinery|processing plant/i, '🏭 Processing / Refinery'],
  [/\bmine\b|mining|rare earth|lithium|extraction/i, '⛏️ Mine / Extraction'],
  [/transmission|substation|\bgrid\b|interconnector/i, '⚡ Energy / Grid'],
];
export function inferType(name: string, notes: string): string | null {
  if (isPolicy(name)) return '🏛️ Policy / Regulation';
  if (DC.test(name)) return '🖥️ Data Centre';
  for (const [re, t] of OTHER) if (re.test(name)) return t;
  // Fall back to the notes, data centre first: notes often mention policy in passing.
  if (DC.test(notes)) return '🖥️ Data Centre';
  for (const [re, t] of OTHER) if (re.test(notes)) return t;
  if (isPolicy(notes)) return '🏛️ Policy / Regulation';
  return null;
}

// --- Coordinates: an address from the name, else from the notes ----------
const PROJECT_WORDS = /\b(data ?cent(re|er)s?|campus|hyperscale|project|ssd|stage \d+)\b/gi;
const STREET = /\b\d+[A-Z]?(?:[-–]\d+[A-Z]?)?\s+[A-Z][A-Za-z' ]+?\s+(?:ROAD|RD|STREET|ST|DRIVE|DR|AVENUE|AVE|PLACE|PL|WAY|LANE|LN|HIGHWAY|HWY|CRESCENT|CRES|COURT|CT|PARADE|BOULEVARD|CLOSE)\b[ ,]+[A-Z][A-Za-z ]+?(?:\s+(?:NSW|VIC|QLD|WA|SA|TAS|ACT|NT))?\s+\d{4}/i;
export function addressOf(name: string, notes = ''): string | null {
  const paren = name.match(/\(([^()]*\d[^()]*)\)\s*$/);
  if (paren) {
    const a = paren[1].replace(/\b(SSD|PAN|DA|PA|EPBC)[-\s]?[\w/-]+\b/gi, '').replace(/^[\s,]+|[\s,]+$/g, '');
    if (/\d/.test(a)) return a;
  }
  const fromNotes = notes.match(STREET);
  if (fromNotes) return fromNotes[0].replace(/\s+/g, ' ').trim();
  const dash = name.split('—').slice(1).join('—').replace(/\([^)]*\)/g, '').replace(PROJECT_WORDS, '').replace(/\s{2,}/g, ' ').replace(/^[\s,]+|[\s,]+$/g, '');
  return dash || null;
}
async function geocode(q: string): Promise<{ lat: number; lng: number; label: string } | null> {
  // A council or authority name is not a location: placing it would pin the
  // site to the council offices.
  if (/\b(council|shire|department|authority)\b/i.test(q)) return null;
  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({ q, countrycodes: 'au', format: 'json', limit: '1' })}`;
  await new Promise((r) => setTimeout(r, 1100)); // Nominatim policy: at most one request a second
  const res = await fetch(url, { headers: { 'User-Agent': 'civicinterplay-tracker/1.0 (+https://civicinterplay.io/sovereignties/)' } });
  if (!res.ok) return null;
  const [hit] = (await res.json()) as Array<{ lat: string; lon: string; display_name: string; addresstype?: string }>;
  // The label records how precise the pin is (street, suburb, locality...).
  return hit ? { lat: Number(hit.lat), lng: Number(hit.lon), label: `${hit.addresstype ?? 'place'} level: ${hit.display_name}` } : null;
}

async function sites() {
  const rows = await query(INFRA_DATABASE_ID, { or: [{ property: 'Review', select: { equals: 'Approve' } }, { property: 'Review', select: { equals: 'Reject' } }] });
  for (const p of rows) {
    const title = plain(p.properties['Company / Project']);
    const decision = select(p.properties['Review']);
    const proposed = title.startsWith('[PROPOSED]');
    if (decision === 'Reject') {
      const newTitle = proposed ? title.replace(/^\[PROPOSED\]/, '[REJECTED]') : title;
      console.log(`REJECT  ${title}`);
      await patch(p.id, {
        properties: {
          'Company / Project': { title: [{ type: 'text', text: { content: newTitle } }] },
          Review: { select: { name: 'Rejected' } },
          Notes: notesWith(p, 'Rejected by a person via the Review field.'),
        },
      });
      continue;
    }
    // Approve
    if (!proposed) {
      console.log(`APPROVE ${title} (existing row: marked reviewed)`);
      await patch(p.id, {
        properties: {
          'Classified by': { select: { name: 'Human' } },
          Review: { select: { name: 'Approved' } },
          Notes: notesWith(p, 'Reviewed and approved by a person via the Review field.'),
        },
      });
      continue;
    }
    const name = title.replace(/^\[PROPOSED\]\s*/, '');
    const notes = plain(p.properties['Notes']);
    const type = select(p.properties['Infrastructure Type']) ?? inferType(name, notes);
    const hasCoords = typeof (p.properties['Latitude']?.number) === 'number' && typeof (p.properties['Longitude']?.number) === 'number';
    const needsPin = type !== '🏛️ Policy / Regulation' && type !== '🌍 Geopolitical Signal';
    let pin: { lat: number; lng: number; label: string } | null = null;
    const addr = addressOf(name, notes);
    if (needsPin && !hasCoords && addr) pin = await geocode(addr);
    const missing = [!type && 'a type', needsPin && !hasCoords && !pin && `map coordinates (could not place "${addr ?? 'no address in the name'}")`].filter(Boolean);
    if (missing.length) {
      console.log(`NEEDS   ${name}: ${missing.join('; ')}`);
      await patch(p.id, {
        properties: {
          Review: { select: { name: 'Needs details' } },
          Notes: notesWith(p, `Approval held: please add ${missing.join(' and ')}, then set Review to Approve again.`),
        },
      });
      continue;
    }
    console.log(`APPROVE ${name} -> ${type}${pin ? ` @ ${pin.lat.toFixed(4)},${pin.lng.toFixed(4)} (${pin.label.slice(0, 60)})` : ''}`);
    const props: Record<string, object> = {
      'Company / Project': { title: [{ type: 'text', text: { content: name } }] },
      'Classified by': { select: { name: 'Human' } },
      Review: { select: { name: 'Approved' } },
      Notes: notesWith(
        p,
        `Approved by a person via the Review field.${select(p.properties['Infrastructure Type']) ? '' : ` Type set to ${type} from the row's wording.`}${pin ? ` Coordinates approximate, geocoded from "${addr}" via OpenStreetMap Nominatim.` : ''}`,
      ),
    };
    if (!select(p.properties['Infrastructure Type']) && type) props['Infrastructure Type'] = { select: { name: type } };
    if (pin) {
      props['Latitude'] = { number: Number(pin.lat.toFixed(5)) };
      props['Longitude'] = { number: Number(pin.lng.toFixed(5)) };
    }
    await patch(p.id, { properties: props });
  }
  return rows.length;
}

async function news() {
  const rows = await query(CONTESTATION_DATABASE_ID, { or: [{ property: 'Review', select: { equals: 'Approve' } }, { property: 'Review', select: { equals: 'Remove' } }] });
  for (const p of rows) {
    const title = plain(p.properties['Item']);
    if (select(p.properties['Review']) === 'Remove') {
      console.log(`REMOVE  ${title}`);
      if (write) {
        const res = await fetch(`https://api.notion.com/v1/pages/${p.id}`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ archived: true }) });
        if (!res.ok) throw new Error(`Notion archive failed (${res.status}): ${await res.text()}`);
      }
      continue;
    }
    console.log(`APPROVE ${title}`);
    await patch(p.id, {
      properties: {
        'Classified by': { select: { name: 'Human' } },
        Review: { select: { name: 'Approved' } },
        Notes: notesWith(p, 'Reviewed and approved by a person via the Review field.'),
      },
    });
  }
  return rows.length;
}

async function main() {
  const s = await sites();
  const n = await news();
  console.log(`\n${write ? 'Applied' : 'Would apply'}: ${s} site decision(s), ${n} news decision(s).${write ? '' : ' Add --write to apply.'}`);
}
if (process.argv[1]?.endsWith('apply-reviews.ts')) main().catch((e) => {
  console.error(e);
  process.exit(1);
});
