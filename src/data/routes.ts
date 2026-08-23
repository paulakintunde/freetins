import { dailyLinkCatalogue, gameCatalogue } from './home';
import routeRendering from './route-rendering.json';

export type RouteKind =
  | 'daily'
  | 'dailyGame'
  | 'codes'
  | 'browse'
  | 'hub'
  | 'cheats'
  | 'cheat'
  | 'search'
  | 'queue'
  | 'gearCategory'
  | 'gearProduct'
  | 'verify'
  | 'submit'
  | 'alerts'
  | 'author'
  | 'contact'
  | 'guide'
  | 'calendar'
  | 'az'
  | 'status'
  | 'privacy'
  | 'affiliate'
  | 'notTracked'
  | 'values'
  | 'tiers'
  | 'team'
  | 'adspec'
  | 'updates'
  | 'gearIndex'
  | 'manage'
  | 'archive'
  | 'terms';

export interface RouteDefinition {
  path: string;
  routeId: string;
  kind: RouteKind;
  title: string;
  heading: string;
  description: string;
  eyebrow?: string;
  name?: string;
  slug?: string;
  platform?: string;
  noindex?: boolean;
}

const staticRoutes: RouteDefinition[] = [
  {
    path: '/daily', routeId: 'daily', kind: 'daily', title: 'Daily links | Freetins', heading: 'Daily links',
    description: 'Free dice, spins, rolls and energy links, opened on a published check schedule.',
  },
  {
    path: '/roblox', routeId: 'browse', kind: 'browse', title: 'Roblox codes | Freetins', heading: 'All games',
    description: 'Every Roblox game we track, ordered by the time its codes were last checked.',
  },
  {
    path: '/cheats', routeId: 'cheats', kind: 'cheats', title: 'Game cheats | Freetins', heading: 'Cheats',
    description: 'Game cheats entered by hand and confirmed against the current patch.',
  },
  {
    path: '/search', routeId: 'search', kind: 'search', title: 'Search | Freetins', heading: 'Find your game',
    description: 'Search every game, daily link page and guide tracked by Freetins.', noindex: true,
  },
  {
    path: '/internal/queue', routeId: 'queue', kind: 'queue', title: 'Review queue | Freetins', heading: 'Review queue',
    description: 'Internal validation queue for candidate games.', eyebrow: 'Internal', noindex: true,
  },
  {
    path: '/how-we-verify', routeId: 'verify', kind: 'verify', title: 'How we verify | Freetins', heading: 'How we verify',
    description: 'The source, check schedule and removal rules behind every code on Freetins.',
  },
  {
    path: '/submit', routeId: 'submit', kind: 'submit', title: 'Submit a code | Freetins', heading: 'Submit a code',
    description: 'Send a code to the Freetins verification queue.', eyebrow: 'Community',
  },
  {
    path: '/alerts', routeId: 'alerts', kind: 'alerts', title: 'Code alerts | Freetins', heading: 'Know before the code expires',
    description: 'Choose games and save email alert preferences before the delivery worker launches.',
  },
  {
    path: '/contact', routeId: 'contact', kind: 'contact', title: 'Contact | Freetins', heading: 'Contact',
    description: 'Corrections, partnerships, promotion and general enquiries for the Freetins team.',
  },
  {
    path: '/calendar', routeId: 'calendar', kind: 'calendar', title: 'Codes calendar | Freetins', heading: 'Codes calendar',
    description: 'What dropped, what expired and what is coming next.',
  },
  {
    path: '/games', routeId: 'az', kind: 'az', title: 'All games A-Z | Freetins', heading: 'All games A-Z',
    description: 'Every game with a page on Freetins and its current number of live codes or links.',
  },
  {
    path: '/status', routeId: 'status', kind: 'status', title: 'Checker status | Freetins', heading: 'Checker status',
    description: 'Current health and recent incidents for the Freetins verification system.',
  },
  {
    path: '/privacy', routeId: 'privacy', kind: 'privacy', title: 'Privacy | Freetins', heading: 'Privacy',
    description: 'How Freetins collects, uses and shares data.',
  },
  {
    path: '/affiliate-disclosure', routeId: 'affiliate', kind: 'affiliate', title: 'Affiliate disclosure | Freetins', heading: 'Affiliate disclosure',
    description: 'Which Freetins links may pay us and what money never buys.',
  },
  {
    path: '/not-tracked', routeId: 'notfound', kind: 'notTracked', title: 'Game not tracked | Freetins', heading: 'We do not cover Anime Card Clash 2',
    description: 'This game has not cleared the Freetins validation gate.',
  },
  {
    path: '/tier-list', routeId: 'tiers', kind: 'tiers', title: 'Roblox code tier list | Freetins', heading: 'Roblox code tier list',
    description: 'Roblox games ranked by code generosity, with recent codes shown as evidence.',
  },
  {
    path: '/team', routeId: 'team', kind: 'team', title: 'Editorial team | Freetins', heading: 'Editorial team',
    description: 'The three people who write, check and sign off every Freetins page.',
  },
  {
    path: '/advertise', routeId: 'adspec', kind: 'adspec', title: 'Ad slot inventory | Freetins', heading: 'Ad slot inventory',
    description: 'Freetins advertising placements, dimensions and delivery rules.', eyebrow: 'Commercial specification', noindex: true,
  },
  {
    path: '/updates', routeId: 'updates', kind: 'updates', title: 'Update history | Freetins', heading: 'Update history',
    description: 'A dated record of product, checker and editorial policy changes.',
  },
  {
    path: '/gear', routeId: 'gearIndex', kind: 'gearIndex', title: 'Gaming gear | Freetins', heading: 'Gear',
    description: 'Products picked for a specific gaming problem, with the commercial relationship disclosed.',
  },
  {
    path: '/alerts/manage', routeId: 'manage', kind: 'manage', title: 'Manage alerts | Freetins', heading: 'Manage alerts',
    description: 'Pause, remove or delete code alerts from a signed management link.', noindex: true,
  },
  {
    path: '/archive', routeId: 'archive', kind: 'archive', title: 'Expired code archive | Freetins', heading: 'Expired code archive',
    description: 'Every expired code remains visible with its first-seen and removal dates.',
  },
  {
    path: '/terms', routeId: 'terms', kind: 'terms', title: 'Terms of use | Freetins', heading: 'Terms of use',
    description: 'The terms governing use of Freetins.',
  },
];

