import type { EditorialArticle } from './types';

/**
 * The site's method, written out in full.
 *
 * This page is cited in Organization structured data as both publishingPrinciples
 * and correctionsPolicy, and every operational page links to it, so it has to
 * actually define the terms the rest of the site uses. The previous version was
 * 114 words and never named the four evidence states it promised to explain.
 */
export const howWeVerifyArticle: EditorialArticle = {
  path: '/how-we-verify/',
  routeId: 'verify',
  section: 'resources',
  schemaType: 'Article',
  title: 'How Freetins verifies codes, links and cheats | Freetins',
  heading: 'How we verify',
  description:
    'The evidence rules behind every Freetins page: what counts as a source, the four evidence states, what makes a code usable, when a game has an active record, and what we remove.',
  eyebrow: 'Editorial policy',
  author: 'Paul A',
  authorPath: '/author/paul-a/',
  publishedAt: '2026-08-24',
  reviewedAt: '2026-08-24',
  reviewLabel: 'Reviewed 24 August 2026',
  quickAnswer:
    'A code is only labelled verified once an editor has redeemed it in the game and recorded the result with a timestamp. A code confirmed by a publisher post but not redeemed is source-reported. A code that no publisher channel covers stays community-reported no matter how many sites repeat it. Anything that fails a re-check is marked expired and kept as a record rather than quietly deleted.',
  sections: [
    {
      id: 'the-problem',
      heading: 'The problem this method exists to solve',
      paragraphs: [
        'Game codes expire without announcement. A code posted on Monday can be dead by Wednesday, and nothing tells the reader which one they are looking at. The usual response across code sites is to copy a list from another code site, add the current month to the title, and let the reader find out by typing.',
        'That practice has a specific failure mode: the codes propagate faster than the corrections. One site publishes an unconfirmed code, five aggregators repeat it within a day, and every copy cites a different one of the others. The result looks corroborated and is not. Nobody in the chain redeemed anything.',
        'Freetins exists to break that chain in one place: we say what was checked, how it was checked, and when. Where we have not checked something, the page says so rather than implying otherwise.',
      ],
    },
    {
      id: 'what-counts-as-a-source',
      heading: 'What counts as a source',
      paragraphs: [
        'A source is a channel the publisher controls. That means the studio or game account posting on its own website, YouTube channel, Discord server, Twitch stream, or X account. If the publisher announced the code, there is a post, and that post is the citation.',
        'Two things are explicitly not sources. Other code sites are not sources, however many of them agree, because agreement between aggregators is usually just one unverified post being reprinted. And a game listing is not a source either: a Roblox game page proves the game exists, not that a code was ever issued, so we link it to open the game and never cite it as evidence for a code.',
        'Where we found a code and what proves it are different questions. Both are recorded. Only the second is shown to you as evidence.',
      ],
      table: {
        caption: 'Source handling',
        columns: ['URL type', 'Recorded as', 'Shown as evidence'],
        rows: [
          ['Publisher website, YouTube, Discord, Twitch or X post', 'Publisher source', 'Yes, linked on the row'],
          ['Another code site or aggregator blog', 'Discovery trail', 'No'],
          ['Store or game listing', 'Game link', 'No'],
          ['Preview host such as a pages.dev or vercel.app build', 'Rejected at validation', 'No, blocks publication'],
        ],
      },
      note: 'The last row is enforced in code. A citation on a throwaway preview host fails the data check and the build stops.',
    },
    {
      id: 'evidence-states',
      heading: 'The four evidence states',
      paragraphs: [
        'Every code, reward link and cheat on the site carries exactly one state. The state is calculated from the verification record, never typed by hand, so a page cannot claim a freshness it has not earned.',
      ],
      table: {
        caption: 'Evidence states and what produces them',
        columns: ['State', 'What it means', 'What produced it'],
        rows: [
          ['Verified', 'An editor redeemed this in the game and it worked', 'A check with result accepted, inside the freshness window'],
          ['Source-reported', 'A publisher post confirms it, but no editor has redeemed it', 'A check with result source-only, inside the freshness window'],
          ['Stale', 'It passed once, but the check is now older than the freshness window', 'Any passing check that has aged out, or a check that could not complete'],
          ['Expired', 'It was re-checked and no longer works', 'A check with result rejected'],
        ],
      },
      note: 'A fifth condition, unverified, means no check has been recorded at all. Unverified entries never count toward a usable total.',
    },
    {
      id: 'evidence-tier',
      heading: 'Verification and sourcing are separate questions',
      paragraphs: [
        'A code has two independent properties, and collapsing them is how other sites end up overstating what they know.',
        'The state above answers "did the last check pass". The tier answers "do we know the publisher ever issued this". A code an editor redeemed successfully is verified whatever its paper trail, because redemption is direct evidence. A code repeated by fifty blogs with no publisher post is community-reported, because repetition is not evidence.',
        'Both are shown. A row that says community-reported is telling you the code may well work, and that nobody at Freetins can point to the publisher issuing it.',
      ],
    },
    {
      id: 'usable-code',
      heading: 'When is a code usable',
      paragraphs: [
        'A code is usable when its most recent check passed and that check is still inside the game freshness window. In practice that means one of two states: verified or source-reported.',
        'Stale, expired and unverified entries are all excluded. This is why a game page can list twelve codes and report zero usable ones: the codes exist as records, and none of them currently passes.',
        'We would rather show you a page that says nothing works today than a list of twelve dead strings ordered by how recently someone reposted them.',
      ],
      table: {
        caption: 'Counted toward the usable total',
        columns: ['State', 'Counted', 'Why'],
        rows: [
          ['Verified', 'Yes', 'Redeemed successfully and still fresh'],
          ['Source-reported', 'Yes', 'Publisher-confirmed and still fresh'],
          ['Stale', 'No', 'The evidence has aged out and has not been renewed'],
          ['Expired', 'No', 'Re-checking proved it no longer works'],
          ['Unverified', 'No', 'No check has ever been recorded'],
        ],
      },
    },
    {
      id: 'active-record',
      heading: 'When does a game have an active record',
      paragraphs: [
        'A game has an active record when at least one of its entries is usable by the rule above. That number, not the number of codes on file, is what the site reports as active and what decides whether a game is promoted anywhere on the site.',
        'A game with an active record of zero stays published, because the page is still the correct answer to the question "does anything work right now" — but it is not featured, not listed in the most-searched row, and its page leads with the fact that nothing currently passes.',
      ],
      bullets: [
        'Active record = at least one entry in the verified or source-reported state.',
        'The count is recalculated from the verification log on every build, never stored.',
        'A game with zero active entries is never promoted, only reachable.',
        'A game with no published entries at all does not get a route.',
      ],
    },
    {
      id: 'freshness',
      heading: 'Freshness windows',
      paragraphs: [
        'Each game carries its own window, because code lifetimes differ by title. A game that ships codes on a weekly stream cadence does not need the same window as one that drops them during a live event.',
        'When a check ages past its window, the entry becomes stale automatically. Nothing has to be edited for that to happen, which is the point: an unmaintained page degrades honestly instead of silently continuing to look fresh.',
      ],
    },
    {
      id: 'removal',
      heading: 'What we remove and what we keep',
      paragraphs: [
        'A code that fails a re-check is marked expired and kept on the game page as a retired record, collapsed below the working codes. It is kept because the alternative is worse: if dead codes simply disappear, a reader who finds one elsewhere has no way to learn that it was checked and rejected.',
        'Expired codes do not get their own page. A list of dead strings is a maintenance record, not something anyone searches for, and giving each one a URL puts thin near-duplicate pages in front of crawlers for no reader benefit.',
        'Entries are deleted outright in one case only: when there is no acceptable evidence for them at all. Three Basketball Zero codes were removed on 24 August 2026 for exactly this reason — their only citation was a throwaway preview host, which is not a publisher.',
      ],
    },
    {
      id: 'constraints',
      heading: 'The constraints, and how the method handles them',
      paragraphs: [
        'This method is more expensive than copying a list, and pretending otherwise would be dishonest. These are the real limits and what we do about each.',
      ],
      groups: [
        {
          heading: 'Redemption is one-shot',
          body: 'Most codes can only be redeemed once per account, so redeeming a code to prove it works consumes it. We accept that cost on the games we cover most closely, and fall back to publisher confirmation elsewhere rather than claiming a redemption we did not perform.',
        },
        {
          heading: 'Publishers announce in scattered places',
          body: 'Codes appear in Discord pins, stream overlays and in-game banners as often as on a website. We record the channel per game so a check knows where to look, and where a publisher has no findable channel, entries stay community-reported instead of being upgraded on a guess.',
        },
        {
          heading: 'Codes expire without notice',
          body: 'There is no announcement when a code dies. The freshness window handles this: rather than asserting a code is live, the page asserts when it was last confirmed, and downgrades itself once that claim gets old.',
        },
        {
          heading: 'Coverage is narrower than an aggregator',
          body: 'A site that copies lists can cover hundreds of games. We cover fewer, because each one carries a maintenance cost. We would rather be right about twelve games than plausible about two hundred.',
        },
      ],
    },
    {
      id: 'automation',
      heading: 'Can this be automated',
      paragraphs: [
        'Partly, and it matters which parts. Automation is useful for detection and for decay. It cannot manufacture the evidence itself.',
      ],
      table: {
        caption: 'What automation can and cannot do',
        columns: ['Step', 'Automatable', 'Notes'],
        rows: [
          ['Watch publisher channels for new posts', 'Yes', 'Polling a Discord, YouTube or X feed is straightforward and is the highest-value piece'],
          ['Age an entry out of its freshness window', 'Yes', 'Already automatic — it is arithmetic on the last check time'],
          ['Flag which entries are due a re-check', 'Yes', 'A queue ordered by window expiry'],
          ['Detect a dead redemption endpoint', 'Partly', 'Only where a game exposes a web redemption route that returns a distinguishable failure'],
          ['Redeem a code in game to prove it works', 'No', 'Requires a real account in a real client; automating it violates most terms of service'],
          ['Decide that a post is genuinely from the publisher', 'No', 'An editorial judgement, and the exact judgement the site exists to make'],
        ],
      },
      note: 'The automated checker service is configured but not enabled. Until it runs, the site does not claim an automated schedule anywhere, and every check on the site is a manual one.',
    },
    {
      id: 'corrections',
      heading: 'Corrections',
      paragraphs: [
        'If a code on this site does not work, that is a defect and we want to know. Corrections go to hello@freetins.com with the page URL and, if you have it, what happened when you tried to redeem it.',
        'Section owners are accountable for their own surfaces: Guides, Answers and Cheats each have a named editor, and anything else routes to the site editor. A correction that changes a published state is recorded as a verification event like any other check, so the page history stays consistent with the page.',
      ],
      links: [
        { label: 'Editorial team', href: '/author/paul-a/', description: 'Who owns which section, and what each is accountable for.' },
        { label: 'Resources directory', href: '/resources/', description: 'Every published section on the site.' },
      ],
    },
  ],
  faq: [
    {
      question: 'What does verified mean on a Freetins page?',
      answer:
        'An editor entered the code in the game and it was accepted, and that check is still inside the game freshness window. It is the only label on the site that implies someone actually redeemed the code.',
    },
    {
      question: 'Why do you show codes you have not verified?',
      answer:
        'Because withholding them helps nobody, and mislabelling them helps nobody either. A code we cannot tie to a publisher post is shown as community-reported, which tells you it may work and that we cannot prove it was issued.',
    },
    {
      question: 'Why does this game say zero active codes when it lists codes?',
      answer:
        'The listed codes have all either expired or aged out of their freshness window. The active count only includes codes whose most recent check passed and is still current, so it can legitimately be zero on a page that shows a dozen records.',
    },
    {
      question: 'Why do you not cite other code sites?',
      answer:
        'Aggregators mostly cite each other, so agreement between them is not corroboration. A citation only counts here if it points at a channel the publisher controls.',
    },
    {
      question: 'Is any of this checked automatically?',
      answer:
        'Freshness decay is automatic. Everything else is currently manual: the automated checker is configured but not enabled, and the site does not claim an automated schedule until it runs.',
    },
  ],
  sources: [
    {
      label: 'Freetins operational record',
      href: '/resources/',
      description: 'Every count on the site is derived from the operational data file rather than entered as copy.',
    },
  ],
  related: [
    { label: 'Resources directory', href: '/resources/', description: 'Every published section on the site.' },
    { label: 'All games A-Z', href: '/games/', description: 'Every game with a published Freetins page.' },
  ],
};
