import type { ImageMetadata } from 'astro';

export interface SiteArtwork {
  src: ImageMetadata;
  alt: string;
  socialImage: string;
}

const approvedGameSources = import.meta.glob<ImageMetadata>('../assets/home/*-codes-art.webp', {
  eager: true,
  import: 'default',
});
const gameSources = import.meta.glob<ImageMetadata>('../assets/games/*-codes-art.webp', {
  eager: true,
  import: 'default',
});
const dailySources = import.meta.glob<ImageMetadata>('../assets/daily/*-free-rewards-art.webp', {
  eager: true,
  import: 'default',
});
const gearSources = import.meta.glob<ImageMetadata>('../assets/gear/*-product.webp', {
  eager: true,
  import: 'default',
});
const teamSources = import.meta.glob<ImageMetadata>('../assets/team/*-editorial-portrait.webp', {
  eager: true,
  import: 'default',
});

const byFilename = (sources: Record<string, ImageMetadata>) => Object.fromEntries(
  Object.entries(sources).map(([path, image]) => [path.split('/').at(-1), image]),
);

const images = {
  games: byFilename({ ...approvedGameSources, ...gameSources }),
  daily: byFilename(dailySources),
  gear: byFilename(gearSources),
  team: byFilename(teamSources),
};

const requireImage = (collection: Record<string, ImageMetadata>, filename: string) => {
  const image = collection[filename];
  if (!image) throw new Error(`Missing optimized site artwork: ${filename}`);
  return image;
};

const artwork = (
  collection: Record<string, ImageMetadata>,
  filename: string,
  alt: string,
  socialImage: string,
): SiteArtwork => ({
  src: requireImage(collection, filename),
  alt,
  socialImage,
});

const gameAlts: Record<string, string> = {
  'grow-a-garden': 'Gardener carrying an oversized tomato through bright crop plots',
  'basketball-zero': 'Basketball player rising for a one-handed dunk in a night arena',
  'volleyball-legends': 'Volleyball player spiking over two blockers in an indoor arena',
  'blue-lock-rivals': 'Two energized soccer players racing toward the ball',
  '99-nights-in-the-forest': 'Forest survivor beside a campfire with an antlered creature in the fog',
  'sols-rng': 'Adventurer surrounded by a rare blue and violet cosmic aura',
  'dandys-world': 'Colorful mascots exploring a dark abandoned play center',
  'type-soul': 'Supernatural swordsman facing a masked opponent at night',
  'anime-card-clash': 'Duelist revealing three glowing fantasy battle cards',
  'tennis-zero': 'Tennis player striking a luminous ball across a neon stadium court',
  'jujutsu-zero': 'Two spell fighters clashing red and blue energy in a city plaza',
  'weak-legacy-2': 'Swordsman using flame and mist techniques in a mountain village',
  'hunty-zombies': 'Survivor with dual blasters facing teal zombies in a school corridor',
  'sailor-piece': 'Sailor leaping from a wooden ship toward a tropical island',
  'jujutsu-infinite': 'Sorcerer striking a golden seal with a gavel in a sunlit courtyard',
  'azure-latch': 'Soccer striker sending an icy blue volley toward goal',
  'fruit-battlegrounds': 'Elemental fighters clashing fire and water powers on a tropical island',
  'untitled-boxing-game': 'Two boxers exchanging a body counterpunch in an open-air ring',
  'the-forge': 'Miner-smith forging a glowing blade beside a crystal mine',
  kaizen: 'Martial spell fighters clashing jade and crimson energy in the rain',
  mugen: 'Swordsmen dueling with flame and water trails beside a lantern village',
  'dress-to-impress': 'Three fashion avatars walking a colorful studio runway',
  'universal-tower-defense': 'Elemental defenders protecting a neon city path from shadow creatures',
  'anime-last-stand': 'Desert defenders holding a winding route against armored creatures',
  'anime-final-quest': 'Red-haired adventurer charging a portal boss with a glowing sword',
  flashpoint: 'Tactical squad advancing through a stormy district toward a red flare',
  rivals: 'Orange blaster aimed at red opponents in a white grid arena',
  'shindo-life': 'Forest trainee casting teal energy beside wooden practice posts',
  'anime-ranger-x': 'Ranger fighters clearing armored creatures from a fantasy village road',
  'racket-rivals': 'Racket players contesting a glowing ball above a turquoise court',
  'pixel-blade': 'Armored hero swinging a luminous sword through crystal creatures',
  'bizarre-lineage': 'Street fighter surrounded by a violet guardian aura in a snowy city',
  'anime-apocalypse': 'Swordsman wall-running above zombies in a sunlit ruined city',
  'clover-retribution': 'Mage casting a blue shield from an emerald spellbook',
  'devil-hunters': 'Hunter confronting a many-armed shadow creature at a rainy intersection',
  'spongebob-tower-defense': 'Original coral guardians defending an undersea path from bubble creatures',
  'ninja-time': 'Ninja trainee racing through a mountain village with a blue wind technique',
  'king-legacy': 'Sea adventurer firing golden energy toward a fortified island',
  'anime-guardians': 'Elemental guardian units protecting an enchanted forest path',
  'dragon-soul': 'Energy fighter flying above a tropical floating island',
  'soccer-zero': 'Soccer striker driving a red-trail shot between two defenders',
  'playground-basketball': 'Streetball player spinning past a defender on an outdoor court',
  'anime-eternal': 'Energy fighter battling ranked creatures on a futuristic city street',
  'jump-star': 'Two teams converging on a glowing capture point in a canyon arena',
  'restaurant-tycoon-3': 'Chef plating a meal in a warm open restaurant kitchen',
  'slap-battles': 'Competitors swinging glowing gloves across floating grass islands',
  'blade-ball': 'Sword fighters timing a blue parry against a blazing arena ball',
  'plants-vs-brainrots': 'Block-built plants defending garden rows from colorful creatures',
  'da-hood': 'Street avatars running through a rain-darkened brick neighborhood',
  'anime-vanguards': 'Elemental defenders protecting a path from shadow enemies',
  'driving-empire': 'Orange and blue sports cars racing through a sunny coastal city',
  fisch: 'Angler landing a glowing rare fish near an island lighthouse in daylight',
};

