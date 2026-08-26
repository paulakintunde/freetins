import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/*
 * The reader-report ordering guard.
 *
 * `services.reports.enabled` decides at build time whether the reader control is
 * rendered at all; the endpoint it posts to cannot answer without a REPORTS KV
 * binding and a REPORT_SECRET. Set the flag ahead of the binding and every code
 * row grows a control whose every click answers 503 — a dead control, not a
 * degraded one — and nothing in the data, the types or the build relates the two
 * halves.
 *
 * Only one half is visible from here. wrangler.toml is in the repository and can
 * be read. Whether the namespace exists on the Cloudflare account, and whether
 * REPORT_SECRET is set on the Pages project, cannot be read from here at all. So
 * this checks the half it can and says plainly what it cannot, rather than
 * passing and leaving the impression that the whole configuration was verified.
 */

/**
 * True when wrangler.toml declares a live REPORTS KV binding: an uncommented
 * `binding = "REPORTS"` under an uncommented `[[kv_namespaces]]` table. A
 * commented template does not count, and neither does a binding of that name
 * under some other table, which would not be a KV namespace.
 */
export const hasUncommentedReportsBinding = (wranglerSource) => {
  let table = null;
  for (const rawLine of String(wranglerSource ?? '').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) continue;
    const header = /^\[\[?\s*([^\]]+?)\s*\]\]?/.exec(line);
    if (header) {
      table = header[1];
      continue;
    }
    if (table === 'kv_namespaces' && /^binding\s*=\s*["']REPORTS["']/.test(line)) return true;
  }
  return false;
};

/**
 * The error to report, or null when there is nothing to say. Takes the
 * wrangler.toml text rather than reading it so the rule can be exercised without
 * writing a fixture to disk.
 */
export const reportsOrderingError = (reportsEnabled, wranglerSource) => {
  if (reportsEnabled !== true) return null;
  if (hasUncommentedReportsBinding(wranglerSource)) return null;
  return [
    'services.reports.enabled is true in src/content/operations.json, but wrangler.toml carries no uncommented REPORTS binding.',
    '  Uncomment the [[kv_namespaces]] block for REPORTS in wrangler.toml, or set the flag back to false in src/content/operations.json.',
    '  With the flag on and the binding absent, every code row renders a reader control whose every click answers 503, and no amount of',
    '  waiting turns it into a working one.',
    '  This check reads wrangler.toml and nothing else. Whether the KV namespace exists on the Cloudflare account, and whether the',
    '  REPORT_SECRET secret is set on the Pages project, cannot be checked from this repository. Confirm both yourself with',
    '  `wrangler kv namespace list` and `wrangler pages secret list --project-name freetins`.',
  ].join('\n');
};

const selfPath = fileURLToPath(import.meta.url);
const entryPath = process.argv[1] ? resolve(process.argv[1]) : '';
const isEntryModule =
  entryPath !== '' &&
  (entryPath === selfPath || (process.platform === 'win32' && entryPath.toLowerCase() === selfPath.toLowerCase()));

