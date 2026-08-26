export interface LaunchGameContent {
  slug: string;
  summary: string;
  redemptionIntro: string;
  redemptionSteps: string[];
  rewardNote: string;
  sourceNote: string;
}

// These are the first editorially supported code pages. Active codes are
// intentionally kept out of this file and must come from the verified release workflow.
export const launchGameContent: Record<string, LaunchGameContent> = {
  'anime-apocalypse': {
    slug: 'anime-apocalypse',
    summary: 'Use this page to track verified Anime Apocalypse code releases without mixing rumours into the active list.',
    redemptionIntro: 'Open the in-game menu from the lobby, then choose the Codes option before entering a code exactly as published.',
    redemptionSteps: ['Launch Anime Apocalypse in Roblox.', 'Open the Menu control near the top of the screen.', 'Choose Codes and paste one code into the entry field.', 'Select Redeem and check that the reward reaches your inventory.'],
    rewardNote: 'Codes are commonly tied to updates, milestones, or developer announcements. Enter them promptly because game codes can expire without notice.',
    sourceNote: 'Check the official Roblox experience and developer announcements first; community posts are leads, not proof.',
  },
  'anime-eternal': {
    slug: 'anime-eternal',
    summary: 'Anime Eternal codes are most useful when you are progressing through worlds, champions, and upgrades, so this page separates verified drops from old lists.',
    redemptionIntro: 'The code field is in the in-game Shop menu, rather than on the Roblox website.',
    redemptionSteps: ['Launch Anime Eternal in Roblox.', 'Open Shop from the side of the screen.', 'Scroll to the code entry section at the bottom of the menu.', 'Paste the code exactly, then select Redeem.'],
    rewardNote: 'A successful redemption usually updates your in-game inventory or currencies immediately. If it does not, check the spelling and whether you already redeemed it.',
    sourceNote: 'Prioritise the experience description and the developer\'s official channels when a new update arrives.',
  },
  'anime-final-quest': {
    slug: 'anime-final-quest',
    summary: 'Anime Final Quest code drops can move quickly around updates, so the active list should contain only releases that have passed the editorial check.',
    redemptionIntro: 'Look for the code or social icon in the in-game side menu, then enter the code exactly as it was released.',
    redemptionSteps: ['Launch Anime Final Quest in Roblox.', 'Open the code entry control from the side menu.', 'Paste one code without changing capitals, symbols, or spacing.', 'Select Redeem and confirm the reward in your account.'],
    rewardNote: 'If the game says a code is invalid, do not assume another player mistyped it: it may be expired or limited to a newer server build.',
    sourceNote: 'Use official announcements as the release source and keep unconfirmed community submissions out of the active table.',
  },
  'anime-guardians': {
    slug: 'anime-guardians',
    summary: 'This Anime Guardians page is for verified code releases and a clear redemption path, not recycled lists that leave expired rewards mixed with current ones.',
    redemptionIntro: 'Use the Codes button in the in-game interface to open the entry field.',
    redemptionSteps: ['Launch Anime Guardians in Roblox.', 'Find and select the Codes control in the game interface.', 'Paste the code exactly as shown in the verified list.', 'Press Redeem and confirm the reward in your balance or inventory.'],
    rewardNote: 'Codes may have access requirements after an update. If the redemption control is unavailable, complete the game\'s opening progression and check again.',
    sourceNote: 'The official Roblox experience and developer Discord are the primary channels for new releases.',
  },
  'anime-last-stand': {
    slug: 'anime-last-stand',
    summary: 'Anime Last Stand codes often accompany updates, so this page keeps the useful steps and only lists codes once their status has been checked.',
    redemptionIntro: 'Join the game\'s official Roblox community first, then use the Codes gift icon in the in-game interface.',
    redemptionSteps: ['Join the official Anime Last Stand Roblox community.', 'Launch Anime Last Stand and open the Codes gift icon.', 'Paste the code exactly as published.', 'Select Redeem and confirm the reward message.'],
    rewardNote: 'A group-membership requirement can make a valid code fail. Rejoin the experience after joining the community if the game does not recognise it immediately.',
    sourceNote: 'Verify a drop against the developer\'s official announcement before treating it as active.',
  },
  'anime-ranger-x': {
    slug: 'anime-ranger-x',
    summary: 'Anime Ranger X codes are useful for players building a new squad, but eligibility requirements matter as much as the code itself.',
    redemptionIntro: 'After meeting the game\'s entry requirements, open the Code option from the in-game interface.',
    redemptionSteps: ['Join the game\'s official Roblox community and like the experience if required.', 'Reach the level required by the current code release.', 'Open the Code option from the game interface.', 'Paste the code and select Redeem.'],
    rewardNote: 'Some releases have a level gate. If a verified code does not work, check the release note before assuming it has expired.',
    sourceNote: 'Developer announcements are the source of record; reward videos and reposts should be independently verified.',
  },
  'anime-vanguards': {
    slug: 'anime-vanguards',
    summary: 'Anime Vanguards codes are published here only after verification, with level restrictions called out when the game applies them.',
    redemptionIntro: 'Open the blue Profile button on the right of the lobby screen, then choose the purple Codes option in your profile.',
    redemptionSteps: ['Progress until the code option is unlocked.', 'Open Profile on the right-hand side of the lobby.', 'Choose the purple Codes option in the profile panel.', 'Paste the exact code and select Redeem.'],
    rewardNote: 'The code menu and individual releases can have level requirements. Keep progressing if the profile does not yet show the option.',
    sourceNote: 'Check the official Anime Vanguards announcements before trusting a code shared elsewhere.',
  },
  'azure-latch': {
    slug: 'azure-latch',
    summary: 'Azure Latch releases can include normal and follow-code rewards, so this page records only codes whose source and redemption path are clear.',
    redemptionIntro: 'Open the in-game menu and use its current code entry control; menu labels can change after a game update.',
    redemptionSteps: ['Launch Azure Latch in Roblox.', 'Open the in-game menu from the lobby.', 'Find the current code or follow-code entry control.', 'Enter the code exactly, then claim the reward.'],
    rewardNote: 'Follow codes may have additional eligibility rules. Read the original developer announcement before attempting one.',
    sourceNote: 'The official Roblox experience and developer posts take priority over copied code lists.',
  },
  'bizarre-lineage': {
    slug: 'bizarre-lineage',
    summary: 'Bizarre Lineage code guidance needs care because menu locations and access requirements can change between updates.',
    redemptionIntro: 'Open the game menu, move to the code entry area, and submit the code exactly as announced.',
    redemptionSteps: ['Join the official Bizarre Collective Roblox community if the current release requires it.', 'Launch Bizarre Lineage and open the game menu.', 'Use the current code entry field in the menu or shop.', 'Paste the exact code and select Redeem.'],
    rewardNote: 'Some releases require a minimum level or a fresh server. Check the original release note before classifying a code as expired.',
    sourceNote: 'The official Roblox experience is the first place to check for milestones; community code claims need verification.',
  },
  'blade-ball': {
    slug: 'blade-ball',
    summary: 'Blade Ball codes can be short-lived event rewards, so this page keeps verification status separate from copied social posts.',
    redemptionIntro: 'Open the game\'s Extras menu, then select Codes to access the code field.',
    redemptionSteps: ['Launch Blade Ball in Roblox.', 'Open Extras from the game interface.', 'Select Codes to reveal the entry field.', 'Paste a verified code and choose Redeem.'],
    rewardNote: 'Redeem each code once and check the in-game confirmation. An invalid result can mean the event ended or the code was already used.',
    sourceNote: 'Use developer announcements and the official experience as the evidence for a new code release.',
  },
};

export const getLaunchGameContent = (slug: string | undefined) => (
  slug ? launchGameContent[slug] : undefined
);
