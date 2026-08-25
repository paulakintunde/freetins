import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { goneRoutes } from '../src/data/gone.ts';

const pageFileFor = (route) => `src/pages${route}index.astro`;

test('every deliberately removed URL has a route that can return 410', () => {
  for (const route of goneRoutes) {
    const file = pageFileFor(route);
    assert.ok(existsSync(file), `${route} has no page at ${file}`);

    const source = readFileSync(file, 'utf8');
    // Without `prerender = false` Astro emits static HTML and the status is fixed at
    // 200 — the page would look right and be wrong in the only way that matters.
    assert.match(source, /export const prerender = false;/, `${route} is prerendered, so it cannot set a status`);
    assert.match(source, /<GonePage \/>/, `${route} does not render the 410 body`);
  }
});

test('GonePage sets 410 and keeps itself out of the index', () => {
  const source = readFileSync('src/components/pages/GonePage.astro', 'utf8');
  assert.match(source, /Astro\.response\.status = 410;/);
  assert.match(source, /X-Robots-Tag/);
});

test('no removed URL is also redirected', () => {
  // A 301 would turn a deliberate removal into a soft 404. First match wins in
  // `_redirects`, so a stray entry here would silently outrank the 410 route.
  const redirects = readFileSync('public/_redirects', 'utf8')
    .split('\n')
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .map((line) => line.trim().split(/\s+/)[0]);

  for (const route of goneRoutes) {
    assert.ok(!redirects.includes(route), `${route} is both redirected and marked gone`);
  }
});

test('the removal list matches the count the migration review recorded', () => {
  assert.equal(goneRoutes.length, 15);
  assert.equal(new Set(goneRoutes).size, goneRoutes.length, 'duplicate entry in goneRoutes');
  for (const route of goneRoutes) {
    assert.ok(route.startsWith('/') && route.endsWith('/'), `${route} is not a trailing-slash path`);
  }
});
