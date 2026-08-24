/**
 * Orientation copy for the section hubs.
 *
 * The hubs were 107–204 word link lists targeting the site's most competitive head
 * terms, with no explanation of what belongs in the section or how anything gets on
 * the list. Each entry below answers three questions a reader arriving cold actually
 * has: what is this section, how does something get in, and how should I read a row.
 *
 * Keyed by `routeId` so a hub without an entry simply renders nothing.
 */
export interface HubIntro {
  /** Sits directly under the page heading. */
  summary: string;
  paragraphs: string[];
  criteria: { heading: string; body: string }[];
}

export const hubIntros: Record<string, HubIntro> = {
  browse: {
    summary:
      'Redeemable code strings for live games, each carrying the state of its most recent check rather than the date it was last copied.',
    paragraphs: [
      'This section covers codes you type into a game to claim a reward: currency, spins, cosmetics, boosts. It does not cover built-in cheat commands, which live under Cheats, or reward links you click rather than type, which live under Daily links.',
      'Every game page lists its codes with an evidence state attached to each one. That state is calculated from a verification log, so a page cannot present a code as current simply because nobody has edited it recently. When a game has nothing that currently passes a check, its page says so instead of padding the list with dead strings.',
    ],
    criteria: [
      {
        heading: 'How a game gets a page',
        body: 'It needs at least one recorded code with a reward, a redemption path confirmed against the game itself, and a verification event. A game with no published entries does not get a route, which is why the catalogue is smaller than the number of games we track.',
      },
      {
        heading: 'How to read a row',
        body: 'Verified means an editor redeemed the code and it worked. Source-reported means a publisher post confirms it but nobody redeemed it. Community-reported means no publisher post has been found, whatever other sites claim. Expired codes stay on the page, collapsed, so a code you find elsewhere can be identified as already dead.',
      },
      {
        heading: 'What the active count means',
        body: 'Active counts only codes whose most recent check passed and has not aged out of that game freshness window. Stale and never-checked codes are excluded, so an active count of zero on a page listing a dozen codes is accurate, not a bug.',
      },
    ],
  },

  cheats: {
    summary:
      'Built-in cheat codes, button sequences and console commands, scoped to the platform they actually work on.',
    paragraphs: [
      'Cheats are features the developer shipped inside the game: a button sequence on a controller, a console command, a name entered on a save file. They are not redeemable codes, and they are not third-party trainers, mod menus or generators, none of which appear on this site.',
      'Platform scope is the thing most cheat lists get wrong. A sequence that works on the PlayStation release of a game frequently does nothing on the PC release, and a code that works on the original version may be removed in a remaster. Every entry here records which platforms it was confirmed on, and pages say when a platform is untested rather than implying coverage.',
    ],
    criteria: [
      {
        heading: 'How a cheat gets published',
        body: 'It needs the exact input, the platforms it applies to, the build it was confirmed against, and a source. Entries that cannot be tied to a specific build stay unpublished rather than being listed with a guess.',
      },
      {
        heading: 'Warnings are part of the entry',
        body: 'Many cheats disable achievements, block trophy unlocks or flag a save file permanently. Where that is true it is recorded with the cheat, because a working code that quietly costs you your achievements is not a good answer.',
      },
      {
        heading: 'What is not here',
        body: 'No generators, no modified APKs, no account-based exploits and no paid unlock services. They break terms of service, they frequently carry malware, and they are the reason most cheat searches return junk.',
      },
    ],
  },

  answers: {
    summary:
      'Level answers, element recipes and puzzle solutions, checked against the current build of the game rather than an older release.',
    paragraphs: [
      'Answer sheets go stale in a specific way: the answers stay correct while the numbering drifts. A puzzle app ships an update, inserts three levels into the middle of a pack, and every list written before that update now points at the wrong level number. Readers get the right answer for the wrong puzzle and assume the site is broken.',
      'Pages in this section record the version they were checked against, and where a renumbering is known they say so on the page. Where a game has multiple releases with overlapping names, the specific release is named in the heading rather than left ambiguous.',
    ],
    criteria: [
      {
        heading: 'How an answer sheet gets published',
        body: 'Someone plays the section through and confirms both the answers and the order they appear in. A sheet copied from another list without that pass does not go up, because copying is exactly how the numbering drift propagates.',
      },
      {
        heading: 'Completeness is stated, not implied',
        body: 'Where a sheet covers levels 1 to 100, the heading says so. Partial coverage is labelled partial. A page never implies it is complete by omitting the range.',
      },
      {
        heading: 'Alternate accepted answers',
        body: 'Many puzzle games accept more than one spelling or synonym. Where a rejected answer is a common near-miss, the alternate is listed alongside it, since "the answer is right but the game says no" is the most common reason people arrive here.',
      },
    ],
  },

  guideIndex: {
    summary:
      'Explainer and process pages: how something works, what is actually available, and what to do when the obvious route fails.',
    paragraphs: [
      'Guides cover the questions that are not answered by a code or a level solution. How to redeem on a given platform. Whether a demo exists. What a game feature does and how to reach it. They are explanatory rather than exploit-oriented, which is the line between this section and Cheats.',
      'A large share of these questions have an unwelcome true answer. Sometimes the demo does not exist, the feature was removed two updates ago, or the method circulating online never worked. Guides here say that plainly. A page that invents a workaround to avoid disappointing the reader wastes more of their time than a page that closes the question in one line.',
    ],
    criteria: [
      {
        heading: 'Checked against first-party material',
        body: 'Platform behaviour is confirmed against the publisher or platform holder own support documentation and store listings, not against other guides. Where a support page has changed, the guide records when it was last read.',
      },
      {
        heading: 'The answer comes first',
        body: 'Every guide opens with the direct answer before the explanation. If the answer is no, the first line says no.',
      },
      {
        heading: 'Re-checked when the game ships',
        body: 'A guide whose game has published an update is queued for re-checking, because menu paths and feature availability are the details updates break most often.',
      },
    ],
  },

  az: {
    summary:
      'Every game with a published Freetins page, with its current active count so you can see what is worth opening.',
    paragraphs: [
      'This directory lists games that have a page, not games we intend to cover. A game appears here once it has published entries and a recorded check; there is no placeholder row for a game still being prepared, because a directory full of empty promises is not a directory.',
      'The active count beside each game is the number of entries that currently pass a check and are still inside that game freshness window. It is recalculated on every build from the verification log. A game showing zero active entries still has a page worth reading, because "nothing works right now" is the correct answer to the question that brought you here, and the page shows when each code was last checked and rejected.',
    ],
    criteria: [
      {
        heading: 'Ordering',
        body: 'Alphabetical, not by traffic or recency. A directory that reorders itself around what is popular is harder to use as a directory.',
      },
      {
        heading: 'Check times are absolute',
        body: 'Every timestamp is a real date and time in UTC rather than a relative label. "3 hours ago" rendered at build time becomes a lie the moment the page is cached.',
      },
    ],
  },

  daily: {
    summary:
      'Reward links you click rather than codes you type, with the check time on every link.',
    paragraphs: [
      'Daily reward links are the click-to-claim variety: a publisher posts a URL, it grants a reward once per account, and it usually expires within a day or two. They behave differently from codes and are kept separate because the failure mode differs — a dead link silently does nothing, where a dead code at least tells you it was rejected.',
      'Links here carry the same evidence rules as codes. A link is only presented as claimable if its most recent check passed and has not aged out. Guides in this section explain how a game reward system works and where its publisher posts, which stays useful even when individual links have rotated.',
    ],
    criteria: [
      {
        heading: 'Links are opened, not assumed',
        body: 'A check on a reward link means the link was opened and the outcome recorded. A link nobody has opened is not presented as working.',
      },
      {
        heading: 'No redirect wrappers',
        body: 'Reward links point at the destination the publisher posted. Sites that wrap reward links in their own redirects to count clicks are the main reason these links break.',
      },
    ],
  },
};

export const hubIntroFor = (routeId: string): HubIntro | undefined => hubIntros[routeId];
