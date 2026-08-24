# Freetins Content Audit

> **Status: remediated 24 August 2026.** Every structural and template finding below has
> been fixed; see *Remediation status* at the foot of this document for the measured
> result. The two editorial findings (P0.1 redemption checks, P0.2 publisher-channel
> sourcing) are enforced in code and data but still require editorial work to satisfy.
> The findings are preserved as written so the before/after remains auditable.

Audit date: 24 August 2026
Snapshot: local `dist/` build from the current `main` working tree (123 documents)
Method: every measurement below is computed from the built HTML and from `src/content/operations.json`. Nothing is estimated or sampled.

## Executive conclusion

The site is structurally sound and editorially careful. Duplication is genuinely low, metadata is clean, and all 12 legacy traffic pages survived the migration intact. Build quality is not the problem.

The problem is that **the site's single differentiator is not yet backed by the evidence it claims.** Freetins positions itself against code-aggregator blogs by promising verification. As of this snapshot:

- **Zero of 133 codes have been verified by redemption.** All 110 verification events are `manual-review`, resolving only to `source-only` (25) or `rejected` (85). Not one `accepted`.
- **100% of 133 codes are sourced only to third-party aggregators.** No code cites the developer's own announcement channel.
- **64% of published codes are expired.** Only 19% are usable.
- **The two flagship games show zero usable codes** — Grow a Garden and Sol's RNG, both promoted as "most searched".

A reader arriving from the site's highest-intent query lands on a page with no working codes, whose evidence chain terminates at the exact class of site Freetins says it improves on. That is a content problem, not a technical one, and no further engineering fixes it.

The second theme: **the pages carrying the trust claim are the thinnest pages on the site.** `/how-we-verify/` is 114 words and never defines the four evidence states it uses sitewide. `/author/paul-a/` is 50 words and is the sole author of all 19 articles.

## Scorecard

| Dimension | Score | Verdict |
|---|---:|---|
| Evidence integrity | 18/100 | Blocked — the core claim is unsubstantiated |
| Content depth | 52/100 | Needs work — 33% of indexable pages under 300 words |
| Structured data | 45/100 | Needs work — the commercial core has none |
| Originality / duplication | 88/100 | Strong — measured, not assumed |
| Metadata hygiene | 86/100 | Strong — no duplicates, 7 minor length issues |
| Internal architecture | 74/100 | Improved this week, one severed page remains |
| Trust and E-E-A-T pages | 30/100 | Blocked — too thin to carry the claim |

## Inventory

| Measure | Value |
|---|---:|
| Documents built | 123 |
| Indexable | 48 |
| Noindex drafts | 74 |
| Total indexable words | 30,194 |
| Median indexable page | 532 words |
| Indexable pages under 300 words | 16 (33%) |
| Published games | 12 of 58 |
| Codes on published pages | 133 |
| Verification events | 110 |

## What improved since the previous audit

Measured deltas against the earlier snapshot, not impressions. The recent work is real and landed correctly.

| Measure | Before | Now | Change |
|---|---:|---:|---|
| Documents built | 270 | 123 | −147 empty child routes |
| Noindex draft pages | 221 | 74 | −66% |
| Internal links to indexable pages | 147 | 227 | +54% |
| Internal links leaking to noindex drafts | 63 | 18 | −71% |
| Indexable pages | 48 | 48 | unchanged — nothing of value was lost |

The 147 removed routes were all empty `/values/`, `/updates/` and `/expired/` shells. Cutting them without losing a single indexable page was the right call, and `interlinks.ts` has meaningfully closed the gap between the editorial and operational halves of the site. The author bio now renders on article bylines.

Also verified as correct: the Little Alchemy element count. The alignment plan flagged a 540/580 mismatch; the page now claims 580, the data file contains exactly 580 entries, and the page explicitly explains the correction. That is the standard the rest of the site should be held to.

---

## P0 — Evidence integrity

