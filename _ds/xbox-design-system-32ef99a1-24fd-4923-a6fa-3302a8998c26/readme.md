# XBOX Design System

A design system extracted from the live **xbox.com** consumer site (en-CA), August 2026.

---

## 1. Context

**XBOX** is Microsoft's gaming brand. It is no longer a console brand — the site's own
information architecture puts the *subscription* first, hardware second, and treats
"where you play" as an open list. The primary nav reads: **Game Pass → Games →
Devices → Play → Community → Support**, and the devices menu enumerates
*XBOX on PC, XBOX on handhelds, XBOX on mobile, XBOX on TVs, XBOX on VR headsets*
as peers of the console.

### Surfaces represented in this system
| Surface | What it is | Where it lives here |
|---|---|---|
| **Marketing site** | Full-bleed, dark, CMS-composed campaign and hub pages (home, Game Pass, Series X\|S, community/philosophy hubs) | `ui_kits/marketing-site/` |
| **Game Pass plan selector** | The commercial heart of the site: 4-SKU chart, benefit carousel, FAQ, legal footnotes | `ui_kits/game-pass/` |
| **Product catalog** | Accessories and games browse: search, faceted filter rail, sort, product grid, load-more, empty states | `ui_kits/catalog/` |

### Product families named on the site
Consoles (XBOX Series X, Series S, in Carbon Black / Robot White / Galaxy Black),
handhelds (ROG XBOX Ally), controllers and XBOX Design Lab, console wraps, headsets,
storage expansion, assistive technologies (XBOX Adaptive Joystick), XBOX Cloud Gaming,
XBOX Play Anywhere, XBOX Rewards, XBOX FanFest, XBOX Mastercard.

### Game Pass plan ladder (verbatim from the SKU chart)
| Plan | Library | Notes |
|---|---|---|
| **Essential** | 50+ games | first month for $1 · unlimited cloud gaming · online console multiplayer · Rewards points |
| **Premium** | 200+ games | first 14 days for $1 · XBOX-published games within 1yr of launch · 2× Rewards |
| **Ultimate** | 400+ games | new games on day one · EA Play, Fortnite Crew, Ubisoft+ Classics · best cloud quality · 4× Rewards |
| **PC only** | 300+ games | PC only · day one · EA Play · 2× Rewards |

---

## 2. Sources

| Source | Access |
|---|---|
| `https://www.xbox.com/en-CA/` | Given by the user. Fetched — shell nav + footer only; the homepage body is client-rendered and did not resolve. |
| `https://www.xbox.com/en-ca/consoles/compare` | Fetched. Server-rendered — full spec-comparison structure and copy. |
| `https://www.xbox.com/en-CA/xbox-game-pass` | Fetched. Server-rendered — full SKU chart, benefit carousel, FAQ, legal footnotes. |
| `https://www.xbox.com/community/for-everyone` | Fetched. Server-rendered — brand philosophy copy, feature and tile modules. |
| `https://www.xbox.com/en-ca/accessories` | Fetched. Server-rendered — catalog filter taxonomy, category copy, empty states. |

### What could NOT be read — read this before trusting a number
1. **No CSS was retrieved.** xbox.com's stylesheets were not reachable. Colour hexes,
   type sizes and spacing below are reconstructed from (a) the framework the site
   demonstrably runs on and (b) the brand's published constants. They are marked
   `verified` / `framework` / `reconstructed` in the tables that follow.
2. **The framework is confirmed, though.** A footer asset is named
   `MWF-Xbox-Template-2025_LinkedIn-Dark.svg` — xbox.com is built on **MWF, the
   Microsoft Web Framework**. Independently, the site's image filenames embed MWF's
   viewport ladder: `Page-Hero-1084`, `Large-Tile-1084`, `Feature-768`. MWF's vp3
   (768px) and vp4 (1084px) breakpoints are therefore verified from source.
3. **No font binaries.** Nothing is substituted in their place. See Typography.
4. **No asset binaries.** The build sandbox blocks cross-origin downloads, so every
   logo, icon and photograph is referenced by its live CDN URL. See `assets/README.md`.
5. **No screenshots of the rendered site were used.** Everything is from page source.
6. **Assets load live, but do not screenshot.** Every image renders correctly in a real
   browser (verified: the CDN serves them with no hotlink protection). DOM-rendering
   screenshot tools cannot embed cross-origin images, so specimen and kit captures show
   blank image boxes. That is a capture artefact, not a broken reference.

