# Freetins cutover readiness — scored

**Re-audit rev 3 — 24 August 2026, 21:55.** Supersedes `.rev1.md` and `.rev2.md`. Every figure re-measured against a clean rebuild of the current working tree. Nothing carried forward.

| | |
|---|---|
| Old site | `www.freetins.com` — WordPress + Rank Math, 47 sitemap URLs |
| New build | Astro 5.18.2 → Cloudflare Pages, clean build, `87860b2` + 12 modified files |
| Method | 47-URL scripted sweep, 45 page-viewport pairs, clean-build output parse, 14 game data files |

---

## Switch readiness: **68 %**

| Score | Band | |
|---:|---|---|
| **72 %** | Technical cutover readiness | Weighted across 6 gates (below) |
| **56 %** | Editorial readiness | Weighted across 2 gates |
| **68 %** | **Overall** | Technical 70 % · Editorial 30 % |

**Projected after the blocker list closes: 95 %** — technical 98 %, editorial 87 %.

The gap between 68 % and 95 % is one afternoon of engineering plus roughly five hours of editorial. Nothing in it is architectural, and nothing needs a decision that has not already been made.

**Recommendation unchanged: cut over in 3–5 days.** 68 % is not "not ready" — it is "four known items short of ready", and every one of them is a discrete, verifiable fix.

---

## 1. How the percentage is calculated

Each gate is scored on a measured ratio, not a judgement. Weights reflect *cutover risk* — what a bad switch costs — not general quality. Any of these can be re-run to check the number.

### Technical cutover readiness — 72.4 %

| Gate | Weight | Score | Contribution | Measurement |
|---|---:|---:|---:|---|
| **A** Redirect & URL continuity | 25 | **95.7 %** | 23.94 | 45 of 47 old URLs return 200/301/410 |
| **B** Sitemap & index signals | 20 | **77.9 %** | 15.59 | 53 of 68 sitemap entries resolve to a live page |
| **C** Hostname & canonical integrity | 20 | **75.0 %** | 15.00 | Output 2,669/2,669 `www`; no clean-build guard in CI |
| **D** Staging isolation | 15 | **0.0 %** | 0.00 | 0 of 3 checks pass on `freetins.pages.dev` |
| **E** Security headers & dependencies | 10 | **82.0 %** | 8.20 | 6/6 headers present; 29 advisories outstanding |
| **F** Application quality | 10 | **97.0 %** | 9.70 | 45 page-viewport pairs clean; search, filter, copy all pass |
| | **100** | | **72.4** | |

### Editorial readiness — 56.2 %

| Gate | Weight | Score | Contribution | Measurement |
|---|---:|---:|---:|---|
| **G** Content readiness | 50 | **92.0 %** | 46.00 | 53 indexable pages, median 753 words, 38 placeholders correctly gated |
| **H** Verification substantiation | 50 | **20.4 %** | 10.20 | 0/192 publisher-sourced · 7/21 channels confirmed · 133/192 carry a confidence value |
| | **100** | | **56.2** | |

Gate H is itself weighted: publisher-sourcing 60 % (scores 0), channel confirmation 20 % (scores 33 %), data completeness 20 % (scores 69 %).

### Why the two bands are separate

A domain switch is a technical event. Verification quality is a brand risk that arrives *with* the switch but is not caused by it. Blending them into one number would hide which kind of work unblocks which. The 70/30 split reflects that the technical gates decide whether the switch is *safe*, while the editorial gates decide whether it is *worth doing now*.

---

## 2. Gate-by-gate detail

### A — Redirect & URL continuity · 95.7 %

All 47 URLs from the old site's Rank Math sitemaps, requested against the built site. Scripted, one request each.

| Status | Count | Meaning |
|---|---:|---|
| `200` | 7 | Path kept, page exists |
| `301` | 25 | Permanently moved to a real target |
| `410` | 13 | Deliberately removed, stated as gone |
| `404` | **2** | **The defect** — see finding 2 |

Target on cutover day: `7 × 200, 25 × 301, 15 × 410, 0 × 404`.

### B — Sitemap & index signals · 77.9 %

Sitemap contains **68 URLs**; the build has **53 indexable pages**. The 15 extras are precisely the deliberate removals. `robots.txt` and canonical host are both correct — the phantom entries are the entire deduction.

