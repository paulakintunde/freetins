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
}

test('the daily template carries no typed verification claim', () => {
  const { raw } = load('daily-example');
  for (const key of ['checked_at', 'content_changed_at', 'recheck_cadence', 'unverified_summary', 'changes']) {
    assert.equal(key in raw, false, `${key} must not be typed on a v2 page`);
  }
  for (const row of raw.rows) {
    for (const key of ['status', 'last_verified_at', 'confidence', 'needs_human', 'ended_at']) {
      assert.equal(key in row, false, `${row.name}: ${key} must not be typed on a v2 row`);
    }
    assert.ok(row.added_at, `${row.name}: added_at is required`);
  }

  // And what it renders as, before any editor acts.
  const normalised = normaliseDataset(raw, raw.slug);
  const { body } = interpolate('{{table:links}}\n\n{{checkedAt}}\n\n{{changelog}}', normalised, Date.now());
  assert.match(body, /\| Facebook morning post \| 25 free spins \| Facebook \| Unverified \| awaiting editor verification \|/);
  assert.match(body, /\nawaiting editor verification\n/);
  assert.match(body, /No changes recorded yet/);
});
