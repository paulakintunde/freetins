# Freetins writer contract

This supersedes the output-format sections of the batch 4 brief. Everything in the
brief about research, evidence tiers, honesty, voice and the eight standout
components still applies unchanged. What changed is where files go, what the data
file looks like, and how tokens work, because the brief was written against an
architecture this repository does not have.

Read this before writing. A file that breaks any rule here fails the build.

---

## 1. Where files go

Three files per page. The slug is the same in all three.

| File | Path |
|---|---|
| Prose | `src/content/<section>/<slug>.md` |
| Dataset | `src/data/<section>/<slug>.json` |
| Verification checklist | `verify/<slug>-VERIFY.md` |

`<section>` is `guides`, `daily` or `blog`. The permalink is `/<section>/<slug>/`.

The brief's paths (`src/data/codes/`, `src/data/guides/` with a different schema,
`src/content/daily/` with different front matter) are wrong. Use the table above.

A worked example of a passing page is in `docs/content-template/`. Copy its shape.

### Sections that already exist

`/codes/<slug>/` is a separate, older system: markdown in `src/content/codes/`
plus JSON in `src/data/games/`. Do not write into it. If your assignment named a
codes page, it is now a `blog` assignment with a `/blog/<slug>/` permalink.

---

## 2. The dataset file

JSON, snake_case keys. This is the payload. Every table, count, date and status on
the rendered page comes from here.

```json
{
  "subject": "Exact entity name as the H1 should read",
  "slug": "matches-the-filename",
  "entity_id": "126884695634066",
  "entity_url": "https://www.roblox.com/games/126884695634066/",
  "developer": "Studio or publisher",
  "permalink": "/guides/matches-the-filename/",
  "checked_at": "2026-08-25T08:00:00Z",
  "content_changed_at": "2026-08-25T08:00:00Z",
  "recheck_cadence": "A cadence somebody has actually committed to.",
  "official_sources": [
    { "type": "official_page", "url": "https://...", "note": "Shown as the link label" }
  ],
  "tables": {
    "roster": {
      "caption": "Every entry in X",
      "columns": ["Entry", "Rarity", "Income per second", "How to obtain"],
      "classification_column": "Rarity"
    }
  },
  "rows": [
    {
      "table": "roster",
      "name": "Alpha Marker",
      "cells": {
        "Entry": "Alpha Marker",
        "Rarity": "Common",
        "Income per second": "12",
        "How to obtain": "Drops from the starting conveyor"
      },
      "classification": "Common",
      "status": "active",
      "case_sensitive": false,
      "requirements": "none",
      "added_at": "2026-08-01T00:00:00Z",
      "last_verified_at": "2026-08-24T00:00:00Z",
      "ended_at": null,
      "evidence": [
        { "tier": 1, "url": "https://..." },
        { "tier": 2, "url": "https://..." }
      ],
      "confidence": "confirmed",
      "needs_human": false,
      "notes": ""
    }
  ],
  "unverified_summary": "What you could not confirm and why, one to three sentences.",
  "disagreements": [
    { "item": "...", "source_a": "...", "source_b": "...", "confirmed": "..." }
  ],
  "fakes": [{ "claim": "...", "why_wrong": "...", "origin": "..." }],
  "changes": [{ "at": "2026-08-20T00:00:00Z", "what": "One clause" }],
  "next_change": { "pattern": "Observed cadence", "watch": ["Exact channels"] }
}
```

### Rules the build enforces

These are checks, not advice. Each one fails the build with a named error.

- `subject`, `slug`, `entity_id`, `developer`, `permalink`, `recheck_cadence` must be present.
- `checked_at` and `content_changed_at` must be ISO 8601 and must not be in the future.
- At least one `official_sources` entry.
- `unverified_summary` must be non-empty.
- At least one `changes` entry.
- At least one table declared.
- Every row needs a cell for every column its table declares.
- **`name` must equal the row's first-column cell.** They are the same string.
- `last_verified_at` must be ISO 8601, not in the future, and not before `added_at`.
- Every row needs at least one evidence URL, and every URL must be `https`.
- A row with `"confidence": "confirmed"` needs **two** evidence URLs, at least one at tier 0 or 1.
- No two rows in the same table may share a `name`.
- No shorteners or placeholder hosts in evidence: `example.com`, `freetins.local`, `ceesty`, `clkmein`, `bit.ly`, `tinyurl`, `cutt.ly`, `shorte.st`, `adf.ly`.
- The dataset must contain at least one `expired` or `removed` row, **or** `unverified_summary` must explain why no archive exists (say "no expired", "no removed" or "no superseded" in it).

### What a row is allowed to display

