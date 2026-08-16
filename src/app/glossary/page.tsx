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

function Term({ name, color, children }: { name: string; color?: string; children: React.ReactNode }) {
  return (
    <div style={{ margin: '10px 0', fontSize: 12.5, lineHeight: 1.7 }}>
      <span style={{ color: color ?? '#fff', fontWeight: 600 }}>{name}</span>{' '}
      <span style={{ color: '#9aa39b' }}>— {children}</span>
    </div>
  );
}

export default function Glossary() {
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

      <Footnote>
        These rules are maintained alongside the tracker and revised in the open —{' '}
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
