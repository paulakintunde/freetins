# Testing and CI

What each step in `.github/workflows/ci.yml` proves, in the order it runs, and what a
reviewer checks that no script can.

## The steps

| Step | Command | Proves |
|---|---|---|
| Typecheck | `pnpm typecheck` | Every `.ts` and `.astro` file type-checks under `astro check`. |
| Lint | `pnpm lint` | The same, failing on warnings. |
| Validate operational content | `pnpm check:data` | `src/content/operations.json` passes `validateOperations`: unique ids, HTTPS sources, declared publisher channels behind every publisher citation, the reader-cannot-accept rule, and — from Step 1b — the event vocabulary and the editors registry. Also the two checks the validator lacks: no relative "ago" strings, no `example.com`. |
| Run unit tests | `pnpm test` | `test/operations.test.mjs` (the validator and the index gate), `test/dataset-collection.test.mjs` (front matter, the dataset loader, tokens, prose checks), `test/dataset-routes.test.mjs`, `test/interlinks.test.mjs`, `test/search.test.mjs`, `test/gone.test.mjs`, `test/extract-codes.test.mjs` (the collector's scorer, offline), and `test/content-template.test.mjs` (both writer templates pass every check a page faces). These ran nowhere before this step existed. |
| Vet dataset pages | `pnpm check:content --strict` | Every page under `src/content/{guides,daily,blog}` passes the checks the Astro loader runs (including the 155-character cap on `description`), and every internal link resolves to a page that has shipped. |
| Report retired vocabulary | `pnpm check:vocabulary` | Report-only: lists every file still naming a term the Confirmation Ledger retires. It becomes `--strict` in the Step 1a change that retires those terms, and not before — until then the hits are expected. |
| Build | `pnpm build` | The site builds; the dataset loader re-runs every content check; the sitemap is generated. |
| Crawl internal routes | `pnpm check:routes` | Every internal link in `dist/` resolves, no noindex page is in the sitemap and no indexable page is missing from it, no prototype route leaked, and the on-demand routes in `src/data/route-rendering.json` are Worker-only. From Step 2c this step also serves the flag-on build and fetches the server-rendered families and `sitemap-games.xml`. |

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
- **No new typed verification claim.** A new dataset row or article carries no field
  that asserts a check happened (`docs/adr/0003-no-hand-typed-verification-claims.md`).
  The vocabulary check will report it; the reviewer confirms it.
- **The build ran locally** for anything touching pages, the loader or the config —
  `check:routes` only means something against a fresh `dist/`.

## Running locally

```
pnpm typecheck && pnpm lint && pnpm check:data && pnpm test && pnpm check:content --strict && pnpm check:vocabulary
pnpm build && pnpm check:routes
```

The first line takes about two minutes; the build a few more.
