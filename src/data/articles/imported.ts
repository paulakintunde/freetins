import type { EditorialArticle } from './types';

const reviewed: Pick<
  EditorialArticle,
  'author' | 'authorPath' | 'publishedAt' | 'reviewedAt' | 'reviewLabel' | 'sections' | 'faq'
> = {
  author: 'Paul A',
  authorPath: '/author/paul-a/',
  publishedAt: '2026-08-24',
  reviewedAt: '2026-08-24',
  reviewLabel: 'Reviewed 24 August 2026',
  sections: [],
  faq: [],
};

export const importedEditorialArticles: EditorialArticle[] = [
  {
    ...reviewed,
    contentSlug: 'gta-5-cheats',
    path: '/cheats/gta-5/', routeId: 'gta5Cheats', section: 'cheats',
    title: 'GTA 5 Cheat Codes for PC, PS5 and Xbox | Freetins',
    heading: 'GTA 5 cheat codes for PC, PS5 and Xbox',
    description: 'Every GTA 5 Story Mode cheat, organized by platform with PC commands, phone numbers, controller inputs and the restrictions that matter.',
    eyebrow: 'Cheat sheet',
    quickAnswer: 'GTA 5 cheats work in Story Mode through the PC console, controller combinations or the in-game phone. They do not work in GTA Online, there is no money cheat, and achievements are disabled for the current session.',
    sources: [
      { label: 'PC Gamer GTA 5 cheat reference', href: 'https://www.pcgamer.com/gta-5-cheats/', description: 'Current command, phone-number and platform cross-check.' },
      { label: 'GamesRadar GTA 5 cheat guide', href: 'https://www.gamesradar.com/gta-5-cheats/', description: 'Independent platform and input cross-check.' },
    ],
    related: [
      { label: 'GTA 5 radio stations', href: '/guides/gta-5-radio-stations/', description: 'The complete in-game station and soundtrack guide.' },
      { label: 'Does GTA 5 have a demo?', href: '/guides/gta-5-demo/', description: 'The honest answer and safe ways to try the game.' },
    ],
  },
  {
    ...reviewed,
    contentSlug: 'sims-4-cheats',
    path: '/cheats/the-sims-4/', routeId: 'sims4Cheats', section: 'cheats',
    title: 'The Sims 4 Cheats for Money, Skills and Careers | Freetins',
    heading: 'The Sims 4 cheats for money, skills and careers',
    description: 'A searchable Sims 4 cheat sheet covering money, needs, skills, careers, relationships and build mode on PC, Mac, PlayStation and Xbox.',
    eyebrow: 'Cheat sheet',
    quickAnswer: 'Open the cheat console, enter testingcheats true when a command requires it, then use the exact skill, career or money command. Console players should accept the achievement warning before continuing.',
    sources: [
      { label: 'EA Sims 4 skill and cheat guidance', href: 'https://help.ea.com/en/articles/the-sims/the-sims-4/programming-skill/', description: 'Official example of the current skill-cheat syntax.' },
      { label: 'PC Gamer Sims 4 cheat reference', href: 'https://www.pcgamer.com/sims-4-cheats/', description: 'Current pack, skill and career command cross-check.' },
    ],
    related: [
      { label: 'Minecraft commands', href: '/cheats/minecraft/', description: 'Creative, teleport, item and world commands by edition.' },
      { label: 'Baldur\'s Gate 3 cheats', href: '/cheats/baldurs-gate-3/', description: 'What is possible through official mods and PC tools.' },
    ],
  },
  {
    ...reviewed,
    contentSlug: 'minecraft-commands',
    path: '/cheats/minecraft/', routeId: 'minecraftCommands', section: 'cheats',
    title: 'Minecraft Commands and Cheats for Java and Bedrock | Freetins',
    heading: 'Minecraft commands and cheats for Java and Bedrock',
    description: 'Useful Minecraft commands for items, teleporting, game modes, mobs, weather and world control, with Java and Bedrock differences made explicit.',
    eyebrow: 'Command guide',
    quickAnswer: 'Enable cheats or operator permissions, open chat, and begin a command with a forward slash. Java and Bedrock syntax can differ, so use the edition label beside each example.',
    sources: [
      { label: 'Microsoft introduction to Minecraft commands', href: 'https://learn.microsoft.com/en-us/minecraft/creator/documents/commandsintroduction?view=minecraft-bedrock-stable', description: 'Official Bedrock command, permission and syntax guidance.' },
      { label: 'Microsoft command reference', href: 'https://learn.microsoft.com/en-us/minecraft/creator/commands/?view=minecraft-bedrock-stable', description: 'Current Bedrock command documentation.' },
    ],
    related: [
      { label: 'The Sims 4 cheats', href: '/cheats/the-sims-4/', description: 'Money, skill, career and build-mode commands.' },
      { label: 'Pokemon Emerald cheats', href: '/cheats/pokemon-emerald/', description: 'GameShark and CodeBreaker entries with save-safety notes.' },
    ],
  },
  {
    ...reviewed,
    contentSlug: 'baldurs-gate-3-cheats',
    path: '/cheats/baldurs-gate-3/', routeId: 'baldursGate3Cheats', section: 'cheats',
    title: 'Baldur\'s Gate 3 Cheats, Mods and Console Options | Freetins',
    heading: 'Baldur\'s Gate 3 cheats, mods and console options',
    description: 'What Baldur\'s Gate 3 actually supports on PC, PS5 and Xbox, including official mods, Script Extender limits, save editing and achievement risks.',
    eyebrow: 'Cheat explainer',
    quickAnswer: 'Baldur\'s Gate 3 has no built-in retail cheat console. Officially curated mods are the safest route on PC and console; Script Extender and save editing remain unsupported PC-only options.',
    sources: [
      { label: 'Larian official modding support overview', href: 'https://forums.larian.com/ubbthreads.php?Number=943532&ubb=showflat', description: 'Official support boundaries for PC and console mods.' },
      { label: 'Baldur\'s Gate 3 mods on mod.io', href: 'https://mod.io/g/baldursgate3', description: 'The official in-game mod catalogue and current console-compatible listings.' },
    ],
    related: [
      { label: 'The Sims 4 cheats', href: '/cheats/the-sims-4/', description: 'A game with a supported built-in command console.' },
      { label: 'Minecraft commands', href: '/cheats/minecraft/', description: 'Built-in commands with clear Java and Bedrock scope.' },
    ],
  },
  {
    ...reviewed,
    contentSlug: 'wordscapes-answers',
    path: '/answers/wordscapes/', routeId: 'wordscapesAnswers', section: 'answers',
    title: 'Wordscapes Answers for Levels 1 to 40 | Freetins',
    heading: 'Wordscapes answers for levels 1 to 40',
    description: 'Answer tables for Wordscapes levels 1 to 40, plus a fast letter-based method for finding the right solution when level numbering differs.',
    eyebrow: 'Answer sheet',
    quickAnswer: 'Use the level tables for the first 40 puzzles. If your numbering differs, search by the letters shown in your wheel rather than trusting a pack name, because app versions can shift level labels.',
    sources: [
      { label: 'Wordscapes Help Center: coins and hints', href: 'https://peoplefun.helpshift.com/hc/en/6-wordscapes/faq/269-what-are-coins-and-how-do-i-use-them/', description: 'Official explanation of coins, hints and free reward routes.' },
      { label: 'Wordscapes Help Center', href: 'https://peoplefun.helpshift.com/hc/en/6-wordscapes/', description: 'Official gameplay and account support.' },
    ],
    related: [
      { label: 'Guess Emoji levels 1 to 10', href: '/answers/guess-emoji-levels-1-10/', description: 'A compact answer sheet for another mobile puzzle game.' },
      { label: 'Little Alchemy combinations', href: '/answers/little-alchemy/', description: 'The full searchable element recipe sheet.' },
    ],
  },
  {
    ...reviewed,
    contentSlug: 'candy-crush-free-boosters',
    path: '/guides/candy-crush-free-boosters/', routeId: 'candyCrushBoosters', section: 'guides',
    title: 'Candy Crush Free Boosters and Lives: What Works | Freetins',
    heading: 'Candy Crush free boosters and lives: what works',
    description: 'The legitimate in-game routes to Candy Crush boosters, lives and Gold Bars, plus the promo-code and generator claims to avoid.',
    eyebrow: 'Reward guide',
    quickAnswer: 'Candy Crush Saga has no public promo-code box. Free boosters and lives come from current in-game events, daily features, friends, rewarded offers and official links, and availability can vary by account.',
    sources: [
      { label: 'King support: Candy Crush boosters', href: 'https://candycrush.zendesk.com/hc/en-us/articles/360000750998-What-are-Boosters', description: 'Official booster types and behavior.' },
      { label: 'Candy Crush Help Center', href: 'https://candycrush.zendesk.com/hc/en-us', description: 'Official account, event and reward support.' },
    ],
    related: [
      { label: 'Wordscapes answers', href: '/answers/wordscapes/', description: 'Early-level answers and a fast solver method.' },
      { label: 'DoubleDown Casino daily rewards', href: '/daily/doubledown-casino/', description: 'A game that uses source-linked daily rewards instead of promo-code claims.' },
    ],
  },
  {
    ...reviewed,
    contentSlug: 'best-gba-emulators',
    path: '/guides/best-gba-emulators/', routeId: 'bestGbaEmulators', section: 'guides',
    title: 'Best GBA Emulators for Android, iPhone, PC and Mac | Freetins',
    heading: 'Best GBA emulators for Android, iPhone, PC and Mac',
    description: 'A practical comparison of maintained Game Boy Advance emulators, including mGBA, Delta, RetroArch and Android options, with legal setup guidance.',
    eyebrow: 'Platform guide',
    quickAnswer: 'Use mGBA on desktop, Delta for the simplest iPhone setup, and a maintained Android emulator with clear store and developer provenance. Emulators are legal, but download only game dumps you are entitled to use.',
    sources: [
      { label: 'mGBA official site', href: 'https://mgba.io/', description: 'Official downloads, compatibility notes and project updates.' },
      { label: 'Delta emulator help', href: 'https://faq.deltaemulator.com/', description: 'Official iPhone and iPad setup documentation.' },
      { label: 'RetroArch official site', href: 'https://www.retroarch.com/', description: 'Official platform support and core documentation.' },
    ],
    related: [
      { label: 'Best GBA games', href: '/guides/best-gba-games/', description: 'Twenty-five games worth playing and their legal availability.' },
      { label: 'Pokemon Emerald cheats', href: '/cheats/pokemon-emerald/', description: 'Codes formatted for accurate GBA emulators.' },
    ],
  },
  {
    ...reviewed,
    contentSlug: 'best-gba-games',
    path: '/guides/best-gba-games/', routeId: 'bestGbaGames', section: 'guides',
    title: 'Best Game Boy Advance Games to Play Now | Freetins',
    heading: 'The best Game Boy Advance games to play now',
    description: 'Twenty-five standout GBA games ranked for modern play, with genre recommendations and the legal ways to access them on current hardware.',
    eyebrow: 'Game guide',
    quickAnswer: 'Start with Metroid Fusion for action, The Minish Cap for adventure, Fire Emblem for tactics, Mario and Luigi for RPG comedy, or WarioWare for short sessions. Availability differs between Nintendo Switch Online and original cartridges.',
    sources: [
      { label: 'Nintendo Game Boy Advance Classics', href: 'https://www.nintendo.com/pos-redirect/70010000062483?c=US&l=en', description: 'Official Switch Online availability and membership requirements.' },
      { label: 'Nintendo Life GBA library tracker', href: 'https://www.nintendolife.com/guides/every-nintendo-switch-online-game-boy-advance-gba-game-ranked', description: 'Current independent catalogue and availability cross-check.' },
    ],
    related: [
      { label: 'Best GBA emulators', href: '/guides/best-gba-emulators/', description: 'Maintained emulator options and legal setup guidance.' },
      { label: 'Pokemon Emerald cheats', href: '/cheats/pokemon-emerald/', description: 'Rare Candy and item codes with save-safety guidance.' },
    ],
  },
];
