# ADR 0003: No hand-typed verification claims

Status: accepted, 26 August 2026
Applies from: Confirmation Ledger Step 1a, whose first commit lands inside week one
(see the plan, revision 5)
Related: ADR 0001 (the Confirmation Ledger) and ADR 0002 (the apex rule), both to be
written in Step 1a. On every field this record retires, it outranks
`docs/WRITER-CONTRACT.md` v1.

Scope, amended by ADR 0004 (every article gets a pass): this rule governs what the
site displays as a verification claim for content created from cutover forward. It
never reaches back — existing content keeps the status it displays on cutover day as
its baseline — and it is never a reason to reject, delay or de-index a page: the check
that enforces it is advisory, reporting typed claims to the editor queue, and a page
carrying them is accepted and rendered as awaiting editor verification.

## Context

The site's promise is that every claim of verification is real: a named person did
something on a date, and the page can show it. The reviews of the Confirmation
Ledger plan found that the authoring contract itself violates that promise in the
one place the plan had not looked: fields and files where a writer *types* that a
check happened.

What the repository shows on the day of this decision:

- `verify/<slug>-VERIFY.md` is a mandatory third file for every dataset page.
  `scripts/check-content.mjs` checks that it exists and reads no line of it.
  Nothing else reads it. All ten files have exactly one commit: created with the
  page, never touched since. The file proves a file was made, not that a row was
  tested.
- Every dataset page's `checked_at` equals the day the page was written. It renders
  as "Last verified <date>" on the page and the hub cards. `content_changed_at`
  renders as `dateModified` and the earliest `changes[]` entry as `datePublished` in
  structured data. Writing dates are being presented as verification dates.
- Each row's `status`, `last_verified_at` and `confidence` are typed by the writer,
  who did not test the row; 85 of the 495 rows across the ten pages also carry a
  typed `ended_at`. The checker enforces the shape of the claim, not the act.
- Each page's `recheck_cadence` is a typed promise: "Rechecked every Monday and
  Thursday morning UK time", "every weekday morning", "re-tested against Roblox's
  own …". Ten promises, none scheduled, none performed.
- `changes[]` is a hand-typed changelog beside a system whose purpose is to keep a
  real one.
- `needs_human` is set on 155 of 155 rows on one page and 20 of 20 on another. A flag
  on everything carries no information, and it duplicates the recheck queue.
