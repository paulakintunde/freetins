# Verification checklist: Monopoly GO Tycoon Club

**Page:** `/guides/monopoly-go-tycoon-club/`
**Entity:** MONOPOLY GO!, published by Scopely, Inc. App Store ID 1621328561
**Entity URL:** https://apps.apple.com/us/app/monopoly-go/id1621328561
**Primary publisher source:** https://support.monopolygo.com/article/e2f83c11-234c-4ae3-a61b-97d38d0daf77

## Access path a tester follows

1. Open MONOPOLY GO! on a phone, signed in to the account under test.
2. Tap the menu icon in the top corner of the board screen.
3. Select **Tycoon Club**. Record whether the entry is present and which platform the device runs.
4. If present: copy the link from the popup, paste it into the device browser, open it.
5. If absent: open the device browser, go to `https://www.monopolygo.com/`, tap **LOGIN**, sign in with the linked Facebook account.
6. Record the exact labels of every item in the post-login left menu. This is the single biggest unverified area on the page.

## Account and level prerequisites

- Board level 11 or higher.
- 30 to 35 full days of recorded activity on the account.
- An invitation already issued in game. There is no way to request one.
- A Facebook account linked to the game, or a MONOPOLY GO! account if that option is offered post-login.
- No purchase required to reach the club. A purchase is required to hold any Loyalty Points.

## Rows

### eligibility

```
[ ] Board level 11  -> expected: invite gate is board level 11, not 10  | evidence: https://support.monopolygo.com/article/e2f83c11-234c-4ae3-a61b-97d38d0daf77 https://www.pcgamesn.com/monopoly-go/tycoon-club | gates: none | confidence: confirmed
[ ] 30 to 35 full days of activity  -> expected: publisher states a range, outlets state a flat 35  | evidence: https://support.monopolygo.com/article/e2f83c11-234c-4ae3-a61b-97d38d0daf77 https://www.pcgamesn.com/monopoly-go/tycoon-club | gates: none | confidence: confirmed
[ ] An invitation issued in game  -> expected: invitation only, no member-to-member invite control exists anywhere in the UI  | evidence: https://support.monopolygo.com/article/e2f83c11-234c-4ae3-a61b-97d38d0daf77 https://www.pcgamesn.com/monopoly-go/tycoon-club | gates: none | confidence: confirmed
[ ] Any spending at all  -> expected: no purchase requirement stated or enforced for the invite or for joining  | evidence: https://support.monopolygo.com/article/e2f83c11-234c-4ae3-a61b-97d38d0daf77 https://www.thegamer.com/monopoly-go-tycoon-club-explained/ | gates: none | confidence: reported (absence claim)
[ ] A sign-in method for the web club  -> expected: check whether the login panel offers a MONOPOLY GO! account option as well as Facebook  | evidence: https://www.monopolygo.com/ https://support.monopolygo.com/ | gates: linked Facebook account | confidence: conflicting
```

### benefits