### P0.1 No code has ever been verified by redemption

`src/content/operations.json` contains 110 verification events. Every one uses `method: "manual-review"`. Results are `source-only` (25) and `rejected` (85). There are **zero** `accepted` results and zero events using the `redeemed`, `opened` or `entered` methods.

This contradicts the site's own definitions:

- `README.md`: "Use a verification result of `accepted` for a successful redemption/open/entry."
- `/how-we-verify/` step 02: "A redemption, opened link, entered cheat or official-source review becomes a verification event."

The published state of the site therefore rests entirely on reading other people's blog posts. Every verification affordance in the UI resolves, in the data, to "someone read a third-party page".

**Fix:** redeem codes in-game and record `accepted` / `redeemed` events. Until at least one game has redemption-backed codes, do not present verification as the differentiator in copy or schema. This is the highest-value content action available.

### P0.2 Every code is sourced only to competitor aggregators

All 133 codes cite third-party blogs exclusively. Not one cites the developer's own channel, despite all 12 published games having a valid `officialSourceUrl`.

Most-cited sources:

| Citations | Host |
|---:|---|
| 22 | driffle.com |
| 22 | www.pocketgamer.com |
| 19 | www.destructoid.com |
| 18 | www.pcgamesn.com |
| 15 | urgametips.com |
| 13 | beebom.com |
| 10 | rocodes.gg |

These are the same aggregators Freetins competes with. A site whose value proposition is "we check the source" is currently checking other aggregators' unverified reposts. The `officialSourceUrl` on each game points at the Roblox game page, which establishes that the game exists — not that any code was ever announced.

**Fix:** for each code, cite the developer's announcement — the game's Discord, X/Twitter post, or in-game changelog. Where no primary source exists, label the code community-reported rather than sourced.

### P0.3 A Cloudflare preview domain is cited as evidence

`basketball-zero-codes.pages.dev` appears as a `sourceUrl`. This is a Pages preview host, not a publisher. `README.md` states that `pnpm check:data` "rejects duplicate identifiers, **prototype domains**, typed relative ages, broken references" — this one passes validation.

**Fix:** remove the citation and extend the prototype-domain rule in `scripts/check-operational-data.mjs` to reject `*.pages.dev`, `*.vercel.app` and `*.netlify.app`.

### P0.4 Two flagship games show zero usable codes

| Game | Codes | Usable | Expired | Unverified |
|---|---:|---:|---:|---:|
| Grow a Garden | 12 | **0** | 9 | 3 |
| Sol's RNG | 15 | **0** | 9 | 6 |

Sitewide: 25 usable (19%), 85 expired (64%), 23 unverified (17%).

Grow a Garden is the lead game and the first "most searched" chip on the home page. Its page is the destination for the highest-intent query the site targets, and it has nothing to give the reader.

**Fix:** either refresh these two games' codes before promoting them, or stop promoting games whose active count is zero. The "most searched" row should be filtered by `activeCount > 0`, not merely by publication state.

---

## P1 — Structured data is absent from the commercial core

The 12 game code pages emit **no `Article`, no `FAQPage`, no `BreadcrumbList` and no `dateModified`.** They carry only the generic `Organization` / `WebSite` / `WebPage` graph from `BaseLayout`.

| Schema | Pages emitting it | Which |
|---|---:|---|
| Article | 12 | editorial articles only |
| FAQPage | 12 | editorial articles only |
| BreadcrumbList | 19 | editorial articles only |
| dateModified | 19 of 48 | editorial articles only |

This is backwards. Game codes are the most freshness-sensitive query class on the site, and the code pages are precisely the ones with no structured freshness signal. They render breadcrumbs and "last checked" timestamps visually, but none of it reaches structured data.

**Fix:** emit `BreadcrumbList` for every route — the breadcrumb trail already exists in `RouteScreen` — and on code pages emit `dateModified` from `latestCheckedAt` plus `FAQPage` from the redemption steps. This is a template change, not a writing task, and it is the cheapest high-value item in this audit.

