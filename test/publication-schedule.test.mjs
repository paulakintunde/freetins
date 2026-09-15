import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nextPublication, pstDate, stripPendingLinks } from '../scripts/lib/publication-schedule.mjs';
const plan = JSON.parse(readFileSync(new URL('../docs/publication/september-2026/schedule.json', import.meta.url)));
const fixtureOffset = Date.parse(plan.startDate + 'T00:00:00Z') - Date.parse('2026-09-14T00:00:00Z');
plan.startDate = '2026-09-14';
for (const item of plan.items) item.scheduledAt = new Date(Date.parse(item.scheduledAt) - fixtureOffset).toISOString();
test('fixed PST starts at 17:30 UTC and first day has three slots', () => {
  const ledger = { releases: [], pendingDeployment: null };
  assert.equal(nextPublication(plan, ledger, '2026-09-14T17:29:59Z').item, null);
  for (const time of ['2026-09-14T17:30:00Z','2026-09-14T22:30:00Z','2026-09-15T03:30:00Z']) {
    const result = nextPublication(plan, ledger, time);
    assert.ok(result.item);
    ledger.releases.push({ slug: result.item.slug, slot: result.slot });
    assert.equal(nextPublication(plan, ledger, time).item, null);
  }
  assert.equal(ledger.releases.length, 3);
  assert.equal(pstDate('2026-09-15T03:30:00Z'), '2026-09-14');
});
test('missed slots release only one and the first actual day retains its extra slot', () => {
  const ledger = { releases: [], pendingDeployment: null };
  const result = nextPublication(plan, ledger, '2026-09-20T17:30:00Z');
  assert.equal(result.item.slug, 'blox-fruits-codes');
  ledger.releases.push({ slug: result.item.slug, slot: result.slot });
  assert.equal(nextPublication(plan, ledger, '2026-09-20T17:35:00Z').item, null);
  assert.ok(nextPublication(plan, ledger, '2026-09-21T03:30:00Z').item);
  assert.equal(nextPublication(plan, ledger, '2026-09-22T03:30:00Z').item, null);
});
test('ambiguous deploy blocks retry and completed queue stops', () => {
  assert.equal(nextPublication(plan, { releases: [], pendingDeployment: { slug: 'x' } }, '2026-09-14T17:30:00Z').item, null);
  assert.equal(nextPublication(plan, { releases: plan.items, pendingDeployment: null }, '2026-09-14T17:30:00Z').reason, 'All publications complete');
});
test('only links to pending pages become text', () => {
  assert.equal(stripPendingLinks('[Later](/blog/later/) and [Now](/codes/)', new Set(['/blog/later/'])), 'Later and [Now](/codes/)');
});
