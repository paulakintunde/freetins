import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

import { parseFrontmatter, splitFrontmatter } from '../src/lib/frontmatter.ts';
import { CUTOVER_AT, asPublished, displayState, countStates, validateDataset } from '../src/lib/dataset.ts';
import { interpolate, DERIVED_CADENCE } from '../src/lib/interpolate.ts';
import { runProseChecks } from '../src/lib/prose-qa.ts';
import { normaliseDataset, derivedRowId, earliestAddedAt } from '../src/lib/normalise.ts';

const answer = (words) => Array.from({ length: words }, (_, index) => `word${index}`).join(' ');

const faqBlock = Array.from({ length: 6 }, (_, index) =>
  `  - q: Question number ${index}?\n    a: ${answer(45)}`).join('\n');

const frontmatterSource = [
  '---',
  'title: "Every Entry in Pipeline Check"',
  'slug: "pipeline-check"',
  'permalink: "/guides/pipeline-check/"',
  'category: "Guides"',
  'category_slug: "guides"',
  'focus_keyword: "pipeline check entries"',
  'secondary_keywords:',
  '  - all pipeline check entries',
  '  - rarest pipeline check entry',
  '  - pipeline check entry list',
  '  - pipeline check roster',
  'author: "Paul A"',
  'faq:',
  faqBlock,
  '---',
  '',
  'Body text here.',
].join('\n');

test('splitFrontmatter separates the block from the body', () => {
  const { raw, body } = splitFrontmatter(frontmatterSource);
  assert.equal(raw.title, 'Every Entry in Pipeline Check');
  assert.equal(body.trim(), 'Body text here.');
});

test('parseFrontmatter reads string lists and faq pairs', () => {
  const { frontmatter, errors } = parseFrontmatter(frontmatterSource, 'test');
  assert.deepEqual(errors, []);
  assert.equal(frontmatter.secondaryKeywords.length, 4);
  assert.equal(frontmatter.faq.length, 6);
  assert.equal(frontmatter.faq[0].q, 'Question number 0?');
  assert.match(frontmatter.faq[0].a, /^word0 /);
});

test('parseFrontmatter rejects a title over the character limit', () => {
  const source = frontmatterSource.replace(
    'title: "Every Entry in Pipeline Check"',
    `title: "${'x'.repeat(66)}"`,
  );
  const { errors } = parseFrontmatter(source, 'test');
  assert.ok(errors.some((error) => /title is 66 characters/.test(error)));
});

test('parseFrontmatter rejects an faq answer outside the word range', () => {
  const source = frontmatterSource.replace(answer(45), 'Too short.');
  const { errors } = parseFrontmatter(source, 'test');
  assert.ok(errors.some((error) => /faq answer 1 is 2 words/.test(error)));
});

const DAY = 86_400_000;
const isoDaysAgo = (days) => new Date(Date.now() - days * DAY).toISOString();
/* Dates are pinned to the cutover instant, not the wall clock, because the
 * baseline is frozen there and a test that drifts with the calendar would
 * prove nothing about it. */
const isoBeforeCutover = (days) => new Date(Date.parse(CUTOVER_AT) - days * DAY).toISOString();
const A_YEAR_LATER = Date.parse(CUTOVER_AT) + 365 * DAY;

const row = (name = 'Alpha', overrides = {}) => ({
  id: `pipeline-check:roster:${name.toLowerCase()}`,
  name,
  cells: { Entry: name },
  addedAt: isoBeforeCutover(30),
  status: 'active',
  lastVerifiedAt: isoBeforeCutover(1),
  evidence: [
    { tier: 1, url: 'https://example.org/official' },
    { tier: 2, url: 'https://example.org/outlet' },
  ],
  confidence: 'confirmed',
  ...overrides,
});

