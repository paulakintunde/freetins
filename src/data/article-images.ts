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
  littleAlchemy: artwork('little-alchemy', 'Air, earth, fire and water combining above an alchemy recipe book'),
  guessEmojiLevels1To10: artwork('guess-emoji-levels-1-10', 'Colorful emoji clues and answer tiles on a puzzle stage'),
  christmasEmoji: artwork('100-pics-christmas-emoji', 'Christmas emoji ornaments, gifts and answer tiles on a cozy puzzle table'),
  littleAlchemyEnergy: artwork('little-alchemy-2-energy', 'Air and fire recipes producing glowing Energy spheres'),
  jurassicWorldGame: artwork('jurassic-world-the-game', 'Dinosaur park habitats and a tactical planning board'),
  gta5RadioStations: artwork('gta-5-radio-stations', 'Illuminated car radio and equalizer on a nighttime city drive'),
  gta5Demo: artwork('gta-5-demo', 'Verified game download protected from suspicious files and fake mobile apps'),
  legoJurassicWorld: artwork('lego-jurassic-world', 'Brick-built dinosaurs beside a glowing cheat-code keypad'),
  guitarHero3: artwork('guitar-hero-3', 'Five colored guitar fret buttons glowing on a concert stage'),
  pokemonEmerald: artwork('pokemon-emerald', 'Rare candies moving into a retro game storage box'),
  doubleDownCasino: artwork('doubledown-casino', 'Virtual casino chips connected securely to a verified mobile reward'),
  resources: artwork('resources', 'Codes, answers, cheats, rewards and guides arranged around a verified compass'),
};

export const requireArticleArtwork = (routeId: string) => {
  const entry = articleArtwork[routeId];
  if (!entry) throw new Error(`Missing article artwork for route: ${routeId}`);
  return entry;
};
