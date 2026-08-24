import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { routeDefinitions } from './src/data/routes.ts';

const excludedFromSitemap = new Set([
  '/internal/',
  ...routeDefinitions.filter((route) => route.noindex).map((route) => route.path),
]);

export default defineConfig({
  site: 'https://freetins.com',
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
      filter: (page) => !excludedFromSitemap.has(new URL(page).pathname),
    }),
  ],
  compressHTML: true,
});