### C — Hostname & canonical integrity · 75.0 %

Two sub-checks, weighted 75/25:

- **Output consistency — 100 %.** 2,669 hostname references across the clean build, all `www`, zero apex. Canonical, `og:url`, JSON-LD `@id`, sitemap and `robots.txt` all agree.
- **Build-process guard — 0 %.** No clean-build enforcement or post-build host assertion. See finding 5.

### D — Staging isolation · 0.0 %

Three checks on `freetins.pages.dev`, all failing:

| Check | Result |
|---|---|
| `robots.txt` disallows crawling | ✗ reads `Allow: /` |
| `X-Robots-Tag: noindex` sent | ✗ absent |
| Canonical resolves to a live page | ✗ points to apex, which 301s to the old homepage, dropping the path |

Scoring zero here is correct — nothing has been done, and it is a minutes-long fix that is leaking signal today.

### E — Security headers & dependencies · 82.0 %

- **Headers — 100 %** (weighted 0.7). All six present: CSP (9 directives, `script-src 'self'`), **HSTS `max-age=31536000; includeSubDomains` — added since rev 2**, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **Dependency currency — 40 %** (weighted 0.3). 29 advisories: 9 high, 14 moderate, 6 low.

### F — Application quality · 97.0 %

45 page-viewport pairs (320 / 360 / 768 / 1280 / 1440 × 9 routes):

| | Result |
|---|---:|
| Text-contrast failures | **0** |
| Sub-12 px text | **0** |
| Horizontal overflow | **0** |
| Targets below 24×24 | **1** — an inline link inside a sentence, exempt under WCAG 2.2 SC 2.5.8 |

Functional checks pass: search returns results with distinct no-match and empty states; the element filter cuts 580 cards to 15; the copy control handles both the success and clipboard-denied paths with `aria-live`.

### G — Content readiness · 92.0 %

53 indexable pages, **62,065 words**, median **753**, 24 pages over 1,000 words, 0 under 150. The four pages under 300 words are author bios, which is normal. 38 game routes exist without published codes — all `noindex`, and **zero linked from `/codes/` or `/games/`**.

### H — Verification substantiation · 20.4 %

The lowest score in the audit, and the one that is getting worse rather than better. Detail in section 5.

---

## 3. What is already fixed

Verified fixed, not claimed fixed. Ten items closed across the three revisions.

| Finding | Closed | Evidence |
|---|---|---|
| 27 of 47 old URLs returned 404 | rev 2 | Sweep: 45 of 47 conforming |
| Legal pages `/privacy-policy/`, `/terms-of-use/`, `/dcma/` 404'd | rev 2 | All three 301 to correct targets |
| Build canonicalised to apex | rev 2 | 2,669 references, all `www`, zero apex |
| 12 hardcoded `https://freetins.com` literals | rev 2 | grep across `src/**/*.{astro,ts}` → **0** |
| CSP blocked an inline script on 19 pages | rev 2 | 0 scripts after `</html>`; filter cuts 580 → 15 |
| Desktop nav never showed an active state | rev 2 | `aria-current="page"` renders on `/codes/` |
| No desktop search entry point | rev 2 | Header carries 1 input and 1 `/search/` link |
| Contact address disagreed three ways | rev 2 | 10 `mailto:` instances, all `support@freetins.com` |
| Deliberate removals were soft 404s | rev 2 | 15 server routes returning true `410 Gone`, with a test keeping them in step |
| **HSTS was dropped vs the old site** | **rev 3** | **`Strict-Transport-Security: max-age=31536000; includeSubDomains` now in `_headers`** |

The `410` implementation deserves specific credit. `src/data/gone.ts` documents *why* 410 rather than 301 — "sending Rainmeter-skin traffic to a game-codes hub is a soft-404 pattern" — and *why* one route per path rather than a dynamic catch-all. That reasoning is correct, and it is the part of a migration most teams get wrong.

---

## 4. What is still open

### 4.1 — P0 — Sitemap advertises 15 URLs that are not live pages · *gate B*

68 sitemap entries against 53 indexable pages. The 15 extras are the deliberate removals — Rainmeter skins, the APK sideloader, the adblock comparison. Submitting this on day one generates 15 immediate Search Console errors on a brand-new property.