test('asPublished freezes at CUTOVER_AT, not the clock', () => {
  const inside = row('Alpha', { lastVerifiedAt: isoBeforeCutover(13) });
  const outside = row('Beta', { lastVerifiedAt: isoBeforeCutover(20) });
  assert.equal(asPublished(inside), 'active');
  assert.equal(asPublished(outside), 'unverified');
  // A year on, the same row still displays what it displayed on cutover day.
  assert.equal(displayState(inside, A_YEAR_LATER), 'active');
  assert.equal(displayState(inside, Date.now()), 'active');
  assert.equal(displayState(outside, A_YEAR_LATER), 'listed');
});

test('a reported typed-active row is listed', () => {
  assert.equal(displayState(row('Beta', { confidence: 'reported' }), Date.now()), 'listed');
  assert.equal(displayState(row('Gamma', { confidence: 'conflicting' }), Date.now()), 'listed');
  assert.equal(asPublished(row('Beta', { confidence: 'reported' })), 'unverified');
});

test('expired and removed both display expired, removed stays selectable', () => {
  const expired = row('Beta', { status: 'expired', confidence: 'reported' });
  const removed = row('Gamma', { status: 'removed' });
  assert.equal(displayState(expired, Date.now()), 'expired');
  assert.equal(displayState(removed, Date.now()), 'expired');
  assert.equal(asPublished(expired), 'expired');
  assert.equal(asPublished(removed), 'removed');

  const page = dataset({ rows: [row(), expired, removed] });
  const removedOnly = interpolate('{{table:roster|status=removed}}', page, Date.now()).body;
  assert.match(removedOnly, /\| Gamma \| Expired \|/);
  assert.doesNotMatch(removedOnly, /\| Beta \|/);
  const expiredOnly = interpolate('{{table:roster|status=expired}}', page, Date.now()).body;
  assert.match(expiredOnly, /\| Beta \| Expired \|/);
  assert.doesNotMatch(expiredOnly, /\| Gamma \|/);
  const both = interpolate('{{table:roster|status=expired,removed}}', page, Date.now()).body;
  assert.match(both, /\| Beta \|/);
  assert.match(both, /\| Gamma \|/);
  const notRemoved = interpolate('{{table:roster|not-status=removed}}', page, Date.now()).body;
  assert.match(notRemoved, /\| Alpha \|/);
  assert.match(notRemoved, /\| Beta \|/);
  assert.doesNotMatch(notRemoved, /\| Gamma \|/);
});

test('a link row past expires_at is expired only when its table kind is link', () => {
  const link = row('Spins', { status: 'unverified', confidence: 'reported', expiresAt: '2026-08-23T09:30:00Z' });
  const after = Date.parse('2026-08-24T00:00:00Z');
  const before = Date.parse('2026-08-22T00:00:00Z');
  assert.equal(displayState(link, after, 'link'), 'expired');
  assert.equal(displayState(link, before, 'link'), 'listed');
  assert.equal(displayState(link, after, 'fact'), 'listed');
  assert.equal(displayState(link, after, 'code'), 'listed');
  assert.equal(displayState(link, after), 'listed');
  // The baseline does not move: only the display does, and only for a link.
  assert.equal(asPublished(link), 'unverified');
});

test('a v2 row with no typed fields is listed', () => {
  const normalised = normaliseDataset(ledgerShape, 'pipeline-check');
  const [only] = normalised.rows;
  assert.equal(asPublished(only), 'unverified');
  assert.equal(displayState(only, Date.parse('2026-08-25T00:00:00Z'), 'link'), 'listed');
  assert.equal(displayState(only, A_YEAR_LATER), 'listed');
});

test('countStates totals', () => {
  const tables = { roster: { caption: 'Roster', columns: ['Entry'] } };
  const counts = countStates([
    row(),
    row('Beta', { confidence: 'reported' }),
    row('Gamma', { status: 'expired' }),
    row('Delta', { status: 'removed' }),
    row('Epsilon', { status: 'unverified', confidence: 'reported' }),
  ], A_YEAR_LATER, tables);
  assert.deepEqual(counts, {
    totalCount: 5,
    verifiedCount: 0,
    activeCount: 1,
    listedCount: 2,
    expiredCount: 2,
    removedCount: 1,
    confirmedCount: 3,
    unverifiedCount: 2,
  });
  assert.equal(counts.unverifiedCount, counts.listedCount);
});

