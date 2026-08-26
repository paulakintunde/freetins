import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

import { parseFrontmatter } from '../src/lib/frontmatter.ts';
import { validateDataset } from '../src/lib/dataset.ts';
import { normaliseDataset } from '../src/lib/normalise.ts';
import { interpolate } from '../src/lib/interpolate.ts';
import { runProseChecks } from '../src/lib/prose-qa.ts';

/*
 * The templates are what writers copy, so they must pass every check a real
 * page faces. Their sources are deliberate placeholders on a banned domain,
 * which is the one failure they are meant to produce until replaced.
 */
const load = (name) => {
  const md = readFileSync(new URL(`../docs/content-template/${name}.md`, import.meta.url), 'utf8')
    .replace(/\r\n/g, '\n');
  const raw = JSON.parse(readFileSync(new URL(`../docs/content-template/${name}.json`, import.meta.url), 'utf8'));
  return { md, raw };
};

/*
 * Pinned earlier than every expires_at in the templates. A link row past its
 * publisher's expiry reads Expired, which is correct on a live page and would
 * make a wall-clock assertion here fail on the day the placeholder date passed.
 */
const BEFORE_EVERY_EXPIRY = Date.parse('2026-08-21T00:00:00Z');

/* Both templates are v2: nothing on them asserts that a check happened. */
const PAGE_CLAIM_KEYS = ['checked_at', 'content_changed_at', 'recheck_cadence', 'changes']; // retired-vocabulary: allow, asserts absence
const ROW_CLAIM_KEYS = ['status', 'last_verified_at', 'confidence', 'needs_human', 'ended_at']; // retired-vocabulary: allow, asserts absence

for (const name of ['example', 'daily-example']) {
  test(`content template ${name} passes every writer check except its placeholder sources`, () => {
    const { md, raw } = load(name);

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

  test(`content template ${name} carries no typed verification claim`, () => {
    const { raw } = load(name);
    for (const key of PAGE_CLAIM_KEYS) {
      assert.equal(key in raw, false, `${key} must not be typed on a v2 page`);
    }
    assert.ok(raw.rows.length > 0, 'the template shows at least one row');
    for (const row of raw.rows) {
      for (const key of ROW_CLAIM_KEYS) {
        assert.equal(key in row, false, `${row.name}: ${key} must not be typed on a v2 row`);
      }
      assert.ok(row.added_at, `${row.name}: added_at is required`);
    }
  });
}

test('the daily template renders as listed, awaiting an editor, before any editor acts', () => {
  const { raw } = load('daily-example');
  const normalised = normaliseDataset(raw, raw.slug);
  const { body } = interpolate('{{table:links}}\n\n{{checkedAt}}\n\n{{changelog}}', normalised, BEFORE_EVERY_EXPIRY);
  assert.match(body, /\| Facebook morning post \| 25 free spins \| Facebook \| Listed · awaiting editor verification \| not yet \|/);
  assert.match(body, /\nawaiting editor verification\n/);
  assert.match(body, /No changes recorded yet/);

  // Once the publisher's own expiry passes, the link row reads Expired: the
  // one clock input this surface allows, and it touches only link rows.
  const afterExpiry = interpolate('{{table:links}}', normalised, Date.parse('2026-08-24T00:00:00Z')).body;
  assert.match(afterExpiry, /\| Facebook morning post \| 25 free spins \| Facebook \| Expired \| not yet \|/);
  assert.match(afterExpiry, /\| X weekend post \| Dice bonus \| X \| Listed · awaiting editor verification \| not yet \|/);
});

test('the guides template renders every row as listed and its counts as zero stars', () => {
  const { raw } = load('example');
  const normalised = normaliseDataset(raw, raw.slug);
  const { body, unresolved } = interpolate(
    '{{table:roster}}\n\n{{verifiedCount}} {{activeCount}} {{listedCount}} {{totalCount}}',
    normalised,
    Date.now(),
  );
  assert.deepEqual(unresolved, []);
  assert.match(body, /\| Alpha Marker \| Common \| 12 \| Drops from the starting conveyor \| Listed · awaiting editor verification \| not yet \|/);
  assert.match(body, /\n0 0 3 3$/);
});
