import assert from 'node:assert/strict';
import test from 'node:test';
import { readCheckerSnapshot } from '../src/lib/checker-status.ts';
import { createOpaqueToken, isOpaqueToken, sha256 } from '../src/lib/security.ts';

test('management tokens are opaque, unique, and stored as hashes', async () => {
  const first = createOpaqueToken();
  const second = createOpaqueToken();

  assert.equal(isOpaqueToken(first), true);
  assert.equal(isOpaqueToken(second), true);
  assert.notEqual(first, second);
  assert.notEqual(await sha256(first), first);
  assert.equal((await sha256(first)).length, 64);
});

test('checker status accepts complete stored snapshots', async () => {
  const stored = {
    state: 'Degraded',
    lastFullRun: '2026-08-22T23:10:00Z',
    pagesChecked: 247,
    medianResponseMs: 184,
    message: 'Checks are twelve minutes behind.',
  };
  const snapshot = await readCheckerSnapshot({
    async get() { return stored; },
  });

  assert.deepEqual(snapshot, { available: true, ...stored });
});

test('checker status reports unavailable instead of inventing data', async () => {
  const snapshot = await readCheckerSnapshot({
    async get() { throw new Error('KV unavailable'); },
  });

  assert.equal(snapshot.available, false);
  assert.equal(snapshot.lastFullRun, 'Unavailable');
  assert.equal(snapshot.pagesChecked, 0);
});
