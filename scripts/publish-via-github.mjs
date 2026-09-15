#!/usr/bin/env node
// Publish exactly one due article through the existing GitHub → Cloudflare link.
import { readFile, writeFile, rename, open, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { nextPublication } from './lib/publication-schedule.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));
const folder = join(root, 'docs/publication/september-2026');
const stateFile = join(folder, 'releases.json');
const plan = JSON.parse(await readFile(join(folder, 'schedule.json'), 'utf8'));
const repository = 'paulakintunde/freetins';
const env = { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', WRANGLER_SEND_METRICS: 'false' };
delete env.FREETINS_FULL_CONTENT_REVIEW;
function run(binary, args, quiet = false) {
  return new Promise((accept, reject) => {
    const child = spawn(binary, args, { cwd: root, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', data => { output += data; if (!quiet) process.stdout.write(data); });
    child.stderr.on('data', data => { if (!quiet) process.stderr.write(data); });
    child.on('error', reject);
    child.on('close', code => code === 0 ? accept(output.trim()) : reject(new Error(binary + ' exited ' + code)));
  });
}
const save = async state => {
  await writeFile(stateFile + '.tmp', JSON.stringify(state, null, 2) + '\n');
  await rename(stateFile + '.tmp', stateFile);
};
const gh = process.platform === 'win32' ? 'gh.exe' : 'gh';
async function cloudflareCheck(sha) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const data = JSON.parse(await run(gh, ['api', 'repos/' + repository + '/commits/' + sha + '/check-runs'], true));
    const check = data.check_runs.find(row => row.name === 'Cloudflare Pages');
    if (check?.status === 'completed') {
      if (check.conclusion !== 'success') throw new Error('Cloudflare deployment ' + check.conclusion + ': ' + check.details_url);
      return check;
    }
    if (attempt % 2 === 0) console.log('Waiting for Cloudflare Pages deployment of', sha.slice(0, 8));
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
  throw new Error('Cloudflare check timed out; reconcile pendingDeployment before retrying');
}
const lockFile = join(folder, 'publisher.lock');
const lock = await open(lockFile, 'wx').catch(() => { throw new Error('Publisher lock exists; inspect the prior process'); });
try {
  let state = JSON.parse(await readFile(stateFile, 'utf8'));
  let decision = nextPublication(plan, state);
  if (!decision.item) console.log(decision.reason);
  else {
    if ((await run('git', ['diff', '--cached', '--name-only'], true)).length) throw new Error('User-staged changes exist; leave them intact');
    await run('git', ['fetch', 'origin', 'main']);
    await run('git', ['merge', '--ff-only', 'origin/main']);
    // Re-read after fast-forward so another confirmed release is never lost.
    state = JSON.parse(await readFile(stateFile, 'utf8'));
    decision = nextPublication(plan, state);
    if (!decision.item) throw new Error(decision.reason);
    await run(process.execPath, ['scripts/publish-scheduled.mjs', '--prepare', '--through=' + decision.item.slug, '--build']);
    state.pendingDeployment = { slug: decision.item.slug, path: decision.item.path, slot: decision.slot, startedAt: new Date().toISOString(), transport: 'github' };
    await save(state);
    const item = decision.item;
    const targets = ['docs/publication/september-2026/releases.json'];
    if (item.kind === 'dataset') targets.push('src/content/' + item.section + '/' + item.slug + '.md', 'src/data/' + item.section + '/' + item.slug + '.json');
    else if (item.kind === 'editorial') targets.push('src/content/articles/' + item.slug + '.md', 'src/data/articles/september-expansion.ts');
    else targets.push('src/content/codes/anime-ranger-x.md', 'src/content/operations.json');
    await run('git', ['add', '--', ...targets]);
    await run('git', ['commit', '-m', 'content: publish ' + item.slug + ' in scheduled slot']);
    const sha = await run('git', ['rev-parse', 'HEAD'], true);
    await run('git', ['push', 'origin', 'HEAD:main']);
    const check = await cloudflareCheck(sha);
    const liveUrl = 'https://www.freetins.com' + item.path;
    const response = await fetch(liveUrl, { signal: AbortSignal.timeout(30000), cache: 'no-store' });
    if (!response.ok || !(await response.text()).includes(item.path)) throw new Error('Live page could not be confirmed: ' + liveUrl);
    state.releases.push({ ...state.pendingDeployment, commit: sha, deploymentUrl: check.details_url, publishedAt: check.completed_at });
    state.pendingDeployment = null;
    await save(state);
    await run('git', ['add', '--', 'docs/publication/september-2026/releases.json']);
    await run('git', ['commit', '-m', 'content: record Cloudflare publication of ' + item.slug]);
    await run('git', ['push', 'origin', 'HEAD:main']);
    await cloudflareCheck(await run('git', ['rev-parse', 'HEAD'], true));
    console.log('Published and confirmed:', liveUrl);
  }
} finally {
  await lock.close();
  await rm(lockFile);
}