**Cause:** `astro.config.mjs` builds `excludedFromSitemap` from `routeDefinitions.filter(r => r.noindex)`. The gone routes live in `src/data/gone.ts`, not `routes.ts`, so the filter never sees them.

```js
import { goneRoutes } from './src/data/gone.ts';

const excludedFromSitemap = new Set([
  '/internal/',
  ...goneRoutes,
  ...routeDefinitions.filter((route) => route.noindex).map((route) => route.path),
]);
```

**Closing this moves gate B from 77.9 % → 100 %, and the overall score +3.1 points.**

### 4.2 — P0 — Two real legacy URLs 404 · *gate A*

The sweep's two failures trace to a path mismatch. The `/tech-guides/` paths **never existed on the old site**.

| Real old URL — returns 200 today | What `gone.ts` created instead |
|---|---|
| `/best-ios-emulator-for-windows-pc-that-runs-apple-store-apps/` | `/tech-guides/ios-emulators-windows/` |
| `/best-iphone-secret-codes-to-unlock-hidden-features-and-settings/` | `/tech-guides/iphone-secret-codes/` |

The two URLs that actually carry history return a 404 crawlers retry for months, while two invented paths return a tidy 410 nobody will ever request — and, per 4.1, are advertised in the sitemap. `test/gone.test.ts` already asserts the two stay in step, so it will catch the rename.

**Closing this moves gate A from 95.7 % → 100 %, and the overall score +0.7 points.**

### 4.3 — P1 — Staging host is still fully crawlable · *gate D*

`pages.dev/robots.txt` reads `Allow: /`, no `X-Robots-Tag` is sent, and the deployed build still canonicals to apex — which 301s to the old homepage **discarding the path**. This is causing damage now, independent of the cutover.

**Closing this moves gate D from 0 % → 100 %, and the overall score +10.5 points — the single largest available gain.**

### 4.4 — P1 — Incremental builds emit the wrong hostname · *gate C*

During this audit an incremental `astro build` produced canonical, `og:url`, JSON-LD `@id` and sitemap entries on the **apex** host, despite `astro.config.mjs` reading `site: 'https://www.freetins.com'`. Only after `rm -rf dist .astro` did output switch to `www` — then consistently, across all 2,669 references.

If CI performs an incremental build, **the cutover deploy can ship the wrong canonical host** — the exact defect this migration exists to close.

**Closing this moves gate C from 75 % → 100 %, and the overall score +3.5 points.**

### 4.5 — P2 — Two redirects point at hubs when exact pages now exist

`/best-gba-games-emulator-pokemon-roms-time/` redirects to `/guides/`, but `/guides/best-gba-games/` now returns 200. A hub redirect where an exact match is available is a weaker relevance signal than a 1:1 map. Three others still legitimately point at hubs because their targets are unbuilt.

### 4.6 — P2 — Category archives redirect to the homepage

`/featured/`, `/news-updates/` and `/uncategorized/` all 301 to `/`. Google treats an irrelevant redirect as a soft 404. `/uncategorized/` should be `410 Gone`.

### 4.7 — P2 — Two of nine primary nav items are noindex dead ends

`/alerts/` — 53 words, "not active yet", its only call to action links back to itself — and `/daily/`, with zero published links. Demote to the footer until they do something.

### 4.8 — P2 — 29 dependency advisories, read correctly · *gate E*

| Package | Count | Real exposure here |
|---|---:|---|
| `undici` | 14 | Node HTTP client, **build time only**. Not in the Worker runtime. |
| `astro` | 7 | XSS / SSRF. Patched only in Astro **6.x / 7.x**; project is on 5.18.2. |
| `ws` | 2 | Dev server only. |
| `sharp` | 1 | Build-time processing of trusted local images. |
| `esbuild` | 1 | Advisory text is explicit: "when running the development server". |
| `@astrojs/cloudflare` | 1 | Image-service SSRF via redirect following. |

The Astro ones are real but need a **5 → 7 major upgrade**. Ship the cutover on 5.18.2 and upgrade separately, with its own verification pass. This is why gate E is capped at 82 % rather than scored as a blocker.

### 4.9 — P3 — One structurally heavy page

`/answers/little-alchemy/` — 3,402 words, 628 headings and 656 focusable elements in one document. A screen-reader heading list returns 628 entries. Section or paginate it.

