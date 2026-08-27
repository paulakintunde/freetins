import { publishedDailyLinkCatalogue, publishedGameCatalogue } from './home';

/**
 * The published contact address. Previously the site used support@ on the legal and
 * contact pages and hello@ in the Organization JSON-LD and the submit page, so the
 * address a reader was told to use depended on which page they landed on.
 */
export const contactEmail = 'support@freetins.com';

/**
 * The canonical origin. The indexed site, every backlink and the Search Console
 * property are all on `www`, so the cutover keeps `www` and lets the platform swap
 * be the only variable that changes. Apex 301s to www at the edge, as it does today.
 *
 * Everything that needs an absolute URL derives it from here or from `Astro.site`
 * (which `astro.config.mjs` sets to the same value). Previously the JSON-LD carried
 * 12 hardcoded literals that `site:` did not control, so a host change could leave
 * the graph identifying a different site than the canonical tag.
 */
export const siteOrigin = 'https://www.freetins.com';

/**
 * Google Search Console site verification token, without the `google-site-verification=`
 * prefix — just the token itself.
 *
 * Set `PUBLIC_GOOGLE_SITE_VERIFICATION` in the Cloudflare Pages build environment and
 * the tag renders on every page. Leave it unset and no tag renders at all, which is
 * the correct failure mode: an empty or invented token is worse than a missing one,
 * because Search Console reports it as a *failed* verification against the property
 * rather than an unattempted one.
 *
 * The HTML tag is used rather than the DNS TXT record because the property that matters
 * is the `https://www.freetins.com/` URL-prefix property, and because a build-time value
 * moves with the repo — a DNS record set during cutover is invisible to anyone reading
 * this codebase later. Both can coexist; verifying twice is harmless.
 */
export const googleSiteVerification: string =
  import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION ?? '';

/**
 * Cloudflare Web Analytics is enabled on the zone, so Cloudflare injects `beacon.min.js`
 * into every HTML response at the edge. It is not in this repository and cannot be
 * conditionally loaded from here, which has two consequences the rest of the site has to
 * respect rather than contradict:
 *
 *  1. `public/_headers` must allow `static.cloudflareinsights.com` in `script-src` and
 *     `cloudflareinsights.com` in `connect-src`, or the beacon is blocked and no
 *     measurement happens at all. That was the state until this constant was added.
 *  2. It is a real audience-measurement vendor, so the consent panel and the privacy
 *     page must name it. They previously said no analytics vendor was configured.
 *
 * It is listed as necessary rather than optional because the site genuinely cannot gate
 * it — the injection happens after this build's HTML is written. Offering a toggle that
 * does nothing would be a worse disclosure than naming it plainly. The measurement is
 * cookieless: no cookie, no `localStorage`, no cross-site identifier, and no per-visitor
 * profile, which is why it sits outside the consent gate rather than inside a broken one.
 *
 * Set this to `false` if Web Analytics is ever turned off on the zone, and drop the two
 * origins from the CSP at the same time.
 */
export const edgeAnalytics = {
  enabled: true,
  vendor: 'Cloudflare Web Analytics',
  purpose: 'Audience measurement (cookieless)',
} as const;

/** Stable JSON-LD node identifiers, referenced by `@id` across every page graph. */
/**
 * The picture a page falls back to when it has no artwork of its own.
 *
 * It is named here rather than defaulted inside the layout because the card and
 * the graph have to show the same picture. The layout defaulted `og:image` to it
 * while the article templates omitted `image` from the graph entirely, so a page
 * with no artwork advertised a picture to a social crawler and none to a search
 * one — two accounts of the same page, from the same build.
 */
export const defaultSocialImage = '/og/freetins-home-game-codes.jpg';
export const defaultSocialImageAlt = 'Freetins game codes and daily reward links';

export const organizationId = `${siteOrigin}/#org`;
export const websiteId = `${siteOrigin}/#site`;

export interface SiteLink {
  label: string;
  href: string;
  count?: string;
  section?: string;
}

