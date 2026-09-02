# Testing and CI

What each step in `.github/workflows/ci.yml` proves, in the order it runs, and what a
reviewer checks that no script can.

## The steps

| Step | Command | Proves |
|---|---|---|
| Typecheck | `pnpm typecheck` | Every `.ts` and `.astro` file type-checks under `astro check`. |
| Lint | `pnpm lint` | The same, failing on warnings. |
| Validate operational content | `pnpm check:data` | `src/content/operations.json` passes `validateOperations`: unique ids, HTTPS sources, declared publisher channels behind every publisher citation, the reader-cannot-accept rule, a positive `recheckTargetDays` on every game, and — from Step 1b — the event vocabulary and the editors registry. Advertising is checked whether or not it is switched on: a malformed `publisherId` fails even while `enabled` is false, because it is rendered as the AdSense verification tag before there is anything to serve and a wrong one there fails at the only moment nothing else would notice. Enabled, it also needs a provider, an HTTPS privacy URL and at least one placement, and every placement needs a unique id, a numeric ad-unit id, one of the three known formats and a positive mobile and desktop reserve. The format decides the markup, and a unit created as one type rendered with another type's attributes is a dead unit rather than a wrong one — it renders, never fills, and says nothing about why. The reserve is the height the block holds open before the creative arrives, which is what keeps its arrival from moving the article under a reader mid-sentence (`docs/ADVERTISING.md`). Also the two checks the validator lacks: no relative "ago" strings, no `example.com`. Prints, as an advisory that never fails, the planned games whose live entries still lack a game link or two redeem steps (queue warnings) and the number of importer events read as the baseline. |
| Run unit tests | `pnpm test` | `test/operations.test.mjs` (the validator, `resolveState` and the content-only index gate: a page with one live entry indexes, an empty or all-expired page does not, and no verification state opens or closes it), `test/dataset-collection.test.mjs` (front matter, the dataset loader, the four display states, which are never time-dependent: the as-published baseline is frozen at `CUTOVER_AT`, and the only clock input is a link row's own `expires_at`; tokens and their v1 aliases; prose checks), `test/dataset-routes.test.mjs`, `test/interlinks.test.mjs`, `test/search.test.mjs`, `test/gone.test.mjs`, `test/extract-codes.test.mjs` (the collector's scorer, offline), `test/content-template.test.mjs` (both writer templates are in the v2 shape and pass every check a page faces), and `test/meta-description.test.mjs` (`clampDescription` and `datasetMetaDescription`: the 155-character cap that `check:content` and the loader enforce, and the description, summary, title fallback order). These ran nowhere before this step existed. |
| Vet dataset pages | `pnpm check:content --strict` | Every page under `src/content/{guides,daily,blog}` passes the checks the Astro loader runs (including the 155-character cap on `description`), and every internal link resolves to a page that has shipped. Prints each page's state counts (verified, active, listed, expired) and, as an advisory that never fails, the number of rows carrying typed claims that the build reads as the as-published baseline: the interim editor queue of `docs/adr/0003`. A `needs_human` or `recheck_cadence` on an incoming page is listed in that advisory block as a typed claim to confirm and is never a reason to fail the page (`docs/adr/0004` §5). <!-- retired-vocabulary: allow, names the fields only to say they are listed, never fatal --> |
| Check retired vocabulary | `pnpm check:vocabulary --strict` | No scanned file outside the allow list (`docs/adr/`, `docs/migrations/`, the v1 writer contract and the script itself) names a term in `RETIRED`, the set Step 1a retired. The scan covers `README.md`, `CLAUDE.md`, `package.json`, `astro.config.mjs`, `tsconfig.json`, `wrangler.toml`, `.github/`, `docs/`, `verify/`, `public/` (including the extensionless `_headers` and `_redirects`), `src/`, `scripts/` and `test/`; only `node_modules`, `dist`, `.astro`, `public/og` and `src/assets` are skipped. Terms in `SCHEDULED` (the article review fields, retiring in Step 1b) are reported and never fatal, so the report shows them before the PR that retires them. Two exemptions, each stated in the script. First, a line carrying the marker `retired-vocabulary: allow, <reason>`: the reason after the comma is mandatory (a bare marker is not a marker), and it is honoured only in paths that never render to a reader (`docs/`, `scripts/`, `test/`, `src/lib/`, `README.md`, `.github/`); anywhere else, prose and templates included, the marker is ignored and the term counts. Second, a retired field in key position of a data file (`src/data/games/*.json`, `src/data/articles/*.ts`, and the dataset files `src/data/{guides,daily,blog}/*.json`), where it is the baseline the build reads or a typed claim `check:content` lists (`docs/adr/0004` §3 and §5): key position means the term starts the line or follows `{` or `,` and is followed by a colon, and only those key matches are subtracted, so the same term in the value of that line still counts. The dataset files are exempt in key position so that a v1-shaped incoming page is never bounced by this guard. |
| Build | `pnpm build` | The site builds; the dataset loader re-runs every content check; the sitemap is generated — one file per section (`sitemap-codes-0.xml` and its siblings) plus the `sitemap-index.xml` that lists them, each carrying an `<?xml-stylesheet?>` reference to `/main-sitemap.xsl` so a browser renders it as a table. The stylesheet is browser-only and no crawler runs it; it is served as `text/xsl` by a rule in `public/_headers`, which the site's `X-Content-Type-Options: nosniff` makes load-bearing rather than decorative. |
| Crawl internal routes | `pnpm check:routes` | Every internal link in `dist/` resolves, no noindex page is in the sitemap and no indexable page is missing from it, and no prototype route leaked. The sitemap it reads is the section files, never `sitemap-index.xml`, whose `<loc>` elements name sitemap files rather than pages; finding no section files is fatal on its own, because every sitemap check here asks whether a URL appears in that text and an empty read would report all 128 indexable pages as missing rather than report the sitemap gone. Also the free-plan guard (`docs/adr/0005-the-free-plan-is-the-design-target.md`), read from `dist/_routes.json` in both directions. **Outward:** every built HTML page must be served as a static asset, because a page an `include` rule reaches is served by the metered Function on every view rather than as an unmetered static asset. **Inward:** every on-demand route must still be matched by an `include` rule, because a route no rule reaches is answered from static assets — a 404 where `/api/code-report.json` or a 410 belongs. Both are fatal, and both are matched in the form Cloudflare receives, with the trailing slash `trailingSlash: 'always'` puts there; the guard no longer accepts either form, which used to let a manifest naming the wrong one report a page free while every view of it was metered. The on-demand list comes from `src/data/route-rendering.json`, which `pnpm build` generates alongside the manifest from the same derivation, so a third check fails when the two disagree — the shape a stale `dist/` or a hand edit takes. Two numbers are printed on every run, pass or fail: how many built pages are served as static assets out of how many exist, and how many rules are in use out of the 100-rule cap, counting `include` and `exclude` together as Cloudflare counts them. Reaching 95 warns rather than fails, which is upgrade trigger 3 of ADR 0005 taken as a reading by CI instead of remembered by a person. It also reads the first heading out of every emitted page and fails when it is not the h1: the drawer and the consent banner render before `<main>` and the footer after it, so a heading in any of them takes the top of the outline and puts a chrome label on the same level as the content h2s. Chrome names its regions with `aria-label` or `aria-labelledby` instead, which is a rule a partial cannot show on its own. It also assembles every page's JSON-LD out of the emitted HTML and fails on three shapes: more than one `application/ld+json` block on a page, two nodes under one `@id` inside a graph, and a `{"@id": …}` reference to a node the page never declares. The first two are the same defect seen from either side — a page's graph is resolved by `@id`, so two nodes under one id are one node with two values for the same property, and a strict merge arbitrates or drops it. No template can see that on its own: `BaseLayout` declared `{url}#webpage` named after the document title while `DatasetArticle`, `EditorialArticle` and `RouteScreen` each declared it again in a second script tag named after their own heading, every one correct in isolation, and 32 pages shipped that way. The third catches the id drifting a trailing slash from the node it means, which is why both sides derive it from `src/lib/pageGraph.ts`. From Step 2c this step also serves the flag-on build and fetches the server-rendered families and `sitemap-games.xml`. Last, it checks that the three files advertising is spread across still agree (`docs/ADVERTISING.md`): that `public/ads.txt` authorises the publisher id `src/content/operations.json` records, and that the CSP in `public/_headers` allows the AdSense origins whenever advertising is enabled. Each disagreement is silent and none of them is visible from the file it starts in — an unauthorised inventory, a verification tag for an account the seller line does not name, or three ad blocks that render on every page and never fill, with only a console violation to say why. |

