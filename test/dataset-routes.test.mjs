import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { datasetBackedPaths, datasetSections } from '../src/data/datasetRoutes.ts';

/*
 * These cover the helper's contract with the disk. The invariant it exists to
 * protect — that a dataset-backed page is never excluded from the sitemap by a
 * stale route-table entry — is enforced on every build by scripts/check-routes.mjs,
 * which compares emitted HTML against the emitted sitemap in both directions. It
 * cannot be asserted here: routes.ts reaches astro:content through extension-less
 * imports that the node test runner cannot resolve.
 */

test('every dataset-backed path has the prose file it was derived from', () => {
  for (const path of datasetBackedPaths()) {
    const [, section, slug] = path.split('/');
    assert.ok(datasetSections.includes(section), `${path} is not in a dataset section`);
    assert.ok(
      existsSync(`src/content/${section}/${slug}.md`),
      `${path} has no prose file at src/content/${section}/${slug}.md`,
    );
  }
});

test('paths are trailing-slash, matching the route table they are compared against', () => {
  // The comparison in astro.config.mjs is a Set lookup against RouteDefinition.path.
  // A missing or extra slash would make it silently never match, which is the exact
  // failure mode this helper exists to prevent.
  for (const path of datasetBackedPaths()) {
    assert.ok(path.startsWith('/') && path.endsWith('/'), `${path} is not a trailing-slash path`);
    assert.equal(path.split('/').filter(Boolean).length, 2, `${path} is not /<section>/<slug>/`);
  }
});

test('only prose files become paths', () => {
  // The dataset JSON lives in a sibling directory, but a stray .json or .DS_Store
  // in the prose directory must not become a URL.
  for (const path of datasetBackedPaths()) {
    assert.ok(!path.includes('.'), `${path} looks like a filename rather than a route`);
  }
});

test('a missing section directory is a normal state, not a throw', () => {
  // Sections are populated one batch at a time. Reading from a root with no content
  // directories at all must return nothing rather than fail the build.
  assert.deepEqual(datasetBackedPaths('test/__no_such_root__'), []);
});
