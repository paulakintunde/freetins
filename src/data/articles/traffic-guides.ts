import type { EditorialArticle } from './types';

const checked = {
  author: 'Paul A', authorPath: '/author/paul-a/', publishedAt: '2026-08-23', reviewedAt: '2026-08-23', reviewLabel: 'Reviewed 23 August 2026',
} as const;

export const jurassicWorldGameArticle: EditorialArticle = {
  ...checked,
  path: '/guides/jurassic-world-the-game/', routeId: 'jurassicWorldGame', section: 'guides',
  /*
   * The original publication date, carried across the WordPress cutover. This
   * page replaced /jurassic-world-cheats-and-tricks-for-android-ios/, which 301s here and which
   * Google still shows as published 19 June 2025. `reviewedAt` stays at the
   * rewrite date: the URL is a year old, the words on it are not, and the two
   * fields are the place to say so.
   */
  publishedAt: '2025-06-19',
  title: 'Jurassic World: The Game Cheats and Strategy | Freetins',
  heading: 'Jurassic World: The Game cheats and safe strategy',
  description: 'Jurassic World: The Game has no cheat-code screen. Use these safe DNA, coin, park and battle strategies instead of generators or mod APKs.',
  eyebrow: 'Mobile game guide',
  quickAnswer: 'Jurassic World: The Game has no code-entry screen. Web generators cannot add DNA, cash or coins to a server-held account. Use daily rewards, events, arena battles, ads and official offers, and never submit a support key or install an app to unlock a claimed reward.',
  sections: [
    { id: 'no-codes', heading: 'Are there working cheat codes?', paragraphs: ['No. The official Android and iOS listings describe daily rewards and in-app purchases but no redemption feature. This is a different game from LEGO Jurassic World, which does contain a built-in Extras code menu.'], groups: [
      { heading: 'Safe', body: 'Official store builds, in-game rewards, Ludia support, events and links posted by the verified game channels.' },
      { heading: 'Avoid', body: 'DNA generators, unlimited-cash pages, mod APKs, survey unlocks and any page asking for your support key.' },
    ] },
    { id: 'resources', heading: 'Best legitimate resource routine', steps: ['Collect the daily reward and every free production pickup before spending.', 'Use reward ads only when the reward shown is useful to the next upgrade.', 'Complete daily missions and limited events that fit your current roster.', 'Keep a coin reserve so habitats and food production do not stop.', 'Spend DNA on a planned evolution rather than spreading it across every unlocked creature.'] },
    { id: 'park', heading: 'Build a park that funds progression', bullets: ['Place and upgrade coin-producing habitats before decorative items.', 'Group buildings so collection runs are quick and easy to repeat.', 'Do not rush every timer with cash. Save premium currency for a specific bottleneck.', 'Keep more than one battle-ready creature in each class so one cooldown does not block an event.'] },
    { id: 'battle', heading: 'Simple battle planning', paragraphs: ['Class advantage and action-point management matter more than chasing one oversized dinosaur. Enter with a balanced roster, protect a creature when the opponent can spend a full attack, and reserve points when that forces the opponent to guess.'], table: { caption: 'Pre-battle check', columns: ['Check', 'Why it matters'], rows: [
      ['Class matchups', 'A favorable class can outperform a creature with a higher raw level.'], ['Cooldowns', 'Using every top creature at once can leave later events uncovered.'], ['Reward value', 'Skip a costly event if the pack cannot improve the roster.'], ['Connection', 'A stable connection reduces the risk of losing an online battle to a disconnect.'],
    ] } },
    { id: 'account-safety', heading: 'Account and device safety', bullets: ['Install only from Google Play or the Apple App Store.', 'Keep the support key private except when speaking to verified Ludia support.', 'Do not change the device clock to skip timers; server events use their own time and can desync.', 'Avoid modified clients because they can expose credentials, damage progress or lead to account action.'] },
  ],
  faq: [
    { question: 'Does Jurassic World: The Game have cheat codes?', answer: 'No. The current official app has no code-entry screen.' },
    { question: 'Do DNA generators work?', answer: 'No. A web page cannot write currency to the game server. Generator pages commonly use surveys, app installs or credential collection.' },
    { question: 'Is the game still available?', answer: 'Yes. It is currently listed on Google Play and the Apple App Store by Ludia Games Inc.' },
  ],
  sources: [
    { label: 'Jurassic World: The Game on Google Play', href: 'https://play.google.com/store/apps/details?id=com.ludia.jurassicworld', description: 'Official Android availability, current update information and in-app purchase disclosure.' },
    { label: 'Jurassic World: The Game on the App Store', href: 'https://apps.apple.com/us/app/jurassic-world-the-game/id791211390', description: 'Official iPhone and iPad listing.' },
  ],
  related: [
    { label: 'LEGO Jurassic World codes', href: '/cheats/lego-jurassic-world/', description: 'The separate LEGO game does have 34 built-in codes.' },
    { label: 'Browse all guides', href: '/guides/', description: 'Current game and platform explainers.' },
  ],
};

