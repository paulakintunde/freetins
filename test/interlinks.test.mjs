import assert from 'node:assert/strict';
import { test } from 'node:test';

import { datasetLinksForGame } from '../src/lib/datasetLinks.ts';

const page = (overrides = {}) => ({
  path: '/guides/example/',
  slug: 'example',
  heading: 'Example guide',
  description: 'A long unverified summary that must never reach a link card.',
  section: 'guides',
  focusKeyword: '',
  secondaryKeywords: [],
  checkedAt: '2026-08-24T00:00:00Z',
  entityId: '126884695634066',
  activeCount: 0,
  totalCount: 20,
  ...overrides,
});

const robloxGame = {
  platform: 'Roblox',
  officialSourceUrl: 'https://www.roblox.com/games/126884695634066/Grow-a-Garden',
};

test('a dataset page stating the game listing id is linked from that game', () => {
  const links = datasetLinksForGame(robloxGame, [page()]);
  assert.equal(links.length, 1);
  assert.equal(links[0].href, '/guides/example/');
});

test('a dataset page about another game is not linked', () => {
  const links = datasetLinksForGame(robloxGame, [page({ entityId: '109983668079237' })]);
  assert.deepEqual(links, []);
});

test('a platform-wide page is linked from any game on that platform', () => {
  const links = datasetLinksForGame(
    { platform: 'Roblox', officialSourceUrl: 'https://www.roblox.com/games/999/Other' },
    [page({ entityId: 'https://www.roblox.com/redeem', path: '/blog/redeem/' })],
  );
  assert.equal(links.length, 1);
  assert.equal(links[0].href, '/blog/redeem/');
});

test('a subdomain of the platform host still counts as platform-wide', () => {
  const links = datasetLinksForGame(
    { platform: 'Roblox', officialSourceUrl: 'https://www.roblox.com/games/999/Other' },
    [page({ entityId: 'https://create.roblox.com/store/audio', path: '/guides/song-ids/' })],
  );
  assert.equal(links.length, 1);
});

test('a platform with no published code pages contributes no platform links', () => {
  const links = datasetLinksForGame(
    { platform: 'Mobile', officialSourceUrl: null },
    [page({ entityId: 'https://www.roblox.com/redeem' })],
  );
  assert.deepEqual(links, []);
});

test('the game-specific page is ordered ahead of platform-wide pages', () => {
  const links = datasetLinksForGame(robloxGame, [
    page({ entityId: 'https://www.roblox.com/redeem', path: '/blog/redeem/' }),
    page({ path: '/guides/this-game/' }),
  ]);
  assert.equal(links[0].href, '/guides/this-game/');
});

test('a page matching on both counts is listed once', () => {
  const both = page({ entityId: '126884695634066', path: '/guides/only-once/' });
  const links = datasetLinksForGame(robloxGame, [both, both]);
  assert.equal(links.length, 1);
});

test('no more than three dataset links reach a card row', () => {
  const pages = Array.from({ length: 6 }, (_, index) => page({ path: `/guides/page-${index}/` }));
  assert.equal(datasetLinksForGame(robloxGame, pages).length, 3);
});

test('the card description reports rows rather than the unverified summary', () => {
  const [quiet] = datasetLinksForGame(robloxGame, [page({ totalCount: 20, activeCount: 0 })]);
  assert.equal(quiet.description, '20 entries');

  const [live] = datasetLinksForGame(robloxGame, [page({ totalCount: 122, activeCount: 79 })]);
  assert.equal(live.description, '122 entries · 79 active');

  const [single] = datasetLinksForGame(robloxGame, [page({ totalCount: 1, activeCount: 0 })]);
  assert.equal(single.description, '1 entry');
});
