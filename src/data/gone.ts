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
/*
 * WordPress archive prefixes — `/category/`, `/tag/`, `/feed/` and paginated
 * `/page/<n>/` — used to have one 410 catch-all route each. They no longer do, and
 * that is deliberate. They now fall through to the static `404.html`.
 *
 * 410 is still the better answer in the abstract: it says the removal is intentional,
 * and crawlers drop it faster than a 404 they retry for months. It was not worth its
 * price here. `_redirects` cannot express 410, so each catch-all had to be a route
 * with `prerender = false` — a metered Cloudflare Function invocation on every hit.
 * Unlike `goneRoutes` below, a prefix matches an unbounded set: `/page/1/` through
 * `/page/9999/` are all valid requests, and one crawler walking them spends 9,999
 * invocations against the 50,000/day reading in upgrade trigger 4
 * (docs/adr/0005-the-free-plan-is-the-design-target.md). That was the only uncapped
 * metered surface on the site, and it existed to answer for a site that no longer
 * exists.
 *
 * What is given up: an archive listing takes 404 timing to leave the index rather
 * than 410 timing — slower by weeks, on a listing nobody wrote and nobody links to.
 * The 410 argument holds for the fifteen named topics below because those are real
 * articles that may carry inbound links. It does not carry a paginated tag index.
 *
 * The escape hatch is unchanged: anything under one of these prefixes that DOES turn
 * out to have a successor belongs in `public/_redirects` as an explicit 301, which
 * still wins because first match wins there.
 *
 * `test/gone.test.mjs` asserts no catch-all comes back under these prefixes without
 * this reasoning being revisited.
 */
export const retiredArchivePrefixes: string[] = [
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
  /*
   * The same article under the slug WordPress served it at before the title
   * changed. Google still lists this one and it answers 404, so it was retiring at
   * 404 timing while its twin two lines up retired at 410 timing.
   */
  '/coding-learn-computing-programming/',
];
