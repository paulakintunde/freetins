/*
 * The title grammar.
 *
 * A title is the site's only pitch in a result list, and the two things that
 * win this niche's results — how many entries a page holds, and when it was
 * last looked at — are both facts this repository already stores. So they are
 * derived here rather than typed into a template, for the same reason no other
 * claim on the site is typed (docs/adr/0003-no-hand-typed-verification-claims.md).
 *
 * Two rules the derivation may never break.
 *
 * 1. A month comes from a recorded check and from nothing else. Not Date.now(),
 *    not the build clock, not a fallback. A page nobody has checked carries no
 *    month at all, which is why `recordedMonth` is nullable and null is an
 *    ordinary input rather than an error. A title reading August because the
 *    build happened to run in August is precisely the freshness lie this file
 *    exists to prevent, and it would be invisible: every build would look right
 *    on the day it ran.
 *
 * 2. A count counts records. It never characterises them. `listed` is the
 *    site's published word for an entry on record that no editor has tested;
 *    `verified` and `active` are states the ledger grants an entry one at a
 *    time, and no route template may assert one on a whole page's behalf. As of
 *    this writing every live code on the site is Listed and the verified count
 *    is zero on all fourteen published pages, so a template promising a
 *    "working list" would contradict the page's own stat row a screen below it.
 */

/**
 * The budget for the rendered `<title>`, brand suffix included.
 *
 * The same 65 the writer contract has always named, now measuring the whole
 * emitted string rather than the front-matter field. `src/lib/frontmatter.ts`
 * still caps the field itself; a field that spends all 65 simply loses the
 * suffix at the last rung below rather than shipping a 76-character title.
 */
export const TITLE_BUDGET = 65;

const BRAND_SUFFIX = ' | Freetins';

/*
 * Fixed locale, fixed zone. A month formatted in the builder's locale would
 * differ between a laptop and CI for the same recorded instant, which is the
 * same defect as reading the clock wearing a different hat: the output has to
 * be a function of the data and nothing else.
 */
const monthFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/**
 * The month of a recorded check, or null when there is no check to name.
 *
 * There is deliberately no `now` parameter and no default: the only way to put
 * a month in a title is to record a check. That makes the title stale exactly
 * when the page is stale, which is the pressure the site wants — a month that
 * has stopped moving is a queue signal a reader can see.
 */
export const recordedMonth = (checkedAt: string | null | undefined): string | null => {
  if (!checkedAt) return null;
  const parsed = Date.parse(checkedAt);
  return Number.isNaN(parsed) ? null : monthFormatter.format(parsed);
};

export interface TitleParts {
  /** The subject and its head term, e.g. "Grow a Garden codes". Never dropped. */
  stem: string;
  /** A tally of records, e.g. "3 listed". Never a characterisation of them. */
  count?: string | null;
  /** From `recordedMonth`, and from nowhere else. */
  month?: string | null;
  /** Set false only where a template must not carry the suffix. */
  brand?: boolean;
}

/*
 * The rungs, widest first, as [count, month, brand].
 *
 * Drop order is fixed and tested. The brand goes first: Google prints the site
 * name above the title now, so the suffix is the only part of the string that
 * says nothing about this particular page. The month goes next, and the count
 * last, because a count is true for as long as the page is unchanged while a
 * month is the part a competitor is beating us with. If the month has to go
 * anyway the brand comes back, since by then there is room for it.
 *
 * Below these is the floor, composed separately: the stem alone, which ships
 * even when it is over budget on its own. A title that has stopped naming its
 * subject is worse than a long one.
 */
const RUNGS: [boolean, boolean, boolean][] = [
  [true, true, true],
  [true, true, false],
  [true, false, true],
  [true, false, false],
];

/**
 * The fullest form of a title that fits `TITLE_BUDGET`.
 *
 * Nothing here truncates. Each part is present whole or absent, so a title can
 * never end mid-word, mid-count or mid-date — the failure mode of every
 * character-count fix that reaches for `slice`.
 */
export const fitTitle = ({ stem, count, month, brand = true }: TitleParts): string => {
  const compose = (withCount: boolean, withMonth: boolean, withBrand: boolean) => {
    const shownCount = withCount && count ? count : null;
    const shownMonth = withMonth && month ? `(${month})` : null;
    /*
     * The colon introduces a count. A month on its own follows the stem
     * directly, because "Sailor Piece codes: (August 2026)" reads as a list
     * whose contents went missing rather than as a page with a date on it.
     */
    const detail = shownCount
      ? `: ${[shownCount, shownMonth].filter(Boolean).join(' ')}`
      : (shownMonth ? ` ${shownMonth}` : '');
    return `${stem}${detail}${withBrand && brand ? BRAND_SUFFIX : ''}`;
  };

  const floor = compose(false, false, false);
  return RUNGS
    .map((rung) => compose(...rung))
    .find((candidate) => candidate.length <= TITLE_BUDGET) ?? floor;
};

/**
 * The title of a game's codes page.
 *
 * `liveCount` is everything not expired, which is the number the page's own
 * stat row and every card linking to it already show, so the promise in the
 * result list is the one the reader lands on. Zero drops the count rather than
 * advertising it.
 */
export const codesTitle = (game: {
  name: string;
  liveCount: number;
  latestCheckedAt: string | null;
}): string => fitTitle({
  stem: `${game.name} codes`,
  count: game.liveCount > 0 ? `${game.liveCount} listed` : null,
  month: recordedMonth(game.latestCheckedAt),
});

/**
 * The title of a game's daily reward-link page.
 *
 * Same grammar, different head term. Kept here rather than inlined so the two
 * surfaces cannot drift into two conventions.
 */
export const dailyTitle = (game: {
  name: string;
  liveCount: number;
  latestCheckedAt: string | null;
}): string => fitTitle({
  stem: `${game.name} reward links`,
  count: game.liveCount > 0 ? `${game.liveCount} listed` : null,
  month: recordedMonth(game.latestCheckedAt),
});
