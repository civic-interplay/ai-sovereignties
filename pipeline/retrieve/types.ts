// A retrieval candidate: one potential contestation source-event, before
// classification. `text` is what the classifier reads; for thin sources
// (e.g. a GDELT hit) it may just be the headline.
export interface Candidate {
  sourceUrl: string;
  title: string;
  date: string | null; // ISO YYYY-MM-DD if known
  domain: string | null;
  text: string;
}
