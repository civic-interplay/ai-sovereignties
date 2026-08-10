# What the approval actually says: a disclosure audit

**Victorian data-centre approvals, audited August 2026** — prompted by City of
Melbourne's question: *what data on energy and water demand is actually used,
or even visible, when these projects are approved?*

## The finding, in plain words

**Fourteen approved or lodged Victorian data-centre applications were audited.
Not one discloses the project's expected electricity demand in the public
planning record. None publishes a water-demand figure. Only one describes its
cooling method.**

The megawatt numbers we all quote — NEXTDC M4's "162MW", CDC Laverton's
"150MW initial, 400+MW at full build", AirTrunk MEL2's "354+MW" — exist only
in **company press releases and government investment promotion**. The permits
themselves, where they can be found at all, are silent. We downloaded and
text-searched the actual permit and delegate-report PDFs for four of them
(AWS Cobblebank, Perri West Footscray, 171 Leakes Rd Truganina, 80 Kinloch Ct
Craigieburn): no megawatt figure appears in any of them. Water appears almost
exclusively as *stormwater* conditions; the one partial exception is 80 Kinloch
Court, whose delegate report describes the cooling design (free cooling with
supplementary evaporative) but still no annual volume.

In several cases the public record doesn't even identify **who** the data
centre is for: applications are fronted by engineering consultants (Beca at
130 Cherry Lane, Aurecon at 171 Leakes Rd) or shelf companies. The clearest
case is PA2403452 at 85 Sharps Rd, Tullamarine: lodged and approved under
**EMKC3 Pty Ltd**, with the operator's identity entering the register only
*after* approval — via an "Application to correct planning permit" naming
**AirTrunk MEL2 Pty Ltd** (sighted on the register, Aug 2026). The public was
told who the 354MW+ campus belonged to only once there was nothing left to
contest. Two sites with publicly-marketed capacities (Digital Realty MEL12,
STACK MEL02) have **no locatable planning record at all**.

## The skipped step, in the government's own UI

The Victorian planning portal renders each application as a three-step
timeline: *Application received* ✓ → *Public notice* → *Decision: Permit* ✓.
On the ministerial / Development Facilitation Program approvals, the middle
circle — **Public notice — is simply empty**. The step wasn't failed; it was
exempted. Screenshots in `content updates/` (`lol 1-3.png`) capture this for
recent approvals. This is now recorded on the tracker as
`Public notice: Exempted` per site, which the map can render directly.

## The NSW contrast

This is not what data-centre approval records have to look like. Under NSW
State Significant Development, the Environmental Impact Statement is publicly
exhibited **before** approval, and it carries the numbers:

| NSW application (exhibited EIS) | Energy disclosed | Water disclosed |
|---|---|---|
| AirTrunk Mamre Rd, Kemps Creek (SSD-92743706) | 1GW+, 936 cooling units, 852 diesel gensets | ~22.4 ML/year |
| Goodman "Project Mars", Lane Cove (SSD-82052708) | ~90MW, PUE 1.35, 49 gensets itemised | 510,009 m³/year of *drinking water* |
| CDC Marsden Park (SSD) | 504MW ICT, 720MVA substation | Closed-loop, ~WUE 0.01 |

Exhibition is what made Project Mars's half-a-gigalitre-of-potable-water
figure contestable by residents and council — and what made Mamre Road's
remarkably low 22.4 ML/year (a dry-biased design) verifiable. In Victoria
there is no equivalent moment: the numbers never enter the record, so there
is nothing to contest and nothing to hold the operator to.

## The lifecycle gap: what is said vs what is on the record

The pattern across the Victorian cohort is a two-track lifecycle:

1. **The announcement track** (public, loud): Premier/minister announcement,
   investment-promotion pages, operator press — carries MW, jobs, dollars.
   Often *precedes* lodgement (M4 was announced by the Premier in June 2025,
   lodged October 2025).
2. **The approval track** (quiet, thin): consultant-fronted application, no
   public notice, permit with stormwater/noise/landscaping conditions, energy
   and water absent, sometimes conditions themselves unpublished (M4's were).

The tracker now captures both tracks per site: `Announcement date` vs
`Approval date`, marketing figures (with sources) in Notes vs
`Public notice: Exempted` and the `Transparency deficit` governance flag on
the audited rows.

## Where the underlying documents are

`docs/disclosure-audit/` holds the audit dataset (`results_audit.json`) and
the four permit/delegate-report PDFs that were text-searched. Full per-site
evidence (with URLs) is appended to each site's Notes in the Notion tracker,
flagged `DA disclosure audit 2026-08-10`.
