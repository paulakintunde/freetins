import assert from 'node:assert/strict';
import test from 'node:test';
import { normalize, prepareRecords, searchRecords, tokenize, validateSearchIndex } from '../src/lib/search.ts';

const records = [
  {
    path: '/codes/grow-a-garden/',
    title: 'Grow a Garden codes',
    group: 'Codes',
    description: 'Working Grow a Garden codes with source URLs and recorded checks.',
    keywords: ['Grow a Garden', 'Roblox', 'codes', 'redeem'],
  },
  {
    path: '/codes/grow-a-garden/values/',
    title: 'Grow a Garden item values',
    group: 'Item values',
    description: 'Sourced Grow a Garden item values with observation times.',
    keywords: ['Grow a Garden', 'values', 'trading'],
  },
  {
    path: '/daily/monopoly-go/',
    title: 'Monopoly GO reward links',
    group: 'Daily links',
    description: 'Monopoly GO daily reward links with source URLs.',
    keywords: ['Monopoly GO', 'daily', 'free dice', 'reward links'],
  },
  {
    path: '/codes/sols-rng/',
    title: "Sol's RNG codes",
    group: 'Codes',
    description: "Sol's RNG codes with sources.",
    keywords: ["Sol's RNG", 'Roblox'],
  },
];

test('normalization folds case, diacritics and apostrophes', () => {
  assert.equal(normalize("Sol's RNG"), 'sols rng');
  assert.equal(normalize('Pokémon Emerald!'), 'pokemon emerald');
  assert.deepEqual(tokenize('  Grow   a Garden  '), ['grow', 'a', 'garden']);
  assert.deepEqual(tokenize('   '), []);
});

test('an exact title match ranks first', () => {
  const results = searchRecords(records, 'grow a garden codes');
  assert.equal(results[0].record.path, '/codes/grow-a-garden/');
});

test('a shared game name returns both of its pages, codes before values', () => {
  const results = searchRecords(records, 'grow a garden');
  const paths = results.map((result) => result.record.path);
  assert.deepEqual(paths, ['/codes/grow-a-garden/', '/codes/grow-a-garden/values/']);
});

test('an apostrophe in the query still matches the indexed title', () => {
  assert.equal(searchRecords(records, "sol's rng")[0].record.path, '/codes/sols-rng/');
  assert.equal(searchRecords(records, 'sols rng')[0].record.path, '/codes/sols-rng/');
});

test('prefix typing matches before the word is finished', () => {
  assert.equal(searchRecords(records, 'monop')[0].record.path, '/daily/monopoly-go/');
});

test('keywords reach pages whose title does not carry the word', () => {
  assert.equal(searchRecords(records, 'trading')[0].record.path, '/codes/grow-a-garden/values/');
});

test('records matching every term outrank partial matches', () => {
  const results = searchRecords(records, 'garden values');
  assert.equal(results[0].record.path, '/codes/grow-a-garden/values/');
});

test('a query with no match anywhere returns nothing', () => {
  assert.deepEqual(searchRecords(records, 'zzzznotagame'), []);
});

test('an empty or whitespace query returns nothing rather than everything', () => {
  assert.deepEqual(searchRecords(records, ''), []);
  assert.deepEqual(searchRecords(records, '   '), []);
});

test('the limit is honoured', () => {
  assert.equal(searchRecords(records, 'codes', { limit: 1 }).length, 1);
});

test('prepared records can be reused across queries', () => {
  const prepared = prepareRecords(records);
  assert.equal(searchRecords(prepared, 'monopoly')[0].record.path, '/daily/monopoly-go/');
  assert.equal(searchRecords(prepared, 'values')[0].record.path, '/codes/grow-a-garden/values/');
});

test('the index validator accepts a well-formed index', () => {
  assert.doesNotThrow(() => validateSearchIndex(records));
  assert.equal(validateSearchIndex(records).length, records.length);
});

test('the index validator rejects an empty index', () => {
  assert.throws(() => validateSearchIndex([]), /empty/);
});

test('the index validator rejects a duplicate path', () => {
  assert.throws(() => validateSearchIndex([...records, records[0]]), /indexed twice/);
});

test('the index validator rejects a non-directory path', () => {
  const broken = [{ ...records[0], path: '/codes/grow-a-garden' }];
  assert.throws(() => validateSearchIndex(broken), /absolute directory path/);
});

test('the index validator rejects a record with no title or description', () => {
  assert.throws(() => validateSearchIndex([{ ...records[0], title: '  ' }]), /no title/);
  assert.throws(() => validateSearchIndex([{ ...records[0], description: '' }]), /no description/);
  assert.throws(() => validateSearchIndex([{ ...records[0], title: '!!!' }]), /no searchable term/);
});
