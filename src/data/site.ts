export interface SiteLink {
  label: string;
  href: string;
  count?: string;
  section?: string;
}

export const navLinks: SiteLink[] = [
  { label: 'Today', href: '/', section: 'today' },
  { label: 'Codes', href: '/codes/', section: 'codes' },
  { label: 'Daily links', href: '/daily/', section: 'daily' },
  { label: 'Cheats', href: '/cheats/', section: 'cheats' },
  { label: 'Answers', href: '/answers/', section: 'answers' },
  { label: 'Guides', href: '/guides/', section: 'guides' },
  { label: 'Resources', href: '/resources/', section: 'resources' },
  { label: 'How we verify', href: '/how-we-verify/', section: 'verify' },
  { label: 'Alerts', href: '/alerts/', section: 'alerts' },
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

export const hotSearches = ['Grow a Garden', 'Monopoly GO', 'Blue Lock Rivals', 'Coin Master', "Sol's RNG"];

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
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Aggregate page counts. No cookie, no cross-site profile.',
    required: false,
  },
  {
    id: 'advertising',
    name: 'Advertising',
    description: 'Lets buyers measure whether an ad was seen.',
    required: false,
  },
  {
    id: 'personalisation',
    name: 'Personalisation',
    description: 'Targets ads using what you read here.',
    required: false,
  },
] as const;

export const consentVendors = [
  { name: 'Google Ad Manager', purpose: 'Advertising' },
  { name: 'Cloudflare', purpose: 'Delivery' },
  { name: 'Plausible', purpose: 'Analytics' },
  { name: 'Discord', purpose: 'Alerts' },
  { name: 'Amazon Associates', purpose: 'Affiliate' },
] as const;
