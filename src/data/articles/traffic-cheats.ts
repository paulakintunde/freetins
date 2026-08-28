import type { EditorialArticle } from './types';

const checked = {
  author: 'Paul A',
  authorPath: '/author/paul-a/',
  publishedAt: '2026-08-23',
  reviewedAt: '2026-08-23',
  reviewLabel: 'Reviewed 23 August 2026',
} as const;

const legoCodes = `
AU25GR|ACU Trooper (Female)|Character
28SPSR|ACU Trooper (Male)|Character
VK3TP3|Carlos|Character
9GESXP|Carter|Character
5BETZ5|Cooper|Character
RAVKRT|Dennis Nedry (Costa Rica)|Character
EKCKLC|Dieter Stark|Character
YQ6S7Z|Dino Handler Vic or Bob|Character
AV9DTJ|Ellie Degler|Character
9NGZZQ|Gyrosphere Operator Josh|Character
A3HC7E|Henry Wu (Jurassic World)|Character
QKBCWT|InGen Guard Jerry|Character
38YWVR|InGen Hunter|Character
RMVVB8|InGen Mechanic|Character
VZRSD3|InGen Mercenary|Character
8XL359|InGen Scout|Character
6MKHSG|Jimmy Fallon|Character
PR2R6Y|John Hammond (The Lost World)|Character
XTH9A3|Juanito Rostagno|Character
3FE78R|Jurassic Park Driver and Responder vehicle|Character and vehicle
8WY3FV|Jurassic Park Warden (Female)|Character
XJS7UY|Jurassic Park Warden (Male)|Character
BX9Z6R|Jurassic World Paddock Worker|Character
GW9TGH|Jurassic World Ranger|Character
L5AU6Y|Jurassic World Worker|Character
BRLNWC|Nash (Runway)|Character
SXZ7CC|Raptor Handler Jenny|Character
62539J|S.S. Venture Crewman|Character
XVXGXF|Scientist (Female)|Character
SKKLWC|Scientist (Male)|Character
PFEBS6|Udesky (Alt)|Character
7VNLJT|Young Raptor Handler|Character
5MZ73E|Studs x2|Extra
JYJAFX|Minikit Detector|Extra`
  .trim().split('\n').map((row) => row.split('|'));

