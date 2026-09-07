/**
 * URLs from the old WordPress site that are removed on purpose.
 *
 * The original removal group included Rainmeter desktop skins, an
 * APK sideloading guide, iOS emulators for Windows, iPhone secret codes, Craigslist
 * alternatives, an ambigram generator, a JW Player downloader, an adblock comparison
 * and "what is coding". Several carry download-safety or copyright risk. Dropping
 * them was the original migration decision. The owner has since commissioned
 * restoration as blog articles. All fifteen articles are restored. The sole entry
 * below is a named WordPress archive leaf, not an authored article.
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
  /*
   * The one archive listing that earns a route. The reasoning at
   * retiredArchivePrefixes rules out a catch-all under /category/, because a
   * catch-all matches an unbounded set and every match is a metered invocation.
   * This is one named leaf: /category/anything-else/ still falls through to the
   * static 404. It is here because Google is holding it and answering 404 keeps it
   * for months, which is the cost the prefix reasoning was weighing against and
   * assumed nobody was paying.
   */
  '/category/how-to/',
];
