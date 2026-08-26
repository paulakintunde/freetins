import type { EditorialArticle } from './types';

export const resourcesArticle: EditorialArticle = {
  path: '/resources/',
  routeId: 'resources',
  section: 'resources',
  title: 'Game Codes, Cheats and Answer Resources | Freetins',
  heading: 'Freetins resources',
  description: 'The Freetins directory: published codes, daily links, cheats, answer sheets, guides and the editorial policies behind them.',
  eyebrow: 'Site directory',
  author: 'Paul A',
  authorPath: '/author/paul-a/',
  publishedAt: '2026-08-23',
  reviewedAt: '2026-08-23',
  reviewLabel: 'Reviewed 23 August 2026',
  quickAnswer: 'Choose the result you need: Codes for redeemable strings, Daily for reward links, Cheats for built-in commands, Answers for level solutions, and Guides for explanations.',
  sections: [
    {
      id: 'start-here',
      heading: 'Published Resources',
      links: [
        { label: 'Game codes', href: '/codes/', description: 'Source-backed code records, each listed with its state and the date it was recorded.' },
        { label: 'Daily reward links', href: '/daily/', description: 'Source-backed reward links, each with the date it was recorded.' },
        { label: 'Game cheats', href: '/cheats/', description: 'Built-in cheat codes, button sequences and console commands.' },
        { label: 'Answer sheets', href: '/answers/', description: 'Mission, puzzle and level answers organized for fast scanning.' },
        { label: 'Game guides', href: '/guides/', description: 'Explanations, setup help and walkthroughs that need more context.' },
        { label: 'All games A-Z', href: '/games/', description: 'Every game with a published Freetins route.' },
        { label: 'How we verify', href: '/how-we-verify/', description: 'What counts as a source, the three states and the as-published baseline, and what a heart does.' },
        { label: 'Editorial team', href: '/author/paul-a/', description: 'Who owns each section and what they are accountable for.' },
      ],
    },
    {
      id: 'featured-answers',
      heading: 'Featured answers and guides',
      links: [
        { label: 'Clear Vision 3 walkthrough', href: '/answers/clear-vision-3/', description: 'Mission targets, difficult shots and the recommended upgrade order.' },
        { label: 'GTA 5 radio stations', href: '/guides/gta-5-radio-stations/', description: 'Every station, radio controls and Self Radio setup on PC.' },
        { label: 'LEGO Jurassic World cheats', href: '/cheats/lego-jurassic-world/', description: 'Built-in extras with platform instructions and source notes.' },
      ],
    },
    {
      id: 'gear',
      heading: 'Gaming gear research',
      paragraphs: [
        'The gear structure remains available, but a product is not presented as a recommendation until a checked merchant URL, price timestamp and disclosure record are published.',
      ],
      links: [
      ],
    },
    {
      id: 'editorial',
      heading: 'Editorial and site policies',
      links: [
        { label: 'How we verify', href: '/how-we-verify/', description: 'What counts as a source, the three states and the as-published baseline, and what a heart does.' },
        { label: 'About Freetins', href: '/about/', description: 'What the site covers and why the relaunch is narrower.' },
        { label: 'Disclosure', href: '/disclosure/', description: 'How affiliate links work and what payment cannot influence.' },
        { label: 'Contact', href: '/contact/', description: 'Report an error or reach the editorial desk.' },
      ],
    },
    {
      id: 'using-resources',
      heading: 'How this directory stays useful',
      bullets: [
        'Every link points directly to a page that ships in the current route tree.',
        'A topic appears once under the search intent it answers best.',
        'Removed or unverified legacy pages are not kept as empty directory entries.',
        'Dates change only when a page has been reviewed or its content has changed.',
      ],
    },
  ],
  sources: [],
  related: [
    { label: 'Browse all games', href: '/games/', description: 'A-Z access to every tracked game.' },
    { label: 'Read how we verify', href: '/how-we-verify/', description: 'The rules behind published answers and codes.' },
    { label: 'Contact Freetins', href: '/contact/', description: 'Send a correction or editorial question.' },
  ],
};