---

## P2 — The trust pages cannot carry the trust claim

### P2.1 `/how-we-verify/` is 114 words and does not deliver what it promises

Its meta description promises four things: "The evidence states, source requirements, freshness windows and removal rules used by Freetins."

Measured against the rendered body:

| Promise | Delivered? |
|---|---|
| Evidence states | **No** — the words *verified*, *reported*, *stale* and *expired* never appear |
| Source requirements | Partial — one sentence |
| Freshness windows | **No** — appears only in the lede that repeats the description |
| Removal rules | **No** — appears only in that same lede |

This page is declared in `Organization` schema as both `publishingPrinciples` and `correctionsPolicy`, and every entity page links to it. It is the load-bearing trust document and the third-thinnest page on the site.

**Fix:** define each of the four evidence states with the exact rule that produces it, state the per-game `verificationWindowHours` policy, and state the removal rule. Target 700–900 words.

### P2.2 `/author/paul-a/` is 50 words

The full body: name, role, one sentence, and a derived count of verification events.

No credentials, no experience, no photo, no list of articles authored, no contact. This is the sole author of all 19 editorial articles. The recent `authors.ts` work correctly added a one-line bio to article bylines, but the profile page itself is unchanged.

**Fix:** expand into a real profile — relevant experience, what "editor" means operationally here, and an auto-generated list of the 19 articles authored, which also fixes the page's near-total absence of internal links.

---

## P3 — Architecture leaks

### P3.1 A traffic-protected page is severed from the site

`/daily/doubledown-casino/` (572 words) is the **only orphan** among 48 indexable pages. Its sole inbound link is from `/daily/`, which is `noindex, nofollow`.

This is not a minor page. `CONTENT-ALIGNMENT-PLAN.md` lists "DDC promo codes" as a protected asset with 16 monthly visits. It is indexable and in the sitemap, but has no crawlable internal path.

Root cause: `/daily/` is `noindex` because `publishedDailyLinkCatalogue.length === 0` — no *operational* daily links exist. But a published *editorial* daily article does, and the hub lists it. The hub simultaneously says "No daily-link page is published yet" and then lists a published daily guide.

**Fix:** `/daily/` should be indexable when it holds any published content, editorial or operational, and its empty-state copy should not contradict the content directly beneath it.

### P3.2 `noindex, nofollow` should be `noindex, follow`

`BaseLayout.astro` emits `noindex, nofollow` for every noindex page. Five nav-reachable hubs are affected: `/daily/`, `/alerts/`, `/blog/`, `/submit/`, `/search/`.

`nofollow` tells crawlers to discard every link on the page. For a hub that links onward to indexable content — exactly the `/daily/` case above — this severs the crawl path. The intent is "do not index this page", not "do not follow anything from it".

**Fix:** change to `noindex, follow`.

### P3.3 `/cheats/` advertises eight empty high-value pages

The indexable `/cheats/` hub lists GTA 5, GTA San Andreas, GTA Vice City, Red Dead Redemption 2, The Sims 4, Skyrim, Fallout 4 and Minecraft as "Verification pending", each linking to a noindex empty draft. These 8 links are 44% of all remaining leakage from indexable pages into drafts.

These are among the highest-volume cheat queries in existence. Publishing a hub that names them and delivers nothing is the pattern the alignment plan explicitly warns against: "Do not create a route because the template has a tab for it."

**Fix:** remove the pending block from the hub until those pages have content.

---

## P4 — Thin and near-duplicate content

### P4.1 Nine indexable `/expired/` archive pages average 152 words

