# ADR 0005: The free plan is the design target

Status: accepted, 26 August 2026
Applies from: now, and to every runtime feature added after it
Related: ADR 0004 (every article gets a pass), which outranks this record wherever the
two meet — a budget is never a reason to hide, delay or de-index anything — and the
standing rule in `CLAUDE.md` that hearts never mint a star

## Context

### The error this record corrects

Step 0 of the Confirmation Ledger plan (revision 5) opened with a prerequisite: buy
Workers Paid at $5/month, because serialising counter writes needs a Durable Object
and Durable Objects are a paid feature.

That prerequisite was wrong. It was an error in the plan — a pricing claim asserted
from memory instead of checked — and not a constraint the owner set. SQLite-backed
Durable Objects are available on the Workers **Free** plan: 100,000 requests a day and
5 GB stored. Only the legacy key-value storage backend requires the paid plan. Nothing
in Step 0 ever needed money spent, and a plan that opens by asking for a card it does
not need is a plan that has not been read carefully. The correction is recorded here
rather than quietly edited out, because the next person to read "this requires the paid
plan" in any document should know that the last time it was written it was not true.

The design below does not use a Durable Object either. At this traffic it is
complexity without benefit. It is now free for the day it is wanted, which is what
makes the first upgrade trigger below cheap to answer.

### What the site did, and what this record changes

The measurements are from the repository as it stood when this decision was taken.
Each of them is answered by a numbered decision below.

- A page view paid for something no reader could see. The client fetched one count per
  control on load and did it twice, because `src/scripts/code-reports.ts` registered
  both an `astro:page-load` listener and an immediate call while `ClientRouter` is
  enabled in `src/layouts/BaseLayout.astro`. `/codes/shindo-life/` carries 38
  controls, so one view was 76 Function invocations and 76 KV reads, none cacheable,
  all returning 503 because the bindings did not exist.
- An accepted report cost two KV writes — the counter and the dedupe key — and
  carried a read-modify-write race. Two readers voting on one entry inside the same
  window lost a count; with opposite verdicts the stale spread clobbered the other
  field too.
- The two writes were unguarded and not atomic. At the daily cap the exception became
  a 500. A failure on the second write left the counter incremented with no dedupe
  key, so one reader could re-increment without limit for the rest of the day.
- The two verbs gated differently. `GET` required `REPORTS`; `POST` required `REPORTS`
  **and** `REPORT_SECRET`. Binding the namespace without the secret revealed the
  control while every click failed silently — the exact failure the client's own
  header comment forbids.
- The route manifest had silently fallen back, so a page view was a metered request.
  `dist/_routes.json` was generated with `include: ["/*"]` and an exclude list the
  adapter filled with legacy redirect paths and image files until it reached the
  100-rule cap: 1 include rule and 99 exclude rules, of which exactly one — `/` — was
  a page. The other 130 of the 131 emitted HTML pages, and 36 of the 52 game OG
  images, were served by the metered Function on every view. It is recorded in full under "The
  manifest that had fallen back" below, because it is the largest thing this record
  corrects and nothing about it was visible from outside.

### The measured free ceilings

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

The binding constraint is KV writes: **1,000 accepted hearts per day**. Everything
else has two or more orders of magnitude of headroom. The `STATUS` namespace draws on
that same account-wide write budget, which is why the checker's cadence is part of the
accounting and not a separate question.

The last two rows are the ones that were not true when this record was opened, and
the section below says why. They hold for a build whose `_routes.json` names the
on-demand routes in `include` and leaves `exclude` empty, which is what the build now
writes and what `pnpm check:routes` reads back on every run.

### The manifest that had fallen back

`dist/_routes.json` decides, per path, whether Cloudflare answers from static assets
or wakes the Pages Function. The Cloudflare adapter built it the other way round: one
`exclude` rule per prerendered page, on an `include: ["/*"]` base. That shape is
correct only while the page count fits Cloudflare's cap of 100 rules, `include` and
`exclude` counted together. When it does not fit, the adapter keeps `include: ["/*"]`
and truncates the exclude list to whatever room is left
(`node_modules/@astrojs/cloudflare/dist/utils/generate-routes-json.js`).

The site outgrew the cap. No setting was changed, nothing was configured wrongly, and
no warning was printed: the manifest simply stopped naming most of the site, 130 of
the 131 built pages moved onto the metered Function, and each view of one cost an
invocation. That is the largest free-plan consumer on the site, and it had been true
of every deployment since the page count passed the cap. It is written down here
rather than fixed quietly because a fault that produces no symptom is a fault that
comes back.

The build now writes the manifest itself, from its own route data, in the opposite
direction. `include` names only what is genuinely on-demand and `exclude` is empty:
the two `/api/` endpoints collapsed to one rule, Astro's own `/_image/` and
`/_server-islands/*`, and the fifteen individual legacy URLs that answer 410 one path
at a time. That is 18 rules where there were 100, and it does not grow when a page is
added, because pages are not named in it. `pnpm check:routes` prints `131 of 131 built
pages are served as static assets, and 18 of 100 _routes.json rules are in use`.

