# Verification checklist: Roblox promo codes

**Entity:** Roblox platform promo codes, Roblox Corporation
**Entity URL / redemption page:** https://www.roblox.com/redeem
**Support reference:** https://en.help.roblox.com/hc/en-us/articles/360029650831-How-Do-I-Redeem-a-Promo-Code

## Access path

1. Sign in to a **fresh test account** that has never redeemed a platform promo code. A reused account returns "already redeemed" and proves nothing.
2. For site wide codes: open https://www.roblox.com/redeem, paste the string into the single Code box, press Redeem, record the exact response text.
3. For Mansion of Wonder codes: join https://www.roblox.com/games/6901029464/Mansion-of-Wonder, walk to the Swag Booth, choose Redeem Code, enter the string.
4. For Island of Move codes: join https://www.roblox.com/games/5306359293/Island-of-Move, use the Click to Interact prompt, choose Redeem Code, enter the string.
5. Confirm the reward at https://www.roblox.com/my/inventory before ticking a line.

## Prerequisites

- Roblox account, signed in. No age, level or Premium requirement.
- No VPN. Region locking is a live failure mode on this platform, so test from the default region and note it if you do not.
- Do not test from an account that already owns the reward item.

## Notes for the tester

- A row moves from Unverified to Active only on a tier 0 result, meaning the code was redeemed on an account by us. Two outlets agreeing is tier 2 and stays Unverified.
- Record the response text verbatim. Roblox distinguishes invalid/expired from already used, and that distinction is the answer to the most searched question on this page.
- Casing is recorded as not significant on every row. If a code fails as written and succeeds in a different case, that is a finding: flag it and the `case_sensitive` field changes.
- Never test a Robux generator, a code claiming a Robux amount, or any third party site. Those are out of scope by policy, not by budget.

## Site wide codes

```
[ ] SPIDERCOLA  -> expected: Spider Cola shoulder accessory added to inventory  | evidence: https://www.roblox.com/catalog/3164811019/Spider-Cola https://www.gamesradar.com/roblox-promo-codes/ | gates: signed in account, redeem page | confidence: reported
```

## Mansion of Wonder codes (in-experience, Swag Booth)

```
[ ] Glimmer         -> expected: Head Slime hat accessory              | evidence: https://www.roblox.com/games/6901029464/Mansion-of-Wonder https://progameguides.com/roblox/roblox-promo-codes-list/ | gates: join experience, Swag Booth | confidence: reported
[ ] ThingsGoBoom    -> expected: Ghastly Aura waist accessory          | evidence: https://www.roblox.com/games/6901029464/Mansion-of-Wonder https://progameguides.com/roblox/roblox-promo-codes-list/ | gates: join experience, Swag Booth | confidence: reported
[ ] ParticleWizard  -> expected: Tomes of the Magus shoulder accessory | evidence: https://www.roblox.com/games/6901029464/Mansion-of-Wonder https://www.gamesradar.com/roblox-promo-codes/ | gates: join experience, Swag Booth | confidence: reported
[ ] FXArtist        -> expected: Artist Backpack back accessory        | evidence: https://www.roblox.com/games/6901029464/Mansion-of-Wonder https://progameguides.com/roblox/roblox-promo-codes-list/ | gates: join experience, Swag Booth | confidence: reported
[ ] Boardwalk       -> expected: Ring of Flames waist accessory        | evidence: https://www.roblox.com/games/6901029464/Mansion-of-Wonder https://progameguides.com/roblox/roblox-promo-codes-list/ | gates: join experience, Swag Booth | confidence: reported
```

## Island of Move codes (in-experience, Redeem Code prompt)

```
[ ] SettingTheStage -> expected: Build It Backpack back accessory          | evidence: https://www.roblox.com/games/5306359293/Island-of-Move https://progameguides.com/roblox/roblox-promo-codes-list/ | gates: join experience, Redeem Code prompt | confidence: reported
[ ] StrikeAPose     -> expected: Hustle Hat                                | evidence: https://www.roblox.com/games/5306359293/Island-of-Move https://progameguides.com/roblox/roblox-promo-codes-list/ | gates: join experience, Redeem Code prompt | confidence: reported
[ ] GetMoving       -> expected: Speedy Shades                             | evidence: https://www.roblox.com/games/5306359293/Island-of-Move https://progameguides.com/roblox/roblox-promo-codes-list/ | gates: join experience, Redeem Code prompt | confidence: reported
[ ] WorldAlive      -> expected: Crystalline Companion shoulder accessory  | evidence: https://www.roblox.com/games/5306359293/Island-of-Move https://www.gamesradar.com/roblox-promo-codes/ | gates: join experience, Redeem Code prompt | confidence: reported
[ ] DIY             -> expected: Kinetic Staff back accessory              | evidence: https://www.roblox.com/games/5306359293/Island-of-Move https://progameguides.com/roblox/roblox-promo-codes-list/ | gates: join experience, Redeem Code prompt | confidence: reported
[ ] VictoryLap      -> expected: Cardio Cans hat                           | evidence: https://www.roblox.com/games/5306359293/Island-of-Move https://progameguides.com/roblox/roblox-promo-codes-list/ | gates: join experience, Redeem Code prompt | confidence: reported
```

## Open questions for the tester

```
[ ] Case handling   -> expected: enter SPIDERCOLA as "spidercola" on a second fresh account and record whether it redeems | gates: fresh account | confidence: conflicting
[ ] Punctuation     -> *HAPPY2019ROBLOX*, $ILOVETHEBLOXYS$, !HAPPY12BIRTHDAYROBLOX!, ONEMILLIONCLUB!, WEAREROBLOX300! and ROADTO100KAY! carry symbols only the community archive prints. All are expired, so this is a string accuracy check against an archived Roblox page, not a redemption test.
[ ] Redirect        -> confirm https://www.roblox.com/promocodes still lands on https://www.roblox.com/redeem. If Roblox splits them again, the redemption section and entity_url both change.
```
