# Verification checklist: Monopoly Go Golden Blitz

**Access path.** Install MONOPOLY GO! (App Store ID 1621328561, publisher Scopely) and open it on the device the account is signed in on. Tap the sticker album icon to confirm the album is unlocked. A live Golden Blitz appears as its own icon at the side of the game board and as an entry with a countdown in the events menu. If neither is present, no window is running and every occurrence row below is checked against the source lists instead of the app.

**Entity URL.** https://apps.apple.com/us/app/monopoly-go/id1621328561

**Prerequisites.** An account with the sticker album unlocked. At least one duplicate gold sticker to test a send. A second account or a friend on the in game friends list to receive it. No purchase is required.

**Timezone.** All windows below are recorded in UTC. One tracker records a 05:00 UTC start for most windows and 04:00 UTC for one. Convert before comparing against a local screenshot, because a one day discrepancy between sources is usually this and nothing more.

**Under a minute per line.** Open the source list, find the occurrence by its sticker pair, read the date beside it, compare.

---

## Expected occurrence, not announced

```
[ ] Next Golden Blitz, not announced  -> expected: no publisher announcement exists; predicted pair Set 16 Family Portrait and Set 17 The Goods; date not fixed by Scopely  | evidence: https://www.pcgamesn.com/monopoly-go/golden-blitz https://monopolygo.game/next-monopoly-go-golden-blitz | gates: album unlocked, duplicate of a featured sticker held | confidence: conflicting
```

Check this line by opening the in game events menu first. If a Blitz icon with a countdown is present, record the observed start and end in UTC and the two featured stickers, then move the row out of the expected table. If no icon is present, the row stays Unverified regardless of what any tracker prints.

## Past occurrences

```
[ ] Golden Blitz, 21 August 2026  -> expected: window 21 to 22 August 2026, Set 13 Honey, I'm Home and Set 14 Rudy Root  | evidence: https://www.pcgamesn.com/monopoly-go/golden-blitz https://monopolygo.game/next-monopoly-go-golden-blitz | gates: duplicate required to send | confidence: reported
[ ] Golden Blitz, 28 July 2026  -> expected: window 28 to 29 July 2026, Set 20 Ranier Wolfcastle and Set 21 Guy Incognito  | evidence: https://www.pcgamesn.com/monopoly-go/golden-blitz https://mogostickers.com/monopoly-go-latest-game-news/when-is-the-next-golden-blitz-monopoly-go | gates: duplicate required to send | confidence: reported
[ ] Golden Blitz, 25 July 2026  -> expected: window 25 to 26 July 2026, Set 18 Carl Carlson and Set 21 Mr. Snrub  | evidence: https://www.pcgamesn.com/monopoly-go/golden-blitz https://monopolygo.game/next-monopoly-go-golden-blitz | gates: duplicate required to send | confidence: reported
[ ] Golden Blitz, 22 July 2026  -> expected: window 22 to 23 July 2026, Set 18 Lenny Leonard and Set 17 Shutdown  | evidence: https://www.pcgamesn.com/monopoly-go/golden-blitz https://monopolygo.game/next-monopoly-go-golden-blitz | gates: duplicate required to send | confidence: reported
[ ] Golden Blitz, 19 July 2026  -> expected: window 19 to 20 July 2026, Set 21 Homer's Hoagie and Set 15 Northern Lights  | evidence: https://www.pcgamesn.com/monopoly-go/golden-blitz https://mogostickers.com/monopoly-go-latest-game-news/when-is-the-next-golden-blitz-monopoly-go | gates: duplicate required to send | confidence: reported
[ ] Golden Blitz, 12 July 2026  -> expected: window 12 to 13 July 2026, Set 20 Kent Brockman and Set 18 Pickled Eggs; DISPUTED, one outlet dates this three days earlier  | evidence: https://monopolygo.game/next-monopoly-go-golden-blitz https://mogostickers.com/monopoly-go-latest-game-news/when-is-the-next-golden-blitz-monopoly-go | gates: duplicate required to send | confidence: conflicting
[ ] Golden Blitz, 4 July 2026  -> expected: window 4 to 5 July 2026, Set 15 Obviously Grilled and Set 16 More Coffee  | evidence: https://www.pcgamesn.com/monopoly-go/golden-blitz https://monopolygo.game/next-monopoly-go-golden-blitz | gates: duplicate required to send | confidence: reported
[ ] Golden Blitz, 28 June 2026  -> expected: window 28 to 29 June 2026, Set 13 Blinky and Set 14 Sad Schmuck; DISPUTED, one outlet dates this two days earlier  | evidence: https://monopolygo.game/next-monopoly-go-golden-blitz https://mogostickers.com/monopoly-go-latest-game-news/when-is-the-next-golden-blitz-monopoly-go | gates: duplicate required to send | confidence: conflicting
[ ] Golden Blitz, 2 June 2026  -> expected: window 2 to 3 June 2026, Set 24 Brick House and Set 24 Blown Away; one tracker records a 04:00 UTC start rather than 05:00 UTC  | evidence: https://www.pcgamesn.com/monopoly-go/golden-blitz https://monopolygo.game/next-monopoly-go-golden-blitz | gates: duplicate required to send | confidence: reported
[ ] Golden Blitz, 29 May 2026  -> expected: window 29 to 30 May 2026, Set 22 Transformed and Set 24 Howling Wolf  | evidence: https://www.pcgamesn.com/monopoly-go/golden-blitz https://mogostickers.com/monopoly-go-latest-game-news/when-is-the-next-golden-blitz-monopoly-go | gates: duplicate required to send | confidence: reported
```

