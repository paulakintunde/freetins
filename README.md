# Freetins

Static-first Astro 5 site for Cloudflare Pages.

## Requirements

- Node.js 24.15.0 (`.nvmrc`)
- pnpm 11.19.0
- A Cloudflare Pages project for deployment

## Local Development

```bash
pnpm install
pnpm dev
```

Open the URL printed by Astro, usually `http://localhost:4321`.

Preview the production build locally with Wrangler:

```bash
pnpm preview
```

## Route Model

The current build uses direct, slash-canonical routes and does not rely on redirect middleware or route gating.

Live public namespaces:

- `/`
- `/codes/`
- `/daily/`
- `/cheats/`
- `/answers/`
- `/guides/`
- `/games/`
- `/gear/`
- `/submit/`
- `/alerts/`
- `/contact/`
- `/blog/`
- `/privacy/`
- `/disclosure/`
- `/terms-and-conditions/`
- `/author/paul-a/`

Earned child routes live under the game namespace:

- `/codes/<slug>/`
- `/codes/<slug>/values/`
- `/codes/<slug>/expired/`
- `/codes/<slug>/updates/`

`/daily/<slug>/` is served by the dataset collection first: when `src/content/daily/<slug>.md` and `src/data/daily/<slug>.json` exist, that dataset page takes the path, and the operational daily screen for the same slug is not rendered. Slugs without a dataset page fall through to the catch-all route and the operational screen.

## Rendering

Astro prerenders every content route as direct HTML with a matching canonical URL. The on-demand routes are the two noindex JSON endpoints — `/api/checker-status.json`, used when the optional checker service is enabled, and `/api/code-report.json`, which is called only when a reader clicks a report control — plus the legacy paths that answer 410 and Astro's own internal routes. Every other path is a static file. `src/data/route-rendering.json` lists them, and is generated on every build from the routes the build reports as not prerendered; `dist/_routes.json` is written from the same list, so which routes are metered is derived rather than asserted. Do not edit either by hand. On-demand routes are the metered ones, which is why nothing on a page load touches them (see "Running on the free plan").

Shared shell behavior lives in `src/scripts/site.ts`, which uses delegated events and Astro navigation lifecycle events.

## Editorial ownership

Bylines are resolved from the article's section in `src/data/authors.ts`, not stored per article, so a page cannot ship crediting the wrong desk.

| Section | Owner |
|---|---|
| Guides | David Ng |
| Answers | Lade Akintunde |
| Cheats | Rohene Ladner |
| Codes, Daily, Resources, legal | Paul A |

## Validation

CI runs these in this order; `docs/TESTING.md` says what each step proves:

```bash
pnpm typecheck
pnpm lint
pnpm check:data
pnpm test
pnpm check:content --strict
pnpm check:vocabulary --strict
pnpm build
pnpm check:routes
```

`pnpm check:data` additionally enforces the citation standard below. `scripts/content-audit.mjs` measures the built output (word counts, schema coverage, internal link graph, duplication) and is how the figures in `CONTENT-AUDIT-2026-08-24.md` were produced:

```bash
pnpm build
node scripts/content-audit.mjs audit-pages.json
```

## Operational Content

`src/content/operations.json` is the source of truth for code pages, daily links, generic cheat sheets, value rows, update timelines, products, sponsorships, and service activation.

