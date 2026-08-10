export const meta = {
  name: 'verify-claims',
  description: 'Adversarially verify factual claims with independent skeptic agents (batched), re-checking any refutations',
  whenToUse: 'Before publishing tracker findings: pass {claims: [{id, claim, source}], batchSize?} and get CONFIRMED/PLAUSIBLE/REFUTED/UNVERIFIABLE per claim',
  phases: [
    { title: 'Verify', detail: 'skeptic agents try to refute each claim batch' },
    { title: 'Re-verify', detail: 'second independent opinion on any refutation' },
  ],
}

const claims = (args && args.claims) || []
const batchSize = (args && args.batchSize) || 3
if (!claims.length) return { error: 'no claims provided — pass args.claims = [{id, claim, source}]' }

const batches = []
for (let i = 0; i < claims.length; i += batchSize) batches.push(claims.slice(i, i + batchSize))
log(`${claims.length} claims in ${batches.length} batches`)

const VERDICTS = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          verdict: { type: 'string', enum: ['CONFIRMED', 'PLAUSIBLE', 'REFUTED', 'UNVERIFIABLE'] },
          evidence: { type: 'string', description: 'what you found, <300 chars, cite what kind of source' },
          url: { type: 'string', description: 'best supporting/refuting URL' },
          correction: { type: 'string', description: 'ONLY if REFUTED: the corrected statement' },
        },
        required: ['id', 'verdict', 'evidence'],
      },
    },
  },
  required: ['results'],
}

const RULES = `You are a skeptical fact-checker. For EACH claim below, actively try to REFUTE it using independent web research — do not take the provided source's word for it; find the underlying record or a second independent source.

Verdict rules:
- CONFIRMED: you independently located primary or strong secondary evidence supporting the claim as stated.
- PLAUSIBLE: consistent with what you found, but you could not reach a primary source.
- REFUTED: you found concrete evidence the claim is wrong — provide the correction.
- UNVERIFIABLE: the determining source is inaccessible (paywalled, blocked, offline) and nothing independent exists either way.

Special handling for NEGATIVE claims ("the record contains no X"): these are verified by locating the record itself and checking; if you cannot locate the record at all, that supports the claim's transparency point but verdict is PLAUSIBLE, not CONFIRMED — unless the claim itself is "no record is locatable", which your failed search then CONFIRMS. Victorian planning register pages (planning.vic.gov.au) block automated fetching — try Google cache, PlanningAlerts.org.au, council minutes, gazettes, and news coverage as alternates, and say which route you used.

Precision matters: if a claim gets a number slightly wrong but is directionally correct, verdict REFUTED with the corrected number in 'correction' — councils will be quoting these.`

phase('Verify')
const out = await parallel(
  batches.map((b, i) => () =>
    agent(
      `${RULES}\n\nCLAIMS (return one result per claim, using each claim's exact id):\n${JSON.stringify(b, null, 1)}`,
      { label: `verify:batch${i + 1}`, phase: 'Verify', schema: VERDICTS },
    ),
  ),
)
const results = out.filter(Boolean).flatMap((r) => r.results)
const refuted = results.filter((r) => r.verdict === 'REFUTED')
log(`${results.length} verdicts: ${results.filter((r) => r.verdict === 'CONFIRMED').length} confirmed, ${refuted.length} refuted`)

phase('Re-verify')
const rechecks = refuted.length
  ? await parallel(
      refuted.map((r) => () => {
        const c = claims.find((c) => c.id === r.id)
        return agent(
          `A fact-checker REFUTED this claim:\nCLAIM: ${JSON.stringify(c)}\nREFUTATION: ${r.evidence} ${r.correction || ''}\n\nGive an independent second opinion from fresh sources: is the refutation itself correct? Do not reuse the refuter's reasoning — verify from scratch. Return one result with the same id: CONFIRMED means the ORIGINAL claim stands, REFUTED means the refutation stands (include the final corrected statement in 'correction').`,
          { label: `recheck:${r.id}`, phase: 'Re-verify', schema: VERDICTS },
        )
      }),
    )
  : []
const recheckResults = rechecks.filter(Boolean).flatMap((r) => r.results)

return {
  summary: {
    total: results.length,
    confirmed: results.filter((r) => r.verdict === 'CONFIRMED').length,
    plausible: results.filter((r) => r.verdict === 'PLAUSIBLE').length,
    refuted: refuted.length,
    unverifiable: results.filter((r) => r.verdict === 'UNVERIFIABLE').length,
  },
  results,
  rechecks: recheckResults,
}