test('countStates lets a link row expire on its TTL and nothing else on the clock', () => {
  const tables = { links: { caption: 'Links', columns: ['Entry'], kind: 'link' } };
  const rows = [
    row('Alpha', { table: 'links', status: 'unverified', confidence: 'reported', expiresAt: '2026-08-23T00:00:00Z' }),
    row('Beta', { table: 'links', status: 'unverified', confidence: 'reported' }),
  ];
  assert.equal(countStates(rows, Date.parse('2026-08-22T00:00:00Z'), tables).listedCount, 2);
  const later = countStates(rows, A_YEAR_LATER, tables);
  assert.equal(later.listedCount, 1);
  assert.equal(later.expiredCount, 1);
});

const dataset = (overrides = {}) => ({
  subject: 'Pipeline Check',
  slug: 'pipeline-check',
  entityId: '126884695634066',
  developer: 'Freetins Engineering',
  permalink: '/guides/pipeline-check/',
  checkedAt: isoDaysAgo(0),
  contentChangedAt: isoDaysAgo(0),
  officialSources: [{ type: 'official_page', url: 'https://example.org/official' }],
  tables: { roster: { caption: 'Roster', columns: ['Entry'] } },
  rows: [row(), row('Gamma', { status: 'removed' })],
  unverifiedSummary: 'One row is single sourced.',
  disagreements: [],
  fakes: [],
  changes: [{ at: isoDaysAgo(2), what: 'Published' }],
  nextChange: { pattern: 'Every three weeks.', watch: ['Discord'] },
  ...overrides,
});

test('validateDataset accepts a complete dataset', () => {
  assert.deepEqual(validateDataset(dataset()), []);
});

test('validateDataset rejects a future timestamp', () => {
  const errors = validateDataset(dataset({
    checkedAt: new Date(Date.now() + DAY).toISOString(),
  }));
  assert.ok(errors.some((error) => /checkedAt is in the future/.test(error)));
});

test('validateDataset no longer demands evidence tiers of a confirmed row', () => {
  // Whether a row is confirmed is the ledger's call, not the validator's, so a
  // single tier 2 sighting on a "confirmed" row is a fact about its evidence
  // and not an error (docs/adr/0003).
  const errors = validateDataset(dataset({
    rows: [row('Alpha', { evidence: [{ tier: 2, url: 'https://example.org/outlet' }] })],
  }));
  assert.deepEqual(errors, []);
});

test('validateDataset requires addedAt on every row', () => {
  const errors = validateDataset(dataset({ rows: [row('Alpha', { addedAt: null })] }));
  assert.ok(errors.some((error) => /addedAt must be an ISO 8601 timestamp/.test(error)));
});

test('validateDataset rejects an unknown table kind and a duplicate row id', () => {
  const errors = validateDataset(dataset({
    tables: { roster: { caption: 'Roster', columns: ['Entry'], kind: 'mystery' } },
    rows: [row('Alpha'), row('Beta', { id: 'pipeline-check:roster:alpha' })],
  }));
  assert.ok(errors.some((error) => /unknown kind "mystery"/.test(error)));
  assert.ok(errors.some((error) => /duplicate row id/.test(error)));
});

/* A dataset in the post-ledger shape: no status and no dates typed by a writer. */
const ledgerShape = {
  subject: 'Pipeline Check',
  slug: 'pipeline-check',
  entity_id: '126884695634066',
  developer: 'Freetins Engineering',
  permalink: '/daily/pipeline-check/',
  official_sources: [{ type: 'official_page', url: 'https://example.org/official' }],
  tables: { links: { caption: 'Links', columns: ['Reward'], kind: 'link' } },
  rows: [{
    name: 'Free spins',
    cells: { Reward: 'Free spins' },
    added_at: '2026-08-20T00:00:00Z',
    url: 'https://example.org/claim',
    expires_at: '2026-09-01T00:00:00Z',
    evidence: [{ tier: 1, url: 'https://example.org/post' }],
  }],
};