export const navLinks: SiteLink[] = [
  { label: 'Today', href: '/', section: 'today' },
  { label: 'Codes', href: '/codes/', section: 'codes' },
  { label: 'Cheats', href: '/cheats/', section: 'cheats' },
  { label: 'Answers', href: '/answers/', section: 'answers' },
  { label: 'Guides', href: '/guides/', section: 'guides' },
  { label: 'Resources', href: '/resources/', section: 'resources' },
];

export const drawerLinks: SiteLink[] = [
  { label: 'Today', href: '/' },
  { label: 'Codes', href: '/codes/' },
  { label: 'Daily links', href: '/daily/' },
  { label: 'Cheats', href: '/cheats/' },
  { label: 'Answers', href: '/answers/' },
  { label: 'Guides', href: '/guides/' },
  { label: 'All games A–Z', href: '/games/' },
  { label: 'Resources', href: '/resources/' },
  { label: 'Alerts', href: '/alerts/' },
];

const preferredSearches = ['Grow a Garden', 'Monopoly GO', 'Blue Lock Rivals', 'Coin Master', "Sol's RNG"];
const searchablePageNames = [...publishedGameCatalogue, ...publishedDailyLinkCatalogue]
  .filter((game) => game.liveCount > 0)
  .map((game) => game.name);

/**
 * Only advertise a term that resolves to a published page with something on it. A
 * listed code is real content whether or not an editor has tested it yet, so
 * promotion follows the live count, not the star count. A curated name whose page
 * is not live sends readers to an empty search; a game whose codes have all expired
 * sends them somewhere worse, because the page loads and has nothing on it.
 */
export const hotSearches = [
  ...preferredSearches.filter((term) => searchablePageNames.includes(term)),
  ...searchablePageNames.filter((name) => !preferredSearches.includes(name)),
].slice(0, 5);

export type FooterItem =
  | { label: string; href: string }
  | { label: string; action: 'consent' };

export interface FooterColumn {
  title: string;
  items: FooterItem[];
}

export const footerColumns: FooterColumn[] = [
  {
    title: 'Codes',
    items: [
      { label: 'All games A–Z', href: '/games/' },
      { label: 'Codes', href: '/codes/' },
      { label: 'Cheats', href: '/cheats/' },
      { label: 'Submit a code', href: '/submit/' },
    ],
  },
  {
    title: 'Daily links',
    items: [
      { label: 'All daily links', href: '/daily/' },
      { label: 'Monopoly GO', href: '/daily/monopoly-go/' },
      { label: 'Coin Master', href: '/daily/coin-master/' },
      { label: 'Dice Dreams', href: '/daily/dice-dreams/' },
    ],
  },
  {
    title: 'Freetins',
    items: [
      { label: 'How we verify', href: '/how-we-verify/' },
      { label: 'Contact', href: '/contact/' },
      { label: 'Report a correction', href: '/contact/?topic=Correction' },
      { label: 'Advertise with us', href: '/contact/?topic=Promotion' },
      { label: 'Blog', href: '/blog/' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacy', href: '/privacy/' },
      { label: 'Terms and conditions', href: '/terms-and-conditions/' },
      { label: 'Disclosure', href: '/disclosure/' },
      { label: 'DMCA', href: '/dmca/' },
      { label: 'Cookie choices', action: 'consent' },
    ],
  },
];

export const consentPurposes = [
  {
    id: 'necessary',
    name: 'Strictly necessary',
    description: 'Consent choice, desktop or mobile view, CDN routing.',
    required: true,
  },
  ...(operations.services.advertising.enabled ? [{
    id: 'advertising',
    name: 'Advertising',
    description: `Allows ${operations.services.advertising.provider} to serve configured placements after consent.`,
    required: false,
  }] : []),
] as const;

export const consentVendors = [
  { name: 'Cloudflare', purpose: 'Delivery' },
  ...(edgeAnalytics.enabled
    ? [{ name: edgeAnalytics.vendor, purpose: edgeAnalytics.purpose }]
    : []),
  ...(operations.services.advertising.enabled && operations.services.advertising.provider
    ? [{ name: operations.services.advertising.provider, purpose: 'Advertising' }]
    : []),
] as const;
import { operations } from './operations';
