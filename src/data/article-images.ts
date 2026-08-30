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
  wordscapesAnswers: artwork('wordscapes', 'Blank crossword tiles on a puzzle table overlooking a bright mountain lake'),
  candyCrushBoosters: artwork('candy-crush-free-boosters', 'Colorful candy board with a life heart and glowing booster tools'),
  bestGbaEmulators: artwork('best-gba-emulators', 'Original pixel adventurer passing through four rendering gateways in a bright retro world'),
  bestGbaGames: artwork('best-gba-games', 'Connected pixel-art worlds for racing, tactics, puzzles, science fiction and adventure'),
  resources: artwork('resources', 'Verified compass connecting codes, rewards, puzzles and guide paths across a bright game world'),
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