Later steps add: the companion Worker's typecheck and tests (Step 2a), and the
serve-and-fetch pass above (Step 2c).

## What a reviewer checks

- **Documentation is in the same diff as the code it describes.** If the PR retires
  a term, a field or a state, every file that names it is updated in the PR, and the
  term is added to `RETIRED` in `scripts/check-vocabulary.mjs`.
- **The change matches its step.** The plan's creation steps say what lands together;
  a PR that lands half a step leaves the site in a state the plan never describes.
- **Nothing gates on verification.** No new `noindex`, robots directive, sitemap
  exclusion or hidden state that depends on whether an editor has acted
  (`docs/adr/0004-every-article-gets-a-pass.md`).
- **No state changes because time passed.** No new timer, window or age rule on any
  display state; `recheckTargetDays` orders the editor queue and is never a state
  input. A link row's own `expires_at` is the one clock input.
- **No new typed verification claim.** A new dataset row or article carries no field
  that asserts a check happened (`docs/adr/0003-no-hand-typed-verification-claims.md`).
  `check:content` reports it to the editor queue as typed claims to confirm and never
  fails on it (`docs/adr/0004` §5); the vocabulary check exempts a retired field in key
  position of a data file, the incoming dataset files included, for the same reason. The
  reviewer confirms the claim is not displayed.
- **A page view still costs nothing.** No new code fetches on load, and no control
  discovers its own configuration by calling an endpoint: what renders is decided at
  build time from `src/content/operations.json`. A `fetch` outside a user gesture in
  anything shipped to the client is a finding
  (`docs/adr/0005-the-free-plan-is-the-design-target.md`).
- **The new feature degrades honestly at its budget.** For any runtime feature the
  reviewer asks what a reader sees on the day it hits its ceiling. One short true
  sentence is the answer; a 500, a silent failure or a stale number shown as live is
  not. A write that is not wrapped, or an error path that leaves storage half-updated,
  fails this bullet.
- **The build ran locally** for anything touching pages, the loader or the config —
  `check:routes` only means something against a fresh `dist/`.

## Running locally

```
pnpm typecheck && pnpm lint && pnpm check:data && pnpm test && pnpm check:content --strict && pnpm check:vocabulary --strict
pnpm build && pnpm check:routes
```

The first line takes about two minutes; the build a few more.

## The cutover proof

`pnpm snapshot:states` writes every operational entry's and dataset row's displayed state and
every page's indexability to JSON; `pnpm report:cutover before.json after.json` joins two such
snapshots to the typed data and writes `docs/migrations/2026-08-cutover-states.md`, exiting 1 on
any row that moved outside the mapping docs/adr/0004 allows or any page that lost its index
entry. Run both around any change that touches states or the gate.
