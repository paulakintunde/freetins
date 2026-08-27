# Freetins writer contract, v2

This is the contract for every dataset-backed page written from now on. It
replaces `docs/WRITER-CONTRACT.md` (v1) for new pages. Pages written to v1 keep
every field v1 asked for; the build still reads those fields and nobody is asked
to rewrite a page (docs/adr/0004). If you are editing an older page, leave its
v1 fields alone and add new rows in the v2 shape.

Two decisions shape everything below:

- **Verification is an act, not a field** (docs/adr/0003). You do not type a
  status, a check date or a confidence on anything. An editor verifies a row by
  testing it after the page is live, and that act appears on the page by itself.
- **Every article gets a pass** (docs/adr/0004). A page that passes the checker
  is published, indexed and linked. It is never held back, noindexed or bounced
  for want of verification. What you write is listed as *awaiting editor
  verification*, which is a full listing and not a demotion.

Read this before writing. A file that breaks a rule here fails the checker, and
the checker tells you exactly which rule.

---

## 1. Where files go

Two files per page. The slug is the same in both.

| File | Path |
|---|---|
| Prose | `src/content/<section>/<slug>.md` |
| Dataset | `src/data/<section>/<slug>.json` |

`<section>` is `guides`, `daily` or `blog`. The permalink is `/<section>/<slug>/`.

There is no third file. The `verify/` checklist file of v1 is not produced and
not read: a tester's result is recorded on the page as an event, not written up
as a document.

Templates to copy: `docs/content-template/example.md` and `.json` (a guides
roster page) and `docs/content-template/daily-example.md` and `.json` (a daily
links page). Both are in the v2 shape: neither carries a field from the list in
section 2 below. Both pass every check except their placeholder sources.

---

## 2. The dataset file

Snake case keys, as the templates show.

### Page fields

| Key | Required | What it is |
|---|---|---|
| `subject` | yes | The entity the page is about, as its publisher names it |
| `slug` | yes | Same as the file name |
| `entity_id` | yes | The subject's own identifier: a numeric listing id, or a URL for a platform-wide mechanism |
| `entity_url` | no | The subject's official listing |
| `developer` | yes | Publisher or developer, as named on the listing |
| `permalink` | yes | `/<section>/<slug>/` |
| `official_sources` | yes, at least one | `{ type, url, note }`. The publisher's own channels: listing, Discord, Facebook, X, help centre |
| `tables` | yes, at least one | See below |
| `rows` | yes | See below |
| `reader_confirmations` | no | `true` or `false`. Whether readers may confirm rows on this page. Omit to take the section default |
| `disagreements` | no | `{ item, source_a, source_b, confirmed }` where two sources conflict |
| `fakes` | no | `{ claim, why_wrong, origin }` for fabrications you found circulating |
| `unverified_summary` | no | Prose for the "What we could not verify" section, only when there is something you genuinely could not verify |
| `changes` | no | `{ at, what }`. Only real changes. Omit on a new page; the change log then reads "No changes recorded yet" |
| `next_change` | no | `{ pattern, watch }` |

### Fields you do not type

Most of these exist on v1 pages, where the build reads them as that page's
as-published baseline and never as a claim; the cadence sentence and the
per-row human flag were removed from every page at cutover and nothing reads
them. **A new page does not carry any of them.** They are claims about
verification, and you are not the one verifying. If you supply them anyway the
page is still accepted: they are ignored for display and printed by
`pnpm check:content` as typed claims for the editor queue. When present they are
validated for form only (a date must be ISO 8601 and not in the future), listed as
typed claims, and never rejected: carrying them is not a reason to bounce a page.

`checked_at`, `content_changed_at`, `recheck_cadence`, and on rows: `status`, `last_verified_at`, `confidence`, `needs_human`, `ended_at`. <!-- retired-vocabulary: allow, names the fields only to say they are not typed -->

If you know a row has ended, say so in `notes` and keep the row: the editor
retires it, and a retired row stays visible as Expired rather than vanishing.

### Tables

```json
"tables": {
  "links": {
    "caption": "Free spins links for Pipeline Check",
    "columns": ["Post", "Reward", "Channel"],
    "kind": "link",
    "classification_column": "Rarity"
  }
}
```

- `columns` are the subject columns. Status and Last checked are appended by the
  build on every table; never add them yourself.
- `kind` is `code` (something redeemed), `link` (something opened, which expires)
  or `fact` (something observed). Omit for `fact`.
