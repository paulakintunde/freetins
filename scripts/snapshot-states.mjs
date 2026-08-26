#!/usr/bin/env node
/*
 * Snapshot of what every page and row displays right now.
 *
 * Written for the Step 1a cutover so the before and after can be compared row
 * by row: docs/adr/0004 promises that existing content keeps its status and
 * that no page is de-indexed, and a promise like that is checked, not assumed.
 * Run before and after a change that touches states or the index gate and diff
 * the two files.
 *
 *   node scripts/snapshot-states.mjs > before.json
 *
 * Dataset rows are resolved by displayState, so the only clock input is a link
 * row's own expiry; every other state is the frozen baseline and the snapshot
 * is the same on any day.
 */

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as ops from '../src/data/operations.ts';
import { normaliseDataset } from '../src/lib/normalise.ts';
import { countStates, displayState, rowTableKind } from '../src/lib/dataset.ts';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const now = Date.now();
const out = { takenAt: new Date(now).toISOString(), games: [], cheatGames: [], datasets: [] };

for (const game of ops.operations.games) {
  // Code games carry codes; daily games carry dailyLinks. Both live in `games`.
  const entries = game.surface === 'daily'
    ? ops.resolveEntries('dailyLink', (ops.operations.dailyLinks ?? []).filter((d) => d.gameSlug === game.slug), now)
    : ops.resolveEntries('code', ops.operations.codes.filter((c) => c.gameSlug === game.slug), now);
  out.games.push({
    slug: game.slug,
    surface: game.surface,
    publicationState: game.publicationState,
    indexable: ops.isIndexable(game, entries),
    entries: entries.map((item) => ({ id: item.entry.id, state: item.state })),
  });
}

for (const game of ops.operations.cheatGames ?? []) {
  const page = ops.getCheatOperationalPage(game.slug, now);
  out.cheatGames.push({
    slug: game.slug,
    publicationState: game.publicationState,
    indexable: page ? ops.isIndexable(game, page.entries) : null,
    entries: (page?.entries ?? []).map((item) => ({ id: item.entry.id, state: item.state })),
  });
}

for (const section of ['guides', 'daily', 'blog']) {
  let files = [];
  try { files = (await readdir(path.join(root, 'src/data', section))).filter((f) => f.endsWith('.json')); } catch { continue; }
  for (const file of files) {
    const slug = file.replace(/\.json$/, '');
    const raw = JSON.parse(await readFile(path.join(root, 'src/data', section, file), 'utf8'));
    const ds = normaliseDataset(raw, slug);
    out.datasets.push({
      page: `${section}/${slug}`,
      counts: countStates(ds.rows, now, ds.tables),
      rows: ds.rows.map((row) => ({ id: row.id, state: displayState(row, now, rowTableKind(row, ds.tables)) })),
    });
  }
}

process.stdout.write(JSON.stringify(out, null, 2) + '\n');