test('normaliseDataset accepts a page with no typed verification fields', () => {
  const normalised = normaliseDataset(ledgerShape, 'pipeline-check');
  assert.deepEqual(validateDataset(normalised), []);
  assert.equal(normalised.rows[0].id, derivedRowId('pipeline-check', 'links', 'Free spins'));
  assert.equal(normalised.rows[0].id, 'pipeline-check:links:free-spins');
  assert.equal(normalised.rows[0].status, 'unverified');
  assert.equal(normalised.rows[0].confidence, 'reported');
  assert.equal(normalised.rows[0].url, 'https://example.org/claim');
  assert.equal(normalised.tables.links.kind, 'link');
});

test('earliestAddedAt compares instants, not strings', () => {
  // The offset timestamp is the earlier instant even though it sorts later as text.
  const rows = [
    { addedAt: '2026-07-31T23:30:00Z' },
    { addedAt: '2026-08-01T00:00:00+01:00' },
    { addedAt: 'not a date' },
    { addedAt: null },
    {},
  ];
  assert.equal(earliestAddedAt(rows), '2026-08-01T00:00:00+01:00');
  assert.equal(earliestAddedAt([{ addedAt: '2026-08-02' }, { addedAt: '2026-08-01T12:00:00Z' }]), '2026-08-01T12:00:00Z');
  assert.equal(earliestAddedAt([{ addedAt: null }, {}]), '');
  assert.equal(earliestAddedAt([]), '');
});

test('interpolate says a page awaits verification rather than inventing dates', () => {
  const normalised = normaliseDataset(ledgerShape, 'pipeline-check');
  // Pinned before the row's expiry, so the TTL cannot turn the listing expired.
  const beforeExpiry = Date.parse('2026-08-25T00:00:00Z');
  const { body, unresolved } = interpolate(
    'Checked {{checkedAt}}.\n\n{{table:links}}\n\n{{changelog}}\n\n{{recheckCadence}}',
    normalised,
    beforeExpiry,
  );
  assert.deepEqual(unresolved, []);
  assert.match(body, /Checked awaiting editor verification\./);
  assert.match(body, /\| Free spins \| Listed · awaiting editor verification \| not yet \|/);
  assert.match(body, /No changes recorded yet/);
  assert.ok(body.includes(DERIVED_CADENCE));

  // Past the publisher's expiry the link row reads Expired, and the cell still
  // says no editor has checked it.
  const afterExpiry = interpolate('{{table:links}}', normalised, Date.parse('2026-09-02T00:00:00Z')).body;
  assert.match(afterExpiry, /\| Free spins \| Expired \| not yet \|/);
});

test('parseFrontmatter accepts a description and bounds its length', () => {
  const withDescription = frontmatterSource.replace(
    'author: "Paul A"',
    'author: "Paul A"\ndescription: "Every entry, with where each was seen."',
  );
  const { frontmatter, errors } = parseFrontmatter(withDescription, 'test');
  assert.deepEqual(errors, []);
  assert.equal(frontmatter.description, 'Every entry, with where each was seen.');

  const tooLong = frontmatterSource.replace('author: "Paul A"', `author: "Paul A"\ndescription: "${'x'.repeat(161)}"`);
  assert.ok(parseFrontmatter(tooLong, 'test').errors.some((error) => /description is 161 characters/.test(error)));
});

/*
 * The templates are what writers copy, so they must pass every check a real
 * page faces. Their sources are deliberate placeholders on a banned domain,
 * which is the one failure they are meant to produce until replaced.
 */
