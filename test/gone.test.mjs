import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
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
  // 15 from the migration review, plus /coding-learn-computing-programming/ — the
  // slug WordPress served the same article at before its title changed — and
  // /category/how-to/, the one archive listing Google is actually holding.
  assert.equal(goneRoutes.length, 17);
  assert.equal(new Set(goneRoutes).size, goneRoutes.length, 'duplicate entry in goneRoutes');
  for (const route of goneRoutes) {
    assert.ok(route.startsWith('/') && route.endsWith('/'), `${route} is not a trailing-slash path`);
  }
});

test('no WordPress archive prefix has a catch-all, so none of them reaches the Function unbounded', () => {
  // These four used to be 410 catch-alls. A catch-all matches an unbounded set of
  // paths, and every match was a metered Function invocation, so `/page/1/` through
  // `/page/9999/` was the one place a crawler could spend the free-plan budget at
  // will. They now fall through to the static 404.html, which costs nothing.
  //
  // What is forbidden is the catch-all, not the prefix directory. The cost being
  // avoided is *unbounded* invocations, and a named leaf like `/category/how-to/`
  // matches exactly one path — `/category/anything-else/` still falls through to
  // the static 404. Such a leaf is listed in `goneRoutes` like any other removed
  // article and is asserted there. Bringing back a real catch-all is still a
  // decision to argue rather than a reflex, and this test is what objects.
  // The reasoning is recorded at `retiredArchivePrefixes` in src/data/gone.ts.
  for (const prefix of retiredArchivePrefixes) {
    assert.ok(prefix.startsWith('/') && prefix.endsWith('/'), `${prefix} is not a trailing-slash prefix`);
    assert.equal(prefix.split('/').filter(Boolean).length, 1, `${prefix} is not a single segment`);

    const directory = `src/pages${prefix}`;
    if (!existsSync(directory)) continue;

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      assert.ok(
        !entry.name.includes('['),
        `${prefix}${entry.name} is a catch-all — see retiredArchivePrefixes in src/data/gone.ts before restoring one`,
      );
      assert.ok(
        entry.isDirectory(),
        `${prefix}${entry.name} answers the bare prefix — only named leaf paths belong here`,
      );
      assert.ok(
        goneRoutes.includes(`${prefix}${entry.name}/`),
        `${prefix}${entry.name}/ has a route but is not in goneRoutes`,
      );
    }
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
