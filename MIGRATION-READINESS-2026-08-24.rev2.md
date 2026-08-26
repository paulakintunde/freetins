> **Dated audit, 24 August 2026.** This document predates the Confirmation Ledger (`docs/adr/0003-no-hand-typed-verification-claims.md`, `docs/adr/0004-every-article-gets-a-pass.md`). It is kept as evidence of a moment and is not updated; where it contradicts the ADRs, the ADRs govern.

# Freetins migration readiness audit

**Re-audit — 24 August 2026, 21:20.** Supersedes `MIGRATION-READINESS-2026-08-24.rev1.md`. Every figure below was re-measured against a clean rebuild of the current working tree; nothing is carried forward.

| | |
|---|---|
| Old site | `www.freetins.com` — WordPress + Rank Math, 47 sitemap URLs |
| New build | Astro 5.18.2 → Cloudflare Pages, clean build at `87860b2` + 2 modified files |
| Method | Live probes of both hosts, scripted 47-URL sweep against `wrangler pages dev`, instrumented Chromium across 45 page-viewport pairs, direct parse of 14 game data files |

---

## 1. Verdict

**Cut over in 3–5 days.** The blocking list from the previous revision is almost entirely closed. What remains is roughly an afternoon of engineering plus five hours of editorial.

Since the last review the team shipped the four fixes that were the substance of the earlier "not ready" verdict: the redirect map was completed, the canonical host moved to `www`, all hardcoded hostname literals were removed, and the CSP-blocked script was fixed. Those were the right four things.

Three defects remain. All were found by end-to-end sweeps rather than inspection, and all are narrow.

| Area | Status |
|---|---|
| Application quality | **Ready** |
| Redirect / gone map | **Near-ready** — 45 of 47 old URLs correct, 2 at wrong paths |
| Hostname configuration | **Ready** — with one build-process caveat |
| Sitemap integrity | **Not ready** — advertises 15 URLs that are not live pages |
| Security headers | **Near-ready** — HSTS still absent |
| Staging hygiene | **Not ready** — `pages.dev` still fully crawlable |
| Verification substantiation | **Regressing** — 91 of 91 code rows say "no publisher post found" |
| Content volume | **Ready** — 53 indexable pages, median 753 words |

---

## 2. What changed since the previous revision

Verified fixed, not claimed fixed.

| Previous finding | Status | Evidence |
|---|---|---|
| 27 of 47 old URLs returned 404 | **Fixed** | Sweep: 7×200, 25×301, 13×410, 2×404 |
| Legal pages `/privacy-policy/`, `/terms-of-use/`, `/dcma/` 404'd | **Fixed** | All three 301 to correct targets |
| Build canonicalised to apex; indexed site is `www` | **Fixed** | `site: 'https://www.freetins.com'`; 2,653 hostname references in HTML, all `www`, zero apex |
| 12 hardcoded `https://freetins.com` literals | **Fixed** | grep across `src/**/*.{astro,ts}` → **0** |
| CSP blocked an inline script on 19 pages | **Fixed** | 0 pages with a script after `</html>`; filter works — typing `life` cuts 580 cards to 15, live region reads "15 elements" |
| Desktop nav never showed an active state | **Fixed** | `aria-current="page"` renders on `/codes/` |
| No desktop search entry point | **Fixed** | Header now carries 1 input and 1 `/search/` link |
| Contact address disagreed three ways | **Fixed** | 10 `mailto:` instances, all `support@freetins.com` |
| Deliberate removals were soft 404s | **Fixed, and done well** | `src/data/gone.ts` + 15 server routes returning true `410 Gone`, with a test asserting the two stay in step |

The 410 implementation deserves specific credit. The file documents *why* 410 rather than 301 — "sending Rainmeter-skin traffic to a game-codes hub is a soft-404 pattern" — and *why* one route per path rather than a dynamic catch-all. That reasoning is correct, and it is the part of a migration most teams get wrong.

---

## 3. Issues the migration will FIX

### 3.1 Delivery

| | Old | New |
|---|---:|---:|
| Homepage transfer | 154,715 B | **42,610 B** (−72 %) |
| Third-party scripts | `stats.wp.com` | **0** |
| Rendering | PHP per request | Prerendered static at edge |