const authorRoutes: RouteDefinition[] = ([
  ['priya-raman', 'Priya Raman', 'Roblox codes editor'],
  ['diego-ferreira', 'Diego Ferreira', 'Mobile games editor'],
  ['marcus-bell', 'Marcus Bell', 'Verification lead'],
] as const).map(([slug, name, role]) => ({
  path: `/team/${slug}`,
  routeId: 'author',
  kind: 'author',
  title: `${name}, ${role} | Freetins`,
  heading: name,
  description: `${name} is the ${role} at Freetins.`,
  eyebrow: role,
  name,
  slug,
}));

const cheatRoutes: RouteDefinition[] = ([
  ['gta-5', 'GTA 5', 'GTA 5 cheats for PS5, Xbox and PC'],
  ['gta-san-andreas', 'GTA San Andreas', 'GTA San Andreas cheats'],
  ['gta-vice-city', 'GTA Vice City', 'GTA Vice City cheats'],
  ['red-dead-redemption-2', 'Red Dead Redemption 2', 'Red Dead Redemption 2 cheats'],
  ['the-sims-4', 'The Sims 4', 'The Sims 4 cheats'],
  ['skyrim', 'Skyrim', 'Skyrim console commands'],
  ['fallout-4', 'Fallout 4', 'Fallout 4 console commands'],
  ['minecraft', 'Minecraft', 'Minecraft commands'],
] as const).map(([slug, name, heading]) => ({
  path: `/cheats/${slug}`,
  routeId: 'cheat',
  kind: 'cheat',
  title: `${heading} | Freetins`,
  heading,
  description: `${name} cheats confirmed by hand against the current game build.`,
  name,
  slug,
}));

const gearCategories = [
  ['roblox', 'Roblox gear'],
  ['mobile', 'Mobile gaming gear'],
  ['pc-and-console', 'PC and console gear'],
] as const;

const gearCategoryRoutes: RouteDefinition[] = gearCategories.map(([slug, name]) => ({
  path: `/gear/${slug}`,
  routeId: 'gear',
  kind: 'gearCategory',
  title: `${name} | Freetins`,
  heading: name,
  description: `Freetins picks for ${name.toLowerCase()}, with prices and affiliate relationships shown clearly.`,
  name,
  slug,
}));