```
[ ] Tycoon Club Store  -> expected: same offers as in game with extra value, some in-game offers absent, purchase counts shared with the app  | evidence: https://support.monopolygo.com/article/e2f83c11-234c-4ae3-a61b-97d38d0daf77 https://www.thegamer.com/monopoly-go-tycoon-club-explained/ | gates: membership | confidence: confirmed
[ ] Loyalty Points  -> expected: paid on web Store purchases only, scaled to total spend not per item  | evidence: https://support.monopolygo.com/article/e2f83c11-234c-4ae3-a61b-97d38d0daf77 https://www.thegamer.com/monopoly-go-tycoon-club-explained/ | gates: membership plus a web purchase | confidence: confirmed
[ ] Benefits section  -> expected: bundles bought with points, each capped at a set number of redemptions, delivered into the game  | evidence: https://support.monopolygo.com/article/e2f83c11-234c-4ae3-a61b-97d38d0daf77 https://www.pcgamesn.com/monopoly-go/tycoon-club | gates: Loyalty Points | confidence: confirmed
[ ] Milestone track and Tycoon Pass  -> expected: advances only by spending points elsewhere, stored total resets on a new track, three day gap between passes  | evidence: https://support.monopolygo.com/article/e2f83c11-234c-4ae3-a61b-97d38d0daf77 https://www.pockettactics.com/monopoly-go/tycoon-club | gates: Loyalty Points | confidence: confirmed
[ ] Tycoon Club Store free gift  -> expected: claimable free, and claimable in addition to the in-game free gift on the same day  | evidence: https://support.monopolygo.com/article/e2f83c11-234c-4ae3-a61b-97d38d0daf77 https://gamerant.com/monopoly-go-how-access-get-back-tycoon-club-android-button-website/ | gates: membership | confidence: confirmed
[ ] Profile card and achievements  -> expected: upgraded Tycoon Card, badges, exactly three selectable at once  | evidence: https://support.monopolygo.com/article/e2f83c11-234c-4ae3-a61b-97d38d0daf77 https://www.pcgamesn.com/monopoly-go/tycoon-club | gates: membership | confidence: confirmed
[ ] Tycoon Stats  -> expected: refreshed about monthly, shows the previous month, empty on a new account  | evidence: https://support.monopolygo.com/article/be779dab-6648-45d4-a1e6-ef5e6dac001a https://www.pockettactics.com/monopoly-go/tycoon-club | gates: membership | confidence: confirmed
[ ] First-time Purchase Bonus  -> expected: one per price point across app and web combined, not one in each  | evidence: https://support.monopolygo.com/article/e2f83c11-234c-4ae3-a61b-97d38d0daf77 https://www.thegamer.com/monopoly-go-tycoon-club-explained/ | gates: none | confidence: confirmed
[ ] Daily Wheel  -> expected: confirm whether a free daily wheel exists at the foot of the Benefits tab at all  | evidence: https://www.pockettactics.com/monopoly-go/tycoon-club https://gamerant.com/monopoly-go-how-access-get-back-tycoon-club-android-button-website/ | gates: membership | confidence: reported, needs a human look
```

### issues

```
[ ] Tycoon Club button missing from the in-game menu  -> expected: help centre banner still live, and the menu entry still absent on at least one Android device  | evidence: https://support.monopolygo.com/ https://gamerant.com/monopoly-go-missing-tycoon-club-button-facebook-fix-dev-comment/ | gates: membership | confidence: confirmed
[ ] The /benefits address people were told to use  -> expected: https://www.monopolygo.com/benefits redirects to the site root; retest while signed in  | evidence: https://www.monopolygo.com/benefits https://gamerant.com/monopoly-go-how-access-get-back-tycoon-club-android-button-website/ | gates: none signed out, membership signed in | confidence: reported, needs a human look
[ ] Home screen shortcut will not stay signed in on iOS  -> expected: reproduce on an iOS 16 device, confirm it holds on current iOS  | evidence: https://support.monopolygo.com/article/e2f83c11-234c-4ae3-a61b-97d38d0daf77 | gates: membership, iOS device | confidence: reported
[ ] Tycoon Pass disappears between seasons  -> expected: three day gap between one pass closing and the next opening  | evidence: https://support.monopolygo.com/article/e2f83c11-234c-4ae3-a61b-97d38d0daf77 | gates: membership | confidence: reported
[ ] Invitation never arrives after clearing both thresholds  -> expected: no publisher-stated queue or timeframe exists; check whether the help article has added one  | evidence: https://www.pcgamesn.com/monopoly-go/tycoon-club https://www.gamesradar.com/platforms/mobile-gaming/monopoly-go-tycoon-club/ | gates: board level 11 plus the days rule | confidence: conflicting
[ ] Refunding a Tycoon Club purchase  -> expected: receipts held in the Xsolla account, refund requested through Scopely support, not the app store  | evidence: https://support.monopolygo.com/article/d8710677-d2a7-4872-a103-150c50fba474 | gates: a completed web purchase | confidence: reported
```

## Archived rows, recheck only if a source contradicts

```
[ ] Board level 10  -> expected: stays Expired unless Scopely restates 10 as the threshold  | evidence: https://support.monopolygo.com/article/e2f83c11-234c-4ae3-a61b-97d38d0daf77 https://www.pockettactics.com/monopoly-go/tycoon-club | gates: none | confidence: confirmed
```

## Standard applied on this page

A row reaches `confirmed` only where Scopely's live help centre states it and an independent outlet corroborates the same fact. A fact stated only by Scopely stays `reported`. A fact stated only by outlets stays `reported` and its row status stays `unverified`. Nothing behind the club's sign-in was observed directly, because no invited account was available.