Four wildcard families — `/category/*`, `/tag/*`, `/feed/*`, `/page/*` — used to sit in
that list and answer 410. They were retired to the static 404 for the reason recorded
below; `retiredArchivePrefixes` in `src/data/gone.ts` carries the full argument. The same derived list is written to
`src/data/route-rendering.json`, so the file that documents which routes are metered
is generated from the build rather than maintained by hand.

`pnpm check:routes` reads the manifest back on every run and checks it in both
directions: every built HTML page must resolve to a static asset, and every on-demand
route must be matched by an `include` rule. It counts `include` and `exclude`
together, because that is what Cloudflare counts. It is fatal, and the paragraph above
is the reason it is fatal rather than advisory.

### Why a signal for the queue tolerates a cap

Hearts never mint a star and never touch the index gate. They order the editor's
queue. A signal whose only job is ordering can be eventually consistent, capped, and
occasionally lossy without one thing the site displays becoming less true: the
thousand-and-first heart of a day changes the order of a queue nobody has reached yet.

That is the honest argument for staying free. It is also the reason the upgrade can
wait for evidence instead of being bought against a forecast. A feature that could
*not* survive its budget being exhausted would not get this argument, and by the
consequence at the foot of this record it would not get built.

## Decision

**Freetins runs on Cloudflare's free plan, and the free plan is the design target
rather than a phase to be grown out of.** Four readings below are taken rather than
argued. Three of them are engineering signals with named engineering answers, and are
never by themselves a reason to spend money. The fourth, and only the fourth, is the
buy signal: when it reads true the paid plan is bought, and not on judgement.

1. **A page view makes no metered request at all.** Two things have to hold for that,
   and both are read back by a check rather than remembered. The document itself is
   served as a static asset, because the manifest is derived from the build and names
   only the on-demand routes. And nothing on the page fetches on load: whether a
   control renders is decided at build time from configuration in source control,
   never discovered at runtime by probing the endpoint. The client speaks to the
   server only when a reader clicks.

2. **One write per accepted heart, and no race.** The vote record is the only key: one
   key per day, entry and fingerprint, holding the verdict, with the existing seven-day
   TTL. Each key is written by exactly one reader, so there is no read-modify-write
   and no race by construction. Counts are derived by listing that prefix when an
   editor works the queue, never on the request path.

3. **Degrade honestly at the cap, never with a 500.** The write is wrapped. A refusal
   answers `{ accepted: false, reason: 'paused' }` with 429, the client says so in one
   short line, and it does not spend a second request on a state that cannot change
   until the budget resets at 00:00 UTC. The reader is told the truth — this was not
   recorded — and nothing on the page is left claiming otherwise. The refusal is
   logged with the quota-or-fault discrimination the library computes, so the two are
   not indistinguishable in production.

4. **Fail closed, symmetrically.** Both verbs require both bindings *and* the same
   `services.reports.enabled` flag the markup is gated on, so the write budget is not
   live while the control renders nowhere. Without any of the three the endpoint
   answers 503, and the control renders nothing at all: no markup, no note, nothing
   for a reader to click into silence.

5. **Configuration, not a runtime probe, decides visibility.** `services.reports` in
   `src/content/operations.json` stays disabled until an operator has created the
   namespace and set the secret. That is what keeps the fail-closed promise without
   spending a request to discover it. Half of that ordering is checkable and is
   checked: `pnpm check:data` refuses `enabled: true` while `wrangler.toml` carries no
   uncommented `REPORTS` binding. The other half — whether the namespace and the
   secret exist in Cloudflare — cannot be read from this repository at all, so it is
   said rather than implied: nothing here verifies it, and the endpoint's 503 is what
   catches it.

6. **The upgrade is triggered by a reading, not by a feeling.** The four conditions
   below are checkable, and each names what answers it.

### The four upgrade triggers

| # | Condition | Read from | What answers it |
|---|---|---|---|
| 1 | Accepted hearts exceed 500 in a day — half the write budget — on seven consecutive days | `pnpm queue:hearts`, which lists the day's vote prefix and prints the totals | Move counts into a SQLite-backed Durable Object. Free. |
| 2 | Pages builds exceed 400 in a calendar month | the Cloudflare dashboard's build history | Batch deploys. |
| 3 | `_routes.json` `include` and `exclude` rules together reach 95 of 100 | printed by `pnpm check:routes` on every run | Restructure routes so fewer rules cover more paths. |
| 4 | Function invocations exceed 50,000 in a day | the Cloudflare dashboard's Workers analytics | Buy the paid plan. |

Only the fourth argues for money, and it corresponds to roughly 50,000 daily
*interactions*, which the site does not have. That reading depends on the manifest
above and on nothing else: an invocation is spent when a reader clicks rather than
when a page is opened, for exactly as long as `include` names the on-demand routes and
no page.

