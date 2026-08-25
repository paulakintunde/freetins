import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { goneRoutePrefixes, goneRoutes } from '../src/data/gone.ts';

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

test('every removed WordPress archive prefix has a catch-all that can return 410', () => {
  for (const prefix of goneRoutePrefixes) {
    const file = `src/pages${prefix}[...slug].astro`;
    assert.ok(existsSync(file), `${prefix} has no catch-all at ${file}`);

    const source = readFileSync(file, 'utf8');
    assert.match(source, /export const prerender = false;/, `${prefix} is prerendered, so it cannot set a status`);
    assert.match(source, /<GonePage variant="archive" \/>/, `${prefix} does not render the archive 410 body`);
  }
});

test('archive prefixes are single segments that shadow no real route', () => {
  // A bare catch-all would swallow every single-segment page on the site. These are
  // safe only because nothing real lives under them, so the day someone wants a
  // /page/ or /tag/ section, this test is the thing that objects.
  const realSegments = new Set(
    readdirSync('src/pages', { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .map((item) => `/${item.name}/`),
  );

  for (const prefix of goneRoutePrefixes) {
    assert.ok(prefix.startsWith('/') && prefix.endsWith('/'), `${prefix} is not a trailing-slash prefix`);
    assert.equal(prefix.split('/').filter(Boolean).length, 1, `${prefix} is not a single segment`);

    // The prefix owns its directory: the only thing in it is the catch-all itself.
    const contents = readdirSync(`src/pages${prefix}`);
    assert.deepEqual(contents, ['[...slug].astro'], `${prefix} holds real pages as well as the catch-all`);
    assert.ok(realSegments.has(prefix), `${prefix} has no directory under src/pages`);
  }
});

test('no archive prefix is also redirected wholesale', () => {
  // A named 301 for one path beneath a prefix is the intended escape hatch. A rule
  // for the bare prefix itself is not: first match wins, so it would outrank the 410.
  const redirects = readFileSync('public/_redirects', 'utf8')
    .split('\n')
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .map((line) => line.trim().split(/\s+/)[0]);

  for (const prefix of goneRoutePrefixes) {
    assert.ok(!redirects.includes(prefix), `${prefix} is both redirected and marked gone`);
  }
});