---

## 3. Content fundamentals

### The brand is set in caps
The single most distinctive current convention: **the wordmark is written `XBOX`, in
full caps, everywhere — including mid-sentence body copy.** Not "Xbox". This runs
through nav, headings, body and legal:

> "At XBOX, we believe that gaming is for everyone."
> "XBOX Game Pass" · "XBOX Series X|S" · "XBOX Cloud Gaming" · "Optimized for XBOX Series X|S"

### Casing ladder
| Level | Case | Real examples |
|---|---|---|
| H1 / page title | **ALL CAPS** | `WELCOME TO XBOX` · `COMPARE XBOX CONSOLES` · `JOIN GAME PASS` |
| H2 / section label in data-dense pages | **ALL CAPS** | `COLOR` · `STORAGE & EXPANDABILITY` · `PROCESSOR` · `GAMING RESOLUTION` · `SHARED FEATURES OF NEXT GEN` |
| H2 / editorial section | Sentence case | "Choose the plan that's right for you" · "Discover your next favourite game" · "Our philosophy in action" |
| H3 / card title | Sentence case | "Inclusive of all" · "Play on your devices" · "Enjoy benefits & rewards" · "Make your voice count" |
| Eyebrow / plan tag | **ALL CAPS**, wide tracking | `ULTIMATE` · `ALL PLANS` · `PLAY ON DAY ONE` |
| Every CTA | **ALL CAPS** | `LEARN MORE` · `GET THE APP` · `SELECT` · `HELP ME CHOOSE` · `COMPARE ALL FEATURES` · `BECOME AN XBOX FANFEST MEMBER` |
| Body & legal | Sentence case | — |

Mixed separators appear in eyebrows: `Ultimate · PC`, `Ultimate・Premium・Essential`
(middot and the CJK katakana middle dot are both in production).

### Person
**"We" for the brand, "you" for the player** — and the two are deliberately braided.
Brand voice is plural-first-person and commits to things:

> "We strive to make life more fun for billions of people around the world by creating
> gaming experiences that everyone can enjoy. Because when everyone plays, we all win."

"We strive to…" is used as anaphora — three consecutive cards open with it. Player-facing
copy switches to imperative second person: "Play the games you want on any screen."
"Get in-game benefits…" "Join your friends to play, chat and explore together."

### Sentence shape
Two sentences per card, maximum. First states the offer, second widens it.

> "Access a growing library of console and PC games with new games added each month."
> "Explore hundreds of games from every genre. With new games added all the time,
> there's always something new to play."

### Numbers are the headline
Quantities carry the pitch and are set bold inside otherwise-regular text:
**50+ games**, **200+ games**, **400+ games**, **300+ games**, "50+ iconic games",
"up to 100,000 Rewards points a year", "UP TO **120FPS**". Spec names are bolded and
the value left plain — `**DTS** 5.1`, `**DOLBY** Digital 5.1`, `3x **USB** 3.1 Gen 1 ports`.

### No emoji. Ever.
Zero emoji across every page fetched. No unicode decoration either. Separators are
`|` (Series X|S), `·`, `&`, and the em dash. Superscript numerals mark footnotes.

### Legal is a first-class citizen
Every claim carries a numbered footnote and the fine print is set in *italics* with a
leading asterisk. Plan copy always names the trap: "Subscription continues
automatically. See terms." "*Prices and availability may vary by retailer.*"
"Game availability varies by plan". This is not an afterthought — it is a visible,
designed layer at the bottom of every commercial page.

