import type { EditorialArticle } from './types';

/**
 * The site's method, written out in full.
 *
 * This page is cited in Organization structured data as both publishingPrinciples
 * and correctionsPolicy, and every operational page links to it, so it has to
 * actually define the terms the rest of the site uses: the states a row can be
 * in, the as-published baseline, what a heart does and how a correction is
 * recorded (docs/adr/0003, docs/adr/0004). Nothing here describes a timer:
 * no editor state changes on its own, and the one clock input is a link's own
 * published expiry.
 */
export const howWeVerifyArticle: EditorialArticle = {
  path: '/how-we-verify/',
  routeId: 'verify',
  section: 'resources',
  schemaType: 'Article',
  title: 'How Freetins verifies codes, links and cheats | Freetins',
  heading: 'How we verify',
  description:
    'The evidence rules behind every Freetins page: what counts as a source, the three states and the as-published baseline, and what a heart does.',
  eyebrow: 'Editorial policy',
  author: 'Paul A',
  authorPath: '/author/paul-a/',
  publishedAt: '2026-08-24',
  reviewedAt: '2026-08-24',
  reviewLabel: 'Reviewed 24 August 2026',
  quickAnswer:
    'A row is marked Verified only when a named editor has tested it and recorded the result with a date. Until then it is listed in full as awaiting editor verification, which is a state and not a rejection. Rows that were live when this record began keep their status as published. No editor state changes on its own: a row leaves the live list only when an editor retires it or a reward link passes the expiry its publisher stated, and nothing an editor retires is deleted.',
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
      note: 'The last row is enforced in code. A citation on a throwaway preview host fails the data check and the build stops. That is a rule about sources, not about verification: no page is ever held back for want of a check.',
    },
    {
      id: 'awaiting-verification',
      heading: 'Awaiting verification is a state, not a rejection',
      paragraphs: [
        'Every code, reward link, cheat and dataset row on the site is in one of the states below from the moment it is recorded. A new row lands as Listed · awaiting editor verification. It is rendered in full with its source, and on code pages with its Copy control and reader controls, and it is indexed like any other content. Nothing waits on an editor.',
        'That is deliberate. It takes real work to get a page, and a system that hides or bounces that work until someone has had time to check it destroys value it did not create. Verification is the job of an editor and never a gate: no page is held out of the index, marked noindex or dropped from the sitemap for want of a check.',
        'Existing content is protected the same way. Every row and every article that was on the site when this record began keeps the status it displayed on that day as its baseline. A row that displayed Active stays Active · as published, a row that was Expired stays Expired, and a row nobody had confirmed became Listed · awaiting editor verification with no change in visibility. Nothing was demoted, and from here only an editor can change any of it.',
      ],
    },
    {
      id: 'evidence-states',
      heading: 'The three states and the as-published baseline',
      paragraphs: [
        'A row shows exactly one state. Three of them can be produced from today on: Verified, Listed and Expired. The fourth, Active · as published, is a baseline carried over from before this record existed and is never assigned to new content. None of them is typed by a writer, and no editor state changes on its own: a row leaves the live list only when an editor retires it or a reward link passes the expiry its publisher stated.',
      ],
      table: {
        caption: 'States and what produces them',
        columns: ['State', 'What it means', 'What produced it'],
        rows: [
          ['★ Verified', 'A named editor tested this row and it passed', 'An editor verification event with a method and a date, and it is the newest event on the row'],
          ['Active · as published', 'The row was live when this record began and no editor has acted on it since', 'The as-published baseline; nothing new ever lands here'],
          ['Listed · awaiting editor verification', 'The row is on record and no editor has tested it yet', 'Being recorded; every new row starts here and stays here until an editor acts'],
          ['Expired', 'The row no longer works, or has passed the expiry its publisher stated', "An editor retirement, a link's own expiry date, or the baseline for rows that were already expired"],
        ],
      },
      note: 'A page is in the index when it has at least one live row, and every dataset and editorial page is indexed. Whether an editor has verified any of them never decides that. The archive keeps every Expired row.',
    },
    {
      id: 'evidence-tier',
      heading: 'Verification and sourcing are separate questions',
      paragraphs: [
        'A code has two independent properties, and collapsing them is how other sites end up overstating what they know.',
        'The state answers "has an editor tested this". The evidence line answers "do we know the publisher ever issued this". A code an editor redeemed successfully is Verified whatever its paper trail, because redemption is direct evidence. A code repeated by fifty blogs with no publisher post stays community-reported, because repetition is not evidence.',
        'Both are shown. A row that says community-reported is telling you the code may well work, and that nobody at Freetins can point to the publisher issuing it.',
      ],
    },
    {
      id: 'legend',
      heading: 'How to read a row',
      bullets: [
        'Status: one of the four labels above. On a dataset page it is the Status column; on a code or link page it is the label beside each entry.',
        'Last checked: the date of the newest recorded event on that row. On pages that predate this record it is the as-published baseline date the writer supplied, and it becomes an editor check only when an editor event replaces it. A row with no recorded date reads not yet, and that is the honest answer rather than a gap.',
        'Evidence: whether a publisher channel or community reporting backs the row, with the source linked where one exists. It sits beside the state and never replaces it.',
        'Expired archive: every retired or expired row stays on the page, collapsed below the live ones, so a code you find elsewhere can be identified as already dead.',
        'Counts: every number on a page, from the verified total to the size of the archive, is counted from the rows on that page at build. None is typed.',
      ],
    },
    {
      id: 'public-history',
      heading: 'The public history',
      paragraphs: [
        'Every state on the site comes from a dated event: who did what, by which method, and when. A verification, a review and a retirement are each an event with a named editor, a method and a server timestamp. A row being recorded is an event too, attributed to whoever recorded it, and it never claims more than that.',
        'The page shows the history rather than summarising it. A dataset page carries a change log built from its events, and the date beside a row belongs to the event that produced it: an editor check where one is recorded, otherwise the as-published baseline date the writer supplied, or not yet where there is neither. Pages that predate this record keep their published date line as their baseline until a real editor event replaces it.',
        'No date on the site is relative. "Checked three hours ago" rendered at build time becomes a lie the moment the page is cached, so every date is an absolute date, and the absence of one is stated rather than filled in.',
      ],
    },
    {
      id: 'apex-rule',
      heading: "An editor's word supersedes everything within its dimension",
      paragraphs: [
        'Within the question it answers, a recorded act by a named editor outranks every other signal. On whether a code works, a star or a retirement beats a sighting, a heart count, a repeated list, a typed field and anything a script produced. The most recent editor event on a row decides its state, and nothing that is not an editor event can overrule it.',
        'The rule stops at the edge of its dimension. A verification says nothing about whether a source is a publisher, and a source line says nothing about whether the code was tested. An editor who verifies a community-reported code produces a Verified row that is still community-reported, and both facts are shown.',
        "The corollary is that no editor act is ever manufactured. A script cannot invent a reviewer or copy a writer's date into a check, and no field a person types may assert that a check happened. If the site says an editor did something, an editor did it.",
      ],
    },
    {
      id: 'hearts',
      heading: 'What a heart means, and what it does not',
      paragraphs: [
        'Rows carry a reader control so you can say whether a code worked for you. This page calls it a heart; on code pages today it is drawn as a thumbs up and a thumbs down, and the rule is the same either way. Hearts are reader reports. They are counted, they are shown, and they never change a state.',
        'That separation is deliberate. If enough hearts could turn a code green, the site would be publishing unverified consensus as fact, which is the practice this whole method exists to avoid. Hearts never mint a star, and they never touch whether a page is indexed. What they do is order the editor queue: a code collecting failure reports is moved to the front of the list for an editor to check properly, and it is the editor check that changes the label.',
        'Reports are de-duplicated per network address, which stops the same person clicking repeatedly. It is not fraud resistance and we do not present it as such: carrier networks put thousands of genuine readers behind a single address, so real reports get absorbed, and anyone switching networks can report more than once. Treat the numbers as a rough signal of how a code is behaving in the wild, not as a count of distinct people.',
        'No IP address is stored. The de-duplication key is a one-way hash of the address combined with a server-side secret and a daily-rotating value, and it expires by itself. There is no way to recover an address from what is kept, and no way to follow one reader between codes beyond the rotation window.',
      ],
      table: {
        caption: 'What each signal is allowed to do',
        columns: ['Signal', 'Set by', 'Can change a state'],
        rows: [
          ['Editor event: a verification, a review or a retirement', 'A named editor', 'Yes, and only this'],
          ['Evidence line', 'Presence of a publisher-channel citation', 'No, it is shown beside the state'],
          ['Hearts', 'Anyone using the site', 'No, they only reorder the editor queue'],
          ["A link's published expiry", 'The publisher', 'Yes, to Expired, and to nothing else'],
          ['Time passing', 'Nothing', 'No'],
        ],
      },
    },
    {
      id: 'removal',
      heading: 'What we remove and what we keep',
      paragraphs: [
        'A code an editor retires is marked Expired and kept on the page as a retired record, collapsed below the live codes. A reward link whose publisher stated an expiry expires on that date and is kept the same way. It is kept because the alternative is worse: if dead codes simply disappear, a reader who finds one elsewhere has no way to learn that it was checked and rejected.',
        'Expired codes do not get their own page. A list of dead strings is a maintenance record, not something anyone searches for, and giving each one a URL puts thin near-duplicate pages in front of crawlers for no reader benefit.',
        'Entries are deleted outright in one case only: when there is no acceptable evidence for them at all. Three Basketball Zero codes were removed on 24 August 2026 for exactly this reason: their only citation was a throwaway preview host, which is not a publisher.',
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
          body: 'There is no announcement when a code dies. The page does not pretend otherwise: the date beside a row belongs to the event that produced it, an editor check or the as-published baseline, a row with no recorded date says not yet, and a link carries the expiry its publisher stated. A row that stops working is retired by an editor and kept on the page as Expired, and readers can say a row failed for them so the editor gets to it sooner.',
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
        'Partly, and it matters which parts. Automation is useful for finding rows and for keeping the record. It cannot manufacture the evidence itself, and it never changes a state.',
      ],
      table: {
        caption: 'What automation can and cannot do',
        columns: ['Step', 'Automatable', 'Notes'],
        rows: [
          ['Watch publisher channels for new posts', 'Yes', 'Polling a Discord, YouTube or X feed is straightforward and is the highest-value piece'],
          ['Record where a row was seen', 'Yes', 'A sighting with a source URL and a server timestamp; it never marks anything verified'],
          ['Order the editor queue', 'Yes', 'By demand and by reader reports, never by a clock'],
          ['Detect a dead redemption endpoint', 'Partly', 'Only where a game exposes a web redemption route that returns a distinguishable failure'],
          ['Redeem a code in game to prove it works', 'No', 'Requires a real account in a real client; automating it violates most terms of service'],
          ['Decide that a post is genuinely from the publisher', 'No', 'An editorial judgement, and the exact judgement the site exists to make'],
        ],
      },
      note: 'The automated checker service is configured but not enabled. Until it runs, no automated check exists and the site claims no schedule anywhere. No editor check has been recorded yet either: the date on a row is its as-published baseline until an editor event replaces it.',
    },
    {
      id: 'corrections',
      heading: 'Corrections',
      paragraphs: [
        'If a code on this site does not work, that is a defect and we want to know. Corrections go to support@freetins.com with the page URL and, if you have it, what happened when you tried to redeem it.',
        "Section owners are accountable for their own surfaces: Guides, Answers and Cheats each have a named editor, and anything else routes to the site editor. A correction that changes a state is recorded as a dated event in the page's history, so the history and the page always agree.",
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
        'A named editor tested the code and recorded the result with a date. It is the only label on the site that says someone at Freetins actually redeemed the code, and it stays until an editor retires the row.',
    },
    {
      question: 'Why do you show codes you have not verified?',
      answer:
        'Because withholding them helps nobody, and mislabelling them helps nobody either. A code no editor has tested is listed in full as awaiting editor verification, and its evidence line says whether a publisher post or community reporting backs it. That tells you it may work, and exactly how much we can prove.',
    },
    {
      question: 'Why does this game say no verified codes when it lists codes?',
      answer:
        'Because no editor has tested one yet. The rows are still on the page in full, marked as awaiting editor verification, and you can try them. Verified counts only rows an editor has tested, so it can be zero on a page that lists a dozen.',
    },
    {
      question: 'Why do you not cite other code sites?',
      answer:
        'Aggregators mostly cite each other, so agreement between them is not corroboration. A citation only counts here if it points at a channel the publisher controls.',
    },
    {
      question: 'Do hearts change whether a code is verified?',
      answer:
        'No. Hearts are reader reports: they are counted and shown, but only an editor event can change a state, and hearts never touch whether a page is indexed. A code collecting failure reports is moved up the editor queue so an editor looks at it sooner.',
    },
    {
      question: 'Is any of this checked automatically?',
      answer:
        'No. Nothing on the site is checked on a schedule, and no editor state changes on its own: a row leaves the live list only when an editor retires it or a reward link passes the expiry its publisher stated. Every star, retirement and review is an editor event with a name and a date; rows nobody has tested say so.',
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
