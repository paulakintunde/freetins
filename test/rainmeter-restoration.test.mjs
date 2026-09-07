import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { rainmeterRestorationArticles } from '../src/data/articles/rainmeter-restoration.ts';
import { goneRoutes } from '../src/data/gone.ts';
import { editorialDates } from '../src/lib/editorialDates.ts';
import { belongsToSitemapSection } from '../src/lib/sitemapSection.ts';

test('restored articles have bodies and no competing 410 route', () => {
  assert.ok(rainmeterRestorationArticles.length >= 7);
  for (const article of rainmeterRestorationArticles) {
    assert.equal(article.section, 'blog');
    assert.ok(!goneRoutes.includes(article.path));
    assert.ok(!existsSync(`src/pages${article.path}index.astro`));
    const body = readFileSync(`src/content/articles/${article.contentSlug}.md`, 'utf8');
    assert.ok(body.length > 3000);
    assert.doesNotMatch(body, /\u2014|\bhonest\b/i);
    assert.equal(editorialDates(article).publicationLabel, 'First published in 2016');
    assert.equal(editorialDates(article).schema.datePublished, undefined);
    assert.equal(editorialDates(article).schema.dateModified, '2026-09-06');
    assert.equal(editorialDates(article).updateLabel, 'Updated 6 September 2026');
    assert.ok(existsSync(`src/assets/articles/${article.contentSlug}-article-art.webp`));
    assert.ok(existsSync(`public/og/articles/${article.contentSlug}.jpg`));
    assert.ok(article.related.every((link) => rainmeterRestorationArticles.some((item) => item.path === link.href)));
  }
});

test('a root-level or old guides URL belongs only to its declared blog sitemap', () => {
  const membership = new Map([
    ['/cowan-clock-for-rainmeter/', '/blog/'],
    ['/guides/legacy-example/', '/blog/'],
  ]);
  for (const path of membership.keys()) {
    assert.equal(belongsToSitemapSection(path, '/blog/', membership), true);
    assert.equal(belongsToSitemapSection(path, '/guides/', membership), false);
  }
  assert.equal(belongsToSitemapSection('/guides/ordinary/', '/guides/', membership), true);
  assert.equal(belongsToSitemapSection('/author/paul-a/', '/author/', membership), true);
});