- `classification_column` names the column used for `{{table:<id>|classification=...}}`
  sub-tables.

### Rows

```json
{
  "table": "links",
  "name": "Facebook morning post",
  "cells": { "Post": "Facebook morning post", "Reward": "25 free spins", "Channel": "Facebook" },
  "added_at": "2026-08-20T09:30:00Z",
  "expires_at": "2026-08-23T09:30:00Z",
  "url": "https://example.invalid/claim/placeholder-1",
  "requirements": "Open on the device that has the game installed",
  "evidence": [{ "tier": 1, "url": "https://example.invalid/placeholder-facebook/posts/1" }],
  "notes": ""
}
```

| Key | Required | Rule |
|---|---|---|
| `name` | yes | Unique within its table, and equal to the first column's cell. A name is the row's identity, so it must stay unique as the page grows: for links that recur daily, name the post, not the reward |
| `table` | no | Defaults to the first table |
| `cells` | yes | One value per column of the table |
| `added_at` | yes | ISO 8601, not in the future. When the row was first seen. This is the one date every row carries: sort order, the "New" chip and the ledger all read it |
| `evidence` | yes, at least one | `{ tier, url }`, https only, no shorteners. The tier is the source's distance from the publisher: 0 the game itself, 1 the publisher's own channel, 2 an independent outlet, 3 a community sighting |
| `requirements` | no | What the reader must have or do |
| `classification` | no | Matches the table's classification column |
| `case_sensitive` | no | For codes |
| `url` | link rows | The reward URL, https |
| `expires_at` | link rows | Only an expiry the publisher itself has stated, ISO 8601. `null` whenever the publisher has stated nothing, which is the usual case, and an omitted key means the same. A derived window, a measured window or a window an outlet reports is never typed here: it is a report about the link, not a fact the publisher set, so it belongs in a visible cell that names who reported it. Typed here it retires rows on a schedule no publisher chose, against what /how-we-verify/ promises the reader |
| `id` | no | Defaults to `<slug>:<table>:<name slugified>`. Set it only if the derived one would collide or if a name must change while the row keeps its history |
| `notes` | no | Plain text |

There is no minimum number of evidence URLs for any row and no tier a row must
reach. You record where you saw it; the editor decides what it is.

### Rules the build enforces

Beyond the table above: at least one official source, at least one table, every
row's table exists, every column has a cell, `name` equals the first column's
cell, `added_at` is ISO and not in the future, evidence and `url` are https and
not on a banned domain, `expires_at` is ISO when present, table `kind` is one of
the three, row ids are unique, every `changes[].at` is ISO 8601 when `changes` is
present, and a typed `id` is letters, digits and `: _ . / -`.

### What a row displays

Every row you write renders as **Listed · awaiting editor verification** with
"not yet" in its Last checked column. When an editor tests it the row shows
**★ Verified** and the date of that test, without anyone editing the file. When
an editor retires it, or a link row passes its `expires_at`, it shows **Expired**
and stays in the table. Those are the only two ways in: no row reaches Expired
unless an editor has retired it or an expiry its publisher stated has passed,
which is what /how-we-verify/ promises the reader. The fourth label,
**Active · as published**, is the baseline carried by v1 rows that displayed
Active on cutover day; no row written to this contract ever carries it. You
cannot mark a row active, and you do not need to: a listed row is fully
rendered, indexed and linked from the section hub, and no state on any page
changes because time has passed.

---

## 3. Tokens

The names are v1's. What they count changed with the ledger: a state is never a
typed value and never a function of the clock.

### Scalars

| Token | Renders as |
|---|---|
| `{{totalCount}}` | Rows on the page |
| `{{activeCount}}` | Rows carrying the Active · as published baseline: the state a v1 row displayed on cutover day. **Always zero on a page written to this contract**, so do not build the Answer Block on it; build it on `{{totalCount}}` |
| `{{verifiedCount}}` | Rows an editor has starred. Zero until an editor acts; say "no row is starred yet", never "0 active" |
| `{{listedCount}}` | Rows in the Listed state |
| `{{expiredCount}}` | Rows an editor has retired, link rows past `expires_at`, and rows expired or removed in a v1 baseline |
| `{{unverifiedCount}}`, `{{removedCount}}`, `{{confirmedCount}}` | Retired for new pages (docs/adr/0003) and kept only as aliases so v1 pages keep building: `{{unverifiedCount}}` equals `{{listedCount}}`, `{{removedCount}}` counts rows whose baseline was removed, `{{confirmedCount}}` counts rows typed `confidence: confirmed`. Do not write them |
| `{{checkedAt}}`, `{{lastChanged}}` | On a v1 page, the typed dates, read as the baseline. On a new page, the words "awaiting editor verification". Do not write a sentence that assumes a date, such as "last verified {{checkedAt}}"; the daily template shows the alternative |
| `{{recheckCadence}}`, `{{freshness}}` | Always the derived sentence, on every page: "Rechecks are recorded on this page as editors make them. A row whose Last checked column reads not yet has not been tested by an editor." It promises no schedule and no automatic downgrade, and nothing you type changes it |
| `{{subject}}`, `{{developer}}`, `{{entityId}}`, `{{nextChangePattern}}`, `{{unverifiedSummary}}` | As named |

