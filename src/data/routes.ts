import { dailyLinkCatalogue, gameCatalogue } from './home';

export type RouteKind =
  | 'daily'
  | 'dailyGame'
  | 'browse'
  | 'codes'
  | 'cheats'
  | 'cheat'
  | 'search'
  | 'gearCategory'
  | 'gearProduct'
  | 'verify'
  | 'submit'
  | 'alerts'
  | 'author'
  | 'contact'
  | 'guide'
  | 'info'
  | 'az'
  | 'privacy'
  | 'affiliate'
  | 'values'
  | 'updates'
  | 'archive'
  | 'terms'
  | 'notTracked';

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
    path: '/daily/', routeId: 'daily', kind: 'daily', title: 'Daily links | Freetins', heading: 'Daily links',
    description: 'Free dice, spins, rolls and energy links, opened on a published check schedule.',
  },
  {
    path: '/codes/', routeId: 'browse', kind: 'browse', title: 'Game codes | Freetins', heading: 'All codes',
    description: 'Every game we track, ordered by the time its codes were last checked.',
  },
  {
    path: '/search/', routeId: 'search', kind: 'search', title: 'Search | Freetins', heading: 'Search',
    description: 'Search games, guides and daily-link pages on Freetins.',
  },
  {
    path: '/cheats/', routeId: 'cheats', kind: 'cheats', title: 'Game cheats | Freetins', heading: 'Cheats',
    description: 'Game cheats entered by hand and confirmed against the current patch.',
  },
  {
    path: '/answers/', routeId: 'answers', kind: 'info', title: 'Answers | Freetins', heading: 'Answers',
    description: 'Puzzle and level answer sheets with direct navigation.', noindex: false,
  },
  {
    path: '/guides/', routeId: 'guideIndex', kind: 'info', title: 'Guides | Freetins', heading: 'Guides',
    description: 'Process and explainer pages that are not one game’s codes.',
  },
  {
    path: '/how-we-verify/', routeId: 'verify', kind: 'verify', title: 'How we verify | Freetins', heading: 'How we verify',
    description: 'The source, check schedule and removal rules behind every code on Freetins.',
  },
  {
    path: '/submit/', routeId: 'submit', kind: 'submit', title: 'Submit a code | Freetins', heading: 'Submit a code',
    description: 'Send a code to the Freetins verification queue.', eyebrow: 'Community',
  },
  {
    path: '/alerts/', routeId: 'alerts', kind: 'alerts', title: 'Code alerts | Freetins', heading: 'Know before the code expires',
    description: 'Choose games and get an alert when a verified code is published.',
  },
  {
    path: '/contact/', routeId: 'contact', kind: 'contact', title: 'Contact | Freetins', heading: 'Contact',
    description: 'Corrections, partnerships, promotion and general enquiries for the Freetins editorial desk.',
  },
  {
    path: '/blog/', routeId: 'updates', kind: 'updates', title: 'Blog | Freetins', heading: 'Blog',
    description: 'The verification and change log.',
  },
  {
    path: '/games/', routeId: 'az', kind: 'az', title: 'All games A-Z | Freetins', heading: 'All games A-Z',
    description: 'Every game with a page on Freetins and its current number of live codes or links.',
  },
  {
    path: '/resources/', routeId: 'resources', kind: 'info', title: 'Resources | Freetins', heading: 'Resources',
    description: 'A human sitemap and launch references.',
  },
  {
    path: '/about/', routeId: 'about', kind: 'info', title: 'About | Freetins', heading: 'About',
    description: 'About the site and its relaunch.',
  },
  {
    path: '/privacy/', routeId: 'privacy', kind: 'privacy', title: 'Privacy | Freetins', heading: 'Privacy',
    description: 'How Freetins collects, uses and shares data.',
  },
  {
    path: '/disclosure/', routeId: 'affiliate', kind: 'affiliate', title: 'Disclosure | Freetins', heading: 'Disclosure',
    description: 'Which Freetins links may pay us and what money never buys.',
  },
  {
    path: '/terms-and-conditions/', routeId: 'terms', kind: 'terms', title: 'Terms of use | Freetins', heading: 'Terms of use',
    description: 'The terms governing use of Freetins.',
  },
];

const authorRoutes: RouteDefinition[] = ([
  ['paul-a', 'Paul A', 'Editor'],
] as const).map(([slug, name, role]) => ({
  path: `/author/${slug}/`,
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
  path: `/cheats/${slug}/`,
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
  path: `/gear/${slug}/`,
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
  path: `/gear/${category}/${slug}/`,
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
  path: `/guides/${slug}/`,
  routeId: 'guide',
  kind: 'guide',
  title: `${heading} | Freetins`,
  heading,
  description: `${heading}, checked against the current Grow a Garden patch.`,
  name: 'Grow a Garden',
  slug,
}));

const dailyRoutes: RouteDefinition[] = dailyLinkCatalogue.map((game) => ({
  path: `/daily/${game.slug}/`,
  routeId: 'freebies',
  kind: 'dailyGame',
  title: `Free ${game.name} links - August 2026 | Freetins`,
  heading: `Free ${game.name} links - August 2026`,
  description: `Working ${game.name} reward links, each carrying the minute it was last opened.`,
  name: game.name,
  slug: game.slug,
}));

const gameRoutes: RouteDefinition[] = gameCatalogue.flatMap((game) => {
  const root = `/codes/${game.slug}`;
  return [
    {
      path: `${root}/`,
      routeId: 'codes',
      kind: 'codes' as const,
      title: `${game.name} codes | Freetins`,
      heading: game.name,
      description: `Working ${game.name} codes, with expired codes, values and updates kept under the same intent.`,
      name: game.name,
      slug: game.slug,
      platform: game.platform,
    },
    {
      path: `${root}/values/`,
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
      path: `${root}/expired/`,
      routeId: 'archive',
      kind: 'archive' as const,
      title: `${game.name} expired code archive | Freetins`,
      heading: 'Expired code archive',
      description: `Every pulled ${game.name} code, with first-seen and removal dates.`,
      name: game.name,
      slug: game.slug,
      platform: game.platform,
    },
    {
      path: `${root}/updates/`,
      routeId: 'updates',
      kind: 'updates' as const,
      title: `${game.name} updates | Freetins`,
      heading: 'Updates',
      description: `Documented update cadence and change history for ${game.name}.`,
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

export const prerenderedRouteDefinitions = routeDefinitions;

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
