# Grid-led siting: the anticipatory dataset

**Research note, 19 September 2026.** A hypothesis with a method attached. Not
yet tested.

## The hypothesis

Australian data centres are sited by **transmission connection**, not by land
price, labour, water or proximity to users. The planning record describes a lot
boundary; the decision was made at a switchyard.

Two observations prompted it, both from primary documents read today:

- **Supernode, Brendale** — adjacent to the South Pine substation, which its
  developer calls "the major power transmission node for Queensland", with three
  independent high-voltage connections totalling 800 MW.
- **Western Downs, Dalby** — beside the Braemar substation and three gas-fired
  power stations, taking 275 kV and 330 kV connections through customer-owned
  switching stations, and stating explicitly that it will not draw from the
  distribution network serving homes and businesses.

Both bypass distribution entirely and connect to transmission. If that is
general, then the electricity network's existing topology — built decades ago
for coal generation and heavy industry — is selecting the sites of the AI
build-out, and a planning system assessing lot by lot is looking at the wrong
object.

## Why it is testable

The tracker holds coordinates for 94 data centres. Transmission infrastructure
is public. So the first test is a distance computation:

> For each data centre, the distance to the nearest substation and that
> substation's voltage. If siting is transmission-led, the distribution should
> be sharply skewed toward high-voltage assets, and it should hold **across
> states and across approval pathways** — which is what distinguishes a grid
> effect from a planning effect.

A null result is equally publishable: if data centres are no closer to
transmission than warehouses are, the hypothesis is wrong and the obvious
explanation for the siting pattern goes with it. **A control set of non-data-centre
industrial sites should be run alongside**, or the finding is unfalsifiable.

## Where the data is

**Spatial — the network as built.**

- **OpenStreetMap via Overpass**, tagged `power=substation` and `power=line`
  with `voltage`. Free, no key, queryable by bounding box. Verified working
  19 Sep 2026: a query around Brendale returned 21 substations with voltages,
  correctly identifying South Pine at 275 kV, 2.45 km from the Supernode site,
  and Brendale Zone Substation at 110 kV. Coverage of Australian transmission
  is good; coverage of distribution is patchier.
- **Geoscience Australia / Digital Atlas of Australia** — national electricity
  transmission lines and substations as authoritative spatial layers. Slower to
  work with than OSM, better provenance for publication.

**Anticipatory — the network as planned.** This is the more interesting half.

- **Transmission Annual Planning Reports**, published yearly by each network
  service provider: Powerlink (QLD), Transgrid (NSW), AusNet (VIC), ElectraNet
  (SA), Western Power (WA), TasNetworks (TAS). These list **connection
  enquiries and committed connections**, including large loads.
- **AEMO** — the Integrated System Plan, the NEM Registration and Exemption
  List, and connection-related publications.

The point: **a large load connection enquiry appears in a planning report
before any development application is lodged.** A proponent must talk to the
network operator long before they talk to a council. So the TAPRs are a leading
indicator of data centre siting, published annually, in public, and — as far as
this project can tell — not being read for this purpose by anyone.

That inverts the tracker's current posture. Today it finds sites once they
reach a planning portal or the press. Connection enquiries would find them
earlier, and would find them in the one record that cannot be vague about the
load, because the network operator has to size the connection.

## Method sketch

1. Pull substations and transmission lines for Australia from Overpass; keep
   name, voltage, operator, geometry.
2. For each of the 94 data centres with coordinates, compute distance to the
   nearest substation ≥ 110 kV and record its voltage.
3. Run the same computation over a control set — warehouses or general
   industrial sites of comparable size — to establish what "close to a
   substation" means for ordinary industrial land.
4. Break the result down by state and by planning pathway. A grid effect should
   survive both; a planning effect would not.
5. Separately, read the most recent TAPR for each NSTP, extract large-load
   connection enquiries, and compare against the tracker. Anything enquired and
   not tracked is a candidate site nobody has announced.

Step 5 is the one that would change what the tracker is for.

## Caveats stated in advance

- Proximity is not connection. A facility 500 m from a substation may not
  connect to it, and one 20 km away may have a dedicated line. Distance is a
  proxy and must be labelled as one; the Dalby report describes customer-owned
  switching stations, which is exactly the case where distance misleads.
- OSM voltage tags are crowd-sourced and incomplete. Use Geoscience Australia
  for anything published.
- Connection enquiries are commercially sensitive and are often reported
  anonymised or aggregated. The TAPRs may give a load and a location without a
  proponent — which is still more than the planning record gives.
