# Freetins migration readiness review

Prepared: 24 August 2026
Old site: `www.freetins.com` — WordPress + Rank Math, 47 URLs in sitemap
New build: `freetins.pages.dev` — Astro 5.18.2 on Cloudflare Pages, 116 documents / 43 indexable
Question answered: is the dev site ready to take over the main domain, what changes, what breaks, and when should the cutover and the next content push happen

---

## 1. Verdict

**The build is ready. The cutover configuration is not.**

The application itself is in good shape — faster, more secure, better structured and more honest than the site it replaces. Nothing in the codebase justifies delay.

What blocks the cutover is a short list of configuration and mapping defects that would each cause measurable, avoidable loss on the day of the switch. Every one is a hours-not-weeks fix.

| | Assessment |
|---|---|
| Application quality | **Ready** |
| Redirect map | **Not ready** — 27 of 47 old URLs currently 404, including 3 legal pages |
| Hostname configuration | **Not ready** — build canonicalises to apex, the indexed site is `www` |
| Staging hygiene | **Actively harmful today** — `pages.dev` is crawlable with canonicals pointing at a redirect |
| Verification substantiation | **Not ready to be the headline claim** — 48 of 48 published code rows say "no publisher post found" |
| Content volume | **Adequate** — 43 indexable pages, median 658 words, 4 thin pages |

**Recommended cutover window: 7–10 days from now**, once section 6's checklist is closed. Do not cut over this week, and do not wait a month — the current state is worse than either the old site or the new one.

---

## 2. What the migration will FIX

These are broken or absent on the old site and correct on the new one. Verified by measurement, not inspection.

### 2.1 Page weight and delivery

| | Old (`www.freetins.com`) | New (`pages.dev`) |
|---|---|---|
| Homepage transfer | 154,715 bytes | **40,983 bytes** (−73 %) |
| Homepage TTFB | 493 ms | **145 ms** |
| Third-party scripts | `stats.wp.com` (Jetpack) | **none** |
| Rendering | PHP per request | Prerendered static at edge |

### 2.2 Security headers

The old site sends `x-content-type-options`, `x-frame-options: SAMEORIGIN`, HSTS and a bare `upgrade-insecure-requests` CSP. The new build adds a genuinely restrictive policy:

```
default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline';
img-src 'self' data:; font-src 'self' data:; connect-src 'self'
```

plus `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` and a nine-directive `Permissions-Policy`. This is a large, real improvement — with one regression noted in 4.4.

### 2.3 Content scope discipline

The old site carries 15 URLs with no relationship to game help — Rainmeter desktop skins (7), an APK sideloading guide, iOS emulators for Windows, iPhone secret codes, Craigslist alternatives, an ambigram generator, a JW Player downloader, adblock comparison, and "what is coding". Several carry download-safety and copyright risk. All are removed.

### 2.4 Placeholder handling

40 game routes exist without published codes. All 40 are `noindex, nofollow`, and **zero of them are linked from `/codes/` or `/games/`** — both hubs link only to the 12 pages with real data. Each placeholder states its own condition plainly:

> "This page stays out of the index until a code, reward, publisher source, redemption path and verification event all pass validation."

This is a well-built gate and it closes the "routing users and crawlers into placeholders" finding from the production audit.

### 2.5 Accessibility defects

Measured across 45 page-viewport pairs. On the working tree: text-contrast failures **0** (live has 2–3 per page at 4.18–4.35:1), sub-24 px touch targets **0** (live has up to 605 per page), sub-12 px text **0**. Full detail in `PILLAR3-UX-AUDIT-2026-08-24.md`.

### 2.6 Global search

Live `pages.dev` returns byte-identical HTML for every query. The working tree returns real results plus distinct no-match and empty states. The old WordPress site has default search only.

---

## 3. What the migration will IMPROVE (better, not finished)

### 3.1 Structured data

The new build emits an `Organization` + `WebSite` + `WebPage` JSON-LD graph with `publishingPrinciples` and `correctionsPolicy` pointing at `/how-we-verify/`. Improvement over Rank Math defaults — but the `SearchAction` it advertises has no desktop entry point (4.6), and every `@id` is a hardcoded literal that must change with the host decision (6.2).