- Keep a game in `planned` while records are gathered. `planned` means waiting on data: the page is `noindex` only while it holds no live entry, and indexes itself the moment one exists (`docs/adr/0004-every-article-gets-a-pass.md`). Verification is never a condition.
- `published` keeps a page indexed regardless of its entries until Step 5 retires the bypass; the fourteen games that use it are pinned when the ledger lands, so the bypass can retire in Step 5 with nothing changing for them. No pin event exists yet. A published game must still carry `officialSourceUrl` and two `redeemSteps` (`check:data` enforces these as data rules on the flag). On a planned game the same furniture is a queue warning, printed by `check:data` and never fatal.
- Store timestamps as UTC ISO strings such as `2026-08-24T09:42:00Z`. Never upload display text such as `3 min ago`.
- Never write a verification event by hand: an editor records it from the control page, or by a break-glass git edit, with a method and a server timestamp (`docs/adr/0003-no-hand-typed-verification-claims.md`). The 164 events in the file today were emitted by the importer from writers' dates and are read as the baseline, never as editor acts. Until Step 1b changes the vocabulary, a result reads as: `accepted` a successful redemption/open/entry, `source-only` a publisher-channel announcement that was not redeemed, `rejected` an expired record, `unreachable` a check that could not complete.
- `recheckTargetDays` on a game is the editor queue's target in days. It orders the queue and is never a state input.
- Enable checker, alerts, or advertising only after their required schedule, endpoint, channel, provider, privacy URL, and placement records are configured.
- `services.reports.enabled` decides at build time whether the reader-report control renders at all. It stays `false` until the `REPORTS` namespace and the `REPORT_SECRET` exist, which is how the control keeps its fail-closed promise without spending a request to discover its own configuration (`docs/adr/0005-the-free-plan-is-the-design-target.md`).

### Citation standard

Evidence must come from a channel the publisher controls.

- `publisherChannels` on a game lists the publisher's own website, YouTube, Discord, Twitch or X accounts. A code citation must sit on one of these hosts, and `check:data` rejects one that does not.
- `publisherSourceUrl` on an entry is the announcement post. It is the only URL shown to readers as evidence.
- `discoveredVia` records where the code was first noticed. Aggregator blogs belong here. It is kept for the audit trail and never rendered as evidence.
- A game or store listing (`officialSourceUrl`) links the game. It is never a code citation: it proves the game exists, not that a code was issued.
- Preview hosts (`*.pages.dev`, `*.vercel.app`, `*.netlify.app`, `*.workers.dev`, `*.github.io`) are rejected anywhere in the evidence chain.
- An entry with no `publisherSourceUrl` is community-reported. It can still be published and can still be redeemed-verified, but it never claims publisher confirmation.

### States

Every operational entry and every dataset row displays one of four states, and no
state ever changes because time passed. There is no timer, window or age rule; the
one clock input is a link row's own `expires_at`, read at build time.

- `★ Verified`: the newest event on the entry is an editor verification. No editor
  event exists yet, so nothing is Verified today.
- `Active · as published`: the carried-over baseline for dataset rows that displayed
  Active on cutover day, frozen at `CUTOVER_AT` in `src/lib/dataset.ts`. Never
  assigned to new content; `{{activeCount}}` counts it and `status=active` selects it.
- `Listed · awaiting editor verification`: everything live that is neither of the
  above, including every new entry and every new row. Fully rendered, fully indexed.
- `Expired`: retired by an editor, past its `expires_at`, or expired or removed in
  the baseline. Kept on the page as a record.

How the operational baseline maps (`resolveState` in `src/data/operations.ts`): an
entry with no event, or whose newest event is `source-only` or `unreachable`, is
Listed; `accepted` is Verified; `rejected` is Expired; a past `expiresAt` is Expired
before anything else is read. An entry is **live** when its state is not Expired. A
game is promoted on the home page and in "Most searched" when it has at least one
live entry; a listed code is real content.

Every aggregate shown by the site is derived from this file. `pnpm check:data` rejects duplicate identifiers, prototype domains, typed relative ages, broken references, and unsupported `published` states.

## Running on the free plan

The site runs entirely on Cloudflare's free plan, and that is the design target rather
than a phase (`docs/adr/0005-the-free-plan-is-the-design-target.md`). Four readings are
taken rather than argued. Three of them are engineering signals with engineering
answers, and are never by themselves a reason to spend money. The fourth, and only the
fourth, is the buy signal: when it reads true the paid plan is bought, not judged.