### 3.2 Security headers

The old site sends a bare `upgrade-insecure-requests` CSP. The new build sends `default-src 'self'`, `script-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, plus `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` and a nine-directive `Permissions-Policy`. One regression, in 5.3.

### 3.3 Content scope

15 URLs unrelated to game help — seven Rainmeter desktop skins, an APK sideloader, iOS emulators for Windows, iPhone secret codes, Craigslist alternatives, an ambigram generator, a JW Player downloader, an adblock comparison, "what is coding" — removed and correctly returned as `410 Gone`.

### 3.4 Placeholder discipline

38 game routes exist without published codes. All 38 are `noindex, nofollow`, and **zero are linked from `/codes/` or `/games/`** — both hubs link only to the 14 pages with real data. Each states its own gate condition plainly.

### 3.5 Accessibility

45 page-viewport pairs (320 / 360 / 768 / 1280 / 1440 × 9 routes):

| | Result |
|---|---:|
| Text-contrast failures | **0** |
| Sub-12 px text | **0** |
| Horizontal overflow | **0** |
| Targets below 24×24 | **1** — an inline link inside a sentence, exempt under WCAG 2.2 SC 2.5.8's inline exception |

### 3.6 Search

The old site has WordPress default search. The new build returns real results plus distinct no-match and empty states.

---

## 4. Issues the migration will IMPROVE

### 4.1 Content depth

53 indexable pages, **62,065 words**, median **753**, 24 pages over 1,000 words, only 4 under 300 — all author bios, which is normal. Up from 43 pages / 34,187 words / 658 median. The corpus roughly doubled while staying clean.

### 4.2 Editorial trust surface

`/how-we-verify/` at 2,483 words, four named author profiles, an evidence-tier chip on every code row. Capped by what those chips say — section 6.

### 4.3 Outbound linking

31 outbound hosts across 121 documents, essentially all primary: Roblox, Nintendo, Rockstar, Steam, Apple, Google Play, EA Help, Larian forums, RetroArch, mGBA, FTC, Copyright Office. A genuine strength, and the opposite of the old site's pattern.

### 4.4 Structured data

`Organization` + `WebSite` + `WebPage` JSON-LD with `publishingPrinciples` and `correctionsPolicy`, now consistently on `www`.

---

## 5. Issues STILL PRESENT

### 5.1 — P0 — The sitemap advertises 15 URLs that are not live pages

The sitemap contains **68 URLs**; the build has **53 indexable pages**. The 15 extras are precisely the deliberate removals:

```
/amd-ryzen-rainmeter-skin-setup/           /cowan-clock-for-rainmeter/
/jarvis-iron-man-a-blue-rainmeter-.../     /jarvis-shield-interface-.../
/kurugin-rainmeter-skin/                   /monstercat-visualizer-.../
/visbubble-round-visualizer-.../           /blackmart-alpha-apk-.../
/tech-guides/ios-emulators-windows/        /tech-guides/iphone-secret-codes/
/alternative-websites-like-craigslist.../  /ambigram-generator-examples/
/download-jw-player-videos-high-quality/   /adblock-vs-adblock-plus-.../
/what-is-coding-learn-computing-programming/
```

Submitting this on day one generates 15 immediate Search Console errors on a brand-new property.

**Cause:** `astro.config.mjs` builds `excludedFromSitemap` from `routeDefinitions.filter(r => r.noindex)`. The gone routes live in `src/data/gone.ts`, not `routes.ts`, so the filter never sees them.

**Fix — one line:**

```js
import { goneRoutes } from './src/data/gone.ts';

