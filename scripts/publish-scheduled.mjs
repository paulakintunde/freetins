#!/usr/bin/env node
// Isolated release builds leave the complete editorial workspace intact.
import { cp, mkdir, readFile, readdir, writeFile, rename, rm, open, access } from 'node:fs/promises';
import { resolve, join, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { nextPublication, stripPendingLinks } from './lib/publication-schedule.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));
const folder = join(root, 'docs/publication/september-2026');
const stateFile = join(folder, 'releases.json');
const plan = JSON.parse(await readFile(join(folder, 'schedule.json'), 'utf8'));
const readState = async () => JSON.parse(await readFile(stateFile, 'utf8'));
const saveState = async state => {
  await writeFile(stateFile + '.tmp', JSON.stringify(state, null, 2) + '\n');
  await rename(stateFile + '.tmp', stateFile);
};
const args = new Set(process.argv.slice(2));
const argument = name => process.argv.find(arg => arg.startsWith(name + '='))?.slice(name.length + 1);
const stage = join(root, 'output/publication/site');
const env = { ...process.env, FREETINS_ASSET_CACHE: join(root, 'node_modules/.astro'), ASTRO_TELEMETRY_DISABLED: '1', WRANGLER_SEND_METRICS: 'false', WRANGLER_LOG_PATH: join(root, 'output/wrangler-logs') };
delete env.FREETINS_FULL_CONTENT_REVIEW;
async function run(binary, argv, cwd = stage) {
  return new Promise((accept, reject) => {
    const child = spawn(binary, argv, { cwd, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let result = '';
    child.stdout.on('data', data => { result += data; process.stdout.write(data); });
    child.stderr.on('data', data => { result += data; process.stderr.write(data); });
    child.on('error', reject);
    child.on('close', code => code === 0 ? accept(result) : reject(new Error(binary + ' exited ' + code)));
  });
}
const node = (argv, cwd) => run(process.execPath, argv, cwd);
const wrangler = join(root, 'node_modules/wrangler/bin/wrangler.js');
const astro = join(root, 'node_modules/astro/astro.js');

async function prepare(included, ledger) {
  // One native filesystem API, checked absolute destination, never a computed shell deletion.
  const expected = resolve(root, 'output/publication/site');
  const within = relative(resolve(root, 'output/publication'), expected);
  if (!within || within.startsWith('..') || isAbsolute(within) || resolve(stage) !== expected) throw new Error('Unsafe staging path');
  await rm(stage, { recursive: true, force: true });
  await mkdir(stage, { recursive: true });
  for (const name of ['src', 'public', 'scripts', 'test', 'docs', 'astro.config.mjs', 'tsconfig.json', 'package.json', 'wrangler.toml']) {
    await cp(join(root, name), join(stage, name), { recursive: true });
  }
  await writeFile(join(stage, '.publication-stage.json'), JSON.stringify({ included: [...included] }));
  const pending = plan.items.filter(item => item.kind !== 'operational' && !included.has(item.slug));
  const pendingPaths = new Set(pending.map(item => item.path));
  for (const item of pending) {
    const contentSection = item.kind === 'editorial' ? 'articles' : item.section;
    await rm(join(stage, 'src/content', contentSection, item.slug + '.md'));
    if (item.kind === 'dataset') await rm(join(stage, 'src/data', item.section, item.slug + '.json'));
  }
  const editorialFile = join(stage, 'src/data/articles/september-expansion.ts');
  const editorialSource = await readFile(editorialFile, 'utf8');
  const articles = JSON.parse(editorialSource.slice(editorialSource.indexOf('= [') + 2).trim().replace(/;$/, ''));
  const shippedArticles = articles.filter(article => included.has(article.contentSlug)).map(article => ({
    ...article,
    ...(ledger.releases.find(row => row.slug === article.contentSlug)?.publishedAt
      ? { publishedAt: ledger.releases.find(row => row.slug === article.contentSlug).publishedAt } : {}),
    related: article.related.filter(link => !pendingPaths.has(link.href)),
  }));
  // Unquoted path keys remain visible to the repository's source-based route checker.
  await writeFile(editorialFile, "import type { EditorialArticle } from './types';\nexport const septemberExpansionArticles: EditorialArticle[] = " +
    JSON.stringify(shippedArticles, null, 2).replace(/"path":/g, 'path:') + ';\n');
  for (const section of ['blog', 'guides', 'articles']) {
    const dir = join(stage, 'src/content', section);
    for (const file of await readdir(dir)) if (file.endsWith('.md')) {
      const target = join(dir, file);
      await writeFile(target, stripPendingLinks(await readFile(target, 'utf8'), pendingPaths));
    }
  }
  if (!included.has('re-rangers-x-codes')) {
    await cp(join(folder, 're-rangers-baseline.md'), join(stage, 'src/content/codes/anime-ranger-x.md'));
    const operationsFile = join(stage, 'src/content/operations.json');
    const operations = JSON.parse(await readFile(operationsFile, 'utf8'));
    operations.codes = operations.codes.filter(row => !row.id.startsWith('anime-ranger-x-sept-'));
    await writeFile(operationsFile, JSON.stringify(operations, null, 2) + '\n');
    const imageFile = join(stage, 'src/data/site-images.ts');
    await writeFile(imageFile, (await readFile(imageFile, 'utf8')).replace(/^.*\/\/ september-rangers-art.*\r?\n/gm, ''));
  }
  console.log('Prepared release copy:', stage, [...included].join(', '));
}
async function build() {
  await node([astro, 'check', '--root', stage, '--minimumFailingSeverity', 'warning'], root);
  await node(['scripts/check-operational-data.mjs']);
  await node(['--test', 'test/*.test.mjs']);
  await node(['scripts/check-content.mjs', '--strict']);
  await node(['scripts/check-vocabulary.mjs', '--strict']);
  await node([astro, 'build', '--root', stage], root);
  await node(['scripts/check-routes.mjs']);
}
const ledger = await readState();
if (args.has('--plan')) {
  console.log(JSON.stringify({ ...nextPublication(plan, ledger), remaining: plan.items.filter(item => !ledger.releases.some(row => row.slug === item.slug)) }, null, 2));
} else if (args.has('--prepare')) {
  const through = argument('--through');
  const index = through ? plan.items.findIndex(item => item.slug === through) : -1;
  if (through && index < 0) throw new Error('Unknown --through slug');
  const included = new Set([...ledger.releases.map(row => row.slug), ...(ledger.pendingDeployment?.transport === 'github' ? [ledger.pendingDeployment.slug] : []), ...plan.items.slice(0, index + 1).map(item => item.slug)]);
  await prepare(included, ledger);
  if (args.has('--build')) await build();
} else if (args.has('--publish')) {
  if (process.env.FREETINS_FULL_CONTENT_REVIEW) throw new Error('Clear full-review mode before publishing');
  const lockFile = join(folder, 'publisher.lock');
  const lock = await open(lockFile, 'wx').catch(() => { throw new Error('Publisher lock exists; inspect the prior process before removing it'); });
  try {
    const state = await readState();
    const decision = nextPublication(plan, state);
    if (!decision.item) console.log(decision.reason);
    else {
      const auth = await node([wrangler, 'whoami'], root);
      if (/not logged in|token has expired/i.test(auth)) throw new Error('Cloudflare login is required');
      const included = new Set([...state.releases.map(row => row.slug), decision.item.slug]);
      await prepare(included, state);
      await build();
      // An atomic journal prevents another wake from blindly retrying an uncertain upload.
      state.pendingDeployment = { slug: decision.item.slug, path: decision.item.path, slot: decision.slot, startedAt: new Date().toISOString() };
      await saveState(state);
      const output = await node([wrangler, 'pages', 'deploy', 'dist', '--project-name', plan.project, '--branch', plan.branch, '--commit-dirty=true']);
      const urls = output.match(/https:\/\/[a-z0-9-]+\.freetins\.pages\.dev/g);
      if (!urls?.length) throw new Error('Deployment returned no identifiable URL; reconcile pendingDeployment');
      const deploymentUrl = urls[0];
      const response = await fetch(deploymentUrl + decision.item.path, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error('Uploaded page needs reconciliation: HTTP ' + response.status);
      const html = await response.text();
      if (!html.includes('rel="canonical"') || !html.includes(decision.item.path)) throw new Error('Uploaded page identity needs reconciliation');
      state.releases.push({ ...state.pendingDeployment, deploymentUrl, publishedAt: new Date().toISOString() });
      state.pendingDeployment = null;
      await saveState(state);
      console.log('Published', decision.item.slug, deploymentUrl + decision.item.path);
    }
  } finally { await lock.close(); await rm(lockFile); }
} else {
  console.log('Use --plan, --prepare [--through=SLUG] [--build], or --publish. Preparation never deploys.');
}