### 3.2 Editorial trust surface

`/how-we-verify/` is 2,483 words and genuinely specific. Four named author profiles replace a single thin editor page. The evidence-tier chip on every code row is honest.

The improvement is capped by what the chips currently say — see section 5.

### 3.3 Information architecture

Clean slash-canonical paths (`/codes/<slug>/`) replace WordPress's flat 60-character slugs. Breadcrumbs on every non-home route, correctly de-duplicated. Two caveats: the desktop nav never renders an active state (4.6), and two of nine primary nav destinations are noindex dead ends.

### 3.4 Content depth

43 indexable pages, 34,187 total words, median 658. Only 4 pages under 300 words, all author bios. Compared with the old site's 34 posts of mixed relevance, the *usable* corpus is larger even though the URL count is lower.

**Regression to watch:** `/answers/little-alchemy/` is 281 KB and 3,402 words in a single document with 628 headings and 656 focusable elements — against 111 KB for the old equivalent. It should be sectioned or paginated.

---

## 4. Issues STILL PRESENT

Ordered by what they cost on cutover day.

### 4.1 — P0 — 27 of 47 old URLs return 404

`public/_redirects` covers 13 old URLs. 7 more keep their path. **27 return 404.** Of those, 12 are not deliberate removals:

**Legal and policy renames — must redirect, highest link-equity risk:**