const excludedFromSitemap = new Set([
  '/internal/',
  ...goneRoutes,
  ...routeDefinitions.filter((route) => route.noindex).map((route) => route.path),
]);
```

### 5.2 — P0 — Two real legacy URLs 404 because the gone routes use invented paths

The 47-URL sweep returned **2 × 404**:

| Real old URL (returns 200 today) | What `gone.ts` created instead |
|---|---|
| `/best-ios-emulator-for-windows-pc-that-runs-apple-store-apps/` | `/tech-guides/ios-emulators-windows/` |
| `/best-iphone-secret-codes-to-unlock-hidden-features-and-settings/` | `/tech-guides/iphone-secret-codes/` |

The `/tech-guides/` paths **never existed on the old site**. So the two URLs that actually carry history return a 404 crawlers will retry for months, while two invented paths return a tidy 410 nobody will ever request — and, per 5.1, are advertised in the sitemap.

Rename both entries in `gone.ts` and their route directories to the real paths. `test/gone.test.ts` already asserts the two stay in step, so it will catch the rename.

### 5.3 — P1 — HSTS is still dropped

| | |
|---|---|
| Old site | `strict-transport-security: max-age=15552000; includeSubDomains; preload` |
| New build `_headers` | **absent** |

`freetins.com` is **not** on the HSTS preload list (confirmed via `hstspreload.org` — status `unknown`), so nothing breaks. But it is a straight regression against the site being replaced. One line in `public/_headers`:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Add `preload` only as a separate, deliberate decision.

### 5.4 — P1 — The staging host is still fully crawlable

- `https://freetins.pages.dev/robots.txt` → `User-agent: * / Allow: /`
- No `X-Robots-Tag` on any response
- The deployed build still canonicals to apex `freetins.com/...`, which 301s to `https://www.freetins.com/` **discarding the path**

This is causing damage now, independent of the cutover. Add `X-Robots-Tag: noindex` to the `pages.dev` hostname today and keep it after cutover so the two hostnames never compete.

### 5.5 — P1 — Incremental builds emit the wrong hostname

During this audit an incremental `astro build` produced canonical, `og:url`, JSON-LD `@id` and sitemap entries on the **apex** host, despite `astro.config.mjs` reading `site: 'https://www.freetins.com'`. Only after `rm -rf dist .astro` did output switch to `www` — then consistently, across all 2,653 references.

If CI performs an incremental build, **the cutover deploy can ship the wrong canonical host** — the exact defect this migration exists to close. Make the production build a clean build, and assert the canonical host in a post-build check before publishing.

### 5.6 — P2 — Two redirects point at hubs when exact pages now exist

| Old URL | Redirects to | Better target (200) |
|---|---|---|
| `/best-gba-games-emulator-pokemon-roms-time/` | `/guides/` | `/guides/best-gba-games/` |

`/guides/best-gba-emulators/` also now exists. A hub redirect where an exact match is available is a weaker relevance signal than a 1:1 map. Three others still legitimately point at hubs because their targets are unbuilt — `/close-up-pics-.../`, both `/adventure-capitalist-.../`, `/nintendo-switch-2-.../`.

### 5.7 — P2 — Category archives redirect to the homepage

`/featured/`, `/news-updates/` and `/uncategorized/` all 301 to `/`. Google treats an irrelevant redirect as a soft 404. `/uncategorized/` should be `410 Gone` — a WordPress artefact with no successor.

### 5.8 — P2 — Two of nine primary nav items are noindex dead ends

`/alerts/` (53 words, "not active yet", its only CTA links to itself) and `/daily/` (0 published links). Demote to the footer until they do something.

### 5.9 — P2 — 29 dependency advisories, read correctly

`pnpm audit --prod`: 9 high, 14 moderate, 6 low. Most do not apply to this deployment.

| Package | Count | Real exposure |
|---|---:|---|
| `undici` | 14 | Node HTTP client, **build time only**. Not in the Worker runtime. |
| `astro` | 7 | XSS/SSRF. Patched only in Astro **6.x/7.x**; project is on **5.18.2**. |
| `ws` | 2 | Dev server only. |
| `sharp` | 1 | Build-time processing of trusted local images. |
| `esbuild` | 1 | Advisory text is explicit: "when running the development server". |
| `@astrojs/cloudflare` | 1 | Image-service SSRF via redirect following. |

The Astro ones are real but need a **5 → 7 major upgrade**. Ship the cutover on 5.18.2 and upgrade separately with its own verification pass.

### 5.10 — P3 — One structurally heavy page

`/answers/little-alchemy/` — 3,402 words, 628 headings, 656 focusable elements in one document. A screen-reader heading list returns 628 entries. Section or paginate. The working filter mitigates but does not remove this.

