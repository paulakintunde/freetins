import assert from 'node:assert/strict';
import test from 'node:test';
import { operations, validateOperations } from '../src/data/operations.ts';

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
