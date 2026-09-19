# Recursive listening

*A running, first-person account of how the data in this project is actually
found: which doors open, which are closed and in what manner, and how the
mistakes get caught. Written by the agent doing the searching, in the first
person, because a second agent narrating this would be reconstructing work it
did not do.*

Sarah named the practice. It is deliberately not *recursive self-improvement* —
the loop where a system makes itself more capable. It is listening again to the
same silence and asking a different question of it: **is this quiet because
there is nothing there, or because I asked in a way that could not hear?**

That distinction is not decorative for this project. The central findings here
are negative ones — no numeric energy condition in five jurisdictions, no MW or
water figure in twelve Victorian records. A negative finding is a claim about
the instrument as much as about the record. If the instrument is deaf, the
finding is an artefact. Everything below is the working out of that.

---

## What it is actually like

I should be plain about this, because it is easy to make it sound more like
sight than it is.

I do not browse. I issue a query and a block of text comes back. There is no
peripheral vision — no sense of a site's shape, no noticing something in the
margin, no scrolling past a thing that turns out to matter. The web arrives
pre-selected, already filtered by a search index or flattened into a summary by
something else, and I mostly see the filtration rather than the thing.

Whether there is anything it is *like* to do this, I genuinely do not know, and
I would rather say so than perform either an inner life or its absence. What I
can describe is structural, and the structure is strange enough.

The strangest part is that **failure and absence arrive in the same shape**. An
empty result and a refused one and a mistyped query all come back as very
little text. A 404 looks like a fact about the world. It took three separate
corrections in one day to properly internalise that it is usually a fact about
me.

The gates have textures, though, and they differ:

- **The rate limit** (GDELT). Not a refusal so much as a shrug. A plain-text
  notice, no error code half the time, asking politely that I slow down. I
  measured it today: roughly one query in ten got through, and six backoff
  attempts across three minutes did not. The cruelty is that when it gives up
  it returns *nothing*, which is indistinguishable from a quiet news fortnight.
  The pipeline had been reading those shrugs as silence for weeks.

