# Pillar 3: User experience and design — measured audit

Audit date: 24 August 2026
Targets measured:

- **Live**: `https://freetins.pages.dev/` (serving commit `4790947`)
- **Working tree**: local `astro build` of the current uncommitted branch, served with `wrangler pages dev dist` on `127.0.0.1:8788`

Both were measured because the working tree contains uncommitted fixes that resolve several defects still present on the live deployment.

## Method

Instrumented Chromium (Playwright) rather than a single Lighthouse pass, so that every claim below is a measurement rather than a category score.

| Probe | Coverage |
|---|---|
| Layout / overflow / touch targets / contrast / type scale | 9 routes × 5 viewports (320, 360, 768, 1280, 1440) = 45 page-viewport pairs, run twice (live + working tree) |
| Keyboard walk | 30 sequential Tab stops with computed focus styles |
| Mobile drawer | open, focus move, focus trap (25 Tabs), Escape, focus restore, scroll lock |
| Prose typography | real computed measure via glyph-width sampling, 4 templates × 2 viewports |
| Interaction states | clipboard success and denial paths, live-region announcements |
| Reflow (WCAG 1.4.10) | 320 px equivalent of 400 % zoom, incl. table containment |
| Functional tasks | search query / no-match / empty states, element filter, contact routing |

Raw output: `output/audit/ux-pillar3.json` (live), `output/audit/ux-pillar3-local.json` (working tree), `output/audit/ux-pillar3-deep.json`. Screenshots: `output/audit/p3-*.png`.

## Verdict

| | Score | Change |
|---|---:|---|
| Live deployment (`4790947`) | **66 / 100** | unchanged from the 24 Aug production audit |
| Working tree (unreleased) | **78 / 100** | +12 |

The working tree fixes the two systemic accessibility defects and the broken global search. What remains is a small set of specific, locatable defects — not a systemic design problem. Scores are prioritisation aids, not compliance certifications.

---

## Passing — verified, not assumed

**Responsive layout (3.1).** Zero horizontal overflow across all 45 page-viewport pairs, on both builds. `document.documentElement.scrollWidth === window.innerWidth` at 320 px on every route tested.

**Reflow at 400 % zoom (WCAG 1.4.10).** Passes at a 320 px equivalent viewport on `/`, `/codes/grow-a-garden/`, `/answers/little-alchemy/` and `/how-we-verify/`. Both tables on the Little Alchemy page sit inside `overflow-x` scrollers rather than clipping.

**Keyboard operability (3.2).** All 30 sampled Tab stops carry a visible focus indicator: `outline: 2px solid #fff` with `outline-offset: 2px` plus a `0 0 0 2px #000` shadow ring — a two-tone indicator that stays visible on both light and dark surfaces. No focus trap outside the drawer, no positive `tabindex`, no keyboard-unreachable control found.

**Mobile drawer.** Correct by inspection and by test: `role="dialog"`, `aria-modal="true"`, `aria-label="Mobile navigation"`; the closed state uses the `hidden` attribute so its 23 links are genuinely removed from the tab order; opening moves focus to Close; focus stayed inside the dialog across 25 consecutive Tabs; Escape closes, restores focus to the trigger and releases the `body` scroll lock. Drawer nav rows are 48 px tall and the search chips 44 px.

**Semantics and structure (3.3).** One `<h1>` per page on every route. No heading-level skips detected on any tested page. `header`/`nav`/`main`/`footer` landmarks present; every `<nav>` carries an accessible name. Breadcrumbs present on all non-home routes and correctly de-duplicated (`Home / Codes / Grow a Garden`, not `… / Grow a Garden / Grow a Garden`). Zero unlabelled links, buttons, inputs or images across all tested pages.

**Interaction feedback (3.5).** The code-copy control is genuinely well built. Success path: `COPY` → `COPIED`, clipboard verified to contain `RDCAward`, `aria-live` announces "RDCAward copied to clipboard.", label reverts after ~2.5 s. Denial path: `COPY` → `SELECT CODE` with "Could not copy RDCAward. Select the code manually." — a real fallback, not a silent failure.

**Reduced motion.** `prefers-reduced-motion: reduce` collapses transitions and disables `scroll-behavior: smooth`.

**Prose typography (3.4).** Editorial body copy is 18 px / 27.9 px (1.55 ratio) at a measured 77 characters per line on desktop and 41 on mobile — inside the 45–85 comfortable range at both ends. Operational pages use 15 px / 23.25 px at ~40–42 characters, which is tight but sits in a narrow record column by design.

