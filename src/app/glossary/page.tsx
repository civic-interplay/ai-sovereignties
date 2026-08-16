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
          the rows published statistics are computed on. A data-centre row qualifies via any of: (a) a planning
          application on the public record (PA / SSD number, EIS, recorded planning pathway or state approval
          body); (b) a named hyperscaler (Amazon/AWS, Microsoft, Google, Meta, Oracle, Apple) as owner, parent,
          tenant or operator; (c) a campus of a named wholesale developer (NEXTDC, CDC, AirTrunk, STACK, Digital
          Realty, Equinix, Global Switch, Macquarie Data Centres, Goodman, Vantage, Keppel, Supernode/Quinbrook).
          The legacy small-colocation / enterprise / telco inventory with no public planning trail is excluded.
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
          display value for the compound: locational register held domestically while capacity is leased to
          offshore hyperscalers — the productive and financial registers sit offshore. In cross-tabulations it is
          the Locational-only case.
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
          the statutory route the approval took, as recorded on the state planning register (e.g. Victorian
          ministerial fast-track, NSW State Significant Development, standard council DA).
        </Term>
        <Term name="Public notice">
          whether the application was publicly exhibited: Exhibited (open to submissions) or Exempted (approved
          without public exhibition). Blank = not yet checked against the register.
        </Term>
        <Term name="State fast-tracked" color={ACCENT.yellow}>
          map overlay: assessed as NSW State Significant Development, or approved via ministerial fast-track /
          call-in — i.e. outside normal public consultation.
        </Term>
        <Term name="Contested" color={ACCENT.red}>
          map overlay: active or emerging community opposition, evidenced through public-exhibition submissions
          and objections, council minutes and motions, merit appeals (Land &amp; Environment Court / VCAT),
          parliamentary petitions, or media / FOI.
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
          planning documents). The publication standard: every row feeding a published number must be
          Human-verified with a source URL.
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
          research, audit and build sessions run in Claude Code on Opus and Fable-class models — with every
          claim destined for publication verified by a human against primary planning documents. Releases are
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
          uncounted, so the log is a floor, not a ceiling. Dollar and energy conversions are deliberately not
          published —
          per-token energy figures for hosted inference are not credibly public, and a speculative multiplier
          would manufacture the false precision this tracker exists to resist.
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
    </SheetShell>
  );
}