## Mechanic checks, one window each

```
[ ] Five sends per featured sticker per day  -> expected: the sixth send of the same featured sticker is refused inside a single UTC day  | evidence: https://www.pcgamesn.com/monopoly-go/golden-blitz https://gamerant.com/monopoly-go-golden-blitz-explained-work/ | gates: duplicate held, friend on list | confidence: reported
[ ] Blitz allowance is separate from the daily sticker trade limit  -> expected: exhausting the ordinary sticker trade limit does not block a Blitz send  | evidence: https://www.pcgamesn.com/monopoly-go/golden-blitz https://gamerant.com/monopoly-go-golden-blitz-explained-work/ | gates: both limits reachable in one session | confidence: reported
[ ] Only the two featured gold stickers unlock  -> expected: any non featured gold sticker shows no send option during a live window  | evidence: https://www.pcgamesn.com/monopoly-go/golden-blitz https://gamerant.com/monopoly-go-golden-blitz-explained-work/ | gates: duplicate of a non featured gold sticker held | confidence: reported
[ ] A duplicate is required to send  -> expected: a singly held featured sticker cannot be sent  | evidence: https://www.pcgamesn.com/monopoly-go/golden-blitz https://gamerant.com/monopoly-go-golden-blitz-explained-work/ | gates: exactly one copy of a featured sticker held | confidence: reported
[ ] Window duration  -> expected: the events menu countdown, recorded in UTC at open and at close; sources claim anything from a few hours to a full day  | evidence: https://www.pcgamesn.com/monopoly-go/golden-blitz https://dotesports.com/monopoly-go/news/when-is-the-next-golden-blitz-in-monopoly-go | gates: a live window | confidence: conflicting
```

## Notes for the checker

1. Do not upgrade any row to Confirmed on the strength of a third tracker. Confirmed requires a tier 0 or tier 1 source, and for this event that means observing the window in the app or a post on a Scopely owned channel. Nothing else counts.
2. If a window is observed in the app, record the start and end in UTC, both featured stickers with their set numbers, and a screenshot of the countdown. That single observation is the only route to a tier 0 evidence entry on this page.
3. If two sources disagree by exactly one calendar date, check the start time before recording a conflict. A 05:00 UTC start converts to the previous local date in the Americas, which accounts for most single day splits.
4. The two rows flagged DISPUTED differ by two and three days respectively. Those are not timezone artefacts and must not be reconciled without a new source.
5. Re-run the whole list every Monday and Thursday, and re-run the expected row within 24 hours of any Blitz appearing in the game or on the official Discord.
