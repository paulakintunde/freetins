import assert from 'node:assert/strict';
import test from 'node:test';
import { faqAnswerText } from '../src/lib/faqAnswer.ts';

test('inline tags come off, and the sentence is unchanged', () => {
  assert.equal(
    faqAnswerText('Type <code>motherlode</code> for 50,000 Simoleons.'),
    'Type motherlode for 50,000 Simoleons.',
  );
  assert.equal(faqAnswerText('<strong>Yes</strong>, but <em>only</em> temporarily.'), 'Yes, but only temporarily.');
});

test('a link keeps its text and loses its markup', () => {
  assert.equal(
    faqAnswerText('Browse our <a href="/codes/">redeem codes hub</a> for more.'),
    'Browse our redeem codes hub for more.',
  );
});

test('escaped angle brackets come back as themselves', () => {
  // The Minecraft answers are the reason this exists: `<target>` is command syntax a
  // parser should quote literally, not a tag that should vanish with its contents.
  assert.equal(
    faqAnswerText('The syntax is <code>/give &lt;target&gt; &lt;item&gt;</code>.'),
    'The syntax is /give <target> <item>.',
  );
});

test('entities are decoded after tags are stripped, never before', () => {
  // Decoding first would turn `&lt;code&gt;` into a real tag and then strip it,
  // silently deleting text the author escaped on purpose.
  assert.equal(faqAnswerText('Write &lt;code&gt;x&lt;/code&gt; to show the tag.'), 'Write <code>x</code> to show the tag.');
  assert.equal(faqAnswerText('Tom &amp; Jerry said &quot;hi&quot;.'), 'Tom & Jerry said "hi".');
});

test('plain text passes through, which is what the existing answers are', () => {
  const plain = 'Documents > Rockstar Games > GTA V > User Music';
  assert.equal(faqAnswerText(plain), plain);
});

test('whitespace is collapsed so a wrapped answer is one sentence', () => {
  assert.equal(faqAnswerText('One   two\n  three '), 'One two three');
});
