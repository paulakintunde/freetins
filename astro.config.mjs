import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { datasetBackedPaths } from './src/data/datasetRoutes.ts';
import { goneRoutePrefixes, goneRoutes } from './src/data/gone.ts';
import { routeDefinitions } from './src/data/routes.ts';

/*
 * A dataset page takes its path over from the route table via `getStaticPaths`, so
 * where the two disagree the dataset page is the one that renders and the route
 * entry describes a page nobody serves. Its `noindex` must not keep the live page
 * out of the sitemap.
 */
const datasetOwned = new Set(datasetBackedPaths());

/**
 * The sitemap integration enumerates every route the build emits, including the
 * server-rendered ones. `goneRoutes` has to be listed explicitly: those paths return
 * 410 and carry no `RouteDefinition`, so the `noindex` filter below cannot see them.
 * Without this, the sitemap would advertise 15 URLs that answer 410 — 15 Search
 * Console errors on day one, on a brand-new property.
 */
const excludedFromSitemap = new Set([
  '/internal/',
  ...goneRoutes,
  ...routeDefinitions
    .filter((route) => route.noindex && !datasetOwned.has(route.path))
    .map((route) => route.path),
]);

export default defineConfig({
  site: 'https://www.freetins.com',
  output: 'static',
  trailingSlash: 'always',
  adapter: cloudflare({ imageService: 'compile' }),
  build: {
    format: 'directory',
  },
  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: true,
  },
  session: {
    driver: 'null',
  },
  integrations: [
    sitemap({
      /*
       * The prefix check is belt-and-braces. A catch-all route has no concrete URL
       * for the integration to enumerate, so `/category/*` and friends should never
       * reach the sitemap anyway — but a sitemap that advertises a 410 is expensive
       * to notice and cheap to prevent.
       */
      filter: (page) => {
        const { pathname } = new URL(page);
        if (excludedFromSitemap.has(pathname)) return false;
        return !goneRoutePrefixes.some((prefix) => pathname.startsWith(prefix));
      },
    }),
  ],
  compressHTML: true,
});