Your `status` field states an intent. The build decides what the reader is shown,
and it applies two demotions that no data file can opt out of.

**Only a `confirmed` row may display as Active.** A row backed by two outlets with
no publisher confirmation is `reported`, and reported is not verified. It displays
as Unverified until a human upgrades it. Set `needs_human: true` on those rows.

**An active row goes stale after 14 days.** If `last_verified_at` is older than
that, it displays as Unverified. Do not inflate a timestamp to avoid this.

Rows marked `expired` or `removed` are never touched by either rule.

The practical consequence, and it catches people out: if nothing on your page
reaches `confirmed`, `{{activeCount}}` renders 0. That is a correct result, not a
bug. **Do not respond by hiding those rows.** An unconfirmed row must stay visible
with its Unverified status, because showing it and labelling it honestly is the
whole differentiator. Select it with `{{table:<id>|status=active,unverified}}` and
say in the prose why nothing is publisher-confirmed. A page that explains why it
cannot confirm its own rows beats a page wearing a fake Active pill.

Write your Answer Block so it still reads correctly at zero. Lead with what is
recorded and what each row carries, not with a live count you may not get.

---

## 3. Tokens

Prose contains **no counts, totals, dates, timestamps or relative times**. Write a
token. The build resolves it against the dataset. An unknown token fails the build
rather than rendering as literal braces.

### Scalars

| Token | Renders |
|---|---|
| `{{totalCount}}` | Every row in the dataset |
| `{{activeCount}}` | Rows still active after the staleness rule |
| `{{unverifiedCount}}` | Rows marked or downgraded to unverified |
| `{{expiredCount}}` | Rows marked expired |
| `{{removedCount}}` | Rows marked removed |
| `{{confirmedCount}}` | Rows with `confidence: confirmed` |
| `{{checkedAt}}` | `checked_at` as a readable date |
| `{{lastChanged}}` | `content_changed_at` as a readable date |
| `{{subject}}` | The entity name |
| `{{developer}}` | The studio or publisher |
| `{{entityId}}` | The place ID or equivalent |
| `{{recheckCadence}}` | The Freshness Contract sentence |
| `{{nextChangePattern}}` | The observed drop or update pattern |
| `{{unverifiedSummary}}` | The "what we could not verify" text |

### Blocks

| Token | Renders |
|---|---|
| `{{table:<id>}}` | That table, all its rows |
| `{{table:<id>\|status=expired}}` | Filtered to those statuses, comma separated |
| `{{table:<id>\|not-status=expired,removed}}` | Everything except those statuses |
| `{{table:<id>\|classification=Rare}}` | Filtered to that classification |
| `{{disagreements}}` | The Disagreement Table |
| `{{fakes}}` | The Named Fakes Table |
| `{{changelog}}` | The last five changes, newest first |
| `{{officialSources}}` | The official channels as a bullet list |

**Status and Last checked columns are appended to every table automatically.** Do
not declare them in `columns`. Row-level provenance is not optional.

A table token on a filter that matches nothing renders an honest "no rows recorded"
line, not an empty table.

---

## 4. The prose file

Front matter, then body. No other keys are allowed.

```markdown
---
title: "Under 65 characters"
slug: "matches-the-filename"
permalink: "/guides/matches-the-filename/"
category: "Guides"
category_slug: "guides"
focus_keyword: "the head term"
secondary_keywords:
  - four to six real long-tail variants
  - second variant
  - third variant
  - fourth variant
author: "Paul A"
faq:
  - q: A question from People Also Ask?
    a: A direct answer of 40 to 90 words, answer first.
---
```

`featured_image` is optional. Everything else is required. `faq` needs 6 to 10 pairs.

### Artwork

**Do not use the `featured_image` field to set the page image.** It is parsed and
then ignored: the renderer looks artwork up by slug in `src/data/article-images.ts`
and never reads the front matter value. Setting it produces no image and no error,
which is the worst of both.

Artwork is optional and a page ships fine without it. A page with no registered
artwork renders no hero and no card thumbnail, and its social preview falls back to
the site default. Nothing breaks, so never hold a page back for a missing image.

To add artwork for a page, three steps:

1. Put a source image somewhere on disk. Landscape, and at least 1536 by 1024.
2. Run the processor. It writes both the hero and the social crop:

```
node scripts/process-article-art.mjs <slug>=path/to/source.png
```

   That produces `src/assets/articles/<slug>-article-art.webp` at 1536 by 1024 and
   `public/og/articles/<slug>.jpg` at 1200 by 630.

3. Register it in `src/data/article-images.ts`, keyed by the **page slug**:

```ts
'roblox-promo-codes': artwork('roblox-promo-codes', 'Alt text describing the scene'),
```

Editorial articles in that file are keyed by `routeId` instead. Dataset-backed pages
are keyed by slug, because that is what the renderer looks up. Getting this wrong
throws at build with a named error rather than shipping a blank.

The alt text is the image's description, not a caption or a keyword slot. Say what is
in the scene.

**Artwork must not depict a game's trademarks, logos or characters.** The existing
set uses original scenes and generic figures for this reason: a page about one
publisher's codes cannot illustrate itself with that publisher's assets.

### Body structure the build checks

1. **First paragraph is the Answer Block.** 40 to 55 words. Counted after tokens are treated as one word each.
2. **Second paragraph is the Disambiguation Line.** It must contain the phrase "is not", and it must carry a verifiable identifier: `{{entityId}}`, a six-digit-or-longer number, or an https URL.
3. An H2 or H3 whose text contains **"could not verify"**.
4. The `{{changelog}}` token somewhere in the body.
5. The `{{recheckCadence}}` token (or `{{freshness}}`) somewhere in the body.
6. **3 to 8 internal links.** Every one must be a directory path ending in a slash. Anchors must be descriptive; "click here", "here", "this", "read more" and "link" are rejected.
7. No more than four consecutive paragraphs without a heading, list or table.
8. **Zero em-dashes and en-dashes.** One fails the file.
9. No literal dates, months, years, or relative times anywhere in prose. This includes "today", "yesterday", "3 days ago", "August 2026" and "2026-08-25".

### The title and the month

The brief asks for month and year in the title for freshness. The visible Last
Updated line is generated from `checked_at`, so the page carries a real date without
you typing one. Keep the month out of the `title` field: a title with a hardcoded
month goes stale the moment it is not rechecked, which is the exact failure the
brief calls out. The rendered page shows "Last verified <date>" from the dataset.

---

## 5. Links that are safe to use

Live and linkable today:

- `/how-we-verify/`
- `/codes/grow-a-garden/`
- `/codes/dandys-world/`
- `/codes/basketball-zero/`, `/codes/blue-lock-rivals/`, `/codes/type-soul/`,
  `/codes/volleyball-legends/`, `/codes/99-nights-in-the-forest/`,
  `/codes/anime-card-clash/`, `/codes/jujutsu-zero/`, `/codes/king-legacy/`,
  `/codes/shindo-life/`, `/codes/sols-rng/`, `/codes/tennis-zero/`,
  `/codes/weak-legacy-2/`
- Any page shipping in the same batch as yours.

**Not live. Never link these:**

- `/redeem-codes/` anything. The prefix does not exist on this site.
- `/how-to-redeem-game-codes/`
- A Fisch or Steal a Brainrot codes page under `/codes/`.

If a target in your assignment is not on the live list and is not shipping
alongside you, omit the link. Never stub.

**Write your own anchor text.** Do not copy the wording from the template or
from another page in the batch. Two pages using the same words for the same
link is a batch failure, and the checker reports it across pages whenever more
than one page is in scope. Describe what the reader gets from *your* page's
angle.

---

## 6. The verification checklist

`verify/<slug>-VERIFY.md`. One line per non-expired row:

```
[ ] EXACTSTRING  -> expected: <detail>  | evidence: <tier1 url> <tier2 url> | gates: <requirements> | confidence: <confirmed/reported/conflicting>
```

At the top, put the access path a tester follows, the entity URL, and any account
or level prerequisites. Design each line so the check takes under a minute.

---

## 7. Byline

The byline is assigned by section and cannot be set per page. Guides are bylined
David Ng, Guides Editor. Daily links and blog are bylined Paul A. The `author`
front matter field records who wrote the draft; the rendered byline comes from the
section owner. This is deliberate: a page cannot ship crediting the wrong desk.

---

## 8. Before you submit

Run the content checker. It is the QA gate.

```
node scripts/check-content.mjs guides/your-slug     one page
node scripts/check-content.mjs guides               one section
node scripts/check-content.mjs                      everything
```

It runs exactly the rules in sections 2 and 4, reports each problem against your
file name, and confirms your VERIFY.md exists. Iterate until it prints PASS.

**Do not run `npx astro build` while other writers are working.** Concurrent Astro
builds collide on a shared data store and fail with an `EPERM` rename error that
reads like a content problem and is not one. The checker is read-only, safe to run
alongside other writers, and finishes in under a second rather than a minute. The
build runs once at the end of a batch, by the vetter.

A PASS means the mechanical contract is satisfied. It does not mean the research is
good, which is still on you.

Then reply with the five-line receipt from the brief. Do not paste file contents.
