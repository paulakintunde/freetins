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
/**
 * WordPress archive prefixes that are gone as a shape, not as a list of URLs.
 *
 * The old site emitted `/category/<slug>/`, `/tag/<slug>/`, `/feed/` and paginated
 * `/page/<n>/` indexes. These are crawl artefacts: a listing generated from content
 * that has already moved, never a page anybody wrote. Google still has them indexed
 * and they 404 today.
 *
 * They are not enumerable — there is no fixed list of tag slugs or page numbers to
 * put in `goneRoutes` — so each prefix gets one catch-all route instead. A bare
 * catch-all would shadow every real single-segment page on the site, which is why
 * `goneRoutes` uses one file per path; these are safe because they are *prefixed*
 * and no real section lives at `/category/`, `/tag/`, `/feed/` or `/page/`.
 *
 * 410 rather than a redirect to a hub, for the same reason as `goneRoutes`: an
 * archive of posts that moved has no single successor, and dumping the whole
 * archive surface onto `/codes/` is the soft-404 pattern `public/_redirects`
 * already refuses for the removed topics. Nine rules in that file currently point
 * at generic hubs and are marked there as temporary; these prefixes are not
 * joining them.
 *
 * Anything under these prefixes that DOES have a successor belongs in
 * `public/_redirects` as an explicit 301. First match wins there, so a named rule
 * outranks this catch-all — which is the intended escape hatch.
 */
export const goneRoutePrefixes: string[] = [
  '/category/',
  '/tag/',
  '/feed/',
  '/page/',
];

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