### The ceilings

Verified against Cloudflare's documentation on 26 August 2026.

| Resource | Free ceiling | What consumes it here |
|---|---|---|
| Workers/Pages Functions requests | 100,000/day, account-wide, resets 00:00 UTC | one per heart click |
| KV reads | 100,000/day | one per heart click |
| KV **writes** | **1,000/day**, account-wide | one per accepted heart |
| KV list operations | 1,000/day | none at runtime |
| Pages builds | 500/month, one at a time | one per deploy |
| `_routes.json` rules | 100 total, `include` and `exclude` counted together | 22 in this build: one per on-demand route family, and no page named at all |
| Static asset requests | unmetered | every page view, and every hover prefetch of one |

The binding constraint is KV writes: **1,000 accepted hearts a day**. Everything else
has two or more orders of magnitude of headroom. `STATUS` draws on the same
account-wide write budget, so the checker's cadence is part of the same accounting.

The last two rows depend on `dist/_routes.json`, which decides per path whether
Cloudflare answers from static assets or wakes the Function. The build writes that file
itself from its own route data: `include` names only the on-demand routes, `exclude` is
empty, and no page is named at all, so adding a page cannot push it over the cap.

It had not always been so, and the failure was silent. The Cloudflare adapter used to
write one `exclude` rule per prerendered page; the site outgrew the 100-rule cap; and
rather than fail, the adapter fell back to `include: ["/*"]` with as much of the exclude
list as fit. 130 of the 131 built pages moved onto the metered Function with no setting
changed and no warning printed, so every page view cost an invocation while this file
said page views were free. `pnpm check:routes` now reads the manifest back on every run,
fatally and in both directions — no built page may be served by the Function, and no
on-demand route may be left off it — and prints both counts pass or fail.

### What an interaction costs

- **A page view: nothing metered.** The document is a static asset, because the route
  manifest names only the on-demand routes. Nothing is fetched on load either: whether
  a control renders is decided at build time from `services.reports` in
  `src/content/operations.json`, never discovered at runtime by probing the endpoint.
- **A hover: one or more pages fetched early.** `astro.config.mjs` sets
  `prefetch: { defaultStrategy: 'hover', prefetchAll: true }`, so running a cursor down
  a list of links asks for pages the reader may never open. Against static assets that
  is unmetered, and the setting is left as it is. It is listed here because it is the
  multiplier that would apply to Function invocations if a page ever left the static
  path.
- **A heart click: one Function request, one KV read, and one KV write** if the vote is
  new. A repeat click from the same reader on the same entry on the same day still costs
  the request and the read, and writes nothing. The write is what a repeat avoids, and
  the write is the scarce one: reads are capped at 100,000 a day, writes at 1,000.
- **At the cap:** the endpoint answers 429 `{ accepted: false, reason: 'paused' }` and
  the client says so in one line. It never answers 500, and nothing on the page is left
  claiming a report was recorded when it was not.

### Upgrade triggers

| # | Condition | Read from | What answers it |
|---|---|---|---|
| 1 | Accepted hearts exceed 500 in a day on seven consecutive days | `pnpm queue:hearts` (below) | Move counts into a SQLite-backed Durable Object, which is on the free plan. |
| 2 | Pages builds exceed 400 in a calendar month | the Cloudflare dashboard's build history | Batch deploys. |
| 3 | `_routes.json` `include` and `exclude` rules together reach 95 of 100 | printed by `pnpm check:routes` on every run | Restructure routes. |
| 4 | Function invocations exceed 50,000 in a day | the Cloudflare dashboard's Workers analytics | Buy the paid plan. |

