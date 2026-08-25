import assert from 'node:assert/strict';
import test from 'node:test';
import { citationFor, isIndexable, operations, validateOperations } from '../src/data/operations.ts';

const freshData = () => structuredClone(operations);

test('a sourced and verified code page can be published', () => {
  const data = freshData();
  const game = data.games.find((item) => item.slug === 'grow-a-garden');
  assert.ok(game);

  game.publicationState = 'published';
  game.officialSourceUrl = 'https://www.roblox.com/games/126884695634066/Grow-a-Garden';
  game.redeemSteps = ['Open the game menu.', 'Enter the code in the codes field.'];
  data.codes.push({
    id: 'grow-a-garden-test-code',
    gameSlug: game.slug,
    code: 'TEST-CODE',
    reward: 'Test reward',
    firstSeenAt: '2026-08-24T10:00:00Z',
    sourceUrls: ['https://www.roblox.com/games/126884695634066/Grow-a-Garden'],
  });
  data.verificationEvents.push({
    id: 'grow-a-garden-test-check',
    entryType: 'code',
    entryId: 'grow-a-garden-test-code',
    checkedAt: '2026-08-24T10:05:00Z',
    result: 'accepted',
    method: 'redeemed',
    checkedBy: 'paul-a',
  });

  assert.doesNotThrow(() => validateOperations(data));
});

test('a published game without evidence is rejected', () => {
  const data = freshData();
  const game = data.games.find((item) => item.slug === 'grow-a-garden');
  assert.ok(game);
  game.publicationState = 'published';
  game.officialSourceUrl = null;
  game.redeemSteps = [];

  assert.throws(() => validateOperations(data), /needs an officialSourceUrl/);
});

test('incomplete service activation is rejected', () => {
  const data = freshData();
  data.services.alerts.enabled = true;
  data.services.advertising.enabled = true;

  assert.throws(() => validateOperations(data), /Enabled alerts service needs at least one channel/);
  assert.throws(() => validateOperations(data), /Enabled advertising needs a provider/);
});

test('prototype domains are rejected from operational records', () => {
  const data = freshData();
  data.sponsorships.push({
    id: 'prototype-sponsor',
    title: 'Prototype sponsor',
    label: 'Sponsored',
    targetUrl: 'https://example.com/offer',
    startsAt: '2026-08-24T10:00:00Z',
    endsAt: '2026-08-25T10:00:00Z',
    disclosure: 'Paid placement',
  });

  assert.throws(() => validateOperations(data), /needs a target URL and ISO date range/);
});


/*
 * The indexing gate. `planned` means "waiting on data", so these assert the page
 * lets itself into the index the moment the data is real and not one moment before.
 */
const plannedGame = (overrides = {}) => ({
  publicationState: 'planned',
  officialSourceUrl: 'https://www.monopolygo.com/',
  redeemSteps: ['Open the link on the device the game is installed on.', 'Let the game open and collect the reward.'],
  ...overrides,
});

const entry = (state) => ({ entry: { id: 'x' }, latestEvent: null, state, tier: 'community-reported' });

test('a planned page with a live checked link indexes itself', () => {
  assert.equal(isIndexable(plannedGame(), [entry('verified')]), true);
  assert.equal(isIndexable(plannedGame(), [entry('reported')]), true);
});

test('a planned page cannot index on stale, expired or absent links', () => {
  // The failure this guards is a 6-hour daily-link window aging out overnight and
  // the page staying indexed with nothing on it.
  assert.equal(isIndexable(plannedGame(), []), false);
  assert.equal(isIndexable(plannedGame(), [entry('stale')]), false);
  assert.equal(isIndexable(plannedGame(), [entry('expired')]), false);
  assert.equal(isIndexable(plannedGame(), [entry('unverified')]), false);
});

test('a planned page cannot index without the furniture that answers the query', () => {
  assert.equal(isIndexable(plannedGame({ officialSourceUrl: null }), [entry('verified')]), false);
  assert.equal(isIndexable(plannedGame({ redeemSteps: [] }), [entry('verified')]), false);
  assert.equal(isIndexable(plannedGame({ redeemSteps: ['Only one step.'] }), [entry('verified')]), false);
});

test('retired stays out and published stays in, whatever the data says', () => {
  assert.equal(isIndexable(plannedGame({ publicationState: 'retired' }), [entry('verified')]), false);
  assert.equal(isIndexable({ publicationState: 'published', officialSourceUrl: null, redeemSteps: [] }, []), true);
});

test('the three daily-link pages are gated on data, not on a flag', () => {
  // Named because these are the pages the gate exists for. If one of them starts
  // failing here it is because its data landed, which is the point.
  for (const slug of ['monopoly-go', 'coin-master', 'dice-dreams']) {
    const game = operations.games.find((item) => item.slug === slug);
    assert.ok(game, `${slug} is missing from the operational data`);
    assert.equal(game.publicationState, 'planned');
    assert.equal(isIndexable(game, []), false, `${slug} would index with no live link`);
  }
});

/*
 * The evidence line. A row with a reported source is uncorroborated, not unsourced,
 * and the page has to be able to tell the reader which.
 */
test('a publisher post outranks a reported source', () => {
  const citation = citationFor({
    publisherSourceUrl: 'https://www.monopolygo.com/news/',
    sourceUrls: ['https://www.pcgamesn.com/whatever'],
  });
  assert.equal(citation.tier, 'publisher-confirmed');
  assert.equal(citation.label, 'Publisher post');
});

test('a reported source is named rather than disclaimed', () => {
  const citation = citationFor({
    publisherSourceUrl: null,
    sourceUrls: ['https://www.pcgamesn.com/grow-a-garden/codes'],
  });
  assert.equal(citation.tier, 'community-reported');
  assert.equal(citation.label, 'Reported by pcgamesn.com');
});

test('an aggregator in discoveredVia is never promoted to a citation', () => {
  // discoveredVia is the audit trail. Surfacing it would launder one aggregator
  // repeating another into corroboration.
  assert.equal(citationFor({ publisherSourceUrl: null, sourceUrls: [], discoveredVia: ['https://example-aggregator.com/x'] }), null);
});

test('a citation never points at a preview host or a placeholder', () => {
  assert.equal(citationFor({ publisherSourceUrl: null, sourceUrls: ['https://basketball-zero-codes.pages.dev/'] }), null);
  assert.equal(citationFor({ publisherSourceUrl: null, sourceUrls: ['http://www.pcgamesn.com/x'] }), null);
});
