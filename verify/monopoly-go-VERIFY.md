# Verification checklist: Monopoly GO free dice links

**Page:** /daily/monopoly-go/
**Entity:** MONOPOLY GO! by Scopely, App Store ID 1621328561
**Entity URL:** https://apps.apple.com/us/app/monopoly-go/id1621328561
**Dataset:** src/data/daily/monopoly-go.json

## Access path a tester follows

1. Install MONOPOLY GO! on a phone or tablet and sign in to the account you are testing with.
2. Open the official Instagram Story, Facebook page or Discord server from the official sources list in the dataset and locate the drop named in the row.
3. Tap the drop's link on the same device the game is installed on. A desktop browser will not credit rolls and is not a valid test.
4. Read the in-app confirmation. "Reward claimed" is a pass. "This reward has already been claimed" means the account has already used it, so retest on a fresh account before recording a fail.
5. Record the result against the row name exactly as written below.

## Prerequisites

- A game account already past the tutorial, with the board unlocked.
- A second account is needed to retest any row that returns "already claimed".
- Several outlets report a Level 15 gate on link redemption. It is unconfirmed by Scopely, so note the account level with every result.
- Each link is single use per account. Plan the order of tests before starting.

## Rows to check

[ ] 75 dice drop, 24 August  -> expected: 75 free dice credit on tap, window closes 25 August 2026  | evidence: https://www.pocketgamer.com/monopoly-go/free-dice/ https://www.pcgamesn.com/monopoly-go/dice-links-free | gates: tap on the device running the game, one claim per account | confidence: reported
[ ] Daffy Duck shield drop, 29 July  -> expected: Daffy Duck shield skin credit, no dice, window closes 23 November 2026  | evidence: https://www.pocketgamer.com/monopoly-go/free-dice/ https://beebom.com/monopoly-go-dice-links/ | gates: tap on the device running the game, one claim per account | confidence: reported
[ ] 25 dice drop, 20 August  -> expected: window already closed, confirm only that the drop existed and its reward size  | evidence: https://simplegameguide.com/monopoly-go-free-dice-links/ | gates: archive check only, single aggregator source | confidence: reported
[ ] 25 dice drop, 19 August  -> expected: window already closed, confirm only that the drop existed and its reward size  | evidence: https://simplegameguide.com/monopoly-go-free-dice-links/ | gates: archive check only, single aggregator source | confidence: reported
[ ] 25 dice drop, 18 August  -> expected: window already closed, confirm only that the drop existed and its reward size  | evidence: https://simplegameguide.com/monopoly-go-free-dice-links/ | gates: archive check only, single aggregator source | confidence: reported
[ ] 75 dice drop, 17 August  -> expected: window already closed, confirm only that the drop existed and its reward size  | evidence: https://simplegameguide.com/monopoly-go-free-dice-links/ | gates: archive check only, single aggregator source | confidence: reported

Expired rows are not retested. The 25 dice drop posted on 21 August is recorded as Expired with its window closing on 24 August 2026 and stays in the dataset as the archive entry.

## Page-level checks

[ ] Every official source in the dataset resolves and is a Scopely-owned channel, not an aggregator.
[ ] No shortener or placeholder host appears in any evidence URL.
[ ] No link URL appears anywhere in the prose file.
[ ] Every active row has a posting date and a closing date visible in its table row.
[ ] If no drop was logged at the last check, the live block says so in words rather than repeating an older row.
[ ] Internal links point only to /guides/monopoly-go-tycoon-club/, /guides/monopoly-go-golden-blitz/ and /how-we-verify/.
[ ] The stated recheck cadence in the dataset matches what the desk actually runs.
