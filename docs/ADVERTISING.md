# Advertising

Google AdSense, publisher `ca-pub-6309018820960389`, four ad units, live.

## The inventory

| Block | AdSense unit | Type | Where it renders | Pages |
| --- | --- | --- | --- | --- |
| `home-feed` | FTNewHoriz `2805824365` | Display, responsive | Homepage, below the discovery grid | 1 |
| `codes-inline` | FTNewsq `5130886170` | Display, responsive | Code pages, directly under the codes table | 53 |
| `article-mid` | in-article `7483435970` | In-article | Dataset and editorial pages, after the prose, before the questions | 55 |
| `article-end` | multiplex `1464822534` | Multiplex | The same pages, after the sources | 55 |

109 of the site's 132 pages carry at least one block, and the 55 article pages
carry two. `pnpm check:routes` prints the totals on every run.

**Not one of the four has a size**, and that is the point. The article column is
780px on a desktop and 280px on a 320px phone; the homepage block is 296px wide on
a common Android and 1360px on a wide monitor. A fixed unit is one number for all
of that, so it is either wasted on the desktop or clipped on the phone. Responsive
and fluid units are handed the column and size themselves to it.

## What the record holds instead

`src/content/operations.json`, `services.advertising.placements`:

```json
{ "id": "article-mid", "adUnitId": "7483435970", "format": "in-article",
  "reserve": { "mobile": 260, "desktop": 260 } }
```

- `format` is one of `display`, `in-article`, `multiplex`, and it decides the
  markup `AdSlot` emits. A unit created as one type and rendered with another
  type's attributes is not a wrong ad, it is a dead one: it renders, never fills,
  and says nothing about why. `pnpm check:data` rejects an unknown format.
- `reserve` is the height the block holds open before the creative lands, in CSS
  pixels, at the two widths the layout changes at (the breakpoint is 768px). It is
  a **floor, not a clamp** — see below.

Adding a block is a placement here plus one `<AdSlot placement="…" />` in a
template. A name with no placement behind it renders nothing; a placement no
template asks for renders nowhere. Neither is an error, which is how the inventory
gets chosen without editing a template.

In-feed is the one AdSense type not used. It earns its keep between the items of a
repeating list, and no block here sits inside one. Adding it later means a
`layoutKey` field as well, because AdSense generates one per in-feed unit.

## How a block stays a block

`src/components/ui/AdSlot.astro`:

- **Width is absolute.** `max-width: 100%` on the box, the `<ins>` and the iframe
  AdSense swaps in, plus `overflow-x: clip` on the box. Nothing served here can
  reach past its column or scroll the page sideways. `clip` rather than `hidden`
  because `hidden` on one axis forces the other to scroll, which would put a
  scrollbar on the ad.
- **Height is a floor.** A fluid unit decides its own height. Cutting one off at a
  number typed in a JSON file would hide pixels an advertiser paid for, so the
  block reserves `reserve` and grows past it if the creative is taller.
- `data-full-width-responsive` is set to **`false`**, which is the one attribute
  not as the dashboard issues it. The snippet says `true`, which lets a responsive
  unit take the full width of the phone screen rather than the width of its
  column — on an article body, 20px of overflow past each side of the text. Set it
  back to `true` and drop the horizontal clamp together, or not at all.
- A unit AdSense could not fill is marked `data-ad-status="unfilled"`, and the
  block removes itself rather than leaving a labelled empty rectangle — which at a
  multiplex unit's reserve would be a 420px hole.
- Nothing sits at the top of an article body. The artwork placement already argues
  that a reader should meet the byline and the answer before anything else.

**Auto ads must stay off in the AdSense dashboard.** This is the only part of "ads
stay in the blocks" that this repository cannot enforce. Auto ads is an account
setting applied by the same loader script the blocks use, and with it on Google
inserts ads between paragraphs, over the page as anchors and full-screen between
navigations, none of which pass through `AdSlot`. The trade is that anchor and
vignette formats are Auto-ads-only and so this site has none.

## Pages that carry no advertising

The eight trust pages: privacy, terms, DMCA, disclosure, contact, about,
how-we-verify and resources (`AD_FREE_SECTIONS` in
`src/components/pages/EditorialArticle.astro`). These are the pages a reader opens
to decide whether to trust the site, including the one describing this advertising.
Selling space on them is the cheapest possible contradiction of what they say, and
it earns close to nothing.

Section hubs, the A–Z, search and author pages carry none either — no block is
placed on them yet. `codes-inline` can be reused there without a new AdSense unit
if the fill rate justifies it.

## Consent

`src/scripts/ads.ts` requests nothing until `advertising` is a stored `true` in the
`ft_consent` cookie. An absent cookie, an unparseable one and an explicit rejection
all read as a no. Until then the blocks are `hidden` and occupy no space, so a
reader who declines gets the page they would have got with no blocks in the
template at all. Withdrawing consent takes the blocks off the page; it cannot
un-run a script that has already loaded, and the disclosure says so rather than
claiming otherwise.

A page with no `AdSlot` on it makes no ad request, consented or not.

Because a block is revealed on the reader's own click, the reveal's layout shift
falls inside the window the metric excludes. A returning reader with a stored
choice is the case the `reserve` exists for.

## Content-Security-Policy

The Google origins are in `public/_headers`, with the reasoning next to them.
`pnpm check:routes` fails the build if advertising is enabled and `script-src`,
`frame-src` or `connect-src` is missing one, and it checks per directive so an
origin in `connect-src` cannot stand in for `script-src`.

`'unsafe-inline'` is deliberately not in `script-src`. If a unit renders but never
fills, the browser console is the first place to look: a CSP violation there means
the format wants inline execution, and the answer is a nonce for that case, not a
blanket allowance.

## Verification

`public/ads.txt` authorises the publisher, and `BaseLayout` emits the
`google-adsense-account` meta tag from the same id. Both are inert — no script, no
cookie, no request — and both render whether or not advertising is enabled.
`pnpm check:routes` fails the build if the two ever name different accounts.

## What advertising may never touch

`CLAUDE.md`: nothing in `sponsorships`, `products` or advertising may influence a
badge, a state or an order. An ad block is a fixed position in a template. It does
not read an entry, it is not ordered against one, and no ad unit id appears
anywhere near the verification record.