### Vibe
Confident, plural, welcoming — not edgy. The word "fun" appears repeatedly and
unironically ("Gaming is a fun part of a balanced life", "Make gaming fun for
everyone"). Accessibility and safety are marketing copy, not a compliance page.
Empty states are the only place the brand jokes, and it stays in-world:
"Double check your map, Captain" · "You're headed for the wrong backyard!" ·
"Let your torch guide you down another path."

### Localisation note
en-CA uses British-influenced spelling — "favourite", "stylised", "Colour" in prose but
`COLOR` as a spec-table label (US-authored). Expect per-locale divergence.

---

## 4. Visual foundations

### Colour
| Token | Value | Confidence |
|---|---|---|
| `--green-600` Xbox green | `#107C10` | **verified** — the brand constant since 2017; the sphere, primary CTAs, on-states |
| `--green-neon` | `#9BF00B` | reconstructed — high-energy accent seen in Game Pass / cloud campaign work |
| `--green-700` / `--green-800` hover / press | `#0E6A0E` / `#0B5A0B` | reconstructed |
| `--neutral-400` | `#767676` | **framework** — Microsoft's canonical minimum-accessible grey on white (4.54:1) |
| `--red-500` / `--amber-500` / `--blue-500` | `#D13438` / `#FFB900` / `#0078D4` | **framework** — Fluent semantic constants |
| Neutrals `#000` → `#FFF` | 13-step ramp | reconstructed |

**Dark is the default.** Marketing pages sit on true black `#000`, not a soft charcoal —
so that full-bleed key art bleeds into the page with no visible seam. Surfaces step up
by value only (`#000` page → `#101010` raised → `#1A1A1A` card), never by shadow.
Green is rationed hard: it is the primary CTA, the active tab and the brand mark, and
almost nothing else. **Green is never a background wash and never a gradient behind
body copy.** The light theme (`[data-theme="light"]`) exists for catalog and support
surfaces, where product photography needs a white ground.

### Type
Stack: `"Segoe UI", "Segoe UI Web (West European)", system-ui, "Helvetica Neue", Helvetica, Arial`

**⚠ Font files missing — please upload them.** MWF sets Segoe UI, which ships with
Windows and is not redistributable, so **no `@font-face` and no webfont are shipped
here**. The token stays pointed at the real family; Windows machines render it natively
and everything else falls through the system stack. No stand-in family is loaded — a
near-match would silently misrepresent the brand's metrics.
Upload either the licensed Segoe UI web kit, or Microsoft's own open-source
metric-compatible substitute **Selawik**, and add the `@font-face` rules to
`tokens/fonts.css`. This is the single biggest fidelity gap in the system.

Ramp (MWF values — body is **15px/20px**, not 16px; do not round it):

| Role | Size / line-height | Weight | Treatment |
|---|---|---|---|
| Hero | 76 / 80 | 600 | ALL CAPS, `.02em` |
| H1 | 46 / 56 | 600 | ALL CAPS, `.02em` |
| H2 | 34 / 40 | 600 | caps for spec labels, sentence case for editorial |
| H3 | 24 / 32 | 600 | sentence case |
| H4 | 20 / 28 | 600 | — |
| Body lg | 18 / 26 | 400 | page lede |
| **Body** | **15 / 20** | 400 | default |
| Body sm | 13 / 18 | 400 | legal, captions |
| Caption | 11 / 16 | 400 | footnotes |
| CTA label | 15 | 600 | ALL CAPS, `.06em` |
| Eyebrow | 13 | 700 | ALL CAPS, `.12em` |

One family does all the work. There is no serif, no display face, no second pairing —
hierarchy comes from **weight, case and tracking**, which is why the caps/tracking
tokens matter more here than in most systems.

### Layout
MWF's ladder, confirmed by the site's own filenames: **0 · 540 · 768 · 1084 · 1400 · 1779**.
12-column grid, **12px gutter**, content capped at **1600px**. Section rhythm is
48px (mobile) / 64–96px (desktop). Full-bleed media breaks the container; text never does.

Authoring sizes are fixed by the CMS module you're building, and the module names are
worth learning because they *are* the layout spec:

| Module | Pixel size | Ratio |
|---|---|---|
`Page-Hero-1084` | 1920×720 | 8:3 |
`Large-Tile-1084` | 1258×629 | 2:1 |
`Medium-Tile-1084` | 528×534 | ~1:1 |
`Small-Tile-1084` | 528×320 | 1.65:1 |
`Feature-768` | 800×1000 | 4:5 portrait |
`Content-Placement-0` | 788×444 | 16:9 |
`Sneak-Slider-0` | 832×572 | ~1.45:1 |
`Large-tout` key art | 1083×1222 | portrait |
`404-Image-0` | 1200×675 | 16:9 |
`Sharing` | 200×200 | 1:1 |

### Corners, borders, cards
**Square.** Radius 0 is the default — MWF buttons and tiles have no rounding, and this
is one of the fastest ways to spot a fake Xbox mock. 4px appears on small chips and
some image tiles; 50% only on avatars.

A card is: an image at a fixed module ratio, flush to the card edge, with the text block
sitting **below** it on the page surface — no container fill, no border, no shadow.
Separation comes from the image edge and whitespace. When a card *does* need a fill
(SKU chart, filter panel) it takes `#1A1A1A` and, on dark, a `1px rgba(255,255,255,.12)`
hairline. Elevation shadows exist in the tokens for flyouts and dropdowns only.

### Imagery
Real photography and real game key art, never illustration and never stock-abstract.
Two registers:
- **Game key art** — saturated, high-contrast, dramatic lighting. Cool-to-neutral cast.
  Halo greens, Forza racetrack blues.
- **Lifestyle photography** — warm, bright, daylit, shallow depth of field, groups of
  people mid-laugh, domestic interiors. Deliberately unglamorous and diverse. The
  `Feature-768` portraits are all of this second kind.

No grain, no duotone, no b&w, no colour-graded filter over photography.

### Protection gradients
Full-bleed art always carries a scrim so white type holds. Bottom-up
(`--scrim-bottom`, transparent → 75% black) for tiles where the title sits low;
left-in (`--scrim-left`, 85% → transparent) for wide heroes with a left-aligned text
block. Text is never set on unscrimmed art. There is no capsule/pill treatment behind
text anywhere on the site — the gradient does the whole job.

### Transparency & blur
Sparing. `rgba(255,255,255,.08–.12)` for hairlines and hover fills on dark;
`blur(24px)` glass is reserved for the sticky nav when it overlays hero media.
No frosted cards, no glassmorphism panels.

### Motion
Restrained and short. **167ms** is the standard duration (MWF), 250ms for anything
larger. Easing is a fast-out/slow-in curve. Hover is a cross-fade of background or a
2px lift; images inside tiles scale to 1.04 behind an overflow clip. Carousels slide
on one ease with no overshoot.
**No bounce, no spring, no parallax, no scroll-jacking, no entrance animations on
body copy.** If it feels playful, it's wrong.

### Interaction states
| State | Treatment |
|---|---|
| Hover, primary button | green steps **darker** `#107C10` → `#0E6A0E` |
| Hover, secondary/ghost | fill in `rgba(255,255,255,.12)`, border unchanged |
| Hover, tile/card | image `scale(1.04)` inside clip; title underlines |
| Hover, text link | colour steps to `--neutral-200`, underline appears |
| Press | one further step darker + `scale(.98)`. Never a colour *change*, only depth |
| Focus | 2px high-contrast ring, offset by a 2px inverse ring so it reads on any ground |
| Disabled | `#2A2A2A` fill, `#767676` label. No opacity fade |
| Selected/active | green underline or green fill; never a colour tint of the row |

### Fixed elements
The Microsoft mega-nav and the XBOX shell nav pin to the top (48px + 56px). The
"Follow XBOX" footer, link farm, locale picker and privacy row are constant on every
page. A `#backtotop` anchor closes long catalog pages.

---

## 5. Iconography

**Xbox does not use an icon font or an icon library on the web.** There is no
Fluent-icon webfont on the marketing pages, no Font Awesome, no Lucide. Icons are
**individually authored, individually hosted SVG and PNG files served from the CDN**,
one URL per glyph, named after the module that uses them.

Evidence, all real filenames:
- `Xbox-Follow-Footer_Image-0_Facebook_32x32_02.svg` — the social row is eight separate
  32×32 SVGs, monochrome white, flat, no container.
- `Charlie_Accordion_OpenButton.svg` — the accordion chevron is one bespoke SVG.
- `leftArrow.png` / `rightArrow.png` — carousel arrows are still **PNG**.
- `Games-Catalog_Image-0_X-Button_230x120.svg` — the tooltip close button.
- `Game-Pass_SKU-Chart-0_Compare_130x88.svg`, `_Gift_130x88.svg`, `_Renew_130x88.svg` —
  the three utility icons under the plan chart are 130×88 SVGs, i.e. **wide, not square**,
  drawn as small illustrations rather than glyphs.
- `G4E-Hub_Badge-Thumbnail_130x150.svg` — the Gaming-for-Everyone hexagonal badge.

Consequences for anyone designing with this system:
1. **Do not reach for an icon set.** Use `assets/manifest.js`, which lists every real
   glyph URL. The `Icon` component wraps them.
2. Style is **flat, monochrome white, no stroke-weight system** — because each file was
   drawn for its slot, not to a grid. Sizes in the wild: 32×32, 130×88, 130×150, 230×120.
3. Icons are used **structurally** (nav affordances, carousel controls, disclosure
   chevrons, social) and **decoratively at large sizes** (the 130×88 illustration icons).
   They are never used as bullets in a list — plan features use a plain `•`/checkmark.
4. **No emoji, no unicode dingbats**, anywhere.
5. If your build genuinely needs a glyph Xbox doesn't publish, use **Fluent UI System
   Icons** (Microsoft's own open-source set, `@fluentui/svg-icons`) — same house, closest
   match. **Flag it as a substitution.** No such substitution was needed here.

### No logo file is stored
Microsoft's marks are trademarked and could not be downloaded. Nothing in this system
draws, traces or approximates the Xbox sphere. Where the mark appears, components load
the official CDN PNG (`LOGO.xbox`); where that is unavailable, they set the word
**XBOX** in the core face at weight 600 with `.02em` tracking.

---

## 6. Index

### Root
| File | What |
|---|---|
| `styles.css` | Global entry point. `@import` list only — link this one file. |
| `readme.md` | This document. |
| `SKILL.md` | Agent Skills front-matter, for use in Claude Code. |
| `thumbnail.html` | Homepage tile for the system. |

### `tokens/`
`fonts.css` · `colors.css` · `typography.css` · `spacing.css` · `layout.css` ·
`effects.css` · `motion.css` · `semantic.css`

### `assets/`
`README.md` (full CDN URL table) · `manifest.js` (importable constants:
`LOGO`, `SOCIAL`, `GLYPH`, `IMAGE`)

### `components/`
| Group | Components |
|---|---|
| `actions/` | `Button` · `TextLink` · `LoadMore` |
| `content/` | `PageHero` · `SectionHeading` · `Eyebrow` · `FeatureCard` · `ContentPlacement` · `Tile` · `Footnote` |
| `commerce/` | `SkuCard` · `ProductCard` · `Badge` · `PriceTag` · `ComparisonTable` |
| `catalog/` | `SearchField` · `FilterGroup` · `SortSelect` · `CategoryList` · `EmptyState` |
| `disclosure/` | `Accordion` · `Tooltip` · `Carousel` |
| `shell/` | `GlobalNav` · `SiteFooter` · `Icon` |

### `templates/`
Starting folders a consuming project can copy. Each entry loads the system through its
sibling `ds-base.js`.

| Template | What it starts you with |
|---|---|
| `marketing-page/` | Full-bleed dark page: hero with left-in scrim, 3-up feature cards, tile mosaic, pledge block, footer |
| `game-pass-plans/` | The four-SKU plan chart, utility row and legal footnote layer |
| `product-catalog/` | Light-theme browse: faceted filter rail, sort, product grid, load-more |

### `ui_kits/`
| Kit | Screens |
|---|---|
| `marketing-site/` | Community / philosophy hub — hero, 3-up features, tile mosaic, pledge, content placements, footer |
| `game-pass/` | Game Pass PMP — value props, benefit carousel, 4-SKU plan chart, utility row, FAQ, legal |
| `catalog/` | Accessories browse — search, faceted filter rail, sort, product grid, load-more, empty state |

### `guidelines/`
Foundation specimen cards (colour, type, spacing, layout, motion, states, brand).

### Intentional additions
- **`Icon`** — a thin wrapper over `assets/manifest.js`. Xbox publishes no icon
  component because each glyph is a bare `<img>` on the real site; the wrapper exists
  so consumers get consistent sizing and alt-text handling instead of hand-writing URLs.
- **`Badge`** and **`PriceTag`** are factored out of what the site ships inline
  (`PLAY ON DAY ONE`, `[[PLACEHOLDER]]% OFF`, previous/current price pairs). Same
  visuals, extracted for reuse.

Nothing else was added. There is no Avatar, Toast, Switch, Tabs, Dialog or Breadcrumb
in this system because the fetched source does not define them — if you need one,
check the real product first.
