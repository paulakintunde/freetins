const catalogue = [
  ['Grow a Garden', 8, 3],
  ['Basketball Zero', 5, 11],
  ['Volleyball Legends', 6, 18],
  ['Blue Lock Rivals', 4, 26],
  ['99 Nights in the Forest', 7, 34],
  ["Sol's RNG", 3, 41],
  ["Dandy's World", 5, 52],
  ['Type Soul', 2, 64],
  ['Anime Card Clash', 6, 71],
  ['Tennis Zero', 4, 96],
  ['Jujutsu Zero', 3, 118],
  ['Weak Legacy 2', 5, 132],
  ['Hunty Zombies', 4, 148],
  ['Sailor Piece', 3, 166],
  ['Jujutsu Infinite', 5, 184],
  ['Azure Latch', 2, 205],
  ['Fruit Battlegrounds', 6, 228],
  ['Untitled Boxing Game', 3, 246],
  ['The Forge', 4, 268],
  ['Kaizen', 2, 289],
  ['Mugen', 3, 310],
  ['Dress to Impress', 5, 336],
  ['Universal Tower Defense', 2, 358],
  ['Anime Last Stand', 4, 384],
  ['Anime Final Quest', 3, 410],
  ['Flashpoint', 2, 438],
  ['Fisch', 5, 466],
  ['Rivals', 3, 492],
  ['Shindo Life', 4, 520],
  ['Anime Ranger X', 2, 552],
  ['Racket Rivals', 3, 584],
  ['Pixel Blade', 2, 618],
  ['Bizarre Lineage', 3, 652],
  ['Anime Apocalypse', 2, 688],
  ['Clover Retribution', 4, 724],
  ['Devil Hunters', 3, 762],
  ['SpongeBob Tower Defense', 2, 800],
  ['Ninja Time', 3, 840],
  ['King Legacy', 4, 882],
  ['Anime Guardians', 2, 925],
  ['Dragon Souls', 3, 970],
  ['Soccer Zero', 2, 1016],
  ['Playground Basketball', 3, 1064],
  ['Anime Eternal', 2, 1114],
  ['Jump Star', 3, 1165],
  ['Restaurant Tycoon 3', 2, 1218],
  ['Slap Battles', 4, 1272],
  ['Blade Ball', 3, 1328],
  ['Plants vs Brainrots', 5, 1386],
  ['Da Hood', 2, 1445],
  ['Anime Vanguards', 4, 1506],
  ['Driving Empire', 2, 1568],
] as const;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const formatAge = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} h`;
  return `${Math.round(minutes / 1440)} d`;
};

export const gameCatalogue = catalogue.map(([name, live, minutes]) => ({
  name,
  live,
  minutes,
  age: formatAge(minutes),
  slug: slugify(name),
  platform: 'roblox',
}));

export const pulse = [
  { value: '312', label: 'games watched' },
  { value: '1,847', label: 'links checked today' },
  { value: '41 min', label: 'median code age' },
  { value: '94%', label: 'verified in the last hour' },
] as const;

export const homeTiles = catalogue.slice(0, 12).map(([name, live, minutes], index) => ({
  name,
  live,
  age: formatAge(minutes),
  rate: 92 + (index % 7),
  href: `/roblox/${slugify(name)}`,
}));

export const sponsoredGames = [
  { name: 'Fisch', label: 'Sponsored by the developer' },
  { name: 'Anime Vanguards', label: 'Promoted placement' },
  { name: 'Driving Empire', label: 'Sponsored by the developer' },
  { name: 'Plants vs Brainrots', label: 'Promoted placement' },
] as const;

const dailyRaw = [
  ['Monopoly GO', 14, 6],
  ['Coin Master', 9, 12],
  ['Dice Dreams', 7, 21],
  ['Bingo Blitz', 5, 38],
  ['Family Island', 6, 44],
  ['Board Kings', 4, 58],
] as const;

export const dailyGames = dailyRaw.map(([name, live, minutes]) => ({
  name,
  live,
  age: formatAge(minutes),
  href: `/daily/${slugify(name)}`,
}));

export const dailyLinkCatalogue = dailyRaw.map(([name, live, minutes]) => ({
  name,
  live,
  minutes,
  age: formatAge(minutes),
  slug: slugify(name),
}));
