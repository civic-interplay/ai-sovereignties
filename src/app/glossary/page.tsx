// Glossary & methods sheet: operational definitions for every category used
// on the map and the data sheets — how each number and colour is actually
// coded, not what the concept means in the abstract.
import {
  SheetShell,
  SheetNav,
  SheetTitle,
  Panel,
  SectionHead,
  Footnote,
  ScopeNote,
  ACCENT,
  CI_PERIWINKLE,
} from '../sheets/sheet-ui';

export const metadata = {
  title: 'Glossary & methods — Australian Data Centres',
  description: 'Operational definitions: how every category, colour and number on the map and data sheets is coded.',
};

// Rendered per-request so the compute log below stays current.
export const dynamic = 'force-dynamic';

// The public compute log, committed to the repo by the pipeline workflow.
// See docs/COMPUTE.md for the schema and the disclosure rationale.
const COMPUTE_LOG_URL =
  'https://raw.githubusercontent.com/civic-interplay/ai-sovereignties/main/docs/compute-log.jsonl';

interface ComputeEntry {
  date: string;
  kind: string;
  model: string;
  calls: number;
  input_tokens: number;
  cache_read_tokens?: number;
  output_tokens: number;
}

// Anthropic list prices, USD per million tokens (input / output / cache-read),
// as published June 2026. Used only for the indicative conversion below —
// stated assumption, not a billing record.
const RATES: Record<string, { in: number; out: number; cacheRead: number }> = {
  'claude-opus-4-8': { in: 5, out: 25, cacheRead: 0.5 },
  'claude-fable-5': { in: 10, out: 50, cacheRead: 1 },
  'claude-sonnet-5': { in: 3, out: 15, cacheRead: 0.3 },
};