That claim was not true while the four WordPress archive wildcards were in the
manifest, and the gap is worth recording because nothing in this document would have
caught it. A wildcard matches an unbounded set of paths, so `/page/1/` through
`/page/9999/` were all live Function routes: an invocation was spent by a crawler with
no reader, no click and no page, and one bot walking the pagination could reach a fifth
of trigger 4 in an afternoon. It was the only uncapped metered surface on the site, and
it existed to answer for a site that no longer exists. Retiring those four to the
static 404 costs an archive listing 404 timing instead of 410 timing to leave the
index — slower by weeks, on listings nobody wrote and nobody links to — and closes the
hole. What remains on the Function is bounded: two endpoints a reader reaches by acting,
and fifteen named dead URLs. A trigger reading is only as good as the surface it
measures, and an unbounded surface is not measurable in advance. Were the manifest to fall back again, trigger 4 would quietly become roughly
50,000 daily *page views* — a figure the site could reach without this feature being
touched at all, and sooner still with hover prefetching. That is why the reading is
taken by `pnpm check:routes` on every run, and why that check fails rather than warns.

The first three are engineering answers to engineering readings, and the first is free
because of the correction at the top of this record.

## The operator setup

This is the only part of the system that is not code, so it is written here and in
`README.md` in the same words. Run:

```
wrangler kv namespace create REPORTS
wrangler kv namespace create STATUS
wrangler pages secret put REPORT_SECRET --project-name freetins
```

then paste the returned ids into `wrangler.toml` and set
`services.reports.enabled` to `true` in `src/content/operations.json`.

Until the last step is taken the control renders nowhere, which is the intended state
and not a fault to be worked around.

## Consequences

- **No feature may be designed that cannot degrade honestly when its budget is
  exhausted.** This is the general rule the specific decisions above are instances of.
  If the answer to "what does a reader see on the day this hits its ceiling" is a 500,
  a silent failure, or a number that is quietly wrong, the feature is not finished. A
  short true sentence is an acceptable answer; a stale count presented as a live one is
  not.
- A page view costs nothing metered, so reader traffic can grow without the budget
  moving: the budget is consumed by interactions, and only by interactions. That holds
  because of the manifest rather than because of the price list, which is why it is
  read back by CI instead of trusted.
- `prefetch` is left as it is, with `prefetchAll: true` and a `hover` strategy, so one
  reader running a cursor down a list asks for several pages they may never open. On
  static assets that is unmetered and costs nothing. It is recorded here because it is
  the multiplier that would apply to Function invocations if a page ever left the
  static path, and it is a second reason the route guard is fatal.
- `src/data/route-rendering.json` is written by the build from the same route data as
  the manifest. It is a generated artifact: which routes are metered is derived rather
  than asserted, and the two cannot drift apart.
- Trigger 1 has a command. `pnpm queue:hearts` lists the day's vote prefix through
  `wrangler kv key list`, prints per-entry totals and the `needsRecheck` verdict, and
  says what to do when `wrangler` is not authenticated rather than failing obscurely.
  A trigger with no way to take its reading is an argument wearing a table row.
- Counting moves off the request path and onto the aggregation path, which means a
  count is as fresh as the last time an editor worked the queue. That is the trade this
  record accepts, and it costs nothing because of ADR 0004 §2 and the hearts rule in
  `CLAUDE.md`: no state, badge or index decision reads a heart.
- `pnpm check:routes` carries the free-plan guard, so trigger 3's reading is taken on
  every CI run rather than remembered. It checks both directions — no built page on
  the Function, no on-demand route off it — because an empty `include` would put the
  two API endpoints on static assets and break them as silently as the fallback broke
  the pages.
- `pnpm check:data` refuses `services.reports.enabled: true` while `wrangler.toml`
  carries no uncommented `REPORTS` binding, so the half of the operator ordering that
  is visible in the repository has to agree with itself. Its message names both files
  and says plainly that it has not checked Cloudflare, because an operator reading a
  green check should not conclude more than the check performed.
- `wrangler.toml` carries the two KV bindings as commented templates with the commands
  above, so the bindings are documented in the repository instead of living only in a
  dashboard where nobody can review them. Uncommenting one means Cloudflare ignores the
  bindings configured in the dashboard for this project, which is a change to check
  before making, not after.
- `.dev.vars.example` names `REPORT_SECRET`, which the endpoint actually requires.
- The Durable Object is available on the free plan the day trigger 1 reads true. The
  work to adopt it is not pre-built, and a comment on the aggregation surface says so.

## What this does not change

The index gate, the states, and every promise in ADR 0004. A budget is not a gate:
nothing here may hide a row, delay a page, or keep anything out of the index. If a
future reading of these ceilings ever seems to argue for withholding content, the
answer is to spend the $5, not to publish less.

Hearts still never mint a star and never touch the index gate. Making them cheaper
does not make them count for more.