---

## 6. Verification: the gap is widening

Your standard is correct, and the code already agrees with it. `src/data/operations.ts` draws exactly the right distinction:

> A redeemed code is verified whatever the paper trail, and a code reposted by fifty blogs is still community-reported.

The framework is right. **The data is moving away from it, not toward it.**

| | Previous | **Now** | |
|---|---:|---:|---|
| Total codes | 133 | **192** | ▲ +44 % |
| Codes citing a **developer/publisher** source | 0 | **0** | — |
| Codes citing a secondary aggregator | 133 (100 %) | **192 (100 %)** | — |
| Rendered rows reading "no publisher post found" | 48 | **91** | ▲ +90 % |
| Codes flagged `needs_human` | 50 (38 %) | **93 (48 %)** | ▲ worse |
| Codes with no `confidence` value at all | 0 | **59** | ▲ new |
| Official channels declared | 18 | 21 | ▲ |
| …still flagged unconfirmed | 14 | **14** | — |

Evidence hosts, top of list: GamesRadar (49), PocketGamer (23), **driffle.com (22)**, ProGameGuides (19), Destructoid (19), PCGamesN (18), urgametips (15), Beebom (13), rocodes.gg (10), **g2a.com (8)**, plus `basketball-zero-codes.pages.dev` (3), an unattributed Pages site.

`driffle.com` and `g2a.com` are game-key resellers, not editorial sources. Thirty codes rest on them.

**Why this now matters most.** Content volume nearly doubled; publisher-sourced codes went from zero to zero. The most recently added game — Shindo Life, 46 codes — carries **38 flagged for human review**, and 59 codes across the set now ship with no `confidence` value. The site's banner reads *"Evidence before freshness claims."* Every one of the 91 published rows tells the reader, in the site's own words, that no publisher post was found. Cutting over puts that contradiction on the brand's permanent address.

**One real credit:** the build does not publish those aggregator URLs as outbound links. They stay in the data layer as internal provenance, and the 31 outbound hosts are all primary. That was the right call and avoids the worst version of this problem.

### The fix, in your terms

You report publisher-released codes. You do not create them. So the evidence should be the publisher's release.

1. **Confirm the 21 declared official channels.** 14 still read *"unconfirmed invite, verify before publish"* or *"place ID to be confirmed by the human loop"*. A Discord invite, an X handle and a Roblox place ID is ~20 minutes per game — about **5 hours for all 14**.
2. **Re-source codes to the publisher post.** `method: 'official-source'`, `result: 'accepted'`, `evidenceTier: 'publisher-confirmed'`. This is the normal state for a reporting site, not an aspiration.
3. **Keep aggregator citations as a genuine second tier.** A code that only ever appeared on PocketGamer *is* community-reported. Saying so is what makes the first tier mean anything.
4. **Backfill the 59 codes with no `confidence`** and extend the build validator so a code cannot publish without one. It already validates `result` and `method`.
5. **Stop treating `source-only` as failure.** `INVENTORY.md` reads *"the site's verification positioning is a stated method rather than a demonstrated one."* That sets a bar no competitor clears either — nobody redeems every code. Sourcing to the developer's own release **is** verification. Rewrite that note, and make `/how-we-verify/` say plainly: *we report codes the developer released, we cite the developer's post, and we do not create codes.*
6. **Drop the two reseller domains and the unattributed `pages.dev` source** from the evidence set.

Steps 1–2 for the 14 published games is the highest-value work available before cutover.

---

## 7. Cutover plan

### 7.1 Mechanics

Both hostnames already resolve to Cloudflare:

```
freetins.com      → 104.21.27.206, 172.67.143.149
www.freetins.com  → 104.21.27.206, 172.67.143.149
```

Already on Cloudflare nameservers. **No registrar step, no nameserver change, no propagation window.** The cutover is a proxied-record change in one dashboard; rollback is the same change reversed — minutes, not days. Keeping `www` means Search Console needs no Change of Address.

### 7.2 Checklist

**Today, regardless of cutover date**

- [ ] `X-Robots-Tag: noindex` on the `freetins.pages.dev` hostname (5.4)

**Blockers**