const gearProductRoutes: RouteDefinition[] = ([
  ['roblox', 'roblox-gift-card-25-cad', 'Roblox gift card, 25 CAD'],
  ['pc-and-console', 'wired-gaming-headset-mid-range', 'Wired gaming headset, mid range'],
  ['mobile', 'controller-for-mobile-play', 'Controller for mobile play'],
  ['mobile', 'phone-cooling-clip', 'Phone cooling clip'],
  ['pc-and-console', 'mechanical-keypad-24-key', 'Mechanical keypad, 24 key'],
  ['pc-and-console', 'charging-dock-two-bay', 'Charging dock, two bay'],
] as const).map(([category, slug, name]) => ({
  path: `/gear/${category}/${slug}`,
  routeId: 'gearItem',
  kind: 'gearProduct',
  title: `${name} | Freetins`,
  heading: name,
  description: `Price, specifications and the Freetins rationale for ${name.toLowerCase()}.`,
  name,
  slug,
}));

const guideRoutes: RouteDefinition[] = ([
  ['every-mutation-and-what-triggers-it', 'Every mutation in Grow a Garden and what triggers it'],
  ['best-seeds-first-hour', 'Best seeds to plant in your first hour'],
  ['fastest-sheckle-farming-route', 'Fastest sheckle farming route'],
  ['sprinkler-placement-that-works', 'Sprinkler placement that actually works'],
  ['what-to-buy-first-from-the-gear-shop', 'What to buy first from the gear shop'],
  ['pet-setup-for-passive-income', 'Pet setup for passive income'],
] as const).map(([slug, heading]) => ({
  path: `/guides/${slug}`,
  routeId: 'guide',
  kind: 'guide',
  title: `${heading} | Freetins`,
  heading,
  description: `${heading}, checked against the current Grow a Garden patch.`,
  name: 'Grow a Garden',
  slug,
}));

const dailyRoutes: RouteDefinition[] = dailyLinkCatalogue.map((game) => ({
  path: `/daily/${game.slug}`,
  routeId: 'freebies',
  kind: 'dailyGame',
  title: `Free ${game.name} links - August 2026 | Freetins`,
  heading: `Free ${game.name} links - August 2026`,
  description: `Working ${game.name} reward links, each carrying the minute it was last opened.`,
  name: game.name,
  slug: game.slug,
}));

const gameRoutes: RouteDefinition[] = gameCatalogue.flatMap((game) => {
  const root = `/${game.platform}/${game.slug}`;
  return [
    {
      path: root,
      routeId: 'hub',
      kind: 'hub' as const,
      title: `${game.name} codes, guides and values | Freetins`,
      heading: game.name,
      description: `Working ${game.name} codes, guides, item values and update history.`,
      name: game.name,
      slug: game.slug,
      platform: game.platform,
    },
    {
      path: `${root}-codes`,
      routeId: 'codes',
      kind: 'codes' as const,
      title: `${game.name} codes (August 2026) | Freetins`,
      heading: `${game.name} codes (August 2026)`,
      description: `All working ${game.name} codes, each with the time it was last verified. Expired codes stay visible.`,
      name: game.name,
      slug: game.slug,
      platform: game.platform,
    },
    {
      path: `${root}/values`,
      routeId: 'values',
      kind: 'values' as const,
      title: `${game.name} item values | Freetins`,
      heading: 'Item values',
      description: `${game.name} item values with a source and update time on every row.`,
      name: game.name,
      slug: game.slug,
      platform: game.platform,
    },
    {
      path: `${root}/archive`,
      routeId: 'archive',
      kind: 'archive' as const,
      title: `${game.name} expired code archive | Freetins`,
      heading: 'Expired code archive',
      description: `Every pulled ${game.name} code, with first-seen and removal dates.`,
      name: game.name,
      slug: game.slug,
      platform: game.platform,
    },
  ];
});

export const routeDefinitions: RouteDefinition[] = [
  ...staticRoutes,
  ...dailyRoutes,
  ...gameRoutes,
  ...cheatRoutes,
  ...authorRoutes,
  ...guideRoutes,
  ...gearCategoryRoutes,
  ...gearProductRoutes,
];

export const onDemandRoutePaths = routeRendering.onDemandRoutePaths;

const onDemandRoutePathSet = new Set<string>(onDemandRoutePaths);

export const prerenderedRouteDefinitions = routeDefinitions.filter(
  (definition) => !onDemandRoutePathSet.has(definition.path),
);

export const getRouteDefinition = (path: string) => {
  const definition = routeDefinitions.find((candidate) => candidate.path === path);
  if (!definition) throw new Error(`Missing route definition for ${path}`);
  return definition;
};

export const notFoundDefinition: RouteDefinition = {
  path: '/404',
  routeId: 'notfound',
  kind: 'notTracked',
  title: 'Page not found | Freetins',
  heading: 'Nothing grows here',
  description: 'The address does not match a page tracked by Freetins.',
};