| Page | Words |
|---|---:|
| /codes/anime-card-clash/expired/ | 99 |
| /codes/type-soul/expired/ | 112 |
| /codes/blue-lock-rivals/expired/ | 135 |
| /codes/basketball-zero/expired/ | 139 |
| /codes/sols-rng/expired/ | 153 |
| /codes/grow-a-garden/expired/ | 155 |
| /codes/volleyball-legends/expired/ | 185 |
| /codes/dandys-world/expired/ | 187 |
| /codes/weak-legacy-2/expired/ | 208 |

Mean pairwise similarity 11.7% (peak 17.5%) — three times that of the code pages. Their only unique content is a table of dead codes. They are indexable purely because `expiredCount > 0`.

**Fix:** noindex the expired archives and keep them as reader-facing reference, or fold them into the parent code page as a collapsed section. An expired-code list is a maintenance record, not a search destination.

### P4.2 Section hubs are link lists with no content

| Hub | Words |
|---|---:|
| /guides/ | 107 |
| /games/ | 156 |
| /cheats/ | 157 |
| /answers/ | 169 |
| /codes/ | 204 |

These target competitive head terms and carry no original content, no explanation of what the section covers, and no editorial point of view. They cannot rank as-is.

**Fix:** 300–500 words of genuine orientation per hub — what belongs in the section, how entries are chosen, how to use them.

---

## P5 — Minor defects

- **Markdown leaking into prose.** 46 draft pages render a literal backtick: "This configured page remains \`noindex\` until…". Confined to noindex pages, so low impact, but user-visible on direct navigation.
- **Metadata lengths.** Four descriptions under 70 characters (`/author/paul-a/` 33, `/answers/` 54, `/guides/` 58, `/games/` 64); one over 160 (`/resources/` 167); two titles over 60 characters (`/guides/gta-5-demo/` 63, `/codes/99-nights-in-the-forest/` 61).
- **One image missing alt text** on the home page.

---

## Verified strengths

Stated because they were measured, and because they should not be traded away while fixing the above.

- **Duplication is low.** Mean pairwise 5-gram similarity: game code pages 3.9%, editorial articles 1.5%. This is not a templated doorway estate — the pages are genuinely written.
- **No duplicate titles or descriptions** anywhere among the 48 indexable pages.
- **All 12 traffic-protected pages survived the migration** at sensible canonical paths, covering roughly 249 monthly visits of legacy traffic.
- **Editorial articles are well-formed:** 466–4,397 words, with `Article` + `FAQPage` + `BreadcrumbList` + `Person` schema, dates and cited sources.
- **The site refuses to fabricate.** Empty states say "not recorded" rather than inventing counts, and every aggregate is derived from the operational file. This discipline is rare and is the foundation the evidence work should build on.

---

## Remediation order

Ordered by value per unit of effort.

| # | Action | Effort | Type |
|---|---|---|---|
| 1 | Emit `BreadcrumbList` sitewide; `dateModified` + `FAQPage` on code pages | Low | Template |
| 2 | Change `noindex, nofollow` to `noindex, follow` | Trivial | Template |
| 3 | Filter "most searched" chips by `activeCount > 0` | Trivial | Data |
| 4 | Make `/daily/` indexable when it holds editorial content; fix contradictory empty state | Low | Template |
| 5 | Remove the pending-games block from `/cheats/` | Trivial | Template |
| 6 | Remove the `pages.dev` citation; extend prototype-domain validation | Low | Data + script |
| 7 | Noindex or fold the nine expired archives | Low | Template |
| 8 | Rewrite `/how-we-verify/` to 700–900 words defining all four evidence states | Medium | Writing |
| 9 | Expand `/author/paul-a/` into a real profile with an article list | Medium | Writing |
| 10 | Refresh Grow a Garden and Sol's RNG codes | Medium | Editorial |
| 11 | Re-source all 133 codes to primary announcements | High | Editorial |
| 12 | Begin recording redemption-backed verification events | High | Editorial |
| 13 | Write 300–500 words of orientation for each of the five section hubs | Medium | Writing |

Items 1–7 are roughly a day of engineering and remove most of the structural drag. Items 10–12 decide whether the site's positioning is true. No amount of 1–7 substitutes for them.


