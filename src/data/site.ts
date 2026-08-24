import { publishedDailyLinkCatalogue, publishedGameCatalogue } from './home';

/**
 * The published contact address. Previously the site used support@ on the legal and
 * contact pages and hello@ in the Organization JSON-LD and the submit page, so the
 * address a reader was told to use depended on which page they landed on.
 */
export const contactEmail = 'support@freetins.com';

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
  .filter((game) => game.activeCount > 0)
  .map((game) => game.name);

/**
 * Only advertise a term that resolves to a published page with something usable on
 * it. A curated name whose page is not live sends readers to an empty search; a game
 * whose codes have all expired sends them somewhere worse, because the page loads and
 * has nothing on it.
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
  ...(operations.services.advertising.enabled && operations.services.advertising.provider
    ? [{ name: operations.services.advertising.provider, purpose: 'Advertising' }]
    : []),
] as const;
import { operations } from './operations';