- Editorial articles carry a typed `reviewedAt` and `reviewLabel` ("Reviewed 24 August
  2026") set at migration. Six legal pages use the same label for an effective date
  ("Effective 23 August 2026"), which is a fact, not a review claim.
- The operational side has the same defect at its root. All 164 verification events
  in `src/content/operations.json` were written by
  `scripts/build-operational-content.mjs`, which for every row typed `active` in
  `src/data/games/*.json` emitted `{result: 'source-only', method: 'manual-review',
  checkedBy: 'paul-a', checkedAt: <the page's typed checked_at>}`, and for every row
  typed `expired` a `rejected` event from the typed `expired_at`. Sixty-six of them
  share two batch timestamps. A script invented the reviewer and copied a writer's
  date. Not one of the 164 records an act.

A second family has the same failure mode: hand-maintained registries that
duplicate something derivable and rot the same way. `src/data/route-rendering.json`
lists on-demand routes the build manifest already knows; `docs/batch-manifest.json`
tracks twelve in-flight pages by hand, five of which never landed, and links to
them pass the checker; `scripts/check-content-batch.mjs` hardcodes the paths it
checks; the same sources are declared on each dataset page (`official_sources`), on
each game (`publisherChannels`) and in the source register — and the register holds
none of the ten pages' sources, which are app-store listings, the Roblox redeem
page and help centres; the writer contract's "live links" list is a hand-copied
snapshot of the route table.

The root cause is the same everywhere: verification was modelled as something an
author types rather than something an editor does. The ledger fixes the root; this
decision removes the residue.

## Decision

**No field a person types may assert that a check, review or recheck happened, or
that a row ended.**

A writer types facts an author can know: that a row exists (`name`, `cells`), where it
was seen (`evidence[]`), when it was added (`added_at`), what it requires
(`requirements`), and the stable facts of the page (`subject`, `entity_id`,
`developer`, `official_sources` as register ids, `description`). Everything about
testing is an event in the ledger with an actor, a method and a server timestamp,
or it is not on the page.

Concretely:

| Retired | Replaced by |
|---|---|
| `verify/<slug>-VERIFY.md` and its existence check | A checklist generated from the dataset by the control page's run-this-game (or -page) flow from Step 2a — between Steps 1a and 2a the `pnpm queue` printout is the checklist; the result is an `editor-verified`, `editor-reviewed` or `editor-retired` event |
| Row `status`, `last_verified_at`, `confidence`, `ended_at` | Derived from the row's ledger events; a new row is Listed until an editor acts, and ends only by an `editor-retired` event or a link's `expires_at` |
| Dataset `checked_at`, `content_changed_at` | "Editor checked <date>" and `dateModified` from the newest editor event on the page's rows; `datePublished` from the earliest row `added_at` |
| Dataset `recheck_cadence` | A sentence generated from `recheckTargetDays` |
| Dataset `changes[]` | `{{changelog}}` rendered from events |
| Row `needs_human` | The recheck queue |
| Article `reviewedAt`, `reviewLabel` | A "Reviewed by <editor> · <date>" line rendered only from a real `editor-reviewed` event; `publishedAt` stays as the authorship fact; legal pages keep a typed `effectiveAt`, rendered "Effective <date>" |
| The 164 operational verification events | Sightings: `source-seen` from each code's first source URL, each carrying the row's current status as `asPublished`; the site's first real review or retirement is the first one an editor makes |
| The mandatory "could not verify" section | Required when the dataset declares any `disagreements[]` entry or an `unverified_summary`, or when any row's newest event is `editor-acknowledged`; absent otherwise. prose-qa checks the first two from the dataset and the third from the assembled ledger |
| `route-rendering.json`, `batch-manifest.json`, the batch path list, the contract's live-links list | Derived from the build manifest, the content directories and the route table |
| Three source declarations | Register ids. The register first gains `official-page`, `app-store` and `help-centre` kinds for every source the ten pages cite; after that a dataset may not carry a URL in `official_sources` |
| `unverified_summary` as the card and search description | A front-matter `description` under 160 characters; `unverified_summary` becomes optional and means what it says |

Seeding existing pages at cutover follows the same rule. A dataset row seeds one
`source-seen` from its first evidence URL, attributed to the collector `import`, with
`at` from `added_at` — which Step 1a's first commit backfills into the three dataset
files that lack it (180 rows) from each row's git first-add commit, listing those rows
in the cutover report; `added_at` is required on every row from that commit. The
sighting carries the row's displayed state on cutover day as `asPublished: 'active'
| 'unverified' | 'expired'`, and that is the row's baseline: an Active row stays
"Active · as published", an unconfirmed row becomes "Listed · awaiting editor
verification" with no change in visibility, an expired row stays Expired in the
archive. Nothing is demoted. The typed `status`, `last_verified_at`, `confidence` and
`ended_at` are not turned into editor claims — the baseline is labelled as published,
not as checked. An article seeds one `editor-added` at `publishedAt`, attributed to
its author, carrying the review line it shows today as its baseline; that line stays
until a real `editor-reviewed` event replaces it. The 164 operational events seed as
sightings the same way, each with its current status as baseline. No seed ever
produces a star, a new review line or a retirement.

The token vocabulary follows: `{{unverifiedCount}}` becomes `{{listedCount}}` (rows in
the Listed state); `{{removedCount}}` and `{{confirmedCount}}` retire;
`{{expiredCount}}` counts retired and TTL-expired rows; `{{checkedAt}}` and
`{{lastChanged}}` render "awaiting editor verification" on a new page with no editor
event, while pages that predate the ledger keep their baseline date until an editor
event replaces it; table filters take `verified`, `active` (the as-published
baseline), `listed` and `expired`; `{{freshness}}` stays as the alias of
`{{recheckCadence}}`.

An advisory CI check reports the rule once the ledger lands — it never fails the
build: a new dataset page carrying `status`, `last_verified_at`, `confidence`,
`ended_at`, `checked_at`, `content_changed_at`, `changes`, `recheck_cadence` or
`needs_human`, or a new article carrying `reviewedAt` or `reviewLabel`, is accepted
and rendered as awaiting editor verification, its typed claims ignored for display
and listed in the editor queue as "typed claims to confirm" (ADR 0004).

## Consequences

- Dataset pages go from three files to two. The writer contract (v2) and the article
  router change accordingly; the ten existing VERIFY files are deleted from the tree
  in Step 1a and stay in git history as the pre-ledger record.
- The validator, normaliser, prose checks and content checker change in the first
  commit of Step 1a, which lands inside week one so the five commissioned daily pages
  pass CI on arrival and are never written twice.
- At launch, every existing row and article keeps the status it shows today, and
  every new row shows "Listed · awaiting editor verification". Stars, retirements
  and new review lines appear as editors act, beginning with the first editor pass
  (plan Step 2b) — which no page waits on to be indexed.
- Hub cards show "Editor checked <date>" once a real event exists for the page;
  pages that predate the ledger keep their "Last verified <date>" line as the
  baseline until then, and new pages show "Added <date>"; the description comes from
  the front matter.
- The `{{checkedAt}}`, `{{lastChanged}}`, `{{changelog}}` and `{{recheckCadence}}`
  tokens keep their names and change their source. Five pages whose sentences assume
  a checked date are rewritten in the copy sweep.
- The prose-qa rule requiring a "could not verify" heading becomes conditional, so
  no page carries filler to satisfy a rule.
- Cutover events that are not verification claims — the pin and hide events that
  replace `publicationState`, and the settings events that record
  `recheckTargetDays` — are written by the editor running the cutover, carry the
  note "migrated from <field>", and are listed in the cutover report. No event is
  manufactured by a script.
- Writers lose nothing they could honestly supply, and gain a shorter contract.
- The cost is about two extra days in Step 1a of the plan.

## What this does not change

The apex rule. An editor's event still supersedes everything within its dimension.
This decision only insists that the event be real: made through the control page or
a break-glass git edit by a registered editor, with a method and a server timestamp,
never typed into an authoring file by someone who did not perform it — and never
manufactured by a script from someone else's typed date.

Legal effective dates. "Effective 23 August 2026" on the privacy and terms pages is a
fact about the document, not a claim about a check; it stays, as `effectiveAt`.
