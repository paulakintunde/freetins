import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { platformRestorationArticles } from '../src/data/articles/platform-restoration.ts';
import { goneRoutes } from '../src/data/gone.ts';
import { editorialDates } from '../src/lib/editorialDates.ts';

test('platform restoration articles replace their 410 routes safely', () => {
  assert.equal(platformRestorationArticles.length, 8);
  for (const article of platformRestorationArticles) {
    assert.equal(article.section, 'blog');
    assert.ok(!goneRoutes.includes(article.path));
    assert.ok(!existsSync(`src/pages${article.path}index.astro`));
    const body = readFileSync(`src/content/articles/${article.contentSlug}.md`, 'utf8');
    assert.ok(body.length > 5000);
    assert.doesNotMatch(body, /\u2014|\bhonest\b/i);
    assert.equal(editorialDates(article).publicationLabel, 'First published in 2016');
    assert.equal(editorialDates(article).schema.datePublished, undefined);
    assert.equal(editorialDates(article).schema.dateModified, '2026-09-06');
    assert.equal(editorialDates(article).updateLabel, 'Updated 6 September 2026');
    assert.ok(existsSync(`src/assets/articles/${article.contentSlug}-article-art.webp`));
    assert.ok(existsSync(`public/og/articles/${article.contentSlug}.jpg`));
  }
});

test('JW Player article limits instructions to authorized media access', () => {
  const article = platformRestorationArticles.find((item) => item.routeId === 'jwPlayerAuthorizedVideoDownloads');
  const body = readFileSync(`src/content/articles/${article.contentSlug}.md`, 'utf8');
  assert.match(body, /publisher-provided route/i);
  assert.match(body, /Do not describe|does not describe/i);
  assert.match(body, /Do not enter account credentials into a third-party downloader/i);
  assert.match(body, /Do not solve an authorization failure/i);
});

test('the historical coding slug redirects to the canonical restored article', () => {
  const redirects = readFileSync('public/_redirects', 'utf8');
  assert.match(
    redirects,
    /^\/coding-learn-computing-programming\/\s+\/what-is-coding-learn-computing-programming\/\s+301$/m,
  );
  assert.ok(!existsSync('src/pages/coding-learn-computing-programming/index.astro'));
});

test('Blackmart article does not provide an unidentified download route', () => {
  const article = platformRestorationArticles.find((item) => item.routeId === 'blackmartAlphaSourcesAlternatives');
  const body = readFileSync(`src/content/articles/${article.contentSlug}.md`, 'utf8');
  assert.doesNotMatch(body, /blackmart[^\n]{0,80}https?:\/\//i);
  assert.match(body, /did not establish an authoritative publisher/i);
  assert.match(body, /do not disable Android protections/i);
});
