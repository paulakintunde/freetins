import assert from 'node:assert/strict';
import test from 'node:test';
import { TITLE_BUDGET, codesTitle, fitTitle, recordedMonth } from '../src/lib/pageTitle.ts';

/*
 * These cover the grammar in isolation. The other half of the contract — that
 * every title the site actually emits fits the budget and is unique — is
 * enforced on every build by scripts/check-routes.mjs, which reads the titles
 * back out of dist/. It cannot be asserted here: src/data/routes.ts reaches
 * astro:content through extension-less imports the node test runner cannot
 * resolve, the same limitation test/dataset-routes.test.mjs documents.
 */

const AUGUST = '2026-08-24T09:00:00Z';

/**
 * Runs `run` with the clock taken away.
 *
 * Not two fake clocks compared for equal output — that only shows the code did
 * not happen to read the clock on those two runs. This removes the clock
 * outright, so a build-date fallback creeping into the grammar fails loudly
 * instead of passing every day it is written. `Date.parse` still resolves,
 * because parsing a recorded timestamp is the one date operation a title is
 * allowed to perform.
 */
const withoutAClock = (run) => {
  const RealDate = Date;
  globalThis.Date = new Proxy(RealDate, {
    construct(target, args) {
      if (args.length === 0) throw new Error('a title read the build clock via new Date()');
      return Reflect.construct(target, args);
    },
    get(target, property, receiver) {
      if (property === 'now') {
        return () => { throw new Error('a title read the build clock via Date.now()'); };
      }
      return Reflect.get(target, property, receiver);
    },
  });
  try {
    return run();
  } finally {
    globalThis.Date = RealDate;
  }
};

test('a codes title carries the count and the month of the recorded check', () => {
  assert.equal(
    codesTitle({ name: 'Grow a Garden', liveCount: 3, latestCheckedAt: AUGUST }),
    'Grow a Garden codes: 3 listed (August 2026) | Freetins',
  );
});

test('the month is derived without ever reading the clock', () => {
  const title = withoutAClock(() =>
    codesTitle({ name: 'Shindo Life', liveCount: 38, latestCheckedAt: AUGUST }));
  assert.equal(title, 'Shindo Life codes: 38 listed (August 2026) | Freetins');
});

test('a page with no recorded check carries no month, whatever the date today', () => {
  const title = withoutAClock(() =>
    codesTitle({ name: 'Hunty Zombies', liveCount: 0, latestCheckedAt: null }));
  assert.equal(title, 'Hunty Zombies codes | Freetins');
  assert.ok(!/\d{4}/.test(title), 'a year reached a title with no check behind it');
});

test('a zero count is dropped, and the month does not inherit its colon', () => {
  assert.equal(
    codesTitle({ name: 'Sailor Piece', liveCount: 0, latestCheckedAt: AUGUST }),
    'Sailor Piece codes (August 2026) | Freetins',
  );
});

test('recordedMonth returns null for a missing or unparseable date', () => {
  assert.equal(recordedMonth(null), null);
  assert.equal(recordedMonth(undefined), null);
  assert.equal(recordedMonth(''), null);
  assert.equal(recordedMonth('not a date'), null);
});

test('recordedMonth reads the recorded instant in UTC, not the builder locale', () => {
  // 00:30 UTC on the 1st is still the previous month in every zone behind UTC.
  assert.equal(recordedMonth('2026-09-01T00:30:00Z'), 'September 2026');
});

test('the brand is the first thing dropped when the budget is tight', () => {
  const title = codesTitle({
    name: 'Universal Tower Defense',
    liveCount: 12,
    latestCheckedAt: '2026-09-14T00:00:00Z',
  });
  assert.equal(title, 'Universal Tower Defense codes: 12 listed (September 2026)');
  assert.ok(title.length <= TITLE_BUDGET, `${title.length} characters`);
});

test('losing the month frees enough room for the brand to come back', () => {
  // Over budget even with the brand gone, so the month goes next — and once it
  // has, eleven characters are free again and the suffix fits.
  const title = codesTitle({
    name: 'Universal Tower Defense Extended',
    liveCount: 12,
    latestCheckedAt: '2026-09-14T00:00:00Z',
  });
  assert.equal(title, 'Universal Tower Defense Extended codes: 12 listed | Freetins');
  assert.ok(title.length <= TITLE_BUDGET, `${title.length} characters`);
});

test('the month is dropped before the count, and the brand returns when it fits', () => {
  const stem = 'A game with a very long name indeed codes';
  const title = fitTitle({ stem, count: '7 listed', month: 'September 2026' });
  assert.equal(title, `${stem}: 7 listed | Freetins`);
  assert.ok(title.length <= TITLE_BUDGET);
});

test('the stem is the floor and ships even when it is over budget alone', () => {
  const stem = 'A subject name long enough to spend the whole budget on its own codes';
  const title = fitTitle({ stem, count: '7 listed', month: 'September 2026' });
  assert.equal(title, stem);
});

test('a part is present whole or absent, so nothing is ever cut mid-token', () => {
  const cases = [
    { stem: 'Short codes', count: '3 listed', month: 'August 2026' },
    { stem: 'A moderately long game name codes', count: '128 listed', month: 'September 2026' },
    { stem: 'An extremely long game name that eats the entire budget codes', count: '9 listed', month: 'November 2026' },
  ];

  for (const parts of cases) {
    const title = fitTitle(parts);
    assert.ok(title.startsWith(parts.stem), `${title} stopped naming its subject`);
    assert.equal(
      (title.match(/\(/g) ?? []).length,
      (title.match(/\)/g) ?? []).length,
      `${title} carries an unbalanced bracket`,
    );
    if (title.includes('(')) assert.ok(title.includes(`(${parts.month})`), `${title} cut the month`);
    if (title.includes(' listed')) assert.ok(title.includes(parts.count), `${title} cut the count`);
    assert.ok(!/[:(|]\s*$/.test(title), `${title} ends on a separator`);
  }
});

test('a dataset headline takes the brand only when there is room for it', () => {
  assert.equal(
    fitTitle({ stem: 'Monopoly GO Free Dice Links, Dated Row by Row' }),
    'Monopoly GO Free Dice Links, Dated Row by Row | Freetins',
  );

  const long = 'All Brainrots in Steal a Brainrot: Rarity and Income List';
  assert.equal(fitTitle({ stem: long }), long);
  assert.ok(long.length + ' | Freetins'.length > TITLE_BUDGET);
});
