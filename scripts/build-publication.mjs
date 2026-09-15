#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { cp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const root = fileURLToPath(new URL('..', import.meta.url));
const env = { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', WRANGLER_SEND_METRICS: 'false', WRANGLER_LOG_PATH: join(root, 'output/wrangler-logs') };
async function node(args) {
  await new Promise((accept, reject) => {
    const child = spawn(process.execPath, args, { cwd: root, env, windowsHide: true, stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', code => code === 0 ? accept() : reject(new Error('Build exited ' + code)));
  });
}
const queueFile = join(root, 'docs/publication/september-2026/schedule.json');
if (existsSync(queueFile) && env.FREETINS_FULL_CONTENT_REVIEW !== '1' && !existsSync(join(root, '.publication-stage.json'))) {
  await node(['scripts/publish-scheduled.mjs', '--prepare', '--build']);
  // The deployment providers keep their existing build command and dist output.
  await rm(join(root, 'dist'), { recursive: true, force: true });
  await cp(join(root, 'output/publication/site/dist'), join(root, 'dist'), { recursive: true });
  await cp(join(root, 'output/publication/site/src/data/route-rendering.json'), join(root, 'src/data/route-rendering.json'));
} else {
  await node(['node_modules/astro/astro.js', 'check', '--minimumFailingSeverity', 'warning']);
  await node(['scripts/check-operational-data.mjs']);
  await node(['--test', 'test/*.test.mjs']);
  await node(['scripts/check-content.mjs', '--strict']);
  await node(['scripts/check-vocabulary.mjs', '--strict']);
  await node(['node_modules/astro/astro.js', 'build']);
  await node(['scripts/check-routes.mjs']);
}