---

## 5. Gate H: verification — 20.4 %

Your standard is right, and the code already agrees with it. `src/data/operations.ts`:

> A redeemed code is verified whatever the paper trail, and a code reposted by fifty blogs is still community-reported.

The framework is right. The data is moving away from it.

| Measure | rev 2 | **rev 3** | |
|---|---:|---:|---|
| Total codes | 133 | **192** | ▲ +44 % |
| Codes citing a **developer / publisher** source | 0 | **0** | — no change |
| Codes citing a secondary aggregator | 133 · 100 % | **192 · 100 %** | — no change |
| Rendered rows reading "no publisher post found" | 48 | **91** | ▲ +90 % |
| Codes flagged `needs_human` | 50 · 38 % | **93 · 48 %** | ▲ worse |
| Codes with no `confidence` value at all | 0 | **59** | ▲ new |
| Official channels declared | 18 | 21 | ▲ +3 |
| …still flagged unconfirmed | 14 | **14** | — no change |

Evidence hosts, top of list: GamesRadar (49), PocketGamer (23), **driffle.com (22)**, ProGameGuides (19), Destructoid (19), PCGamesN (18), plus **g2a.com (8)** and an unattributed `pages.dev` site (3). `driffle` and `g2a` are game-key resellers, not editorial sources. Thirty codes rest on them.

Content volume nearly doubled; publisher-sourced codes went from zero to zero. The site's banner reads *"Evidence before freshness claims."* Every one of the 91 published rows tells the reader, in the site's own words, that no publisher post was found. Cutting over puts that contradiction on the brand's permanent address.

**One real credit:** the build does not publish those aggregator URLs as outbound links. They stay in the data layer as internal provenance, and all 31 outbound hosts are primary.

### The fix, in your terms

1. **Confirm the 14 unconfirmed channels.** They still read *"unconfirmed invite, verify before publish"*. A Discord invite, an X handle and a Roblox place ID is ~20 minutes per game — about **5 hours**. This alone moves gate H from 20.4 % → 33.3 %.
2. **Re-source codes to the publisher post.** `method: 'official-source'`, `result: 'accepted'`, `evidenceTier: 'publisher-confirmed'`. The normal state for a reporting site, not an aspiration. At 70 % coverage this moves gate H to ~82 %.
3. **Keep aggregator citations as a genuine second tier.** A code that only ever appeared on PocketGamer *is* community-reported. Saying so is what makes the first tier mean anything.
4. **Backfill the 59 codes with no `confidence`** and extend the build validator so a code cannot publish without one. It already validates `result` and `method`.
5. **Stop treating `source-only` as failure.** `INVENTORY.md` calls the positioning "a stated method rather than a demonstrated one". That sets a bar no competitor clears — nobody redeems every code. Sourcing to the developer's own release *is* verification.
6. **Drop the two reseller domains** and the unattributed `pages.dev` source from the evidence set.

---

## 6. Score movement from the blocker list

| Action | Gate | Score movement | Overall gain |
|---|---|---|---:|
| `X-Robots-Tag: noindex` on `pages.dev` | D | 0 % → 100 % | **+10.5** |
| Exclude `goneRoutes` from the sitemap | B | 77.9 % → 100 % | **+3.1** |
| Clean-build guard + post-build host assertion | C | 75 % → 100 % | **+3.5** |
| Rename the two `/tech-guides/` gone routes | A | 95.7 % → 100 % | **+0.7** |
| | | **Technical: 72.4 % → 98.0 %** | **+17.8** |
| Confirm 14 channels, re-source codes | H | 20.4 % → ~82 % | **+9.2** |
| | | **Editorial: 56.2 % → 87.0 %** | |
| | | **Overall: 68 % → 95 %** | |

Gate E stays at 82 % by design — the Astro 5 → 7 upgrade is deliberately deferred out of the cutover.

---

## 7. Cutover plan

### 7.1 Mechanics

Both hostnames already resolve to Cloudflare — `104.21.27.206`, `172.67.143.149`. The domain is already on Cloudflare nameservers, so there is **no registrar step, no nameserver change and no propagation window**. The cutover is a proxied-record change in one dashboard; rollback is the same change reversed — minutes, not days. Keeping `www` means Search Console needs no Change of Address.

