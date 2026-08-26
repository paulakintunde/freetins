import assert from 'node:assert/strict';
import test from 'node:test';
import { META_DESCRIPTION_LIMIT, clampDescription, datasetMetaDescription } from '../src/lib/metaDescription.ts';

const summary = 'No row on this page is publisher confirmed, so every row displays as Unverified and the active count is zero. '
  + 'Grow a Garden publishes no recipe list on any channel it controls, and the ingredient counts here come from two '
  + 'independent outlets cross checked against the community wiki. Base cook times come from the wiki alone.';

test('the limit is the 155 characters a search snippet shows', () => {
  assert.equal(META_DESCRIPTION_LIMIT, 155);
});

test('a description already within the limit is returned untouched', () => {
  const short = 'Every Grow a Garden recipe with the exact crop count for each food.';
  assert.equal(clampDescription(short), short);
  assert.equal(clampDescription('  spaced   out\n text '), 'spaced out text');
});

test('a long summary is cut at the last sentence end that fits', () => {
  const cut = clampDescription(summary);
  assert.equal(cut, 'No row on this page is publisher confirmed, so every row displays as Unverified and the active count is zero.');
  assert.ok(cut.length <= META_DESCRIPTION_LIMIT);
});

test('a sentence longer than the limit is cut at a word with an ellipsis', () => {
  const run = Array.from({ length: 60 }, (_, index) => `word${index}`).join(' ');
  const cut = clampDescription(run);
  assert.ok(cut.length <= META_DESCRIPTION_LIMIT, `${cut.length} characters`);
  assert.ok(cut.endsWith('…'));
  assert.ok(!cut.includes(' …'), 'no space before the ellipsis');
});

test('a sentence end that would leave a stub is passed over for a word boundary', () => {
  const stub = `Four things. ${Array.from({ length: 60 }, () => 'detail').join(' ')}`;
  const cut = clampDescription(stub);
  assert.notEqual(cut, 'Four things.');
  assert.ok(cut.length <= META_DESCRIPTION_LIMIT);
});

test('nothing longer than the limit ever leaves the clamp', () => {
  for (let length = 0; length < 600; length += 7) {
    const text = 'a'.repeat(length % 23 + 1).concat(' ').repeat(Math.ceil(length / 5));
    assert.ok(clampDescription(text).length <= META_DESCRIPTION_LIMIT, `input of ${text.length} characters`);
  }
});

test('the front-matter description wins, then the summary, then the title', () => {
  assert.equal(datasetMetaDescription({ description: 'Answer first.', unverifiedSummary: summary, title: 'T' }), 'Answer first.');
  assert.equal(datasetMetaDescription({ unverifiedSummary: summary, title: 'T' }), clampDescription(summary));
  assert.equal(datasetMetaDescription({ title: 'T' }), 'T');
  assert.equal(datasetMetaDescription({}), '');
});
