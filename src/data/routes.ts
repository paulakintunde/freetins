import {
  dailyLinkCatalogue,
  gameCatalogue,
  publishedDailyLinkCatalogue,
  publishedGameCatalogue,
} from './home';
import { editorialArticles, getArticleByPath } from './articles';
import { authors } from './authors';
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
  /** False omits the rel=canonical link. Only the 404 template does this. */
  canonical?: boolean;
}

const staticRoutes: RouteDefinition[] = [
  {
    path: '/daily/', routeId: 'daily', kind: 'daily', title: 'Daily links | Freetins', heading: 'Daily links',
    description: 'Source-linked daily rewards with absolute check times and clear verification states.',
    noindex: publishedDailyLinkCatalogue.length + editorialArticles.filter((article) => article.section === 'daily').length === 0,
  },
  {
    path: '/codes/', routeId: 'browse', kind: 'browse', title: 'Game codes | Freetins', heading: 'All codes',
    description: 'Published code pages backed by source URLs, redemption steps and recorded verification events.',
    noindex: publishedGameCatalogue.length === 0,
  },
  {
    path: '/search/', routeId: 'search', kind: 'search', title: 'Search | Freetins', heading: 'Search',
    description: 'Search games, guides and daily-link pages on Freetins.',
    // Internal result pages stay out of the index. The directive has to be
    // crawlable to be obeyed, so robots.txt must not also block this path.
    noindex: true,
  },
  {
    path: '/cheats/', routeId: 'cheats', kind: 'cheats', title: 'Game cheats | Freetins', heading: 'Cheats',
    description: 'Published cheat sheets with platform distinctions, warnings and cited sources.',
  },
  {
    path: '/answers/', routeId: 'answers', kind: 'info', title: 'Answers | Freetins', heading: 'Answers',
    description: 'Level answers, element recipes and puzzle solutions, checked against the current build of the game so the numbering still matches what you see.',
  },
  {
    path: '/guides/', routeId: 'guideIndex', kind: 'info', title: 'Guides | Freetins', heading: 'Guides',
    description: 'Explainer and process pages: how a feature works, what is actually available, and what to do when the method everyone repeats does not work.',
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
    description: 'Longer pages on how codes and rewards actually work, each built from a dataset where every row carries its own evidence and check date.',
  },
  {
    path: '/games/', routeId: 'az', kind: 'az', title: 'All games A-Z | Freetins', heading: 'All games A-Z',
    description: 'Every game with a published Freetins page, listed A to Z with the number of codes that currently pass a check.',
    noindex: publishedGameCatalogue.length + publishedDailyLinkCatalogue.length === 0,
  },
];

const authorRoutes: RouteDefinition[] = authors.map((author) => ({
  path: author.path,
  routeId: 'author',
  kind: 'author',
  title: `${author.name}, ${author.role} | Freetins`,
  heading: author.name,
  description: author.credential,
  eyebrow: author.role,
  name: author.name,
  slug: author.slug,
}));

const cheatRoutes: RouteDefinition[] = operations.cheatGames.map((game) => {
  const page = getCheatOperationalPage(game.slug);
  const path = `/cheats/${game.slug}/`;
  const article = getArticleByPath(path);
  return {
    path,
    routeId: 'cheat',
    kind: 'cheat',
    title: `${game.heading} | Freetins`,
    heading: game.heading,
    description: article?.description ?? (page?.isPublished
      ? `${game.name} cheats with platform scope, source URLs and recorded verification events.`
      : `${game.name} is configured for cheat verification, but no cheat sheet is published yet.`),
    name: game.name,
    slug: game.slug,
    noindex: !page?.isPublished && !article,
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

const generatedCheatPaths = new Set(cheatRoutes.map((route) => route.path));
const articleRoutes: RouteDefinition[] = editorialArticles
  .filter((article) => !generatedCheatPaths.has(article.path))
  .map((article) => ({
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

/*
 * Only sections with published content get a route. Generating a values, archive
 * or updates page for a game that has none put 147 placeholder URLs in front of
 * crawlers, every one of them linked from the game tab bar.
 */
const gameRoutes: RouteDefinition[] = gameCatalogue.flatMap((game) => {
  const root = `/codes/${game.slug}`;
  const shared = { name: game.name, slug: game.slug, platform: game.platform };

  const routes: RouteDefinition[] = [
    {
      ...shared,
      path: `${root}/`,
      routeId: 'codes',
      kind: 'codes' as const,
      title: `${game.name} codes and how to redeem | Freetins`,
      heading: game.name,
      description: game.isPublished
        ? `${game.name} codes with source URLs, redemption steps and recorded verification events.`
        : `${game.name} is configured for verification, but no code is published yet.`,
      noindex: !game.isPublished,
    },
  ];

  if (game.valueCount > 0) {
    routes.push({
      ...shared,
      path: `${root}/values/`,
      routeId: 'values',
      kind: 'values' as const,
      title: `${game.name} item values | Freetins`,
      heading: 'Item values',
      description: `${game.name} item values with a source and observation time on every row.`,
    });
  }

  if (game.updateCount > 0) {
    routes.push({
      ...shared,
      path: `${root}/updates/`,
      routeId: 'updates',
      kind: 'updates' as const,
      title: `${game.name} updates | Freetins`,
      heading: 'Updates',
      description: `Source-linked update history for ${game.name}.`,
    });
  }

  return routes;
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
  // Trailing slash like every other route, so the breadcrumb items match the URL.
  path: '/404/',
  routeId: 'notfound',
  kind: 'notTracked',
  title: 'Page not found | Freetins',
  heading: 'Nothing grows here',
  description: 'The address does not match a page tracked by Freetins.',
  /*
   * The body Cloudflare serves with a 404 is also emitted as a real document at
   * /404/, where it answers 200 like any other page. Without this it invited
   * indexing: a page whose entire content is "nothing here", eligible to rank and
   * to be counted against the site as a soft 404. The status code is what a
   * crawler acts on at the missing URL; this covers the document itself.
   *
   * No canonical either. The same body is served at every missing URL, and a
   * canonical on it nominates /404/ as the preferred version of an address that
   * does not exist; a noindex page pointing a canonical at itself is a
   * contradiction a crawler has to resolve on its own.
   */
  noindex: true,
  canonical: false,
};