export const legoJurassicWorldArticle: EditorialArticle = {
  ...checked,
  path: '/cheats/lego-jurassic-world/', routeId: 'legoJurassicWorld', section: 'cheats',
  /*
   * The original publication date, carried across the WordPress cutover. This
   * page replaced /lego-jurassic-world-cheats-list-unlockables-and-codes/, which 301s here and which
   * Google still shows as published 19 June 2025. `reviewedAt` stays at the
   * rewrite date: the URL is a year old, the words on it are not, and the two
   * fields are the place to say so.
   */
  publishedAt: '2025-06-19',
  title: 'LEGO Jurassic World Cheat Codes and Unlocks | Freetins',
  heading: 'LEGO Jurassic World cheat codes and unlocks',
  description: 'All 34 LEGO Jurassic World codes, how to enter them on every platform, and the correct way to unlock dinosaurs and red brick extras.',
  eyebrow: 'Cheat sheet',
  quickAnswer: 'Open Extras, choose Enter Code, and type one of the 34 six-character codes below. There are 32 character codes and two extra codes. Dinosaurs do not have typed codes and must be unlocked with amber bricks.',
  sections: [
    { id: 'all-codes', heading: 'All 34 LEGO Jurassic World codes', paragraphs: ['The same codes are used on PlayStation, Xbox, Switch, PC and the handheld versions. Character names can vary slightly by region, but the six-character entries do not.'], table: { caption: 'LEGO Jurassic World cheat code list', columns: ['Code', 'Unlock', 'Type'], rows: legoCodes } },
    { id: 'enter-codes', heading: 'How to enter a code', steps: ['Load a save and open the pause menu.', 'Choose Extras, then Enter Code.', 'Type the six-character code and confirm.', 'Use Free Play to select a character. For 5MZ73E or JYJAFX, return to Extras and switch the unlocked effect on.'] },
    { id: 'dinosaurs', heading: 'How dinosaur unlocks really work', paragraphs: ['No typed code unlocks a T. rex, Velociraptor or Indominus Rex. Each story level hides an amber brick. Finish the level once, replay it in Free Play with the abilities needed to reach the brick, then complete the level to add its dinosaur to your roster.'], note: 'Older versions of this page repeated fake dinosaur strings such as CAAADT. They have been removed because they are not accepted by the game.' },
    { id: 'red-bricks', heading: 'Codes versus red bricks', groups: [
      { heading: 'Codes', body: 'The table above unlocks characters, Studs x2 and the Minikit Detector without finding their in-world challenges.' },
      { heading: 'Red bricks', body: 'Invincibility and the x4, x6, x8 and x10 stud multipliers must be found in hub challenges and bought with studs.' },
    ] },
    { id: 'not-working', heading: 'Why a code may not work', bullets: ['Use Extras > Enter Code, not the character customizer.', 'Check 0 against O and 5 against S.', 'A save can reject an entry that is already unlocked.', 'Red brick effects still need to be enabled in Extras.', 'Any dinosaur, invincibility or unlock-everything string is not a valid code for this game.'] },
  ],
  faq: [
    { question: 'How many LEGO Jurassic World cheat codes are there?', answer: 'There are 34 entries in the game: 32 character codes and two codes for Studs x2 and the Minikit Detector.' },
    { question: 'Is there a code to unlock every dinosaur?', answer: 'No. Dinosaurs are earned by collecting amber bricks in the 20 story levels.' },
    { question: 'Do the codes disable achievements or trophies?', answer: 'The built-in Extras codes do not disable achievements or trophies.' },
  ],
  sources: [
    { label: 'IGN LEGO Jurassic World cheat code reference', href: 'https://www.ign.com/wikis/lego-jurassic-world/Cheat_Codes', description: 'Independent cross-check for the built-in character and extra codes.' },
    { label: 'LEGO Jurassic World on Steam', href: 'https://store.steampowered.com/app/352400/LEGO_Jurassic_World/', description: 'Current official PC store listing.' },
  ],
  related: [
    { label: 'Jurassic World: The Game strategy', href: '/guides/jurassic-world-the-game/', description: 'The mobile park game is a separate title and has no code-entry screen.' },
    { label: 'Guitar Hero 3 cheats', href: '/cheats/guitar-hero-3/', description: 'Correct fret sequences and controller mapping.' },
  ],
};

const guitarCodes = [
  ['Hyperspeed', 'O, B, O, Y, O, B, O, Y', 'Faster note scroll', 'Scores remain enabled'],
  ['Performance Mode', 'RY, RB, RO, RB, RY, GB, RY, RB', 'Hides the note highway and HUD', 'Scores remain enabled'],
  ['Air Guitar', 'BY, GY, GY, RB, RB, RY, RY, BY, GY, GY, RB, RB, RY, RY, GY, GY, RY, RY', 'Removes the guitar from the character model', 'Cosmetic'],
  ['Bret Michaels', 'GR, GR, GR, GB, GB, GB, RB, R, R, R, RB, R, R, R, RB, R, R, R', 'Changes the singer model', 'Cosmetic'],
  ['Unlock All Songs', 'YO, RB, RO, GB, RY, YO, RY, RB, GY, GY, YB, YB, YO, YO, YB, Y, R, RY, R, Y, O', 'Opens the setlist in Quick Play', 'Working'],
  ['Unlock Everything', 'GRBO, GRYB, GRYO, GBYO, GRYB, RYBO, GRYB, GYBO, GRYB, GRYO, GRYO, GRYB, GRYO', 'Unlocks songs, characters and instruments', 'Needs four-fret chords'],
  ['No Fail', 'GR, B, GR, GY, B, GY, RY, O, RY, GY, Y, GY, GR', 'Prevents song failure', 'Disables scores and achievements'],
  ['Easy Expert', 'GR, GY, YB, RB, BO, YO, RY, RB', 'Makes the Expert rock meter more forgiving', 'Disables scores and achievements'],
  ['Precision Mode', 'GR, GR, GR, RY, RY, RB, RB, YB, YO, YO, GR, GR, GR, RY, RY, RB, RB, YB, YO, YO', 'Tightens the hit window', 'Disables scores and achievements'],
];