const gameSocialOverrides: Record<string, string> = {
  'anime-vanguards': '/og/games/anime-vanguards-v2.jpg',
  'plants-vs-brainrots': '/og/games/plants-vs-brainrots-v2.jpg',
};

export const gameArtwork: Record<string, SiteArtwork> = Object.fromEntries(
  Object.entries(gameAlts).map(([slug, alt]) => [
    slug,
    artwork(
      images.games,
      `${slug}-codes-art.webp`,
      alt,
      gameSocialOverrides[slug] ?? `/og/games/${slug}.jpg`,
    ),
  ]),
);

const dailyAlts: Record<string, string> = {
  'monopoly-go': 'Dice rolling toward a reward chest on a colorful city property board',
  'coin-master': 'Prize wheel showering coins over a Nordic-inspired coastal village',
  'dice-dreams': 'Three dice bouncing before a whimsical hilltop castle',
  'bingo-blitz': 'Numbered bingo balls above colorful cards and a travel suitcase',
  'family-island': 'Island family gathering fruit along a glowing energy trail',
  'board-kings': 'Dice circling a playful city board with a reward vault at its center',
};

export const dailyArtwork: Record<string, SiteArtwork> = Object.fromEntries(
  Object.entries(dailyAlts).map(([slug, alt]) => [
    slug,
    artwork(images.daily, `${slug}-free-rewards-art.webp`, alt, `/og/daily/${slug}.jpg`),
  ]),
);

const gearAlts: Record<string, string> = {
  'roblox-gift-card-25-cad': 'Generic green digital gaming gift card beside a matte gift box',
  'wired-gaming-headset-mid-range': 'Black wired gaming headset with boom microphone and inline controls',
  'controller-for-mobile-play': 'Telescopic mobile gaming controller holding a blank-screen smartphone',
  'phone-cooling-clip': 'Blue-lit cooling fan clipped to the back of a smartphone',
  'mechanical-keypad-24-key': 'Compact 24-key mechanical keypad with restrained green and amber lighting',
  'charging-dock-two-bay': 'Two unbranded game controllers resting in a charging dock',
};

export const gearArtwork: Record<string, SiteArtwork> = Object.fromEntries(
  Object.entries(gearAlts).map(([slug, alt]) => [
    slug,
    artwork(images.gear, `${slug}-product.webp`, alt, `/og/gear/${slug}.jpg`),
  ]),
);

const authorAlts: Record<string, string> = {
  'priya-raman': 'Illustrated portrait of Priya Raman holding a verification notebook',
  'diego-ferreira': 'Illustrated portrait of Diego Ferreira holding a smartphone',
  'marcus-bell': 'Illustrated portrait of Marcus Bell holding a verification checklist',
};

export const authorArtwork: Record<string, SiteArtwork> = Object.fromEntries(
  Object.entries(authorAlts).map(([slug, alt]) => [
    slug,
    artwork(images.team, `${slug}-editorial-portrait.webp`, alt, `/og/team/${slug}.jpg`),
  ]),
);

export const requireArtwork = (
  collection: Record<string, SiteArtwork>,
  slug: string,
  label: string,
) => {
  const entry = collection[slug];
  if (!entry) throw new Error(`Missing ${label} artwork for: ${slug}`);
  return entry;
};