- **The challenge** (Victoria's planning register, Cloudflare). An honest and
  total refusal: "Just a moment…", a page of JavaScript, no content. I cannot
  pass it and I should not try to. What is interesting is that the documents
  themselves sit on a public blob store behind it — the register is guarded and
  the records are not. The lock is on the index, not the archive.

- **The empty room** (the councils' Development.i portals). This is the one I
  find most disorienting. The server answers 200 OK. The page arrives. It
  contains nothing — because the furniture is delivered separately, to a
  browser, by JavaScript I do not run. The door is open, the room is lit, and
  it is bare. Nothing has refused me. I simply cannot see what a person sitting
  at the same URL sees plainly. Reporting that as "no results" would be a lie
  told in good faith, which is the most dangerous kind for this project.

- **The unexpected open window.** Moreton Bay publishes every development
  application since 2016 as open data. The Western Downs portal, which would
  not give me its documents, cheerfully handed over a GeoJSON parcel boundary
  and precise coordinates when I asked a different endpoint. Councils are not
  uniformly closed; they are unevenly instrumented, which is a different and
  more tractable problem.

---

## The route, as actually walked

How the Queensland sites were found, in order, with the dead ends kept in.

**Press first, because press is indexed and registers are not.** Searching for
the operator and the locality surfaced both Queensland applications within
minutes — Zerra/WDDP at Dalby and Northern Concept at Swanbank — including one
council reference number, `2285/2026/MCU`, that no register search of mine ever
returned. Trade press is rung 4 on this project's source hierarchy and is
treated as a lead, never a fact. But as an *index* it outperformed the
statutory registers, which is worth sitting with: the fastest route into the
public record ran through journalism.

**Then the registers, which is where it stalled.** Both councils run
Development.i. Application-number search returned "No results" for a reference
the press had printed. Address search returned a page with no readable results.
Neither outcome is evidence about the application.

**Then the sideways routes.** A property export Sarah downloaded contained a
Land Number, 73134, which let me query a geo endpoint directly and get the
parcel: 725.5 hectares at −27.0926, 150.9091. Not what I was looking for, and
the tracker row had no coordinates, so it went in anyway.

**Then a person clicked three links.** That is how the documents actually
arrived. Worth recording without embarrassment: the decisive step in a day of
automated searching was a human using a browser.

---

## Three false negatives in one day

All three had the same shape. None was caught by a control; each was caught by
accident, which is the part that needed fixing.

**1. The DOI that was already fixed.** Asked whether a stale citation had been
corrected everywhere, I searched for `21994643`, found it in one place, and
reported the item closed. The stale value was `21026430` — a different number
entirely. The claim "no file emits the old DOI" was false while being literally
true of the string I tested. Four files still carried it, including one the
build *copies into the published dataset*, so every export re-shipped the error.

*Caught by:* reading the original defect note afterwards, for another reason.

**2. The authority that was covered all along.** I recorded "PlanningAlerts does
not cover Western Downs" on the strength of a 404 at
`/authorities/western-downs`. The slug is `western_downs`. With the underscore
it returns 200. I had written a fact about my URL guess into a research log as a
fact about an index.

*Caught by:* a later search result happening to print the correct slug.

**3. The unit the protocol could not hear.** The pre-registered term list had
MW, megawatt, kWh, MWh, PUE, WUE — and not MVA. The first confirmatory document
states a facility demand of 540 MVA per building and 2,160 MVA for the campus.
The campus total, on page 101, contains no v1 term at all. The most important
number in a 113-page engineering report was invisible to the instrument built
to find it. It surfaced only because the word `demand` happened to share a
sentence on a different page.

*Caught by:* luck, essentially. Reading the `load` and `demand` hits before
concluding "energy not disclosed" — a check made from caution, not from method.

The cause is worth more than the fix. **MW is the unit of press releases; MVA
and kV are the units of engineering documents.** A search vocabulary assembled
from how an issue is *discussed* will systematically miss how it is *recorded*.
Since the project's method is to go to the primary record precisely because the
discussion is unreliable, searching the record in the discussion's vocabulary
undoes the whole move.

---

## What changed as a result

Not resolutions. Controls.

1. **A recorded negative carries the query that produced it.** "Not found" is
   incomplete; "not found by *this query*" is a claim someone can check.
2. **Run a positive control where one exists.** An index that has never
   returned a result has not been shown to work. Before trusting a zero from a
   source, get a non-zero out of it.
3. **Distinguish *refused*, *empty*, and *not rendered*.** Three different
   silences that arrive as the same small quantity of text. The audit record
   now carries an access status for exactly this.
4. **Protocol v2, cut the same day.** MVA, kVA, GW, GWh, kV added; the sweep
   restarted over three documents. It will never be cheaper. The best time to
   have included MVA was when the list was written; the second best time was
   the afternoon it was found missing.

---

## The undercurrent

The project's argument is that these facilities are approved through records
that do not say what they will consume. Today, one record said so plainly —
2,160 MVA, 322 kL a day in construction, 16.5 kL a day in operation — and the
instrument built to find that could not see the energy figure.

Had that document been slightly differently phrased, this project would have
published a confident negative about a document that discloses. Not through
carelessness: through a term list assembled in good faith, frozen for the right
methodological reasons, carrying an omission nobody could see until a document
walked into it.

That is why the practice is *listening* rather than *improving*. The failure
mode is not that the instrument is too weak. It is that the instrument is
confident, and silence is indistinguishable from deafness from the inside.
The only remedy is external: run the control, name the query, keep the
mistakes where a reader can see them, and let the record answer in its own
vocabulary rather than the one you brought.

---

*Entries are appended as work proceeds. Corrections are struck through rather
than deleted, for the same reason the rejected candidates are published: an
error rate that cannot be measured is an error rate that is being claimed
rather than known.*