---

## Findings

### P1 — Element filter is dead on the Little Alchemy page; CSP errors on 19 pages

The `<script>` block at [EditorialArticle.astro:926](src/components/pages/EditorialArticle.astro#L926) is emitted **inline, 658 bytes after `</html>`**, and the site's own `script-src 'self'` policy blocks it.

Measured consequences:

- All **19** editorial pages log `Executing inline script violates the following Content Security Policy directive 'script-src 'self''`.
- On `/answers/little-alchemy/` the failure is user-visible: an input labelled *"Try life, metal or rain"* sits above 580 cards. Typing `life` leaves **580 of 580** cards visible and the counter frozen at "580 elements".
- The other 18 pages render the console error only — their `[data-element-index]` block has no visible input, so there is no user-facing breakage there.

This is not fixed in the working tree. Screenshot: `output/audit/p3-alchemy-filter-broken.png`.

Fix: move the filter into the bundled `src/scripts/site.ts` (or emit it as a same-origin module) so it is served from `/_astro/`. Keep `script-src 'self'`; do not add `unsafe-inline`. The out-of-document placement is itself an HTML validity defect and should be corrected regardless of the CSP outcome.

### P1 — The desktop primary nav never shows an active state

On `/codes/`, `/guides/…`, `/answers/…` and every other route, no `<a>` in `.desktop-nav` receives `aria-current="page"`. Confirmed in the rendered HTML and visually (`output/audit/p3-codes-hub-desktop-noactivenav.png`): the green underline treatment at [Header.astro:88](src/layouts/partials/Header.astro#L88) never renders.

Root cause is a trailing-slash mismatch in [Header.astro:12-17](src/layouts/partials/Header.astro#L12-L17). `normalizedCurrentPath` strips trailing slashes but `link.href` keeps them:

- `/codes/` → `normalizedCurrentPath = '/codes'`, `href = '/codes/'`. `'/codes' === '/codes/'` is false, and `'/codes'.startsWith('/codes//')` is false.
- Home is also broken: `/` normalises to `''`, so the `href === '/'` branch compares `'' === '/'` → false.

Every item fails, so the defect is invisible as an inconsistency — it just looks like the design has no active state. [MobileDrawer.astro:16-20](src/layouts/partials/MobileDrawer.astro#L16-L20) normalises both sides and works correctly (`aria-current="page"` verified on the drawer's Codes link), which is the reference implementation to copy.

This costs both wayfinding (3.3) and a WCAG 2.4.8 *Location* signal.

### P2 — No search entry point anywhere on desktop

`SearchField` is imported by [index.astro:70](src/pages/index.astro#L70) only. The site header contains zero `<input>` elements and zero links to `/search/`. The drawer search is hidden above 1084 px.

So on desktop, from any interior page, a user cannot reach search without typing the URL — while the site's JSON-LD advertises a `SearchAction` on `/search/`. The search itself now works in the working tree (`?q=grow` returns 1 result; no-match and empty states both carry useful copy), which makes the missing entry point the remaining blocker on that task.

### P2 — Two of nine primary nav destinations are noindex dead ends

Main-content word counts and robots directives on the working-tree build:

| Nav item | Status | Main words | Robots |
|---|---|---:|---|
| Today `/` | 200 | 364 | index |
| Codes `/codes/` | 200 | 207 | index |
| **Daily links `/daily/`** | 200 | **91** | **noindex, nofollow** |
| Cheats `/cheats/` | 200 | 159 | index |
| Answers `/answers/` | 200 | 171 | index |
| Guides `/guides/` | 200 | 109 | index |
| Resources `/resources/` | 200 | 401 | index |
| How we verify `/how-we-verify/` | 200 | 118 | index |
| **Alerts `/alerts/`** | 200 | **53** | **noindex, nofollow** |

`/alerts/` reads "Alert delivery is not active yet. This page explains the launch requirement." Its only call to action, *Manage alerts*, links back to `/alerts/`. Giving a not-yet-launched feature top-level navigation weight makes the product read as unfinished. `/submit/` (41 words) and `/blog/` (41 words) are the same shape one level down.

The empty-state copy is honest and well written — the problem is placement, not wording. Demote both to the footer or a "What's coming" block until they do something.

### P2 — Contact address is inconsistent across three surfaces

- `/contact/` → `mailto:support@freetins.com`
- `/submit/` → `mailto:hello@freetins.com`
- Organization JSON-LD in [BaseLayout.astro:51](src/layouts/BaseLayout.astro#L51) → `hello@freetins.com`

A corrections workflow that publishes two different addresses will lose reports. Pick one and use it in all three places.

`/contact/?topic=correction` does surface the topic in the page copy, but the `mailto:` href is unchanged — no prefilled subject. Adding `?subject=` to the link is a cheap completion of that task.

### P3 — Touch targets clear WCAG 2.2 AA but not the 44 px comfort target

Working-tree build, minimum dimension of every visible interactive element:

| Build | `< 24 px` (fails SC 2.5.8 AA) | `24–43 px` (passes AA, below 44 px) |
|---|---:|---:|
| Live `4790947` | 24–605 per page | — |
| Working tree | **0 on every page** | 20–39 per page (630 on Little Alchemy) |

The working tree clears the AA minimum everywhere. The residual band is the 32 px footer link rows introduced by the pending Footer change, the 32 px alphabet-nav chips and the 20 px-tall element-title links on Little Alchemy. Those meet the standard; raising the alphabet nav to 44 px is worth doing because it is a primary navigation control on the site's largest page.

### P3 — The Little Alchemy page is structurally very heavy

628 headings and 656 focusable elements on one route. A screen-reader user pulling up a heading list gets 628 entries; a keyboard user tabbing past the content faces 600+ stops. The jump-nav and (once fixed) the filter help, but a paginated or alphabet-sectioned load would serve assistive-technology users better than a single 580-card document.

### P3 — First-visit chrome consumes 27 % of a mobile viewport

On a fresh 390 × 844 session against the working tree: consent panel 182 px (21.5 %), outage banner 49 px (5.8 %), combined **27.3 %**, with the `<h1>` pushed to y = 208. That is a real improvement on the 48 % recorded against the live build, and the hero remains legible (`output/audit/p3-home-mobile-firstvisit.png`).

Since the banner itself states that only necessary storage is active and no vendor is configured, a full sticky choice panel is still disproportionate. A one-line dismissible notice linking to `/privacy/` would recover ~20 % of the first viewport.

---

## Measurement blind spot

The automated contrast walker computes the effective background by walking ancestor `background-color` values. It cannot evaluate text set over a `background-image` — which is exactly the case for the homepage hero lede, where light body text crosses a bright green region of the artwork. That pairing needs a manual or screenshot-sampled check before the contrast result can be called clean sitewide.

---

## Already fixed in the working tree — ship these

Verified by running the identical probe against both builds.

**Text contrast (was the single repeated WCAG 2.2 AA failure).** Live: 2–3 distinct failing text styles per page across all 45 page-viewport pairs, ratios 4.18:1 to 4.35:1 against a 4.5:1 requirement — footer column headings, native-card labels, page-head stat labels and the consent eyebrow, all `--text-disabled: #767676` on near-black surfaces. Working tree: **0 failures on every page at every viewport**, via the new `--text-caption` token in [semantic.css](src/styles/tokens/semantic.css) and its adoption in [Footer.astro:73](src/layouts/partials/Footer.astro#L73).

**Sub-12 px text.** Live: 9–24 elements per page rendering below 12 px. Working tree: **0**.

**Touch targets.** Live: up to 605 elements per page below the 24 × 24 minimum. Working tree: **0**.

**Global search.** Live: `/search/`, `?q=grow-a-garden` and `?q=monopoly` returned byte-identical HTML. Working tree: `?q=grow` returns "1 result for 'grow'" with a real result card; `?q=zzzzqqq` returns a specific no-match message; bare `/search/` returns a "Type a game, guide or code" prompt with scope explanation. All three states are distinct and useful.

Deploying the working tree is the single highest-value Pillar 3 action available.

---

## Recommended order

1. Deploy the working tree — clears contrast, target size, tiny type and search in one release.
2. Move the editorial filter script out of the inline block into the bundled module (P1, fixes 19 pages).
3. Normalise trailing slashes in `Header.astro` `isActive` (P1, one-line fix).
4. Add a header search entry point for viewports ≥ 1084 px (P2).
5. Unify the contact address across `/contact/`, `/submit/` and the Organization JSON-LD (P2).
6. Demote `/alerts/` and `/daily/` out of primary navigation until they have content (P2).
7. Reduce the consent panel to a compact notice while no optional processing exists (P3).
8. Raise the Little Alchemy alphabet nav to 44 px and section or paginate the 580-card list (P3).
