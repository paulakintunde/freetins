import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

const excludedFromSitemap = ['/internal/', '/advertise', '/alerts/manage', '/alerts/confirm', '/search', '/feeds/'];

export default defineConfig({
  site: 'https://www.freetins.com',
  output: 'static',
  trailingSlash: 'never',
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
