# The protocol, in plain English

*A plain-language companion to [`PRE-REGISTRATION.md`](PRE-REGISTRATION.md),
which is the formal version. If the two ever disagree, the formal one governs —
but this one is what it actually means.*

## What we're claiming

The tracker's central finding is a claim about something missing:

> The planning documents that approve Australian data centres mostly don't say
> how much electricity or water those data centres will use.

That's an unusual kind of claim. Most research says "here is a thing we found."
This one says "here is a thing that isn't there." And absence is harder to
prove than presence, because one document can disprove it and no number of
documents can finally confirm it.

## Why that needs a protocol

Say you tell someone there's no cat in the house.

That's worth something if you wrote down beforehand which rooms you'd check.
If you didn't, the obvious question is "did you look in the shed?" — and you're
stuck. Either you didn't check it, or you did and nobody can tell whether
you're only mentioning the rooms that happened to be empty.

The trap isn't dishonesty. It's that without a list written in advance, you
tend to stop looking when you stop finding things. That feels like thoroughness
and isn't. You stopped where the silence was, so the silence was partly your
choice.

A protocol is just the list, written down first.

## What's in it

Four things, all decided before any document is opened:

1. **The question.** Does the public planning record say what this facility
   will draw in electricity and water, and how it will be cooled?
2. **Where we'll look.** The state planning register, then PlanningAlerts, then
   the council's own index, then the government gazette — in that order, and we
   record every one we tried, including the ones that turned up nothing. An
   index that came back empty is still evidence about the index.
3. **What words we'll search for.** A fixed list: `MW`, `MVA`, `kWh`, `PUE`,
   `water`, `litres`, `ML`, `kL`, `cooling`, `potable`, and so on.
4. **How we decide what counts.** A mention of water in a drainage condition
   isn't the facility disclosing its water use. Someone has to read each hit and
   say which it is.

Then we go and look. We count every word, including the ones that come back
zero — **especially** the ones that come back zero, because those are the
finding.

## What "frozen" means

The word list is written down and published before the searching starts, and it
doesn't change quietly.

It can change — it changed on 19 September. But changing it means saying so, in
writing, with the date and the reason, and going back to re-do anything already
searched under the old list.

The point isn't that the list is perfect. It's that if the list turns out to be
wrong, **everyone can see it was wrong**, including us.

## What happened on 19 September

This is the best example of why any of it matters.

The original word list had `MW` — megawatts. It did not have `MVA`.

The first Queensland document we checked was a 113-page engineering report for a
very large data centre at Dalby. It states the facility's electrical demand
clearly: 540 MVA per building, about 2,160 MVA for the whole campus.

The protocol couldn't see any of it. It found the figure once, by accident,
because the word "demand" happened to be on the list and happened to appear in
the same sentence. The campus total, on page 101, contains no word from the
original list at all.

The reason is worth understanding, because it isn't carelessness. **MW is the
unit used in press releases and public debate. MVA and kV are the units used in
the engineering documents that actually go to the grid operator.** A word list
built from how something is talked about will miss how it's written down — and
going to the written-down version is the entire point of this method.

So: the list was amended to version 2, `MVA` and four other electrical units
added, the reason written down, and the three documents already checked were
done again. Total cost, about twenty minutes.

Had the list not been frozen and public, that fix would have been a silent
edit. The earlier searches would have stayed on the record looking fine, and
nobody would ever have known they were blind to the most important number in
the document.

**The freeze didn't stop the mistake. It made the mistake visible.** That's the
job.

## What the protocol doesn't do

It doesn't decide anything.

Software counts words, records page numbers, and stores the document's
fingerprint so anyone can check it read the same file. It marks every hit
`UNCLASSIFIED` and stops there.

A person then reads each hit and says whether it's the facility's actual
consumption or something else — drainage, firefighting, a company name that
happens to contain the word "water". A person grades the document and signs it
with their initials and the date. Nothing gets published on a machine's say-so.

## Two things the protocol is careful about

**"We couldn't find it" is never "it doesn't exist."** If a council website
won't load, that's recorded as the website not loading — not as the document
being absent. Three times on 19 September a search came back empty and the
emptiness turned out to be a mistake in how we'd asked, not a fact about the
world.

**Being unable to read a document is a result, not a failure.** If a permit is
published only as a scanned image with no searchable text, that gets recorded
as `NOT-ACCESSIBLE`. A record the public technically can access but cannot
search is itself a finding about transparency.

## The honest limits

- It was borrowed from medical trials, where you know in advance what you're
  measuring. Here, some of what you're discovering *is* the vocabulary — which
  is exactly what the MVA problem was.
- It applies properly only to Queensland and the Northern Territory. Victoria,
  New South Wales, Western Australia, South Australia and Tasmania were
  searched before the protocol was finished, so those results are reported as
  exploratory. They stand on the documents they read; what they can't claim is
  that the search terms were fixed before the answers were known.
- A protocol nobody understands isn't a safeguard, it's paperwork. That's why
  this page exists.
