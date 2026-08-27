import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { goneRoutes, retiredArchivePrefixes } from '../src/data/gone.ts';

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

test('no WordPress archive prefix has a route, so none of them reaches the Function', () => {
  // These four used to be 410 catch-alls. A catch-all matches an unbounded set of
  // paths, and every match was a metered Function invocation, so `/page/1/` through
  // `/page/9999/` was the one place a crawler could spend the free-plan budget at
  // will. They now fall through to the static 404.html, which costs nothing.
  //
  // This test is the thing that objects if one comes back. Reinstating a catch-all
  // is a real option — it buys faster de-indexing — but it re-opens an uncapped
  // metered surface, so it has to be an argued decision rather than a reflex.
  // The reasoning is recorded at `retiredArchivePrefixes` in src/data/gone.ts.
  for (const prefix of retiredArchivePrefixes) {
    assert.ok(prefix.startsWith('/') && prefix.endsWith('/'), `${prefix} is not a trailing-slash prefix`);
    assert.equal(prefix.split('/').filter(Boolean).length, 1, `${prefix} is not a single segment`);
    assert.ok(
      !existsSync(`src/pages${prefix}`),
      `${prefix} has a route again — see retiredArchivePrefixes in src/data/gone.ts before restoring it`,
    );
  }
});

test('a retired archive prefix is not redirected wholesale either', () => {
  // Falling through to a 404 is the decision. A 301 for the bare prefix would send a
  // whole archive surface to one hub, which is the soft-404 pattern `_redirects`
  // already refuses for the removed topics. A named 301 for one path *beneath* a
  // prefix stays the intended escape hatch — first match wins, so it still works.
  const redirects = readFileSync('public/_redirects', 'utf8')
    .split('\n')
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .map((line) => line.trim().split(/\s+/)[0]);

  for (const prefix of retiredArchivePrefixes) {
    assert.ok(!redirects.includes(prefix), `${prefix} is redirected wholesale`);
  }
});
