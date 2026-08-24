import {
  dailyLinkCatalogue,
  gameCatalogue,
  publishedDailyLinkCatalogue,
  publishedGameCatalogue,
} from './home';
import { editorialArticles } from './articles';
import { getCheatOperationalPage, getProduct, operations } from './operations';

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
  | 'notTracked'
  | 'article';

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
    description: 'Source-linked daily rewards with absolute check times and clear verification states.',
    noindex: publishedDailyLinkCatalogue.length === 0,
  },
  {
    path: '/codes/', routeId: 'browse', kind: 'browse', title: 'Game codes | Freetins', heading: 'All codes',
    description: 'Published code pages backed by source URLs, redemption steps and recorded verification events.',
    noindex: publishedGameCatalogue.length === 0,
  },
  {
    path: '/search/', routeId: 'search', kind: 'search', title: 'Search | Freetins', heading: 'Search',
    description: 'Search games, guides and daily-link pages on Freetins.',
  },
  {
    path: '/cheats/', routeId: 'cheats', kind: 'cheats', title: 'Game cheats | Freetins', heading: 'Cheats',
    description: 'Published cheat sheets with platform distinctions, warnings and cited sources.',
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
    description: 'The evidence states, source requirements, freshness windows and removal rules used by Freetins.',
  },
  {
    path: '/submit/', routeId: 'submit', kind: 'submit', title: 'Submit a code | Freetins', heading: 'Submit a code',
    description: 'Submission intake is not active yet. Use the published contact address for corrections.', eyebrow: 'Community', noindex: true,
  },
  {
    path: '/alerts/', routeId: 'alerts', kind: 'alerts', title: 'Code alerts | Freetins', heading: 'Know before the code expires',
    description: 'Alert delivery is not active yet. This page explains the launch requirement.', noindex: true,
  },
  {
    path: '/blog/', routeId: 'updates', kind: 'updates', title: 'Blog | Freetins', heading: 'Blog',
    description: 'A publication log appears here when source-backed operational changes are recorded.', noindex: true,
  },
  {
    path: '/games/', routeId: 'az', kind: 'az', title: 'All games A-Z | Freetins', heading: 'All games A-Z',
    description: 'Every published game page backed by operational content records.',
    noindex: publishedGameCatalogue.length + publishedDailyLinkCatalogue.length === 0,
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

const cheatRoutes: RouteDefinition[] = operations.cheatGames.map((game) => {
  const page = getCheatOperationalPage(game.slug);
  return {
    path: `/cheats/${game.slug}/`,
    routeId: 'cheat',
    kind: 'cheat',
    title: `${game.heading} | Freetins`,
    heading: game.heading,
    description: page?.isPublished
      ? `${game.name} cheats with platform scope, source URLs and recorded verification events.`
      : `${game.name} is configured for cheat verification, but no cheat sheet is published yet.`,
    name: game.name,
    slug: game.slug,
    noindex: !page?.isPublished,
  };
});

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
  description: `Source-linked ${name.toLowerCase()} research appears here when a checked product record is published.`,
  name,
  slug,
  noindex: !operations.products.some((product) => product.category === slug),
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
  kind: 'gearProduct' as const,
  title: `${name} | Freetins`,
  heading: name,
  description: getProduct(slug)
    ? `Checked price, merchant source and editorial rationale for ${name.toLowerCase()}.`
    : `${name} is configured for product research, but no checked listing is published yet.`,
  name,
  slug,
  noindex: !getProduct(slug),
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
  kind: 'guide' as const,
  title: `${heading} | Freetins`,
  heading,
  description: `${heading} is configured for editorial review but is not published yet.`,
  name: 'Grow a Garden',
  slug,
  noindex: true,
}));

const articleRoutes: RouteDefinition[] = editorialArticles.map((article) => ({
  path: article.path,
  routeId: article.routeId,
  kind: 'article',
  title: article.title,
  heading: article.heading,
  description: article.description,
  eyebrow: article.eyebrow,
}));

const dailyRoutes: RouteDefinition[] = dailyLinkCatalogue.map((game) => ({
  path: `/daily/${game.slug}/`,
  routeId: 'freebies',
  kind: 'dailyGame',
  title: `${game.name} reward links and claim guide | Freetins`,
  heading: `${game.name} reward links`,
  description: game.isPublished
    ? `${game.name} reward links with source URLs and recorded check times.`
    : `${game.name} is configured for verification, but no reward link is published yet.`,
  name: game.name,
  slug: game.slug,
  noindex: !game.isPublished,
}));

const gameRoutes: RouteDefinition[] = gameCatalogue.flatMap((game) => {
  const root = `/codes/${game.slug}`;
  return [
    {
      path: `${root}/`,
      routeId: 'codes',
      kind: 'codes' as const,
      title: `${game.name} codes and redemption guide | Freetins`,
      heading: game.name,
      description: game.isPublished
        ? `${game.name} codes with source URLs, redemption steps and recorded verification events.`
        : `${game.name} is configured for verification, but no code is published yet.`,
      name: game.name,
      slug: game.slug,
      platform: game.platform,
      noindex: !game.isPublished,
    },
    {
      path: `${root}/values/`,
      routeId: 'values',
      kind: 'values' as const,
      title: `${game.name} item values | Freetins`,
      heading: 'Item values',
      description: game.valueCount > 0
        ? `${game.name} item values with a source and observation time on every row.`
        : `${game.name} item values are configured, but no sourced value row is published yet.`,
      name: game.name,
      slug: game.slug,
      platform: game.platform,
      noindex: game.valueCount === 0,
    },
    {
      path: `${root}/expired/`,
      routeId: 'archive',
      kind: 'archive' as const,
      title: `${game.name} expired code archive | Freetins`,
      heading: 'Expired code archive',
      description: game.expiredCount > 0
        ? `Expired ${game.name} code records with retained sources and removal check times.`
        : `${game.name} has no expired code record in the published archive yet.`,
      name: game.name,
      slug: game.slug,
      platform: game.platform,
      noindex: game.expiredCount === 0,
    },
    {
      path: `${root}/updates/`,
      routeId: 'updates',
      kind: 'updates' as const,
      title: `${game.name} updates | Freetins`,
      heading: 'Updates',
      description: game.updateCount > 0
        ? `Source-linked update history for ${game.name}.`
        : `${game.name} updates are configured, but no source-linked timeline entry is published yet.`,
      name: game.name,
      slug: game.slug,
      platform: game.platform,
      noindex: game.updateCount === 0,
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
  ...articleRoutes,
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