---

## Remediation status

Applied 24 August 2026, measured with `node scripts/content-audit.mjs` against a fresh build.

| Measure | Audit | After | Change |
|---|---:|---:|---|
| Documents built | 123 | 117 | −6 |
| Indexable pages | 48 | 43 | −9 thin archives, +3 authors, +1 daily hub |
| Total indexable words | 30,194 | 34,087 | +13% |
| Indexable pages under 300 words | 16 | 4 | −75% (the 4 are author profiles) |
| Pages with `BreadcrumbList` | 19 | 42 | +121% |
| Pages with `FAQPage` | 12 | 25 | +108% |
| Pages with `dateModified` | 19 | 32 | +68% |
| Links leaking into noindex drafts | 18 | 0 | eliminated |
| Orphaned indexable pages | 1 | 0 | eliminated |
| Metadata defects | 8 | 0 | eliminated |

### Finding by finding

| # | Finding | Status |
|---|---|---|
| P0.1 | No code verified by redemption | **Open — editorial.** The distinction is now defined, enforced and rendered: `verified` requires an `accepted` result. No redemption checks exist yet. |
| P0.2 | Codes sourced only to aggregators | **Enforced in code.** `publisherSourceUrl` must sit on a declared `publisherChannel`; aggregator URLs moved to `discoveredVia` and are no longer shown as evidence. All 130 codes now render as community-reported, which is accurate. Populating channels is editorial work. |
| P0.3 | Preview domain cited as evidence | **Fixed.** Preview hosts rejected at validation. The 3 codes whose only citation was `basketball-zero-codes.pages.dev` were removed, with their events. |
| P0.4 | Flagship games with zero usable codes | **Fixed structurally.** "Most searched" now filters on `activeCount > 0`, so a game with nothing usable is never promoted. Refreshing those codes remains editorial work. |
| P1.1 | No schema on code pages | **Fixed.** `BreadcrumbList` sitewide; `Dataset` with `dateModified` from the verification record and `FAQPage` from the redemption steps on game pages. |
| P2.1 | `/how-we-verify/` 114 words, promises undelivered | **Fixed.** Rewritten as a full editorial article: 2,151 words, all four evidence states defined, plus usable-code and active-record definitions, constraints and an automation assessment. Now carries `Article`, `FAQPage`, `BreadcrumbList` and a byline. |
| P2.2 | Author page 50 words | **Fixed.** Four section-owner profiles (241–276 words) with remit, credential, accountability, live verification counts and an auto-generated list of pages authored. Bylines resolve from section, so they cannot drift. |
| P3.1 | Traffic-protected page orphaned | **Fixed.** `/daily/` is indexable when it holds editorial content; `/daily/doubledown-casino/` is no longer orphaned. |
| P3.2 | `noindex, nofollow` | **Fixed.** Now `noindex, follow`. |
| P3.3 | `/cheats/` advertising 8 empty pages | **Fixed.** The hub lists only published cheat sheets. |
| P4.1 | 9 thin expired archives | **Fixed.** Routes removed; expired codes render inside the parent game page as a collapsed retired-records block. |
| P4.2 | Section hubs with no content | **Fixed.** Every hub now carries orientation copy and selection criteria: 302–486 words. |
| P5 | Minor defects | **Fixed.** Markdown backticks removed from prose; all title/description lengths in range. The reported missing `alt` was a false positive — a decorative image correctly marked — and the audit script was corrected. |

### Still outstanding

Two things decide whether the positioning is true, and neither can be closed by code:

1. **Record redemption-backed checks.** Until an `accepted` result exists, no entry on the site can reach `verified`.
2. **Populate `publisherChannels` per game.** Until a game declares its publisher's website, YouTube, Discord, Twitch or X account, every code on it stays community-reported — which is now stated plainly on the page rather than dressed up with aggregator links.