for (const name of ['example', 'daily-example']) {
  test(`content template ${name} passes every writer check except its placeholder sources`, () => {
    const md = readFileSync(new URL(`../docs/content-template/${name}.md`, import.meta.url), 'utf8')
      .replace(/\r\n/g, '\n');
    const raw = JSON.parse(readFileSync(new URL(`../docs/content-template/${name}.json`, import.meta.url), 'utf8'));

    const { frontmatter, body, errors } = parseFrontmatter(md, name);
    assert.deepEqual(errors, []);
    assert.ok(frontmatter);

    const normalised = normaliseDataset(raw, raw.slug);
    assert.deepEqual(validateDataset(normalised).filter((error) => !/banned source domain/.test(error)), []);

    const { body: rendered, unresolved } = interpolate(body, normalised, Date.now());
    assert.deepEqual(unresolved, []);

    const problems = runProseChecks(body, rendered, name, {
      requireUnverifiedSection: normalised.disagreements.length > 0 || normalised.unverifiedSummary.trim().length > 0,
    }).filter((problem) => !/banned or shortener domain/.test(problem));
    assert.deepEqual(problems, []);
  });
}

test('validateDataset rejects a duplicate row in one table', () => {
  const errors = validateDataset(dataset({ rows: [row(), row(), row('Gamma', { status: 'removed' })] }));
  assert.ok(errors.some((error) => /duplicate row/.test(error)));
});

test('validateDataset rejects a shortener in evidence', () => {
  const errors = validateDataset(dataset({
    rows: [
      row('Alpha', { evidence: [{ tier: 1, url: 'https://bit.ly/abc' }, { tier: 2, url: 'https://example.org/outlet' }] }),
      row('Gamma', { status: 'removed' }),
    ],
  }));
  assert.ok(errors.some((error) => /banned source domain/.test(error)));
});

test('interpolate resolves counts, dates and tables with the public labels', () => {
  const { body, unresolved } = interpolate(
    'There are {{activeCount}} of {{totalCount}}, checked {{checkedAt}}.\n\n{{table:roster}}',
    dataset(),
    Date.now(),
  );
  assert.deepEqual(unresolved, []);
  assert.match(body, /There are 1 of 2/);
  assert.match(body, /\| Entry \| Status \| Last checked \|/);
  assert.match(body, /\| Alpha \| Active · as published \| \d{1,2} \w+ \d{4} \|/);
  assert.match(body, /\| Gamma \| Expired \|/);
  assert.doesNotMatch(body, /Removed/);
});

test('interpolate renders the listed label for a reported row', () => {
  const { body } = interpolate('{{table:roster}}', dataset({ rows: [row('Beta', { confidence: 'reported' })] }), Date.now());
  assert.match(body, /\| Beta \| Listed · awaiting editor verification \| \d{1,2} \w+ \d{4} \|/);
});

test('interpolate filters a table by status', () => {
  const { body } = interpolate('{{table:roster|status=removed}}', dataset(), Date.now());
  assert.match(body, /Gamma/);
  assert.doesNotMatch(body, /\| Alpha \|/);
});

test('interpolate accepts the v1 filter aliases and the four public values', () => {
  const page = dataset({
    rows: [
      row(),
      row('Beta', { confidence: 'reported' }),
      row('Gamma', { status: 'removed' }),
      row('Delta', { status: 'expired' }),
    ],
  });
  const render = (argument) => interpolate(`{{table:roster|${argument}}}`, page, Date.now()).body;

  const unverified = render('status=unverified');
  assert.match(unverified, /\| Beta \|/);
  assert.doesNotMatch(unverified, /\| Alpha \|/);
  assert.equal(render('status=listed'), unverified);

  const live = render('status=active,unverified');
  assert.match(live, /\| Alpha \|/);
  assert.match(live, /\| Beta \|/);
  assert.doesNotMatch(live, /\| Gamma \|/);
  assert.doesNotMatch(live, /\| Delta \|/);
  assert.equal(render('status=verified,active,listed'), live);

  assert.match(render('status=verified'), /_No rows recorded\._/);
});