async function fetchComputeLog(): Promise<ComputeEntry[]> {
  try {
    const res = await fetch(COMPUTE_LOG_URL, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const text = await res.text();
    return text
      .split('\n')
      .filter(Boolean)
      .map((l) => JSON.parse(l) as ComputeEntry);
  } catch {
    return [];
  }
}

function Term({ name, color, children }: { name: string; color?: string; children: React.ReactNode }) {
  return (
    <div style={{ margin: '10px 0', fontSize: 12.5, lineHeight: 1.7 }}>
      <span style={{ color: color ?? '#fff', fontWeight: 600 }}>{name}</span>{' '}
      <span style={{ color: '#9aa39b' }}>— {children}</span>
    </div>
  );
}

export default async function Glossary() {
  const computeLog = await fetchComputeLog();
  const byModel = new Map<string, { calls: number; input: number; cacheRead: number; output: number }>();
  for (const e of computeLog) {
    const m = byModel.get(e.model) ?? { calls: 0, input: 0, cacheRead: 0, output: 0 };
    m.calls += e.calls;
    m.input += e.input_tokens;
    m.cacheRead += e.cache_read_tokens ?? 0;
    m.output += e.output_tokens;
    byModel.set(e.model, m);
  }
  // Indicative conversions from the stated assumptions above.
  let listCostUSD = 0;
  let unpriced = 0;
  let totalCalls = 0;
  for (const [model, m] of byModel) {
    totalCalls += m.calls;
    const r = RATES[model];
    if (!r) {
      unpriced += 1;
      continue;
    }
    listCostUSD += (m.input / 1e6) * r.in + (m.output / 1e6) * r.out + (m.cacheRead / 1e6) * r.cacheRead;
  }
  return (
    <SheetShell>
      <SheetNav current="glossary" />
      <SheetTitle kicker="Australian Data Centres · methods" title="Glossary & coding rules" />

      <SectionHead>Scope & inclusion</SectionHead>
      <Panel>
        <Term name="Tracker">
          the Critical Infrastructure Tracker (Notion database), recording Australian data-centre projects and the
          adjacent infrastructure they depend on — mines, refineries, energy, water — plus policy and geopolitical
          signals. A row is included when a site or signal is identifiable from a public source (planning record,
          company announcement, press with corroboration).
        </Term>
        <Term name="Analysis subset">
          the current build-out wave — the data-centre projects the summary figures describe. A site is included
          when any of the following holds: (a) it has a planning application on the public record (PA / SSD
          number, EIS, recorded planning pathway or state approval body); (b) a named hyperscaler (Amazon/AWS,
          Microsoft, Google, Meta, Oracle, Apple) is its owner, parent, tenant or operator; (c) it is a campus of
          a named wholesale developer (NEXTDC, CDC, AirTrunk, STACK, Digital Realty, Equinix, Global Switch,
          Macquarie Data Centres, Goodman, Vantage, Keppel, Supernode/Quinbrook). Older small colocation and
          enterprise server rooms with no public planning trail are listed but kept out of the summary figures,
          so they don&rsquo;t dilute statistics about the new wave.
        </Term>
        <Term name="Update cadence">
          the map and data sheets read the tracker live — every edit appears on the next page load, and each
          sheet shows the date of the latest edit in its data. An automated pipeline also runs fortnightly (the
          1st and 15th): it sweeps national and local press for contestation events around tracked sites and
          codes their structure with a language model, reads the NSW ePlanning API for new data-centre
          development applications, and proposes newly announced projects as review-flagged rows. Agent-created
          rows carry Agent provenance and enter the published figures only after human review; everything else
          — new sites, register coding, verification — is human work.
        </Term>
        <Term name="Null vs zero">
          a blank value always means &ldquo;not publicly recorded&rdquo;, never zero. Capacity is stored as null
          when unknown; sites without a public MW figure are excluded from capacity-weighted statistics, not
          counted as zero.
        </Term>
      </Panel>

      <SectionHead>Sovereignty registers</SectionHead>
      <Panel>
        <Footnote>
          Four registers of sovereign capability, coded per site (a site can hold several). Map colour uses
          precedence: the most sovereign register present wins.
        </Footnote>
        <Term name="Productive" color={ACCENT.green}>
          the facility is owned and built by Australian interests — the capability itself accrues onshore.
        </Term>
        <Term name="Operational" color={ACCENT.blue}>
          run by an Australian public body.
        </Term>
        <Term name="Financial" color={ACCENT.yellow}>
          ≥30% of ultimate ownership held by Australian public capital — sovereign wealth, government, or
          superannuation (pooled Australian retirement savings, counted as public capital here).
        </Term>
        <Term name="Locational">
          the site sits on Australian land under Australian planning law, with no other register held onshore.
        </Term>
        <Term name="Rented" color={ACCENT.red}>
          compute capacity rented to companies with headquarters located offshore (unknown local usage
          benefits).
        </Term>
        <Term name="Not coded">
          the register coding pass has not reached this row. Excluded from published register statistics. The
          map&rsquo;s register lens is currently withheld for this reason: register coding is not yet consistent
          against the tenant field, so the map shows the evidenced version of the claim — the Named hyperscaler
          overlay — until the coding pass lands.
        </Term>
      </Panel>

      <SectionHead>Ownership & capital</SectionHead>
      <Panel>
        <Term name="Operator / Parent / Ultimate Owner">
          the ownership chain as publicly documented: the entity running the site → its corporate parent → the
          entity at the top of the chain (fund, listed company, state). Country and capital-type coding follow the
          ultimate owner, not the operator.
        </Term>
        <Term name="Ownership country">
          the jurisdiction of the ultimate owner — where the capital behind the site actually sits, not where the
          operating company is registered.
        </Term>
        <Term name="Hyperscaler">
          owner type: one of the global cloud majors (Amazon/AWS, Microsoft, Google, Meta, Oracle, Apple) owning
          or anchoring the facility.
        </Term>
        <Term name="Named hyperscaler" color="#ff47e5">
          map overlay (magenta pip): an AI platform or model company is publicly named as a user of the site —
          derived directly from the tenant field, so it marks only what the tracker can evidence, independent of
          register coding.
        </Term>
        <Term name="Private equity / infra fund">
          owner type: the ultimate owner is a private investment vehicle (private equity, infrastructure or real
          asset fund) holding a controlling or largest single stake in the facility. Coded from the ultimate
          owner, whatever the size of minority co-investors.
        </Term>
        <Term name="Pension / super">
          owner type: an Australian superannuation fund or overseas pension fund is the ultimate owner or largest
          stakeholder.
        </Term>
        <Term name="Super / sovereign exposure">
          the share of a site funded by Australian sovereign-wealth or super capital, stored as a fraction.
          Channels: direct stake (&gt;30% of the operator), land ownership, or funding via a third-party manager.
          Buckets: low &lt;15%, mid 15–40%, high &gt;40%. An explicit 0% means assessed-and-none; blank means not
          yet assessed.
        </Term>
      </Panel>

      <SectionHead>Planning & disclosure</SectionHead>
      <Panel>
        <Term name="Planning pathway">
          the statutory route the approval took, as recorded on the state planning register: Local council ·
          State assessed · Ministerial fast-track · Federal assessment · Not applicable. The vocabulary is
          deliberately state-neutral, because each state names its own routes differently — "State assessed"
          covers NSW State Significant Development, Western Australia&rsquo;s Part 17 Significant Development
          Pathway and their equivalents, with the precise local instrument named in the row&rsquo;s notes.
        </Term>
        <Term name="Public notice">
          whether the application was publicly exhibited: Exhibited (open to submissions) or Exempted (approved
          without public exhibition). Blank = not yet checked against the register.
        </Term>
        <Term name="State fast-tracked" color={ACCENT.yellow}>
          map overlay: the State, not the local council, is the consent authority — the pathway is State
          assessed or ministerial fast-track / call-in. It does <em>not</em> mean the
          application escaped public exhibition: NSW State Significant Development is exhibited, and its
          documents are usually the fullest public record a project leaves. Whether an application was
          exhibited is a separate field — see Public notice.
        </Term>
        <Term name="Contested" color={ACCENT.red}>
          map overlay: active or emerging community opposition, evidenced through public-exhibition submissions
          and objections, council minutes and motions, merit appeals (Land &amp; Environment Court / VCAT),
          parliamentary petitions, or media / FOI.
        </Term>
        <Term name="Governance flags" color={ACCENT.yellow}>
          analyst findings about <em>how</em> an approval was handled, recorded per site and shown in the map
          popup beneath the pathway, as tags on the state data sheets, and as a filter under Planning pathway
          on the map. The vocabulary is: Transparency deficit · Community consultation lacking · FIRB
          scrutiny. Each records a gap in how a decision was made, not a legal finding, and an absent flag
          means the row has not been assessed on that dimension rather than that it passed. Flags that merely
          restated the statutory route — ministerial fast-track, State significant development, bypassed local
          council — were retired once Planning pathway carried that information on its own.
        </Term>
        <Term name="Why there is no First Nations flag">
          there was one, and it was removed on 18 August 2026. It had been applied almost only to mines and
          remote projects — four of its six uses were in Western Australia, one in the Northern Territory,
          against one of 62 Victorian rows and none of 46 in New South Wales. That is a record of where
          anyone thought to look, not of where engagement is unclear. Because a flag is silent both when a
          row passes and when nobody checked it, an empty filter result could be read as &ldquo;no Traditional
          Owner concerns here&rdquo; — a claim about other people&rsquo;s Country that this tracker should
          never make by accident. Every site on it sits on Country. The defensible replacement is the
          statutory record rather than our judgement: whether a Cultural Heritage Management Plan was
          required and approved under the Aboriginal Heritage Act 2006, assessed with the Registered
          Aboriginal Party for that Country. Whether engagement was adequate is for Traditional Owner
          organisations to say, and would be recorded here only by citing them.
        </Term>
        <Term name="Announcement vs approval date">
          the two clocks of a project: when the company announced it, and when the planning system approved it.
          Where announcement precedes approval by years, the project was marketed before it was assessed.
        </Term>
        <Term name="Capacity (MW)">
          planned or approved electrical load in megawatts, as stated in planning documents (EIS), company
          releases, or credible reporting — recorded at the campus level unless stages are separately approved.
          Null when no public figure exists.
        </Term>
        <Term name="Circle size on the map">
          radius carries disclosed capacity, scaling from 30MW up to 1200MW, so the gigawatt campuses read as
          larger than the rest rather than clamping to one maximum dot. Sites with <em>no</em> disclosed
          capacity are drawn at a separate, deliberately smaller fixed size and are named in the map key —
          they are not sized as though they were small. Most tracked sites fall into that group, which is the
          disclosure finding rather than a gap in the research: for the audited Victorian approvals, no
          megawatt figure exists in the public planning record at all.
        </Term>
      </Panel>

      <SectionHead>Water & energy</SectionHead>
      <Panel>
        <Term name="Closed-loop" color="#3fd17a">
          cooling water recirculates; mains/potable water is drawn only for periodic top-up, not continuous
          evaporative use. Coded as Low water risk.
        </Term>
        <Term name="Water risk">
          High = continuous draw on potable supply in a stressed catchment; Medium = some pressure on local
          supply; Low = closed-loop or air-cooled. Blank / n-a = <em>not yet assessed</em> — data centres always
          draw water, so an unassessed site is never evidence of low risk.
        </Term>
        <Term name="Renewable — contracted">
          energy coding: supply contracted through a PPA or retail renewable product. Note: this includes
          REC-matched (certificate) arrangements, which offset rather than physically supply — the evidence note
          on each row states which.
        </Term>
        <Term name="Grid — mixed / coal-gas heavy">
          drawing from the general grid; &ldquo;coal/gas heavy&rdquo; where the regional grid mix or the
          project&rsquo;s own filings indicate predominantly fossil supply.
        </Term>
      </Panel>

      <SectionHead>Confidence & verification</SectionHead>
      <Panel>
        <Term name="Confidence">
          numeric confidence in the row&rsquo;s core facts: 0.5 = bulk-added, unverified; 0.85 = bulk-added with
          corroborating source; 1.0 = individually researched. Blank on legacy rows predating the scale.
        </Term>
        <Term name="Classified by">
          who coded the row: Agent (automated pipeline), Human, or Human-verified (checked against primary
          planning documents). The standard for citation in print is that every row feeding the cited figure is
          Human-verified with a source URL. The live figures on these sheets do not yet meet that bar — they are
          working numbers from a database under active verification, and each row&rsquo;s status is visible in
          the tracker.
        </Term>
        <Term name="Pending review">
          shown on a news-feed item whose confidence is below 0.6: a language model classified it and no human
          has checked it yet. Most often this is not doubt about the content but about attribution — an item
          the pipeline could not tie to a specific tracked site has its confidence capped automatically, so
          state-wide policy stories are flagged by default. Hover the badge on the news feed for the item&rsquo;s
          own score.
        </Term>
        <Term name="Source">
          the primary public document for the row&rsquo;s core claim — planning register entry, EIS, company
          announcement — preferred in that order.
        </Term>
      </Panel>

      <SectionHead>How this is built — platforms & models</SectionHead>
      <Panel>
        <div style={{ fontSize: 12.5, lineHeight: 1.8, color: '#9aa39b', maxWidth: 760 }}>
          The tracker itself is a <span style={{ color: '#fff' }}>Notion</span> database — the single source of
          truth that every view queries live. The map and these sheets are a{' '}
          <span style={{ color: '#fff' }}>Next.js</span> (React) application rendering the map through{' '}
          <span style={{ color: '#fff' }}>Mapbox GL</span>, deployed via OpenNext to{' '}
          <span style={{ color: '#fff' }}>Cloudflare Workers</span> at the edge. Code, methods and the compute
          log are versioned in the open on <span style={{ color: '#fff' }}>GitHub</span>, where a fortnightly{' '}
          <span style={{ color: '#fff' }}>GitHub Actions</span> pipeline sweeps press coverage (GDELT) and
          planning-portal feeds for new contestation events. Model work is done with{' '}
          <span style={{ color: '#fff' }}>Anthropic Claude</span>: <code>claude-sonnet-5</code> codes the
          structure of each contestation source (who objects, on what grounds, how framed), and interactive
          research, audit and build sessions run in Claude Code on Opus and Fable-class models. This is a{' '}
          <span style={{ color: '#fff' }}>civic AI collaboration</span> with a deliberate division of labour:
          the{' '}
          <span style={{ color: '#fff' }}>human in the loop</span> designs the lenses and the four-register
          scheme, interprets what the data means, fact-checks claims against primary planning documents,
          decides what is published, and organises the interface and its legends; the models retrieve, code
          structure at scale, and draft. Every claim destined for publication is human-verified. Releases are
          archived with a DOI on <span style={{ color: '#fff' }}>Zenodo</span>.
        </div>
        <div style={{ marginTop: 10 }}>
          <a
            href="https://civicinterplay.io/images/architecture.svg"
            style={{ color: CI_PERIWINKLE, fontSize: 11.5, letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none' }}
          >
            Information architecture diagram ↗
          </a>
        </div>
      </Panel>

      <SectionHead>The project&rsquo;s own compute</SectionHead>
      <Panel>
        <Footnote>
          A tracker that asks data centres to disclose their resource draw should disclose its own. Model usage
          behind this project is logged publicly in the repository (
          <a
            href="https://github.com/civic-interplay/ai-sovereignties/blob/main/docs/COMPUTE.md"
            style={{ color: CI_PERIWINKLE }}
          >
            docs/COMPUTE.md
          </a>
          ): the fortnightly classifier pipeline logs its token counts automatically from the API&rsquo;s own
          usage figures, and interactive research and build sessions are logged from their session transcripts
          — also the API&rsquo;s own usage records. Sessions run on machines not represented here remain
          uncounted, so the log is a floor, not a ceiling. The conversions below are indicative, with the
          assumptions stated: cost is priced at Anthropic&rsquo;s published list rates (June 2026) as if every
          token were billed at API prices — actual spend ran partly on subscription plans; energy has no
          credible per-token public figure, so the range applies commonly cited per-query estimates
          (~0.3&ndash;3&nbsp;Wh) while noting these agentic calls are far larger than typical queries.
        </Footnote>
        {byModel.size === 0 ? (
          <div style={{ fontSize: 12, color: '#9aa39b' }}>Compute log unavailable right now — see the repository.</div>
        ) : (
          [...byModel.entries()].map(([model, m]) => (
            <div key={model} style={{ fontSize: 12.5, lineHeight: 1.8 }}>
              <span style={{ color: '#fff', fontWeight: 600 }}>{model}</span>{' '}
              <span style={{ color: '#9aa39b' }}>
                — {m.calls.toLocaleString()} calls · {m.input.toLocaleString()} input /{' '}
                {m.output.toLocaleString()} output tokens
                {m.cacheRead > 0 && ` (+ ${m.cacheRead.toLocaleString()} cached-context reads)`}
              </span>
            </div>
          ))
        )}
        {listCostUSD > 0 && (
          <div style={{ fontSize: 12.5, lineHeight: 1.8, marginTop: 8, borderTop: '1px solid #2a302e', paddingTop: 8 }}>
            <span style={{ color: '#fff', fontWeight: 600 }}>What that converts to</span>{' '}
            <span style={{ color: '#9aa39b' }}>
              — ≈ US${Math.round(listCostUSD).toLocaleString()} at API list rates
              {unpriced > 0 && ` (${unpriced} model${unpriced > 1 ? 's' : ''} unpriced, excluded)`}; energy
              indicatively {Math.round(totalCalls * 0.3 / 1000 * 10) / 10}&ndash;
              {Math.round(totalCalls * 3 / 1000)}&nbsp;kWh across {totalCalls.toLocaleString()} calls at
              0.3&ndash;3&nbsp;Wh per call — plausibly higher given call size; of the order of days of one
              household&rsquo;s electricity, stated to be checked, not cited.
            </span>
          </div>
        )}
      </Panel>

      <Footnote>
        Cite this project:{' '}
        <a href="https://doi.org/10.5281/zenodo.21026430" style={{ color: CI_PERIWINKLE }}>
          doi.org/10.5281/zenodo.21026430
        </a>
        . These rules are maintained alongside the tracker and revised in the open —{' '}
        <a href="https://github.com/studioesem" style={{ color: CI_PERIWINKLE }}>
          changes are versioned
        </a>
        . For the project framing, see the{' '}
        <a href="https://civicinterplay.io/data-centres-map/" style={{ color: CI_PERIWINKLE }}>
          About page ↗
        </a>
        .
      </Footnote>
      <ScopeNote />
    </SheetShell>
  );
}
