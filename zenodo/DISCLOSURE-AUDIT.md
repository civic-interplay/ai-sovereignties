# What the approval actually says: a disclosure audit

**Victorian data-centre approvals, audited August 2026** 

## The finding, in plain words

**Thirteen approved or lodged Victorian data-centre applications were audited.
Not one discloses the project's expected electricity demand in the public
planning record. None publishes a water-demand figure. Only one describes its
cooling method.**

*Caveat (2026-08-17, adversarial verification):* the Westmeadows row
(PA2302140) is downgraded to **unknown** rather than counted as
non-disclosing. Its consultation page turns out to have exhibited ~26
documents — including a Sustainability Management Plan and a Stormwater
Management Strategy — **all since removed from the live planning.vic.gov.au
site** and surviving only in the Wayback Machine, which was unreachable at
the time of checking. Until those archived documents are retrieved and
searched, the safe statement is "12 of 12 checkable records disclose
nothing; one exhibition set was removed from the public record before it
could be checked." The removal itself is a finding — see
[The disappearing record](#the-disappearing-record) below.

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
centre is for: applications are fronted by engineering consultants (e.g. Aurecon at 171 Leakes Rd) or shelf companies. The clearest
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
exempted. Register screenshots held with the working files capture this for
recent approvals. This is now recorded on the tracker as
`Public notice: Exempted` per site, which the map can render directly.

*Correction (2026-08-17, adversarial verification):* the exemption should not
be attributed to the DFP pathway itself. The DFP (clause 53.22) removes
third-party VCAT review rights but does **not** of itself exempt an
application from public notice; where the audited approvals proceeded without
notice, the exemption arose from other planning scheme provisions (e.g. the
Urban Growth Zone) or a case-by-case decision that notice was not required.
The observation stands — no public notice occurred on these approvals, and
the portal timeline records the empty step — but the mechanism is
provision-specific, not pathway-wide.

## The disappearing record

The Westmeadows application (140–204 Western Avenue, PA2302140) looked at
first like the thinnest record in the cohort: a Gazette notice and a
consultation page that appeared to have exhibited only a traffic report. The
adversarial verification pass found something stranger. The Wayback Machine's
index shows the consultation page exhibited **about 26 documents** in 2024 —
architectural plans for the data centre, a Sustainability Management Plan, a
Waste Management Plan, an Environmental Summary Report, a Stormwater
Management Strategy, landscape plans and renders. Every one of those URLs on
planning.vic.gov.au now returns nothing. The exhibition set survives only as
web-archive captures.

So the public record of this approval didn't just start thin — it got
thinner *after* the decision. Documents that were exhibited for community
consultation, the one moment residents could have read and responded to
them, were later removed from the live site. Anyone checking the record
today would conclude the assessments never existed.

Two things follow. First, a correction to our own tally: we can no longer
say what the Westmeadows exhibition disclosed, only that we can't check —
the row is counted as *unknown*, and the headline finding is stated as
"12 of 12 checkable records disclose nothing" (see the caveat above). We
know the documents existed — the archive's index proves they were live at
those addresses in July 2024 — but until the archived copies can be
retrieved and searched, their content is an open question, not a finding.

Second, a finding in its own right: **exhibited planning documents are not
permanent public records in Victoria.** A permit binds a site for decades;
the evidence base it was approved on can vanish from the public site in
months. This is the same pattern the MEL2 shelf-company case shows from
another angle — the record is most complete at exactly the moment the public
has least reason to look, and thinnest once there is something to hold the
operator to. Whatever the removal's administrative rationale, its effect is
that the consultation record cannot be audited later — by a council, a water
authority, or a resident asking what was promised.

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


## Verification

An adversarial verification pass (2026-08-10, partial: 16/22 claims) confirmed 14 claims against primary documents and refuted two, both corrected above — including removing 130 Cherry Lane from the audit set (PA2402783 is AusNet's Altona BESS, whose MW *was* disclosed — energy infrastructure discloses; data centres don't). See `disclosure-audit/verification-2026-08-10-partial.md`.

A second pass (2026-08-17, two runs, 12 claims) completed the programme:
every remaining claim was independently re-checked, with independent
rechecks on all refutations. Six confirmed (including both NSW EIS water
figures, re-reached via the exhibited documents), two plausible-pending-a-
human-step (the "0 of 13" negative — seven register records are
script-blocked; and the EMKC3→AirTrunk MEL2 register correction, which needs
a browser re-sight), and four refuted and corrected in place: the DFP
public-notice mechanism, the Kinloch permit date (issued 17/9/2024), the
PA2504040–CDC association (wrong site), and the Westmeadows "traffic report
only" claim — the refutation that surfaced the disappearing-record finding
above. Full record: `disclosure-audit/verification-2026-08-17.md`.