### Blocks

| Token | Renders as |
|---|---|
| `{{table:<id>}}` | The table with Status and Last checked appended |
| `{{table:<id>\|status=...}}`, `\|not-status=...`, `\|classification=...` | Filtered views. `status=` and `not-status=` take `verified`, `active` (the as-published baseline), `listed` and `expired`, comma-separated. `unverified` and `removed` are accepted only as aliases on v1 pages; do not write them |
| `{{changelog}}` | Newest five changes, or "No changes recorded yet." |
| `{{disagreements}}`, `{{fakes}}`, `{{officialSources}}` | As named |

---

## 4. The prose file

### Front matter

| Key | Required | Rule |
|---|---|---|
| `title` | yes | 65 characters or fewer |
| `slug`, `permalink`, `category`, `category_slug`, `focus_keyword`, `author` | yes | As v1 |
| `secondary_keywords` | yes | 4 to 6 |
| `description` | no, strongly recommended | 155 characters or fewer. This is the hub card and the search snippet. Without it the hub falls back to `unverified_summary`, then the title |
| `featured_image` | no | As v1 |
| `faq` | yes | 6 to 10 pairs, answers 40 to 90 words |

Any other key fails the checker.

### Body structure the build checks

1. **Answer Block**: the first paragraph, 40 to 55 words, extractable whole.
2. **Disambiguation Line**: the second paragraph, containing "is not" and either
   `{{entityId}}`, a six-digit-or-longer id, or an https URL.
3. At least one `{{table:...}}`.
4. **Change Log**: `{{changelog}}` under its own heading.
5. **Freshness**: `{{recheckCadence}}` or `{{freshness}}` under its own heading.
6. **What we could not verify**: an H2 or H3 containing "could not verify", with
   `{{unverifiedSummary}}` under it. **Required only when** the dataset has an
   `unverified_summary` or any `disagreements`. If you could verify everything
   you listed, leave the section out; a section that exists to say nothing is
   filler.
7. 3 to 8 internal links, each a directory path ending in a slash, each with a
   descriptive anchor. Section 5 of v1 lists the safe targets and still applies.
8. No em or en dashes. No literal dates or relative times in prose; dates live
   in the dataset and reach the page through tokens. No more than four
   consecutive paragraphs without a heading, list or table.

---

## 5. Links, byline

Unchanged: v1 §5 (links that are safe to use) and v1 §7 (byline) apply as written.

---

## 6. Before you submit

```
pnpm check:content <section>/<slug>
```

It must print `PASS`. A page that passes is published on the next build. There
is no vetting step that can hold it, and no verification step you have to wait
for. Verification happens after, by the editor, and shows up on the page as it
happens.

---

## 7. v1 to v2 at a glance

| | v1 | v2 |
|---|---|---|
| Files | prose, dataset, `verify/` checklist | prose, dataset |
| Page dates | `checked_at`, `content_changed_at` typed | not typed; the ledger supplies them |
| Freshness | `recheck_cadence` typed, no longer read | not typed; the same derived sentence renders on every page <!-- retired-vocabulary: allow, names the v1 field --> |
| Row status | `status`, `confidence`, `last_verified_at` typed, read as the as-published baseline | not typed; every row is listed awaiting editor verification until an editor acts |
| Row date | `added_at` optional | `added_at` required |
| Evidence | confirmed rows need two URLs including tier 0 or 1 | at least one URL; no tier rule |
| "Could not verify" section | always required | required only when there is something unverified |
| Change log | at least one entry required | optional; empty renders "No changes recorded yet" |
| Hub description | `unverified_summary` | `description` in front matter |
| Link rows | not modelled | `kind: link`, `url`, `expires_at` |
| Reader confirmations | none | `reader_confirmations` per page |
