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
  gta5Demo: artwork('gta-5-demo', 'GTA V game case and controller in a bright room overlooking Los Santos'),
  legoJurassicWorld: artwork('lego-jurassic-world', 'LEGO adventurers running through a sunny dinosaur park with a brick-built T. rex'),
  guitarHero3: artwork('guitar-hero-3', 'Five-fret guitar controller and note highway at a daylight rock festival'),
  pokemonEmerald: artwork('pokemon-emerald', 'Pokemon Emerald pixel-art route beside a storage grid filled with Rare Candy'),
  doubleDownCasino: artwork('doubledown-casino', 'Virtual casino chips connected securely to a verified mobile reward'),
  resources: artwork('resources', 'Codes, answers, cheats, rewards and guides arranged around a verified compass'),
};

export const requireArticleArtwork = (routeId: string) => {
  const entry = articleArtwork[routeId];
  if (!entry) throw new Error(`Missing article artwork for route: ${routeId}`);
  return entry;
};
