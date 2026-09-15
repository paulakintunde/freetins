import type { ImageMetadata } from 'astro';

export interface ArticleArtwork {
  src: ImageMetadata;
  alt: string;
  socialImage: string;
}

const sources = import.meta.glob<ImageMetadata>('../assets/articles/*-article-art.webp', {
  eager: true,
  import: 'default',
});
const images = Object.fromEntries(
  Object.entries(sources).map(([path, image]) => [path.split('/').at(-1), image]),
);

const artwork = (slug: string, alt: string): ArticleArtwork => {
  const src = images[`${slug}-article-art.webp`];
  if (!src) throw new Error(`Missing article artwork for: ${slug}`);
  return { src, alt, socialImage: `/og/articles/${slug}.jpg` };
};

export const articleArtwork: Record<string, ArticleArtwork> = {
  'blox-fruits-codes': artwork('blox-fruits-codes', "Original concept illustration: A block-world pirate adventurer on a sunlit tropical dock, looking at an open reward chest with a glowing hourglass, reset compass and small coins"),
  'steal-an-egg-codes': artwork('steal-an-egg-codes', "Original concept illustration: A cheerful block-world runner approaches a huge yellow gift on a green circular pad near a simple leaderboard structure"),
  'grand-blue-codes': artwork('grand-blue-codes', "Original concept illustration: An original anime pirate navigator beside an open wooden fruit chest and glowing reroll dice, blue sea, early morning port and distant sailing ship, adventurous but calm composition."),
  'evomon-codes': artwork('evomon-codes', "Original concept illustration: Original friendly fantasy creatures gathered around EXP fruit, evolution stones, coins and capture spheres in a sunny training meadow. A small fire pup and water creature, visually distinct item silhouettes."),
  'evomon-tier-list': artwork('evomon-tier-list', "Original concept illustration: A trainer selecting a small diverse creature team for a sunny winding path"),
  'anime-expeditions-codes': artwork('anime-expeditions-codes', "Original concept illustration: Original anime defenders around a bright violet trait crystal chest at the entrance to a vibrant tower-defense path"),
  'dungeon-lootr-codes': artwork('dungeon-lootr-codes', "Original concept illustration: Adventurer at a sunlit dungeon threshold examining purple luck potion bottles, faceted aspect gems and a mysterious blessing chest"),
  'adopt-me-codes': artwork('adopt-me-codes', "Original concept illustration: Friendly pastel pet-adoption plaza with an adorable dog and cat beside a clearly separate frog sticker on a gift envelope"),
  'murder-mystery-2-codes': artwork('murder-mystery-2-codes', "Original concept illustration: Stylized mystery mansion display cabinet of collectible colorful toy-like knives and a pumpkin pet, an old archive drawer and magnifying glass, warm dramatic lighting"),
  'doors-codes': artwork('doors-codes', "Original concept illustration: Moody but readable hotel corridor with a numbered wooden door in background, polished brass knobs, sparkling dust and a glowing revive bottle in foreground"),
  'fish-it-codes': artwork('fish-it-codes', "Original concept illustration: Block-world angler on a turquoise lagoon dock preparing violet mutation potion bottles beside fishing gear"),
  'catch-a-monster-codes': artwork('catch-a-monster-codes', "Original concept illustration: Friendly original monster collector discovering distinct glowing eggs, a fantasy chest and small potion bottles in a bright meadow"),
  'bee-swarm-simulator-codes': artwork('bee-swarm-simulator-codes', "Original concept illustration: Block-world beekeeper among giant sunflowers with cheerful geometric bees, tickets, honey jar and colorful berry treats"),
  're-rangers-x-codes': artwork('re-rangers-x-codes', "Original concept illustration: Original anime ranger team protecting a sunny fantasy village road, trait crystals, summer capsules and blue fragments in foreground, dynamic but uncluttered celebratory composition."),
  'brookhaven-rp-guide': artwork('brookhaven-rp-guide', "Original concept illustration: Cheerful block-world town with a modest free family home, roleplay backpack tools, a parked car and boombox"),
  'nba-2k27-locker-codes': artwork('nba-2k27-locker-codes', "Original concept illustration: Original basketball athlete in a bright modern locker room beside an open locker containing stylized player progression cards and training tokens"),
  'fortnite-admin-panel-codes': artwork('fortnite-admin-panel-codes', "Original concept illustration: Original colorful battle-royale lobby scene with a friendly sprite, sparkling blue dust, glowing reward envelope and playful arcade-machine transformation"),
  'pokemon-go-promo-codes': artwork('pokemon-go-promo-codes', "Original concept illustration: Sunny outdoor trainer scene with a phone displaying a symbolic research checklist without readable UI text, berries, capture balls, cap and baseball shirt reward icons"),
  'genshin-impact-codes': artwork('genshin-impact-codes', "Original concept illustration: Original fantasy traveler beside a sunlit hilltop mailbox, glowing four-point wish gems, golden coins, experience books and food parcels"),
  'honkai-star-rail-codes': artwork('honkai-star-rail-codes', "Original concept illustration: Original space traveler receiving a glowing mail parcel on an elegant interstellar train platform"),
  'zenless-zone-zero-codes': artwork('zenless-zone-zero-codes', "Original concept illustration: Original urban anime courier outside a colorful video shop receiving a reward envelope with iridescent geometric tokens, coins and equipment modules"),
  'gta-6-release-date': artwork('gta-6-release-date', "Original concept illustration: Original cinematic illustration of a pastel coastal city with palms, a sports car and boxed digital game token beside a download symbol"),
  'gta-6-cheat-codes': artwork('gta-6-cheat-codes', "Original concept illustration: Original pastel coastal boulevard scene with a game controller and a closed mystery notebook in foreground, question-mark symbol on its cover"),
  'roblox-innovation-awards-2026-free-ugc': artwork('roblox-innovation-awards-2026-free-ugc', "Original concept illustration: Bright block-world award ceremony stage with audience avatars and four symbolic crystal accessory silhouettes: crown, shield, torch and pair of ducks"),
  'why-roblox-games-skip-codes': artwork('why-roblox-games-skip-codes', "Original concept illustration: Three connected block-world scenes: yellow gift claim beside eggs, an event stage with collectible creatures, and a thriving vegetable garden"),
  clearVision3: artwork('clear-vision-3', 'Mission planning board overlooking a nighttime city target marker'),
  littleAlchemy: artwork('little-alchemy', 'Bright Little Alchemy workspace showing a collection of discovered element icons'),
  guessEmojiLevels1To10: artwork('guess-emoji-levels-1-10', 'Colorful emoji clues and answer tiles on a puzzle stage'),
  christmasEmoji: artwork('100-pics-christmas-emoji', 'Christmas emoji ornaments, gifts and answer tiles on a cozy puzzle table'),
  littleAlchemyEnergy: artwork('little-alchemy-2-energy', 'Air and fire combining to make Energy in a bright Little Alchemy workspace'),
  jurassicWorldGame: artwork('jurassic-world-the-game', 'Dinosaur park habitats and a tactical planning board'),
  gta5RadioStations: artwork('gta-5-radio-stations', 'Convertible driving through sunny Los Santos with the GTA V logo'),
  gta5Demo: artwork('gta-5-demo', 'Sports car choosing the open road beside a closed ramp overlooking a sunny coastal city'),
  legoJurassicWorld: artwork('lego-jurassic-world', 'LEGO adventurers running through a sunny dinosaur park with a brick-built T. rex'),
  guitarHero3: artwork('guitar-hero-3', 'Five-fret guitar controller and note highway at a daylight rock festival'),
  pokemonEmerald: artwork('pokemon-emerald', 'Pokemon Emerald pixel-art route beside a storage grid filled with Rare Candy'),
  doubleDownCasino: artwork('doubledown-casino', 'Casino chips and a gold daily reward envelope on an elegant sunlit casino table'),
  gta5Cheats: artwork('gta-5', 'Three original antiheroes and a red sports car above a sunny coastal city chase'),
  sims4Cheats: artwork('the-sims-4', 'Bright life simulation home with a family, garden and build-mode controls'),
  minecraftCommands: artwork('minecraft-commands', 'Block-world adventurer using command controls in a sunny valley'),
  baldursGate3Cheats: artwork('baldurs-gate-3', 'Fantasy adventurers considering glowing tactical options above a daylight river city'),
  gtaSanAndreasCheats: artwork('gta-san-andreas', 'Street scene with a green lowrider, bicycle and city skyline under bright California daylight'),
  gtaViceCityCheats: artwork('gta-vice-city', 'Pastel sports car and speedboat beside a sunny coastal boulevard with palm trees'),
  redDeadRedemption2Cheats: artwork('red-dead-redemption-2', 'Frontier rider studying a newspaper beside a horse in a bright mountain valley'),
  skyrimConsoleCommands: artwork('skyrim-console-commands', 'Nordic adventurer facing a dragon above a luminous command rune in a daylight mountain pass'),
  fallout4ConsoleCommands: artwork('fallout-4-console-commands', 'Vault survivor in power armor exploring a sunlit retro-futurist wasteland workshop'),
  growAGardenMutations: artwork('grow-a-garden-mutations', 'Mutated tomatoes, strawberries, blueberries and corn showing gold, rainbow, frost and wind effects in a sunny garden'),
  growAGardenFirstHourSeeds: artwork('grow-a-garden-best-seeds-first-hour', 'Starter garden progressing from carrots and strawberries to blueberries, tomatoes and corn'),
  growAGardenSheckleRoute: artwork('grow-a-garden-sheckle-farming', 'Harvested fruit moving through a sunny market loop into newly planted crops'),
  growAGardenSprinklerPlacement: artwork('grow-a-garden-sprinkler-placement', 'Central sprinkler covering a compact crop cluster with one edge plant outside its radius'),
  growAGardenGearShop: artwork('grow-a-garden-gear-shop', 'Watering can, trowel, sprinkler, protection wand and wrench arranged at a sunny garden shop'),
  growAGardenPetIncome: artwork('grow-a-garden-pet-passive-income', 'Bee, mole, turtle and bird companions supporting one productive sunny crop plot'),
  bingoBlitzDailyGuide: artwork('bingo-blitz-free-credits', 'Friends playing colorful bingo cards as blue reward credits emerge from an official gift envelope'),
  boardKingsDailyGuide: artwork('board-kings-free-rolls', 'Two dice rolling through a bright miniature board city toward crown tokens and a gift chest'),
  familyIslandDailyGuide: artwork('family-island-free-energy', 'Blue energy droplets tracing a careful route across a sunny tropical farm island'),
  mobileGearGuide: artwork('mobile-gaming-gear', 'Telescopic controller, active cooler, wired earbuds and USB-C cable arranged in bright daylight'),
  pcConsoleGearGuide: artwork('pc-console-gaming-gear', 'Wired headset, one-handed keypad and two-controller charging dock on a sunlit desk'),
  robloxGearGuide: artwork('roblox-gear-gift-cards', 'Block-world gaming gift token, accessories and safety check beside a gift box in daylight'),
  mobileControllerGuide: artwork('mobile-gaming-controller', 'Extended USB-C mobile controller showing its bridge, thumbsticks, audio and charging ports'),
  phoneCoolingClipGuide: artwork('phone-cooling-clip-guide', 'Universal thermoelectric cooling clip with cold plate, fan, clamp and power cable'),
  wiredGamingHeadsetGuide: artwork('mid-range-wired-gaming-headset', 'Wired over-ear gaming headset with boom microphone, 3.5 mm cable and USB adapter'),
  mechanicalGamingKeypadGuide: artwork('gaming-keypad-24-key-guide', 'One-handed mechanical gaming keypad with thumb control, wrist rest and switch samples'),
  twoControllerChargingDockGuide: artwork('two-controller-charging-dock', 'Two original controllers seated in a two-bay charging dock with battery-door adapters'),
  robloxGiftCardCanadaGuide: artwork('roblox-gift-card-25-cad-guide', 'Canadian gaming gift token, receipt and safety check in a bright block-built plaza'),
  wordscapesAnswers: artwork('wordscapes', 'Blank crossword tiles on a puzzle table overlooking a bright mountain lake'),
  candyCrushBoosters: artwork('candy-crush-free-boosters', 'Colorful candy board with a life heart and glowing booster tools'),
  bestGbaEmulators: artwork('best-gba-emulators', 'Original pixel adventurer passing through four rendering gateways in a bright retro world'),
  bestGbaGames: artwork('best-gba-games', 'Connected pixel-art worlds for racing, tactics, puzzles, science fiction and adventure'),
  resources: artwork('resources', 'Verified compass connecting codes, rewards, puzzles and guide paths across a bright game world'),
  cowonClockRainmeter: artwork('cowon-clock-rainmeter', 'Original instructional diagram for configuring Cowon Clock time and date settings'),
  monstercatVisualizerRainmeter: artwork('monstercat-visualizer-rainmeter', 'Original instructional diagram of an audio signal and visualizer bars'),
  visbubbleRainmeter: artwork('visbubble-rainmeter', 'Original instructional diagram of a circular audio visualizer layout'),
  amdRyzenRainmeterSetup: artwork('amd-ryzen-rainmeter-setup', 'Original instructional diagram for checking desktop sensor data and launchers'),
  jarvisBlueRainmeterTheme: artwork('jarvis-blue-rainmeter-theme', 'Original instructional diagram of a modular blue desktop composition'),
  jarvisShieldRainmeterInterface: artwork('jarvis-shield-rainmeter-interface', 'Original instructional diagram mapping separate desktop interface modules'),
  kuruginRainmeter: artwork('kurugin-rainmeter', 'Original instructional diagram for restoring and testing desktop modules'),
  blackmartAlphaSourcesAlternatives: artwork('blackmart-alpha-sources-alternatives', 'Original instructional diagram for checking an Android app publisher, signature and permissions'),
  iosOnWindowsTestingOptions: artwork('ios-on-windows-testing-options', 'Original instructional diagram comparing Windows, hosted simulator and device testing paths'),
  iphoneDialCodesCarrierLimits: artwork('iphone-dial-codes-carrier-limits', 'Original instructional diagram for checking a dial code before changing carrier settings'),
  adblockVsAdblockPlus: artwork('adblock-vs-adblock-plus', 'Original instructional diagram for a matched two-browser blocker test'),
  craigslistAlternativesByTask: artwork('craigslist-alternatives-by-task', 'Original instructional diagram for comparing local marketplaces by task and location'),
  ambigramGeneratorsReadability: artwork('ambigram-generators-readability', 'Original instructional diagram for reading, rotating and retesting ambigram lettering'),
  jwPlayerAuthorizedVideoDownloads: artwork('jw-player-authorized-video-downloads', 'Original instructional diagram for selecting an authorized video source and checking quality'),
  codingBrowserClickCounter: artwork('coding-browser-click-counter', 'Working Freetins browser counter showing zero with Add one and Reset controls'),
  'how-to-redeem-game-codes': artwork('how-to-redeem-game-codes', 'Code token choosing the correct platform gateway in a bright game plaza'),
  'roblox-promo-codes': artwork('roblox-promo-codes', 'Roblox avatars celebrating one live promo token beside an archive of expired tokens'),
  'steal-a-brainrot-codes': artwork('steal-a-brainrot-codes', 'Rare hybrid creatures and live versus sold-out code tokens on a Steal a Brainrot red carpet'),
  'grow-a-garden-recipes': artwork('grow-a-garden-recipes', 'Giant garden crops feeding an outdoor cooking station surrounded by finished recipes'),
  'monopoly-go-golden-blitz': artwork('monopoly-go-golden-blitz', 'Two golden Monopoly GO stickers trading across a timed board-city event'),
  'monopoly-go-tycoon-club': artwork('monopoly-go-tycoon-club', 'Green-and-gold Tycoon Club with a daily reward wheel, loyalty diamonds and milestone path'),
  'roblox-song-ids': artwork('roblox-song-ids', 'Roblox avatars dancing as colorful music genres converge on an audio medallion'),
  'steal-a-brainrot-admin-abuse': artwork('steal-a-brainrot-admin-abuse', 'Admin event filling a Steal a Brainrot red carpet with taco rain, meteors and rare creatures'),
  'steal-a-brainrot-all-brainrots': artwork('steal-a-brainrot-all-brainrots', 'Brainrot creatures arranged by rarity while coins flow toward their collection pads'),
  'monopoly-go': artwork('monopoly-go', 'Dice following a golden reward path toward a gift chest in a bright Monopoly GO board city'),
};

export const requireArticleArtwork = (routeId: string) => {
  const entry = articleArtwork[routeId];
  if (!entry) throw new Error(`Missing article artwork for route: ${routeId}`);
  return entry;
};
