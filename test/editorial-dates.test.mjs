import assert from 'node:assert/strict';
import test from 'node:test';
import { editorialDates } from '../src/lib/editorialDates.ts';

test('a historical year creates a visible label without inventing a publication day', () => {
  const dates = editorialDates({ publishedYear: 2016 });
  assert.equal(dates.publicationLabel, 'First published in 2016');
  assert.deepEqual(dates.schema, {});
  assert.equal(dates.feedDate, undefined);
  assert.equal(dates.updateLabel, undefined);
  assert.equal(dates.reviewLabel, undefined);
});

test('an actual posting date supplies modification metadata without a review claim', () => {
  const dates = editorialDates({ publishedYear: 2016, modifiedAt: '2026-09-06' });
  assert.deepEqual(dates.schema, { dateModified: '2026-09-06' });
  assert.equal(dates.updateLabel, 'Updated 6 September 2026');
  assert.equal(dates.feedDate, '2026-09-06');
  assert.equal(dates.reviewLabel, undefined);
});

test('existing publication and review behavior remains unchanged', () => {
  const dates = editorialDates({
    publishedAt: '2025-06-08', reviewedAt: '2026-08-23',
    reviewLabel: 'Reviewed 23 August 2026',
  });
  assert.deepEqual(dates.schema, { datePublished: '2025-06-08', dateModified: '2026-08-23' });
  assert.equal(dates.feedDate, '2025-06-08');
  assert.equal(dates.reviewLabel, 'Reviewed 23 August 2026');
  assert.equal(dates.publicationLabel, undefined);
});

test('explicit posting dates remain separate from subsequent product reviews', () => {
  const dates = editorialDates({ modifiedAt: '2026-09-06', reviewedAt: '2026-09-08' });
  assert.equal(dates.schema.dateModified, '2026-09-06');
  assert.equal(dates.updateLabel, 'Updated 6 September 2026');
  assert.equal(editorialDates({ modifiedAt: '2026-09-06', reviewedAt: '2026-08-23' })
    .schema.dateModified, '2026-09-06');
});

test('invalid, conflicting, and incomplete dates are rejected', () => {
  for (const value of ['2016', '2026-02-30', 'not-a-date']) {
    assert.throws(() => editorialDates({ publishedAt: value }), /Invalid editorial date/);
  }
  assert.throws(() => editorialDates({ publishedYear: 2016.5 }), /four digits/);
  assert.throws(() => editorialDates({ publishedYear: 2016, publishedAt: '2017-01-01' }), /disagree/);
  assert.throws(() => editorialDates({ publishedYear: 2016, modifiedAt: '2015-12-31' }), /predates/);
});

test('displayed dates preserve the posting calendar day when a timezone is supplied', () => {
  assert.equal(editorialDates({ modifiedAt: '2026-09-06T23:30:00-07:00' }).updateLabel,
    'Updated 6 September 2026');
});
