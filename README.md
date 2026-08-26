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

Astro prerenders every content route as direct HTML with a matching canonical URL. The only on-demand route is `/api/checker-status.json`, a noindex JSON endpoint used when the optional checker service is enabled.

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

## Cloudflare Pages

Recommended project settings:

- Production branch: `main`
- Build command: `pnpm build`
- Build output: `dist`
- Node.js: `24.15.0`

### Reader reports

Code rows carry a thumbs up/down. Reports are counted and shown but **never** change a
published state: only an editor check does that. Their purpose is to reorder the
re-check queue.

Requires two bindings, and the endpoint refuses reports without them rather than
storing something reversible:

- `REPORTS` — KV namespace for counts and dedup fingerprints.
- `REPORT_SECRET` — secret used to make the per-address fingerprint one-way.

No IP address is ever written to storage. The dedup key is `HMAC(secret, day + entryId + address)`,
truncated, with a 7-day TTL.

### Legacy redirects

`public/_redirects` maps 18 legacy URLs onto the 12 protected pages in
`CONTENT-ALIGNMENT-PLAN.md`. Deleting a legacy *shell* is a route-architecture rule;
404ing an *inbound link that already has traffic* is not the same thing, and these
paths carry roughly 249 monthly visits.

`wrangler.toml` is the source-controlled Pages configuration. Add the optional `STATUS` KV binding when the checker is provisioned; alert delivery remains inactive until `services.alerts.subscriptionEndpoint` points to a deployed HTTPS intake service.

## Prototype Reference

`Freetins Site.dc.html`, `support.js`, `image-slot.js`, and `_ds/` are source references only. They are not imported by the Astro application and are not copied into `dist`.

## Project Status

The current stage is a direct-route launch build with the new information architecture, canonical slugs, and deleted legacy shells. The remaining work is content verification and production rollout, not route migration.
