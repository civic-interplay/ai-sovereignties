# Cards

One file per tracking night, holding the headline claims that night produced in
the `sarah speaks` card format: a label chip, one claim with a single
highlighted figure, and two attribution lines.

These are **not posts**. They are the claims a post could be built from, with
their source, page and date recorded at the moment the document was read —
while the provenance is still in hand rather than being reconstructed weeks
later from memory.

## Every card carries a status

| Status | Means |
| --- | --- |
| `VERIFIED` | A person has walked it to the primary document. |
| `SOURCED` | Quoted correctly from a named document; nobody has independently checked it. |
| `UNVERIFIED` | Rests on this project's own computation, with no adversarial pass. |

**Post nothing above its status.** A figure that is merely `SOURCED` can still
be wrong about what it measures, and the ones most worth posting are the ones
most likely to be contested.

## Why the notes matter more than the claims

Each card carries a *note if used*. That is where the caveat lives — that 20 GW
is enquiries and not commitments, that a $14.7M capital investment value is
almost certainly correct as the regulation defines it, that a count over
application descriptions is not a claim about permit documents.

A card without its note is a card that will be corrected in public.

## Two files per night

`YYYY-MM-DD.md` is the **working copy**: every card with its status, its source
page, and the note that must travel with it.

`YYYY-MM-DD-clean.md` is the **production copy**: card text only, nothing else,
ready to set. It carries a pointer back to the working copy rather than the
caveats themselves, because a caveat printed on a card is not a caveat — it is
small type nobody reads. The check happens before the card is made, not on it.

## Naming

`YYYY-MM-DD.md`, the night the documents were read — not the night a post goes
out, and not the date on the source.
