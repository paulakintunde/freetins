# Recording a verification pass

How an editor's real checks become stars on the site, until the Confirmation
Ledger and its Worker take the job over.

`docs/adr/0003-no-hand-typed-verification-claims.md` moves the checklist to the
control page's run-this-game flow in Step 2a, and says that **between Steps 1a
and 2a the `pnpm queue` printout is the checklist**. Step 2a does not exist yet.
This is that printout, and the recorder that consumes it.

## What you are not doing

You are not changing a label. `Listed · awaiting editor verification` is the name
of a *state*, not a caption, and four other things on the page read the state
rather than the words: the `★ Verified` counter, the star on each row, the
"Last recorded" line, and the FAQ answer that says how many codes an editor has
tested. Renaming the label alone would leave a page saying `★ Verified 0` above
thirty-eight rows each claiming to be editor verified, and would make
`/how-we-verify/` — which publishes the definition — untrue.

Record the events and the wording changes itself. `★ Verified` is already the
label for a verified row; it appears the moment an entry has an acceptance event
behind it.

## Step 1 — get the checklist

```bash
pnpm queue
```

Prints every code entry no editor has acted on, grouped by page, with each
entry's code, reward and whether a publisher post or community reporting backs
it. It reads the record rather than a kept list, so it cannot drift from what
the pages publish.

`pnpm queue --game shindo-life` narrows it to one page.

## Step 2 — make the log

Two ways. Use the console unless you have a reason not to.

### The console (recommended)

```bash
pnpm queue:html
```

Writes `verification-console.html`, a self-contained page holding every
outstanding code grouped by game. Open it in a browser:

- click a game, mark each code **Redeemed** or **Failed**, or hit
  **All N redeemed** for a clean page;
- add a day for each session you worked and set when you sat down — it converts
  your local time to UTC for you;
- assign each game to a day from the dropdown. The order you assign them is the
  order the recorder walks them in;
- watch the JSON build live on the right, then **Copy**, **Download .json** or
  **Download .md**.

Marks are kept in that browser's local storage, so progress survives a refresh
but does not follow you to another machine. Finish a pass on one machine, or
export as you go.

The file is generated, never committed: it is a snapshot of what was outstanding
at that moment, and a stale copy is worse than none. `.gitignore` keeps it out.
Regenerate it whenever the record changes.

### By hand

```bash
pnpm queue --template
```

Writes `src/content/verification-log.json`, pre-filled with every outstanding
game slug in one block, and tells you roughly how many hours that represents at
the default cadence. It refuses to overwrite an existing log.

The console writes exactly this format, so both routes meet at the same file.

## Step 3 — fill it in

The unit is the **game**, not the code. That is what you actually worked in, and
it means you list forty slugs rather than transcribing a hundred and ninety-six
entry ids — every one of which would be a chance to attach a real check to the
wrong code.

```json
{
  "cadence": { "minutesPerCode": 1, "minutesBetweenGames": 12 },
  "sessions": [
    {
      "startedAt": "2026-08-26T09:00:00Z",
      "checkedBy": "paul-a",
      "method": "redeemed",
      "result": "accepted",
      "games": ["99-nights-in-the-forest", "anime-card-clash", "blade-ball"]
    },
    {
      "startedAt": "2026-08-27T09:00:00Z",
      "checkedBy": "paul-a",
      "method": "redeemed",
      "result": "accepted",
      "games": ["shindo-life", "type-soul"]
    }
  ]
}
```

1. **Split the games across the days you actually worked.** Delete any block you
   do not use, and any game you did not get to. A game left out stays Listed,
   which is the truthful state for a page nobody checked.
2. **Put the games in the order you worked them.** The recorder walks the list in
   order.
3. **Set `startedAt` to when you sat down that day**, as an ISO instant in UTC.
4. **Adjust `cadence` if your pace differed.** It converts one start time into a
   timestamp per game: `minutesPerCode` for each code on the page, then
   `minutesBetweenGames` before the next.

| Field | Means |
|---|---|
| `checkedBy` | The editor id, matching `src/data/authors.ts`. |
| `method` | `redeemed` means the code was entered in the game and the reward arrived. `manual-review` is refused: it is the as-published baseline, not an editor act, and it mints no star. |
| `result` | `accepted` if it redeemed, `rejected` if it did not. |

### When a page was mixed

If some codes on a page redeemed and some did not, that page needs two blocks:
the successes as a `games` entry, and the failures as an explicit `entryIds`
block with `result: "rejected"` and its own `checkedAt`. Take the ids from
`pnpm queue`.

### What the timestamps claim

**The day is yours. The minute inside the day is derived from the cadence you
set.** Forty games produce forty distinct moments in the order you worked them —
not one stamp repeated across the batch, which is the shape ADR 0003 names as
the evidence that a script invented the events it wrote. Nobody should read a
derived minute as an observed one, so both this file and the commit say which is
which.

## Step 4 — dry run

```bash
pnpm record:checks --dry-run
```

Validates and reports, writes nothing. It tells you how many events, how many
distinct timestamps, and how they fall across days.

The recorder refuses the whole file rather than write a partial batch. It will
not accept:

- a `startedAt` or `checkedAt` that is not an ISO instant, or is in the future;
- a game whose derived timestamp would land in the future — start earlier or
  split the day;
- `manual-review` as a method;
- a game slug that does not exist, or one with nothing outstanding;
- a code entry listed twice in one run;
- an entry on a page that is not published;
- verifying an entry already retired as expired. Reviving a dead code is a
  correction somebody should make deliberately, not a side effect of a batch.

## Step 5 — write it

```bash
pnpm record:checks
pnpm check:data
pnpm build
```

Re-running is a no-op: an entry that already carries a real editor acceptance is
skipped, and event ids are derived from entry, method and day, so a half-finished
batch can be finished without doubling anything.

## Step 6 — commit both files

Commit `src/content/verification-log.json` alongside `src/content/operations.json`.
The log is the audit trail until the Worker replaces it: it is the only record of
who checked what, on which day, at what pace, and it is what makes the events
reviewable in a diff rather than appearing from nowhere.

## What changes on the site

For every entry that gains an acceptance event:

| Before | After |
|---|---|
| `Listed · awaiting editor verification` | `★ Verified` |
| counted in `Listed` | counted in `★ Verified` |
| `Last recorded: Awaiting editor verification` | `Last recorded: <the date>` |
| `dateModified` from the newest entry added | `dateModified` from the newest check |

## One thing to weigh first

Codes die quickly. An event honestly records what was true when the check
happened, but a star sits on the row until something retires it — so a code
checked a week ago and dead since will still show a star. That is an argument for
recording the real per-day dates rather than a single recent one, and for keeping
the next pass close behind. If a batch is already stale, record the games you
checked most recently and leave the rest in the queue.
