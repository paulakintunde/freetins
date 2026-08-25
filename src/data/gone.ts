/**
 * URLs from the old WordPress site that are removed on purpose.
 *
 * These 15 pages have no relationship to game help — Rainmeter desktop skins, an
 * APK sideloading guide, iOS emulators for Windows, iPhone secret codes, Craigslist
 * alternatives, an ambigram generator, a JW Player downloader, an adblock comparison
 * and "what is coding". Several carry download-safety or copyright risk. Dropping
 * them is the point of the migration, not an oversight.
 *
 * They must NOT be redirected. Sending Rainmeter-skin traffic to a game-codes hub is
 * a soft-404 pattern: it helps nobody and dilutes the site's topical focus.
 *
 * They return `410 Gone` rather than `404 Not Found` because 410 states the removal
 * is intentional and permanent. Crawlers drop a 410 far faster than a 404, which they
 * retry for months on the assumption the page may come back.
 *
 * `public/_redirects` cannot express this — Cloudflare Pages only supports 301/302/
 * 303/307/308 and 200 rewrites there — so each path is a server-rendered route that
 * sets the status explicitly. One file per path, because a shared dynamic route would
 * shadow every real single-segment page on the site.
 *
 * Every entry here has a matching `src/pages/<path>/index.astro`; `test/gone.test.ts`
 * asserts the two stay in step.
 */
export const goneRoutes: string[] = [
  '/amd-ryzen-rainmeter-skin-setup/',
  '/cowan-clock-for-rainmeter/',
  '/jarvis-iron-man-a-blue-rainmeter-skin-theme-inspiration/',
  '/jarvis-shield-interface-rainmeter-skin-installation/',
  '/kurugin-rainmeter-skin/',
  '/monstercat-visualizer-rainmeter-realtime-audio-visualizer/',
  '/visbubble-round-visualizer-for-rainmeter-skin/',
  '/blackmart-alpha-apk-latest-version-blackmarket-apk/',
  '/tech-guides/ios-emulators-windows/',
  '/tech-guides/iphone-secret-codes/',
  '/alternative-websites-like-craigslist-jobs-furniture-apartments-cars/',
  '/ambigram-generator-examples/',
  '/download-jw-player-videos-high-quality/',
  '/adblock-vs-adblock-plus-chrome-android-firefox-safari/',
  '/what-is-coding-learn-computing-programming/',
];
