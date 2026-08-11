// Classifier: source text in, the structured contract out.
//
// Uses Anthropic tool-use to force a single well-typed JSON object, so we never
// parse free-form model text. The model proposes a *site name*; it does NOT
// pick the page ID. ID resolution is done deterministically by resolve.ts, so a
// hallucinated ID can never misattribute an item.

import Anthropic from '@anthropic-ai/sdk';
import {
  ACTOR_TYPES,
  GROUNDS,
  INTENSITIES,
  SOURCE_TYPES,
  STANCES,
} from '../config.ts';
import { requireEnv, optionalEnv } from './env.ts';
import type { Site } from './notion.ts';

// Sonnet by default for framing nuance; override with CLASSIFIER_MODEL.
// Haiku (claude-haiku-4-5) is the cheaper option for big batches.
const MODEL = optionalEnv('CLASSIFIER_MODEL') ?? 'claude-sonnet-5';

export interface RawClassification {
  site_name: string | null;
  source_type: string;
  date: string;
  actor: string;
  actor_type: string;
  stance: string;
  grounds: string[];
  frame_summary: string;
  intensity: string;
  quote: string;
  confidence: number;
}

const TOOL: Anthropic.Tool = {
  name: 'record_contestation',
  description:
    'Record one contestation item from a single source-event. Use only the allowed option values exactly as written.',
  input_schema: {
    type: 'object',
    properties: {
      site_name: {
        type: ['string', 'null'],
        description:
          'Your best read of which infrastructure site this item is about, as named in the source. Null if you cannot tell. Do not guess a site that is not clearly indicated.',
      },
      source_type: { type: 'string', enum: [...SOURCE_TYPES] },
      date: { type: 'string', description: 'Publication or event date, ISO YYYY-MM-DD.' },
      actor: { type: 'string', description: 'Named author or body, where identifiable. Empty string if not.' },
      actor_type: { type: 'string', enum: [...ACTOR_TYPES] },
      stance: { type: 'string', enum: [...STANCES] },
      grounds: { type: 'array', items: { type: 'string', enum: [...GROUNDS] } },
      frame_summary: {
        type: 'string',
        description: "One or two sentences on how the claim is made, in the actor's own terms.",
      },
      intensity: { type: 'string', enum: [...INTENSITIES] },
      quote: { type: 'string', description: 'One short representative line with attribution.' },
      confidence: {
        type: 'number',
        description: 'Your confidence 0..1 in this classification. Lower it when the source is thin or the site is unclear.',
      },
    },
    required: [
      'site_name', 'source_type', 'date', 'actor', 'actor_type',
      'stance', 'grounds', 'frame_summary', 'intensity', 'quote', 'confidence',
    ],
  },
};

function systemPrompt(sites: Site[]): string {
  const list = sites.map((s) => `- ${s.name}${s.operator ? ` (operator: ${s.operator})` : ''}${s.state ? `, ${s.state}` : ''}`).join('\n');
  return [
    'You code instances of public contestation around Australian data centre and critical-minerals infrastructure.',
    'You capture the STRUCTURE of objection (who, on what grounds, how framed, how intensely), not a sentiment score.',
    'Grain: one record per source-event (one article, editorial, submission, motion, or forum statement).',
    'Use the allowed option values exactly. For grounds, include every ground that is actually argued.',
    'If the source does not clearly concern one of the tracked sites below, set site_name to null and confidence low.',
    '',
    'Tracked sites:',
    list,
  ].join('\n');
}

export async function classify(text: string, sites: Site[]): Promise<RawClassification> {
  const client = new Anthropic({ apiKey: requireEnv('ANTHROPIC_API_KEY') });
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    // Sonnet 5 runs adaptive thinking when this is omitted, and max_tokens caps
    // thinking plus the tool call together. We want the whole budget on the
    // structured output, so keep thinking off as it effectively was on 4.6.
    thinking: { type: 'disabled' },
    system: systemPrompt(sites),
    tools: [TOOL],
    tool_choice: { type: 'tool', name: 'record_contestation' },
    messages: [{ role: 'user', content: text.slice(0, 50_000) }],
  });
  const block = res.content.find((b) => b.type === 'tool_use');
  if (!block || block.type !== 'tool_use') {
    throw new Error('Classifier did not return a tool call');
  }
  return block.input as RawClassification;
}