| Old URL (live, returns 200 today) | Should map to |
|---|---|
| `/privacy-policy/` | `/privacy/` |
| `/terms-of-use/` | `/terms-and-conditions/` |
| `/dcma/` *(old site's misspelling)* | `/dmca/` |

**Content with intent, flagged "rewrite and publish later" in `remaining-live-content.csv` but not built:**

`/close-up-pics-answers-and-cheats-for-all-levels/`, `/adventure-capitalist-cheats-for-android-pc-and-ios/`, `/adventure-capitalist-support-code/`, `/best-gba-games-emulator-pokemon-roms-time/`, `/nintendo-switch-2-features-games-cost-and-more/`

**WordPress category archives:** `/code/`, `/featured/`, `/news-updates/`, `/uncategorized/`

The remaining 15 are correct removals — but should return `410 Gone` rather than a soft 404, so crawlers de-index them quickly instead of retrying for months.

There is a documentation conflict to settle: `MIGRATION.md` states "`public/_redirects` was removed" and "these routes were deleted instead of redirected", while the file exists and its own header argues the opposite. The file's reasoning is right; the doc is stale.

### 4.2 — P0 — Hostname mismatch between the build and the indexed site

The old site canonicalises to **`www.freetins.com`**; apex 301s to www. The new build canonicalises to the **apex**:

```
astro.config.mjs:12   site: 'https://freetins.com'
```

Every indexed URL, every backlink and every Search Console property is on `www`. Cutting over as configured stacks a **host migration on top of a platform migration** — two variables changing at once, which makes any ranking movement impossible to diagnose.

**Recommendation: keep `www` as canonical.** Set `site: 'https://www.freetins.com'`, 301 apex → www exactly as today, and let the platform swap be the only change. Revisit apex later as an isolated move, or not at all.

This is not a one-line change. There are **12 additional hardcoded `https://freetins.com` literals** that `site` does not control:

- `src/layouts/BaseLayout.astro` — 8 (JSON-LD `@id`, `url`, `publishingPrinciples`, `correctionsPolicy`, `SearchAction` template)
- `src/components/pages/RouteScreen.astro` — 2
- `src/components/pages/EditorialArticle.astro` — 1
- `src/data/articles/legal-pages.ts` — 1 (prose)

All 13 locations must move together or the JSON-LD will identify a different site than the canonical tag.

### 4.3 — P0 — The staging host is crawlable and is actively leaking signal today

This is causing damage right now, independent of any cutover decision.

- `https://freetins.pages.dev/robots.txt` → `User-agent: * / Allow: /`
- No `X-Robots-Tag: noindex` on any response
- Every page canonicals to `https://freetins.com/...`
- `https://freetins.com/codes/grow-a-garden/` → **`301 → https://www.freetins.com/`** — the path is discarded and the request lands on the old WordPress homepage

So a crawler reaching the staging site is told the preferred version of each page is a URL that redirects to an unrelated homepage. **Fix this today**, before and regardless of cutover: add `X-Robots-Tag: noindex` to the `pages.dev` hostname, and keep it after cutover so the two hostnames never compete.

### 4.4 — P1 — HSTS is dropped

The old site sends `strict-transport-security: max-age=15552000; includeSubDomains; preload`. The new build's `_headers` sends **no HSTS at all**.

`freetins.com` is **not** on the HSTS preload list (confirmed against `hstspreload.org` — status `unknown`), so no preload breakage will occur. But dropping HSTS is still a straight security regression against the site being replaced. One line in `public/_headers`:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Add `preload` only as a separate, deliberate decision.

### 4.5 — P1 — CSP blocks an in-page script on 19 pages

The `<script>` at `src/components/pages/EditorialArticle.astro:926` is emitted inline **658 bytes after `</html>`** and blocked by the build's own `script-src 'self'`.

- All 19 editorial pages log a CSP console error.
- `/answers/little-alchemy/` has visible breakage: an input labelled "Try life, metal or rain" above 580 cards. Typing `life` leaves **580 of 580** visible, counter frozen at "580 elements".

Move it into the bundled `src/scripts/site.ts`. Do not add `unsafe-inline`. The out-of-document placement is an HTML validity defect on its own.

### 4.6 — P2 — Navigation and contact defects

- **Desktop nav never shows an active state.** Trailing-slash mismatch in `src/layouts/partials/Header.astro:12-17`: `normalizedCurrentPath` strips the slash, `link.href` keeps it, so every item fails including home. `MobileDrawer.astro:16-20` normalises both sides and works — copy that.
- **No search entry point on desktop.** `SearchField` is on the homepage only; the header has no input and no `/search/` link, while the JSON-LD advertises a `SearchAction`.
- **Contact address disagrees three ways.** `/contact/` → `support@freetins.com`; `/submit/` → `hello@freetins.com`; Organization JSON-LD → `hello@freetins.com`.
- **Two of nine primary nav items are noindex dead ends.** `/alerts/` (53 words, "not active yet", its only CTA links to itself) and `/daily/` (91 words, 0 published).

### 4.7 — P2 — 29 dependency advisories, but read them correctly

`pnpm audit --prod`: 9 high, 14 moderate, 6 low. The honest professional read is that **most do not apply to this deployment**:

| Package | Count | Real exposure here |
|---|---:|---|
| `undici` | 14 | Node HTTP client used at **build time**. Not in the Worker runtime. |
| `astro` | 7 | XSS/SSRF. Patched only in Astro **6.x/7.x**; project is on **5.18.2**. |
| `ws` | 2 | Dev server only. |
| `sharp` | 1 | Build-time image processing of trusted local files. |
| `esbuild` | 1 | Advisory text is explicit: "when running the development server". |
| `@astrojs/cloudflare` | 1 | Image-service SSRF via redirect following. |

The Astro ones deserve genuine attention — but they require a **5 → 7 major upgrade**. Do not bundle that into the domain cutover. Ship the cutover on 5.18.2, then upgrade as its own change with its own verification pass.

---

## 5. Verification: your standard is right, and the data does not yet match it

You said it directly: *other sites use released developer codes; that should be the standard; we do not create these codes as non-developers, we only report them.*

That is correct, and it is already the intended model. `src/data/operations.ts` defines exactly the right distinction, and the comment in the source says it better than most editorial policies:

> A redeemed code is verified whatever the paper trail, and a code reposted by fifty blogs is still community-reported.

So the framework is right. The problem is that **the data does not currently execute it.**

### What the numbers show

Across the 12 game files — 133 codes:

| | |
|---|---:|
| Codes citing a **developer/publisher** source | **0** |
| Codes citing a **secondary aggregator** | **133 (100 %)** |
| Codes flagged `needs_human` | 50 (38 %) |
| Official channels declared | 18 |
| …of which flagged unconfirmed | **14 of 18** |
| Rendered code rows reading "Community reported, no publisher post found" | **48 of 48** |

The evidence hosts are: PocketGamer (22), Destructoid (19), PCGamesN (18), urgametips (15), Beebom (13), rocodes.gg (10), PocketTactics (7), Sportskeeda (7), ProGameGuides (6), GamesRadar (5), plus `driffle.com` (22) and `g2a.com` (8) — key resellers, not editorial sources — and `basketball-zero-codes.pages.dev` (3), an unattributed Pages site.

### Why this matters more than any other finding

The site's entire positioning is *"Evidence before freshness claims."* Right now that evidence chain terminates at the competitors it is positioned against, and at two storefronts. Every published code row tells the reader, in the site's own words, that no publisher post was found.

**One genuine credit:** the build does **not** publish those aggregator URLs as outbound links. Total outbound hosts across all 116 documents are Roblox, Apple, Google Play, Steam, Rockstar, littlealchemy.com, FTC, Copyright Office and similar — all primary. The aggregator URLs stay in the data layer as internal provenance. That was the right call and it avoids the worst version of this problem.

### The fix, in your terms

You are a reporter of publisher-released codes. So the evidence should be the publisher's release:

1. **Confirm the 18 declared official channels.** 14 carry notes like *"unconfirmed invite, verify before publish"* and *"place ID to be confirmed by the human loop"*. Confirming a Discord invite, an X handle and a Roblox place ID is roughly 20 minutes of work per game — about 4 hours for all 12.
2. **Re-source codes to the publisher post.** Where a Discord announcement or X post issued the code, cite that. `method: 'official-source'`, `result: 'accepted'`, `evidenceTier: 'publisher-confirmed'` — this is the normal, correct state for a reporting site, and it should be the majority state, not an aspiration.
3. **Keep aggregator citations as a genuine second tier.** A code that only ever appeared on PocketGamer is legitimately community-reported. Say so. That is not a weakness — it is the distinction that makes the first tier mean something.
4. **Stop treating `source-only` as a failure.** `INVENTORY.md` currently reads *"No code has been redemption-verified… the site's verification positioning is a stated method rather than a demonstrated one."* That framing sets an impossible bar — no competitor redeems every code either. Sourcing to the developer's own release **is** verification. Rewrite that risk note, and make `/how-we-verify/` say plainly: *we report codes the developer released; we cite the developer's post; we do not create codes.*
5. **Retire the two reseller domains** (`driffle.com`, `g2a.com`) and the unattributed `pages.dev` source from the evidence set entirely.

Do steps 1–2 for the 12 published games **before** cutover. That converts 48 of 48 "no publisher post found" chips into something that supports the headline claim on the day the domain changes hands.

---

## 6. Cutover plan

### 6.1 The good news about the mechanics

Both hostnames already resolve to Cloudflare:

```
freetins.com      → 104.21.27.206, 172.67.143.149  (Cloudflare)
www.freetins.com  → 104.21.27.206, 172.67.143.149  (Cloudflare)
```

The domain is already on Cloudflare nameservers. **There is no nameserver change, no registrar step and no 24–48 hour propagation window.** The cutover is a proxied-record change inside one dashboard, and rollback is the same change in reverse — minutes, not days.

### 6.2 Pre-cutover checklist

**Do today, regardless of the cutover date:**

- [ ] Add `X-Robots-Tag: noindex` to the `freetins.pages.dev` hostname (4.3)

**Blockers — cutover cannot proceed until these are closed:**

- [ ] Decide the canonical host. Recommendation: **`www.freetins.com`**
- [ ] Change `site:` in `astro.config.mjs` **and all 12 hardcoded literals** (4.2)
- [ ] Add the 3 legal-page redirects: `/privacy-policy/`, `/terms-of-use/`, `/dcma/` (4.1)
- [ ] Decide the 5 "publish later" URLs: publish, or 301 to the nearest live hub. Do not 404 them (4.1)
- [ ] Map the 4 WP category archives to hubs
- [ ] Return `410 Gone` for the 15 deliberate removals
- [ ] Add the HSTS header (4.4)
- [ ] Confirm official channels and re-source codes for the 12 published games (5)

**Should ship in the same release:**

- [ ] Move the editorial filter script out of the inline block (4.5)
- [ ] Fix `Header.astro` `isActive` trailing slashes (4.6)
- [ ] Add a desktop header search entry point (4.6)
- [ ] Unify the contact address across all three surfaces (4.6)

**Explicitly deferred — do not bundle:**

- Astro 5 → 7 upgrade (4.7)
- Apex-vs-www reconsideration
- Analytics/RUM instrumentation
- Little Alchemy pagination

### 6.3 Cutover day sequence

1. Verify the production build canonicalises to `www.freetins.com` on a preview deployment.
2. Snapshot the old site: full URL list, current rankings, Search Console coverage. You cannot measure the migration without a before.
3. Attach the custom domain to the Pages project in the Cloudflare dashboard.
4. Confirm apex → www still 301s with the path preserved.
5. Walk all 47 old URLs and assert the expected 301/410 — script it, do not spot-check.
6. Confirm `pages.dev` still returns `X-Robots-Tag: noindex`.
7. Submit the new sitemap in Search Console. Do **not** file a Change of Address — the hostname is unchanged, which is the point of keeping `www`.
8. Watch 404 logs daily for two weeks and add redirects for real inbound paths the sitemap did not list.

### 6.4 Timing

**Cut over 7–10 days from now**, mid-week, early in the day, with nothing else changing that week.

Sooner is wrong because the redirect map would lose the legal pages and five content URLs with real intent, and the verification chain would go live in a state that contradicts the site's own headline.

Later is wrong because the current arrangement is worse than either site: a crawlable staging deployment whose canonicals point at a redirect to an unrelated homepage. Every week that persists is a week of accumulating conflicting signals.

---

## 7. When to publish more content

**Freeze new content from now until two weeks after cutover.** Then resume on a verification-limited cadence.

### Why freeze

- **Attribution.** Publishing during a migration makes ranking movement undiagnosable. You will not know whether a change came from the platform, the redirects or the new pages.
- **The bottleneck is not page count.** 43 indexable pages at a 658-word median is a healthy corpus. 40 more game routes are already built and gated. Volume is not what is missing.
- **Publishing at the current evidence tier scales the weakness.** Every new code page today would add more rows reading "no publisher post found". Fix the tier first, then scale.

### The two weeks before cutover — do this instead of publishing

Confirm official channels and re-source codes for the **12 already-published games**. That is the highest-value editorial work available, it directly serves the standard you described, and it converts the site's headline claim from a stated method into a demonstrated one on the day the domain changes.

### After cutover: the resume schedule

| Window | Action |
|---|---|
| Cutover → +14 days | No new pages. Watch 404s, coverage, rankings. Add redirects as real traffic reveals gaps. |
| +14 to +30 days | Resume at **2–3 game pages per week**, publisher-sourced only. Un-gate from the 40 existing placeholders — no new routes. |
| +30 days | Review the tier ratio. If publisher-confirmed is holding above ~70 % of rows, raise to 4–5 per week. If not, the constraint is editorial capacity — hold the rate. |
| +60 days | Revisit the 5 deferred rewrites (`close-up-pics`, `adventure-capitalist`, `best-gba-games`, `nintendo-switch-2`) with their redirects already earning. |

**The governing rule: publish at the rate you can source from the publisher, not the rate you can fill a template.** 40 gated routes are an asset — a queue of pages that already know what they need. Un-gating one honestly is worth more than publishing five that repeat what every aggregator already says.

---

## Evidence

Measurements in this report come from: live HTTP probes of both hostnames; the old site's Rank Math sitemaps (`post`/`page`/`category`); a local `astro build` of the current working tree served via `wrangler pages dev`; instrumented Chromium across 45 page-viewport pairs; `pnpm audit --prod --json`; and direct parsing of the 12 files in `src/data/games/`.

Supporting artefacts: `PILLAR3-UX-AUDIT-2026-08-24.md`, `AUDIT-2026-08-24.md`, `output/audit/ux-pillar3*.json`, `output/audit/p3-*.png`.