if (isEntryModule) {
  const sourcePath = resolve('src/content/operations.json');
  const source = readFileSync(sourcePath, 'utf8');
  const data = JSON.parse(source);
  const errors = [];

  const requiredArrays = ['games', 'codes', 'dailyLinks', 'cheatGames', 'cheats', 'values', 'updates', 'products', 'sponsorships', 'verificationEvents'];
  for (const key of requiredArrays) {
    if (!Array.isArray(data[key])) errors.push(`${key} must be an array`);
  }
  if (!data.services || typeof data.services !== 'object') errors.push('services must be an object');

  if (/example\.com/i.test(source)) errors.push('example.com is forbidden in operational content');
  if (/\b\d+\s*(?:minutes?|mins?|hours?|days?|min|h|d)\s+ago\b/i.test(source)) errors.push('Relative “ago” strings are forbidden; upload ISO timestamps instead');

  const unique = (items, key, label) => {
    const seen = new Set();
    for (const item of items ?? []) {
      const value = item?.[key];
      if (!value) errors.push(`${label} contains an entry without ${key}`);
      else if (seen.has(value)) errors.push(`${label} contains duplicate ${key}: ${value}`);
      else seen.add(value);
    }
  };

  unique(data.games, 'slug', 'games');
  unique(data.codes, 'id', 'codes');
  unique(data.dailyLinks, 'id', 'dailyLinks');
  unique(data.cheatGames, 'slug', 'cheatGames');
  unique(data.cheats, 'id', 'cheats');
  unique(data.values, 'id', 'values');
  unique(data.updates, 'id', 'updates');
  unique(data.products, 'id', 'products');
  unique(data.sponsorships, 'id', 'sponsorships');
  unique(data.verificationEvents, 'id', 'verificationEvents');

  /*
   * The flag and its binding, read against each other. wrangler.toml is opened
   * only when there is something to check, and a file that cannot be read counts
   * the same as a file with no binding in it: the flag is on and this cannot
   * confirm anything.
   */
  const reportsEnabled = data.services?.reports?.enabled === true;
  let wranglerSource = '';
  if (reportsEnabled) {
    try {
      wranglerSource = readFileSync(resolve('wrangler.toml'), 'utf8');
    } catch {
      wranglerSource = '';
    }
  }
  const orderingError = reportsOrderingError(reportsEnabled, wranglerSource);
  if (orderingError) errors.push(orderingError);

  if (errors.length > 0) {
    console.error('Operational content check failed:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  const ops = await import('../src/data/operations.ts');
  console.log(`Operational content passed: ${data.games.length} games, ${data.codes.length} codes, ${data.dailyLinks.length} daily links, ${data.cheats.length} cheats and ${data.verificationEvents.length} verification events.`);
  console.log(
    reportsEnabled
      ? 'Reader reports: the flag is on and wrangler.toml declares the REPORTS binding. Whether the namespace and REPORT_SECRET exist on Cloudflare is not checked from here.'
      : 'Reader reports: the flag is off, so the control renders nowhere and the endpoint refuses. No binding is required.',
  );

  /*
   * Advisory queue printout. Nothing below changes the exit code. The furniture a
   * page wants (its own listing URL, two redeem steps) left the index gate with
   * ADR 0004: a page with a live entry is indexed whether or not the furniture is
   * there, and its absence is a warning for the editor queue, not a reason to hold
   * the page. The baseline count is the interim "typed claims to confirm" line
   * ADR 0003 asks for until the control page's queue exists.
   */
  const queueWarnings = [];
  for (const game of ops.operations.games) {
    if (game.publicationState !== 'planned') continue;
    const page = ops.getGameOperationalPage(game.slug);
    if (!page || page.liveCount === 0) continue;
    const missing = [];
    if (!game.officialSourceUrl) missing.push('no officialSourceUrl');
    if (game.redeemSteps.length < 2) missing.push(`${game.redeemSteps.length} of 2 redeemSteps`);
    if (missing.length === 0) continue;
    const noun = game.surface === 'codes' ? 'codes' : 'links';
    queueWarnings.push(`${game.slug} lists ${page.liveCount} live ${noun} with ${missing.join(' and ')}`);
  }
  if (queueWarnings.length > 0) {
    console.log(`Queue warnings (advisory, ${queueWarnings.length}):`);
    queueWarnings.forEach((warning) => console.log(`- ${warning}`));
  } else {
    console.log('Queue warnings (advisory): none. Every planned page with a live entry has its listing URL and two redeem steps.');
  }

  const baselineEvents = data.verificationEvents.filter((event) => event.method === 'manual-review').length;
  console.log(`Baseline (advisory): ${baselineEvents} of ${data.verificationEvents.length} verification events are manual-review and are read as the as-published baseline, not as editor acts.`);
}
