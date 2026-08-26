import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

import { parseFrontmatter, splitFrontmatter } from '../src/lib/frontmatter.ts';
import { resolveDisplayStatus, countRows, validateDataset } from '../src/lib/dataset.ts';
import { interpolate } from '../src/lib/interpolate.ts';
import { runProseChecks } from '../src/lib/prose-qa.ts';
import { normaliseDataset, derivedRowId } from '../src/lib/normalise.ts';

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

const isoDaysAgo = (days) => new Date(Date.now() - days * 86_400_000).toISOString();

const row = (name = 'Alpha', overrides = {}) => ({
  id: `pipeline-check:roster:${name.toLowerCase()}`,
  name,
  cells: { Entry: name },
  addedAt: isoDaysAgo(3),
  status: 'active',
  lastVerifiedAt: isoDaysAgo(1),
  evidence: [
    { tier: 1, url: 'https://example.org/official' },
    { tier: 2, url: 'https://example.org/outlet' },
  ],
  confidence: 'confirmed',
  ...overrides,
});

test('resolveDisplayStatus downgrades an active row past the freshness window', () => {
  const rows = resolveDisplayStatus(
    [row(), row('Beta', { lastVerifiedAt: isoDaysAgo(20) })],
    Date.now(),
  );
  assert.equal(rows[0].status, 'active');
  assert.equal(rows[1].status, 'unverified');
});

test('resolveDisplayStatus refuses to show a reported row as active', () => {
  const rows = resolveDisplayStatus(
    [row('Beta', { confidence: 'reported' }), row('Gamma', { confidence: 'conflicting' })],
    Date.now(),
  );
  assert.equal(rows[0].status, 'unverified');
  assert.equal(rows[1].status, 'unverified');
});

test('resolveDisplayStatus leaves archived rows alone', () => {
  const rows = resolveDisplayStatus(
    [row('Beta', { status: 'expired', confidence: 'reported' }), row('Gamma', { status: 'removed' })],
    Date.now(),
  );
  assert.equal(rows[0].status, 'expired');
  assert.equal(rows[1].status, 'removed');
});

test('countRows counts by status', () => {
  const counts = countRows([
    row(),
    row('Beta', { status: 'expired' }),
    row('Gamma', { status: 'removed' }),
  ]);
  assert.equal(counts.totalCount, 3);
  assert.equal(counts.activeCount, 1);
  assert.equal(counts.expiredCount, 1);
  assert.equal(counts.removedCount, 1);
});

const dataset = (overrides = {}) => ({
  subject: 'Pipeline Check',
  slug: 'pipeline-check',
  entityId: '126884695634066',
  developer: 'Freetins Engineering',
  permalink: '/guides/pipeline-check/',
  checkedAt: isoDaysAgo(0),
  contentChangedAt: isoDaysAgo(0),
  recheckCadence: 'Re-verified every 48 hours.',
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
    checkedAt: new Date(Date.now() + 86_400_000).toISOString(),
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

test('interpolate says a page awaits verification rather than inventing dates', () => {
  const normalised = normaliseDataset(ledgerShape, 'pipeline-check');
  const { body, unresolved } = interpolate(
    'Checked {{checkedAt}}.\n\n{{table:links}}\n\n{{changelog}}\n\n{{recheckCadence}}',
    normalised,
    Date.now(),
  );
  assert.deepEqual(unresolved, []);
  assert.match(body, /Checked awaiting editor verification\./);
  assert.match(body, /\| Free spins \| Unverified \| awaiting editor verification \|/);
  assert.match(body, /No changes recorded yet/);
  assert.match(body, /Rechecks are recorded on this page/);
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

test('interpolate resolves counts, dates and tables', () => {
  const { body, unresolved } = interpolate(
    'There are {{activeCount}} of {{totalCount}}, checked {{checkedAt}}.\n\n{{table:roster}}',
    dataset(),
    Date.now(),
  );
  assert.deepEqual(unresolved, []);
  assert.match(body, /There are 1 of 2/);
  assert.match(body, /\| Entry \| Status \| Last checked \|/);
  assert.match(body, /\| Gamma \| Removed \|/);
});

test('interpolate filters a table by status', () => {
  const { body } = interpolate('{{table:roster|status=removed}}', dataset(), Date.now());
  assert.match(body, /Gamma/);
  assert.doesNotMatch(body, /\| Alpha \|/);
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
