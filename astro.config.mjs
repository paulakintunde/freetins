import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

const excludedFromSitemap = ['/internal/', '/search/'];

export default defineConfig({
  site: 'https://freetins.com',
  output: 'static',
  trailingSlash: 'always',
  adapter: cloudflare({ imageService: 'compile' }),
  build: {
    format: 'file',
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
      filter: (page) => !excludedFromSitemap.some((path) => page.includes(path)),
    }),
  ],
  compressHTML: true,
});