export const guitarHero3Article: EditorialArticle = {
  ...checked,
  path: '/cheats/guitar-hero-3/', routeId: 'guitarHero3', section: 'cheats',
  title: 'Guitar Hero 3 Cheats and Controller Codes | Freetins',
  heading: 'Guitar Hero 3 cheats and controller codes',
  description: 'Every cross-checked Guitar Hero 3 fret sequence, the correct controller mapping, achievement warnings and fixes for codes that do not register.',
  eyebrow: 'Cheat sheet',
  quickAnswer: 'Open Options, choose Cheats, then Enter New Cheat. Hold every fret shown together and strum once for each group. G, R, Y, B and O mean green, red, yellow, blue and orange, not console controller buttons.',
  sections: [
    { id: 'cheat-codes', heading: 'Guitar Hero 3 cheat codes', table: { caption: 'Guitar Hero 3 fret sequences', columns: ['Cheat', 'Fret sequence', 'Effect', 'Restriction'], rows: guitarCodes } },
    { id: 'enter', heading: 'How to enter the sequences', steps: ['Open Options from the main menu.', 'Choose Cheats, then Enter New Cheat.', 'Hold all colors in one group at the same time.', 'Strum once, release, then enter the next group.', 'Wait for the confirmation sound before leaving the screen.'] },
    { id: 'controller-map', heading: 'Correct controller button map', paragraphs: ['Use this map only when playing without a guitar controller. The old Freetins page incorrectly treated the colored Xbox face buttons as fret colors.'], table: { caption: 'Default fret mapping on standard controllers', columns: ['Fret', 'Xbox 360 controller', 'PlayStation controller'], rows: [
      ['Green', 'Left trigger', 'L2'], ['Red', 'Left bumper', 'L1'], ['Yellow', 'Right bumper', 'R1'], ['Blue', 'Right trigger', 'R2'], ['Orange', 'A', 'Cross'], ['Strum', 'D-pad up or down', 'D-pad up or down'],
    ] } },
    { id: 'restrictions', heading: 'Which cheats affect scores', paragraphs: ['No Fail, Easy Expert and Precision Mode disable scores and achievement progress while active. Hyperspeed, Performance Mode and the cosmetic cheats do not. Use a separate session before chasing a score or achievement if you are unsure what is enabled.'] },
    { id: 'troubleshooting', heading: 'Why a sequence is not registering', bullets: ['Strum once for each displayed group.', 'Hold multi-color chords together before strumming.', 'Enter the sequence at Enter New Cheat, not during a song.', 'Use fret colors, not the matching colors printed on a console controller.', 'The four-fret Unlock Everything sequence is difficult on a standard controller.'] },
  ],
  faq: [
    { question: 'Do Guitar Hero 3 cheats work on every platform?', answer: 'The fret sequences are shared by PS2, PS3, Xbox 360, Wii and PC. The input method changes with the controller.' },
    { question: 'Which cheats disable achievements?', answer: 'No Fail, Easy Expert and Precision Mode disable scores and achievement progress while they are active.' },
    { question: 'Is there an infinite Star Power code?', answer: 'No. Infinite Star Power is not a built-in Guitar Hero 3 cheat.' },
  ],
  sources: [
    { label: 'GameFAQs Guitar Hero III cheat reference', href: 'https://gamefaqs.gamespot.com/xbox360/939093-guitar-hero-iii-legends-of-rock/cheats', description: 'Historical cross-check for the retail cheat menu sequences.' },
  ],
  related: [
    { label: 'LEGO Jurassic World cheats', href: '/cheats/lego-jurassic-world/', description: 'Built-in character and extra codes.' },
    { label: 'Browse all cheats', href: '/cheats/', description: 'Direct cheat sheets by game.' },
  ],
};