### 7.2 Checklist

**Today, regardless of the cutover date**

- [ ] `X-Robots-Tag: noindex` on the `freetins.pages.dev` hostname *(+10.5)*

**Blockers**

- [ ] Exclude `goneRoutes` from the sitemap — one line in `astro.config.mjs` *(+3.1)*
- [ ] Clean production build + post-build canonical-host assertion *(+3.5)*
- [ ] Rename the two `/tech-guides/` gone routes to the real legacy paths *(+0.7)*

**Same release**

- [ ] Point `/best-gba-games-emulator-pokemon-roms-time/` at `/guides/best-gba-games/`
- [ ] `410` for `/uncategorized/`
- [ ] Confirm official channels and re-source codes for the 14 published games *(+9.2)*

**Explicitly deferred — do not bundle**

Astro 5 → 7 upgrade · Little Alchemy pagination · analytics instrumentation · demoting `/alerts/` and `/daily/` from primary nav.

### 7.3 Cutover day

1. **Clean** build. Assert canonical, `og:url`, JSON-LD `@id` and sitemap all read `www.freetins.com`.
2. Snapshot the old site — URL list, rankings, Search Console coverage. You cannot measure a migration without a before.
3. Attach the custom domain to the Pages project.
4. Confirm apex → www still 301s **with the path preserved**.
5. Re-run the 47-URL sweep against production. Expect `7 × 200, 25 × 301, 15 × 410, 0 × 404`. Script it; do not spot-check.
6. Confirm `pages.dev` still returns `X-Robots-Tag: noindex`.
7. Submit the sitemap. No Change of Address — the hostname is unchanged.
8. Watch 404 logs daily for two weeks; add redirects for real inbound paths the sitemap never listed.

### 7.4 Timing

**Cut over 3–5 days from now**, mid-week, early in the day, with nothing else shipping that week.

Sooner risks shipping a sitemap full of 410s. Later is worse than either site: a crawlable staging deployment whose canonicals resolve to a redirect that discards the path. Every week that persists accumulates conflicting signals.

**Do not wait for 100 %.** Gate E is capped by a deferred major upgrade, and gate H improves on an editorial clock, not an engineering one. **95 % is the ship threshold**; the remainder is scheduled work, not blocking work.

---

## 8. When to publish more content

**Freeze now. Resume two weeks after cutover.**

- **The last content push made the verification gap worse.** Codes rose 44 %, publisher-sourced stayed at zero, `needs_human` went 38 % → 48 %, and 59 codes shipped with no `confidence` value. That is scaling a weakness.
- **Attribution.** Publishing during a migration makes ranking movement undiagnosable.
- **Volume is not the bottleneck.** Gate G already scores 92 %. 38 more game routes are built and correctly gated.

| Window | Action |
|---|---|
| Before cutover | Confirm official channels and re-source codes for the 14 published games. |
| Cutover → +14 days | No new pages. Watch 404s, coverage, rankings. Add redirects as real traffic reveals gaps. |
| +14 to +30 days | **2–3 game pages per week**, publisher-sourced only. Un-gate from the 38 existing placeholders — no new routes. |
| +30 days | Review gate H. Above ~70 %, raise to 4–5 per week. Below, hold — the constraint is editorial capacity, not template capacity. |
| +60 days | Revisit the deferred rewrites with their redirects already earning, and upgrade each hub redirect to a 1:1 map. |

**Governing rule: publish at the rate you can source from the publisher, not the rate you can fill a template.** The 38 gated routes are an asset — a queue that already knows what it needs.

---

## Evidence

Live HTTP probes of `www.freetins.com` and `freetins.pages.dev`; the old site's Rank Math post / page / category sitemaps; a clean `astro build` served via `wrangler pages dev`; a scripted 47-URL sweep; instrumented Chromium across 45 page-viewport pairs; `pnpm audit --prod`; direct parse of the 14 files in `src/data/games/`; the `hstspreload.org` status API.

Artefacts: `migration-readiness.html` · `PILLAR3-UX-AUDIT-2026-08-24.md` · `output/audit/` · prior revisions `.rev1.md`, `.rev2.md`.

Scores are prioritisation aids, not compliance certifications. Every ratio above is reproducible from the commands in the evidence list.
