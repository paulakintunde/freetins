import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildProfile,
  extract,
  scoreCandidate,
  spotCandidates,
  toText,
} from '../src/lib/extract-codes.ts';

/*
 * The extractor is a collector, never evidence: nothing it accepts is published
 * without an editor. These tests pin the behaviour that makes it measurable —
 * what it spots, how a game's own codes shape the score, and which noise it
 * refuses — so a change to the scorer shows up here before it shows up in an
 * editor's inbox. Every case runs offline against literal HTML.
 */

const upperProfile = buildProfile('anime-card-clash', [
  'DRAGONBALL1', 'ARTCONTEST', 'COMMUNITY1', 'CHAINSAW1', 'CHAINSAW2',
]);

const lowerProfile = buildProfile('99-nights-in-the-forest', ['afterparty', 'happyhalloween']);

test('an empty profile is weak, not wrong', () => {
  const profile = buildProfile('unknown', []);
  assert.equal(profile.sampleSize, 0);
  assert.equal(profile.minLength, 3);
  assert.equal(profile.maxLength, 30);
  assert.equal(profile.upperRatio, 0);
  assert.equal(profile.hasDigit, false);
});

test('a profile learns the shape of the codes it is given', () => {
  const profile = buildProfile('king-legacy', ['UPDATE_84', 'SEASON_18', 'PIRATE_SZN']);
  assert.equal(profile.hasUnderscore, true);
  assert.equal(profile.hasUpper, true);
  assert.equal(profile.hasLower, false);
  assert.equal(profile.upperRatio, 1);
  assert.ok(profile.minLength <= 9 && profile.maxLength >= 10);
});

test('one 52-character outlier cannot widen the profile to accept sentences', () => {
  const codes = Array.from({ length: 20 }, () => 'ABCDEFGH');
  codes.push('A'.repeat(52));
  const profile = buildProfile('outlier', codes);
  assert.equal(profile.minLength, 8);
  assert.equal(profile.maxLength, 12);
});

test('toText strips markup and decodes the entities that appear inside code text', () => {
  const text = toText('<p>Use code <strong>BEES10</strong> &amp; enjoy</p>');
  assert.match(text, /BEES10/);
  assert.match(text, /&/);
  assert.doesNotMatch(text, /</);
});

test('candidate spotting records every cue that drew attention to a token', () => {
  const html = [
    '<ul><li>DRAGONBALL3 – 5 gems</li></ul>',
    '<p>Use code: <strong>SPOOKYSEASON</strong></p>',
    '<h2>ACTIVE CODES</h2>',
  ].join('');
  const found = spotCandidates(html);

  assert.ok(found.has('SPOOKYSEASON'));
  assert.ok(found.get('SPOOKYSEASON').has('emphasis'));
  assert.ok(found.get('SPOOKYSEASON').has('phrase'));
  assert.ok(found.get('SPOOKYSEASON').has('uppercase-run'));

  assert.ok(found.has('DRAGONBALL3'));
  assert.ok(found.get('DRAGONBALL3').has('list-item'));
  assert.ok(found.get('DRAGONBALL3').has('uppercase-run'));
});

test('an emphasised token that fits the game profile is accepted', () => {
  const candidate = scoreCandidate('BLACKCLOVER7', new Set(['emphasis']), upperProfile);
  assert.equal(candidate.score, 63);
  assert.equal(candidate.accepted, true);
  assert.equal(candidate.rejectedBecause, undefined);
});

test('two independent cues outrank one', () => {
  const one = scoreCandidate('RETURNOFKINGS', new Set(['uppercase-run']), upperProfile);
  const two = scoreCandidate('JOJOUPDATE5', new Set(['list-item', 'uppercase-run']), upperProfile);
  assert.equal(one.accepted, false);
  assert.equal(two.score, 68);
  assert.equal(two.accepted, true);
});

test('table furniture in bold is refused when the game never uses spaces', () => {
  const candidate = scoreCandidate('Expired Code', new Set(['emphasis']), upperProfile);
  assert.equal(candidate.score, 20);
  assert.equal(candidate.accepted, false);
});

test('stopwords, handles and out-of-range lengths are rejected with a stated reason', () => {
  assert.equal(scoreCandidate('CODES', new Set(['uppercase-run']), upperProfile).rejectedBecause, 'stopword');
  assert.equal(scoreCandidate('discord.gg/abc', new Set(['emphasis']), upperProfile).rejectedBecause, 'looks like a URL or handle');
  assert.match(scoreCandidate('AB', new Set(['emphasis']), upperProfile).rejectedBecause, /^length 2 outside/);
});

test('a profile learned from two codes is trusted less than one learned from many', () => {
  const single = scoreCandidate('yayfishing', new Set(['emphasis']), lowerProfile);
  assert.equal(single.score, 40);
  assert.equal(single.accepted, false);

  const corroborated = scoreCandidate('yayfishing', new Set(['emphasis', 'phrase']), lowerProfile);
  assert.equal(corroborated.score, 90);
  assert.equal(corroborated.accepted, true);
});

test('extraction keeps its rejects and sorts by score', () => {
  const html = [
    '<ul><li>DRAGONBALL3 – 5 gems</li></ul>',
    '<p>Use code: <strong>SPOOKYSEASON</strong></p>',
    '<h2>ACTIVE CODES</h2>',
  ].join('');
  const results = extract(html, upperProfile);

  assert.equal(results[0].token, 'SPOOKYSEASON');
  assert.equal(results[0].accepted, true);

  const dragonball = results.find((item) => item.token === 'DRAGONBALL3');
  assert.equal(dragonball.accepted, true);

  const stopwords = results.filter((item) => item.rejectedBecause === 'stopword').map((item) => item.token);
  assert.ok(stopwords.includes('CODES'));
  assert.ok(stopwords.includes('ACTIVE'));

  for (let index = 1; index < results.length; index += 1) {
    assert.ok(results[index - 1].score >= results[index].score);
  }
});