test('interpolate resolves the count tokens and their v1 aliases', () => {
  const page = dataset({
    rows: [
      row(),
      row('Beta', { confidence: 'reported' }),
      row('Gamma', { status: 'removed' }),
      row('Delta', { status: 'expired' }),
    ],
  });
  const { body, unresolved } = interpolate(
    [
      'total {{totalCount}}', 'verified {{verifiedCount}}', 'active {{activeCount}}',
      'listed {{listedCount}}', 'unverified {{unverifiedCount}}', 'expired {{expiredCount}}',
      'removed {{removedCount}}', 'confirmed {{confirmedCount}}',
    ].join('\n'),
    page,
    Date.now(),
  );
  assert.deepEqual(unresolved, []);
  assert.equal(body, [
    'total 4', 'verified 0', 'active 1', 'listed 1', 'unverified 1', 'expired 2', 'removed 1', 'confirmed 3',
  ].join('\n'));
});

test('interpolate always renders the derived cadence, never a typed one', () => {
  // A leftover typed sentence on a stale object is ignored: a schedule nobody
  // performs is not something the page may promise (docs/adr/0003).
  const stale = { ...dataset(), recheckCadence: 'Re-verified every 48 hours.' };
  const { body } = interpolate('{{recheckCadence}}\n\n{{freshness}}', stale, Date.now());
  assert.equal(body, `${DERIVED_CADENCE}\n\n${DERIVED_CADENCE}`);
  assert.doesNotMatch(body, /48 hours/);
  assert.match(DERIVED_CADENCE, /reads not yet/);
});

test('interpolate reports an unknown token rather than dropping it', () => {
  const { body, unresolved } = interpolate('{{nonsense}}', dataset(), Date.now());
  assert.deepEqual(unresolved, ['nonsense']);
  assert.equal(body, '{{nonsense}}');
});

const goodProse = [
  answer(48),
  'It is not the clone experience, place ID 126884695634066, which has its own roster.',
  '## Every entry',
  '{{table:roster}}',
  '## What we could not verify',
  '{{unverifiedSummary}}',
  '## Change log',
  '{{changelog}}',
  '## Cadence',
  '{{recheckCadence}}',
  '- [How Freetins verifies pages](/how-we-verify/)',
  '- [Grow a Garden codes](/codes/grow-a-garden/)',
  '- [Dandy World codes](/codes/dandys-world/)',
].join('\n\n');

test('runProseChecks passes compliant prose', () => {
  assert.deepEqual(runProseChecks(goodProse, goodProse, 'test'), []);
});

test('runProseChecks rejects an em-dash', () => {
  const source = goodProse.replace('It is not', 'It is not—really');
  assert.ok(runProseChecks(source, source, 'test').some((problem) => /em or en dash/.test(problem)));
});

test('runProseChecks rejects a literal date in prose', () => {
  const source = goodProse.replace('## Cadence', '## Cadence\n\nChecked on 24 August 2026.');
  assert.ok(runProseChecks(source, source, 'test').some((problem) => /literal date/.test(problem)));
});

test('runProseChecks rejects a non-descriptive anchor', () => {
  const source = goodProse.replace('How Freetins verifies pages', 'click here');
  assert.ok(runProseChecks(source, source, 'test').some((problem) => /non-descriptive link anchor/.test(problem)));
});

test('runProseChecks rejects a missing verification section when the dataset needs one', () => {
  const source = goodProse.replace('## What we could not verify', '## Notes');
  assert.ok(runProseChecks(source, source, 'test').some((problem) => /could not verify/.test(problem)));
});

test('runProseChecks lets a page with nothing unverifiable omit that section', () => {
  const source = goodProse.replace('## What we could not verify', '## Notes');
  assert.deepEqual(runProseChecks(source, source, 'test', { requireUnverifiedSection: false }), []);
});
