// Shared configuration for the contestation pipeline.
//
// The controlled vocabularies below MUST match the Notion select/multi-select
// options exactly, character for character. Notion rejects commas in option
// names, so a few labels use " / " where the brief used commas.

// Notion IDs (see memory + brief).
export const INFRA_DATABASE_ID = '8b537010f4cb4aa6b6df470f9d0d40c9';
export const CONTESTATION_DATABASE_ID = '52ffd0917ab14bc29cc54344c524af3a';

export const NOTION_VERSION = '2022-06-28';

// Confidence below this flags an item for human review rather than trusting it.
// The site match is the riskiest part: a low match must lower confidence.
export const REVIEW_THRESHOLD = 0.6;

export const SOURCE_TYPES = [
  'Local or regional press',
  'National press',
  'Editorial or opinion',
  'Planning submission or objection',
  'Parliamentary inquiry submission',
  'Council minutes or motion',
  'Town hall or forum',
  'Social media',
  'NGO or advocacy',
  'Industry or government statement',
] as const;

export const ACTOR_TYPES = [
  'Resident or individual',
  'Community group',
  'Local council',
  'State or federal MP',
  'Environmental body',
  'Industry',
  'Union',
  'Editorial or media',
  'Academic or expert',
  'Traditional Owner or Indigenous body',
  'Other',
] as const;

export const STANCES = [
  'Opposing',
  'Conditional',
  'Supporting',
  'Neutral or informational',
] as const;

export const GROUNDS = [
  'Water use',
  'Energy load or grid',
  'Land use / amenity / visual',
  'Noise',
  'Foreign ownership or sovereignty',
  'Jobs / investment / economic',
  'Process / consultation / transparency',
  'Environmental or ecological',
  'Climate or emissions',
  'Data or digital sovereignty',
  'Health',
  'Other',
] as const;

export const INTENSITIES = [
  'Low (passing mention)',
  'Moderate (sustained)',
  'High (organised petition / protest / objection campaign)',
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];
export type ActorType = (typeof ACTOR_TYPES)[number];
export type Stance = (typeof STANCES)[number];
export type Ground = (typeof GROUNDS)[number];
export type Intensity = (typeof INTENSITIES)[number];

// The classifier output contract, mirrored from the brief.
export interface Classification {
  site_id: string | null;
  source_url: string;
  source_type: SourceType;
  date: string; // ISO YYYY-MM-DD
  actor: string;
  actor_type: ActorType;
  stance: Stance;
  grounds: Ground[];
  frame_summary: string;
  intensity: Intensity;
  quote: string;
  confidence: number; // 0..1
}