- [ ] Exclude `goneRoutes` from the sitemap — one line in `astro.config.mjs` (5.1)
- [ ] Rename the two `/tech-guides/` gone routes to the real legacy paths (5.2)
- [ ] Add the HSTS header (5.3)
- [ ] Make the production deploy a **clean** build; assert canonical host post-build (5.5)

**Same release**

- [ ] Point `/best-gba-games-emulator-pokemon-roms-time/` at `/guides/best-gba-games/` (5.6)
- [ ] `410` for `/uncategorized/` (5.7)
- [ ] Confirm official channels and re-source codes for the 14 published games (6)

**Explicitly deferred — do not bundle**

Astro 5 → 7 upgrade (5.9) · Little Alchemy pagination (5.10) · analytics instrumentation · demoting `/alerts/` and `/daily/` (5.8)

### 7.3 Cutover day

1. Clean build. Assert canonical, `og:url`, JSON-LD `@id` and sitemap all read `www.freetins.com`.
2. Snapshot the old site — URL list, rankings, Search Console coverage. You cannot measure a migration without a before.
3. Attach the custom domain to the Pages project.
4. Confirm apex → www still 301s **with the path preserved**.
5. Re-run the 47-URL sweep against production. Expect 7×200, 25×301, 15×410, **0×404**. Script it; do not spot-check.
6. Confirm `pages.dev` still returns `X-Robots-Tag: noindex`.
7. Submit the sitemap. No Change of Address — the hostname is unchanged, which is the point of keeping `www`.
8. Watch 404 logs daily for two weeks; add redirects for real inbound paths the sitemap never listed.

### 7.4 Timing

**Cut over 3–5 days from now**, mid-week, early in the day, with nothing else shipping that week.

Sooner risks shipping a sitemap full of 410s. Later is worse than either site: a crawlable staging deployment whose canonicals resolve to a redirect that discards the path. Every week that persists accumulates conflicting signals.

---

## 8. When to publish more content

**Freeze now. Resume two weeks after cutover.**

### Why

- **The last content push made the verification gap worse.** Codes rose 44 %, publisher-sourced stayed at zero, `needs_human` went 38 % → 48 %, and 59 codes shipped with no `confidence` value. That is scaling a weakness.
- **Attribution.** Publishing during a migration makes ranking movement undiagnosable — platform, redirects or new pages, you will not be able to tell.
- **Volume is not the bottleneck.** 53 indexable pages at a 753-word median with 24 over 1,000 words is healthy. 38 more game routes are built and correctly gated.

### Before cutover

Confirm official channels and re-source codes for the **14 published games**. It directly serves the standard you described and converts the headline claim from stated to demonstrated on the day the domain changes hands.

### Resume schedule

| Window | Action |
|---|---|
| Cutover → +14 days | No new pages. Watch 404s, coverage, rankings. Add redirects as real traffic reveals gaps. |
| +14 to +30 days | **2–3 game pages per week**, publisher-sourced only. Un-gate from the 38 existing placeholders — no new routes. |
| +30 days | Review the tier ratio. Above ~70 % publisher-confirmed, raise to 4–5 per week. Below, hold — the constraint is editorial capacity, not template capacity. |
| +60 days | Revisit the deferred rewrites with their redirects already earning, and upgrade each hub redirect to a 1:1 map. |

**Governing rule: publish at the rate you can source from the publisher, not the rate you can fill a template.** The 38 gated routes are an asset — a queue that already knows what it needs. Un-gating one honestly beats publishing five that repeat what every aggregator already says.

---

## Evidence

Live HTTP probes of `www.freetins.com` and `freetins.pages.dev`; the old site's Rank Math `post`/`page`/`category` sitemaps; a clean `astro build` served via `wrangler pages dev`; a scripted 47-URL sweep; instrumented Chromium across 45 page-viewport pairs; `pnpm audit --prod`; direct parse of the 14 files in `src/data/games/`; `hstspreload.org` status API.

Artefacts: `output/audit/ux-pillar3-local.json`, `output/audit/p3-*.png`, `PILLAR3-UX-AUDIT-2026-08-24.md`, `MIGRATION-READINESS-2026-08-24.rev1.md`.
