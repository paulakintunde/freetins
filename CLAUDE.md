# CLAUDE.md

Freetins is a static Astro 5 site on Cloudflare Pages that publishes game codes and
reward links with evidence behind every claim. Read this before touching anything.

## Commands

```
pnpm dev                       local server
pnpm build                     static build (also runs the dataset loader checks)
pnpm typecheck / pnpm lint     astro check
pnpm test                      node:test suites in test/
pnpm check:data                validate src/content/operations.json
pnpm check:content --strict    vet every dataset page; --strict refuses links to unshipped pages
pnpm check:vocabulary --strict fail on retired vocabulary; scheduled terms (Step 1b) report only
pnpm check:routes              crawl dist/ for links, sitemap and noindex agreement (after build)
```

CI runs typecheck, lint, check:data, test, check:content --strict,
check:vocabulary --strict, build and check:routes, in that order. `docs/TESTING.md`
says what each proves.

## The documents that govern the work

- `docs/adr/0004-every-article-gets-a-pass.md` — verification is the editor's job
  and never a gate. Content is always accepted and rendered; no noindex or other
  blocking clause is ever added for want of verification; existing content keeps
  its status. Outranks everything below on acceptance, indexing and landing state.
- `docs/adr/0003-no-hand-typed-verification-claims.md` — no field a person types
  may assert that a check happened. Governs new claims from cutover forward; never
  reaches back; its check is advisory.
- `docs/ARTICLE-ROUTER.md` — routes a commission to one of the three page formats
  or to an operational entry update, and lists the exact files each accepts.
- `docs/WRITER-CONTRACT-v2.md` — the dataset-page contract for every page written
  from now on. `docs/WRITER-CONTRACT.md` (v1) is kept for the pages written to it;
  the build reads their typed fields as the as-published baseline, never as claims.
- The Confirmation Ledger plan (revision 5) — the system design and its creation
  steps. Ask for the current artifact link; it is not in the repo.

## Standing rules

- Documentation changes in the same PR as the code it describes. A PR that retires
  a term, a field or a state updates every file that names it, and adds the term to
  `scripts/check-vocabulary.mjs`.
- Never reintroduce retired vocabulary once Step 1a has retired it.
- Verification never rejects, delays, hides or de-indexes a page. The index gate
  consults content only.
- No state changes because time passed; `recheckTargetDays` is a queue target, never
  a state input. The one clock input is a link row's own `expires_at`.
- Hearts never mint a star and never touch the index gate.
- Nothing in `sponsorships`, `products` or advertising may influence a badge, a
  state or an order.
- Once the ledger file exists, only the companion Worker writes it; a hand edit is
  break-glass and follows the documented order (edit in git → trigger the deploy
  hook → run the reconcile).
- Operational content lives in `src/content/operations.json` and is validated at
  build. Dataset pages are prose in `src/content/<section>/<slug>.md` plus a dataset
  in `src/data/<section>/<slug>.json`. Editorial pages are objects in
  `src/data/articles/`. Do not write into `/codes/` prose unless the file exists.
- Commit only when asked; never push, never force.