Only the fourth argues for money, and it corresponds to roughly 50,000 daily
*interactions*, which the site does not have. That figure depends on the route manifest
and on nothing else: an invocation is spent when a reader clicks rather than when a page
is opened, for exactly as long as `include` names the on-demand routes and no page. If
that ever stops being true, the same trigger quietly becomes roughly 50,000 daily *page
views*, which the site could reach without this feature being touched, and sooner with
hover prefetching. That is why `pnpm check:routes` takes the reading every run and fails
rather than warns.

### Reading the heart queue

```bash
pnpm queue:hearts                          today, every entry with votes
pnpm queue:hearts --day 2026-08-25         an earlier day, within the seven-day TTL
pnpm queue:hearts --entry <id> --json      one entry, machine-readable
```

It lists the day's vote prefix with `wrangler kv key list`, reads the verdicts back, and
prints per-entry totals with the `needsRecheck` verdict imported from
`src/lib/code-reports.ts` — the same function the queue uses, rather than a second copy
of the rule. It takes trigger 1's reading and orders the re-check queue. It writes
nothing and changes nothing.

It needs `wrangler` authenticated (`wrangler login`, or `CLOUDFLARE_API_TOKEN` in the
environment) and it needs the namespace: pass `--namespace-id <id>` while the `REPORTS`
binding in `wrangler.toml` is still commented out. It names whichever of those is
missing instead of failing obscurely.

### Operator setup

```
wrangler kv namespace create REPORTS
wrangler kv namespace create STATUS
wrangler pages secret put REPORT_SECRET --project-name freetins
```

then paste the returned ids into `wrangler.toml` and set
`services.reports.enabled` to `true` in `src/content/operations.json`.

Until that last step is taken the report control renders nowhere. That is the intended
state, not a fault.

## Cloudflare Pages

Recommended project settings:

- Production branch: `main`
- Build command: `pnpm build`
- Build output: `dist`
- Node.js: `24.15.0`

### Reader reports

Where `services.reports.enabled` is true, code rows carry a thumbs up/down. Where it is
false, which is how this build ships, the control renders nowhere and no markup for it
is emitted. A report **never** changes a published state: only an editor check does
that. Its purpose is to reorder the re-check queue.

Requires two bindings, and both verbs of the endpoint refuse without both of them
rather than storing something reversible or revealing a control that cannot work:

- `REPORTS` — KV namespace holding one vote record per reader, entry and day.
- `REPORT_SECRET` — secret used to make the per-address fingerprint one-way.

No IP address is ever written to storage. The vote key is
`hb:<day>:<entryId>:HMAC(secret, day + entryId + address)`, truncated, with a 7-day
TTL. One key per reader per entry per day means one write per accepted heart and no
read-modify-write race. No count is displayed anywhere on the site: counts are derived
by listing that prefix when an editor works the queue, never on the request path, so a
count is as fresh as the last queue pass — which costs nothing, because no state, badge
or index decision reads a heart. `pnpm queue:hearts` is that pass.

### Legacy redirects

`public/_redirects` maps 18 legacy URLs onto the 12 protected pages in
`CONTENT-ALIGNMENT-PLAN.md`. Deleting a legacy *shell* is a route-architecture rule;
404ing an *inbound link that already has traffic* is not the same thing, and these
paths carry roughly 249 monthly visits.

`wrangler.toml` is the source-controlled Pages configuration. It carries the `REPORTS` and `STATUS` KV bindings as commented templates alongside the `wrangler` commands that create them, so the bindings are reviewable in git rather than living only in a dashboard; uncomment a binding and paste its id when the namespace exists ("Running on the free plan"). Alert delivery remains inactive until `services.alerts.subscriptionEndpoint` points to a deployed HTTPS intake service.

## Prototype Reference

`Freetins Site.dc.html`, `support.js`, `image-slot.js`, and `_ds/` are source references only. They are not imported by the Astro application and are not copied into `dist`.

## Project Status

The current stage is a direct-route launch build with the new information architecture, canonical slugs, and deleted legacy shells. The remaining work is content verification and production rollout, not route migration.