export const gta5DemoArticle: EditorialArticle = {
  ...checked,
  path: '/guides/gta-5-demo/', routeId: 'gta5Demo', section: 'guides',
  /*
   * The original publication date, carried across the WordPress cutover.
   * /gta-5-demo-download-free-pc-ps3-ps4/
   * 301s here. `reviewedAt` stays at the rewrite date: the URL is the age,
   * the words are not.
   */
  publishedAt: '2025-09-29',
  title: 'GTA 5 Demo Download: What Is Actually Available | Freetins',
  heading: 'GTA 5 demo download: what is actually available',
  description: 'There is no official GTA 5 demo. Check the legitimate stores, avoid fake mobile and compressed downloads, and choose the correct edition for your platform.',
  eyebrow: 'Download safety guide',
  quickAnswer: 'Rockstar does not offer a GTA 5 demo. Download or buy the game only through Rockstar Games, Steam, Epic, PlayStation or Microsoft. A GTA 5 APK, survey unlock, password-protected archive or tiny compressed installer is not an official demo.',
  sections: [
    { id: 'no-demo', heading: 'Is there an official GTA 5 demo?', paragraphs: ['No official trial or demo is listed by Rockstar or the major platform stores. Rockstar’s download page sends players to authorized retailers for the full game. The old Freetins page linked to unrelated or unsafe files; those links have been removed.'] },
    { id: 'safe-stores', heading: 'Legitimate ways to get GTA 5', table: { caption: 'Official purchase and download routes', columns: ['Platform', 'Use this source', 'What to check'], rows: [
      ['PC', 'Rockstar Store, Steam or Epic Games Store', 'Choose Enhanced or Legacy for the hardware and mod setup you use.'], ['PlayStation', 'PlayStation Store or a compatible retail disc', 'Buy the PS4 or PS5 edition that matches the console.'], ['Xbox', 'Microsoft Store or a compatible retail disc', 'Buy the Xbox One or Series X|S edition.'], ['Subscription catalog', 'Your console subscription app', 'Availability rotates. Confirm it is included before subscribing.'],
    ] } },
    { id: 'red-flags', heading: 'How to spot a fake download', bullets: ['It claims to be a GTA 5 APK for Android or iPhone.', 'It requires a survey, app install or browser notification before the file unlocks.', 'It is a password-protected ZIP or RAR from an unknown host.', 'It asks you to disable antivirus or browser protection.', 'It promises an implausibly small highly compressed copy.', 'It offers a console game as a loose download file instead of using the console store.'] },
    { id: 'before-buying', heading: 'Check before you buy', steps: ['Open the official store for your platform.', 'Confirm the edition and system requirements.', 'Check current storage requirements on that exact listing.', 'Compare the current price with your subscription catalog.', 'Use the store library to install and update the game.'] },
    { id: 'mobile', heading: 'Can you play GTA 5 on a phone?', paragraphs: ['There is no native official GTA 5 mobile release. Remote Play, Steam Link or another authorized streaming method can show a copy running on your own PC or console, but the phone is not running a GTA 5 APK.'] },
  ],
  faq: [
    { question: 'Is there a free GTA 5 demo for PC?', answer: 'No official PC demo is available. Use an authorized store for the full game or check a legitimate subscription catalog.' },
    { question: 'Is a GTA 5 APK real?', answer: 'No official GTA 5 Android or iPhone app exists. APK downloads using the name are unofficial and unsafe to trust.' },
    { question: 'Was GTA 5 ever free?', answer: 'The Epic Games Store offered the full PC game in a limited 2020 giveaway. That promotion ended and was not a permanent demo.' },
  ],
  sources: [
    { label: 'Rockstar Games downloads', href: 'https://www.rockstargames.com/downloads/', description: 'Official Rockstar download and retailer routes.' },
    { label: 'Grand Theft Auto V on Steam', href: 'https://store.steampowered.com/app/3240220/Grand_Theft_Auto_V_Enhanced/', description: 'Official PC edition listing and current requirements.' },
  ],
  related: [
    { label: 'GTA 5 radio stations', href: '/guides/gta-5-radio-stations/', description: 'Station list, controls and Self Radio setup.' },
    { label: 'Published cheat sheets', href: '/cheats/', description: 'Cheat pages with platform scope and confirmed builds.' },
  ],
};