export const pokemonEmeraldArticle: EditorialArticle = {
  ...checked,
  path: '/cheats/pokemon-emerald/', routeId: 'pokemonEmerald', section: 'cheats',
  title: 'Pokemon Emerald Rare Candy Cheat and Fixes | Freetins',
  heading: 'Pokemon Emerald rare candy cheat and fixes',
  description: 'The Pokemon Emerald Rare Candy PC and Poke Mart codes, correct cheat formats, emulator entry steps and safe troubleshooting.',
  eyebrow: 'Cheat sheet',
  quickAnswer: 'Use BFF956FA 2F9EC50D as a GameShark v3 or Action Replay code. It stocks Rare Candy in your Pokemon Center PC under Item Storage, not in your bag. Disable the cheat before saving.',
  sections: [
    { id: 'rare-candy-codes', heading: 'Pokemon Emerald Rare Candy codes', table: { caption: 'Rare Candy codes for the US retail version of Pokemon Emerald', columns: ['Result', 'Code', 'Format', 'Where it appears'], rows: [
      ['Unlimited Rare Candy', 'BFF956FA 2F9EC50D', 'GameShark v3 / Action Replay', 'PC Item Storage'],
      ['Rare Candy at Poke Mart', '82005274 0044', 'CodeBreaker', 'First shop item, costs 4,800'],
    ] }, note: 'These memory addresses target the US retail game. ROM hacks and some regional dumps can use different addresses.' },
    { id: 'withdraw', heading: 'Where the Rare Candies appear', steps: ['Enable BFF956FA 2F9EC50D under the GameShark or Action Replay type.', 'Enter a Pokemon Center and open your own PC.', 'Choose Item Storage, then Withdraw Item.', 'Withdraw the amount you need.', 'Turn the cheat off before making a new in-game save.'] },
    { id: 'emulators', heading: 'Cheat type by emulator', table: { caption: 'Where to add the code', columns: ['Emulator', 'Menu', 'Type to select'], rows: [
      ['mGBA', 'Tools > Cheats > Add New Set', 'GameShark'], ['VBA-M', 'Cheats > Cheat list', 'Gameshark'], ['My Boy', 'Menu > Cheats > New Cheat', 'Auto-detected'], ['Delta', 'Pause > Cheat Codes > +', 'GameShark'],
    ] } },
    { id: 'not-working', heading: 'Why the code may not work', bullets: ['The PC code was entered as CodeBreaker instead of GameShark.', 'You checked the bag instead of PC Item Storage.', 'The ROM is a hack, a different region or a modified dump.', 'Another item code is writing to the same memory address.', 'The emulator needs you to leave and re-enter the Pokemon Center after enabling the code.'] },
    { id: 'save-safety', heading: 'Protect the save file', paragraphs: ['Keep a backup of the .sav file before enabling any memory code. Run one item cheat at a time, withdraw the items, disable the cheat, and only then save in-game. Rare Candies raise levels without awarding battle EVs, so a candy-only roster may need EV training later.'] },
  ],
  faq: [
    { question: 'What is the Pokemon Emerald Rare Candy cheat?', answer: 'BFF956FA 2F9EC50D, entered as a GameShark v3 or Action Replay code, fills PC Item Storage with Rare Candies.' },
    { question: 'Why are the candies not in my bag?', answer: 'The GameShark code writes to the Pokemon Center PC Item Storage. Use your own PC and choose Withdraw Item.' },
    { question: 'Does the code work on a ROM hack?', answer: 'Not reliably. ROM hacks can move the memory address and should use codes written specifically for that hack.' },
  ],
  sources: [
    { label: 'mGBA documentation', href: 'https://mgba.io/docs.html', description: 'Current emulator documentation and supported platforms.' },
    { label: 'Delta cheat code guide', href: 'https://faq.deltaemulator.com/using-delta/cheat-codes', description: 'Current iPhone and iPad cheat-entry guidance.' },
  ],
  related: [
    { label: 'Browse all cheats', href: '/cheats/', description: 'Direct cheat sheets without legacy category slugs.' },
    { label: 'How we verify', href: '/how-we-verify/', description: 'How codes are checked and corrected.' },
  ],
};
