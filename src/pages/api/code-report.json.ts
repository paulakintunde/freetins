import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import {
  DEDUPE_TTL_SECONDS,
  countsKey,
  dedupeKey,
  fingerprint,
  isVerdict,
  needsRecheck,
  readCounts,
  type CodeReportStore,
} from '../../lib/code-reports';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });

const store = () => env.REPORTS as CodeReportStore | undefined;

/**
 * Reader reports are only accepted when the store and the hashing secret are both
 * configured. Without the secret the dedup fingerprint would be reversible, so the
 * endpoint refuses rather than storing something that leaks an address.
 */
const unavailable = () =>
  json({ available: false, reason: 'Reader reports are not configured.' }, 503);

export const GET: APIRoute = async ({ url }) => {
  const entryId = url.searchParams.get('entry');
  if (!entryId) return json({ error: 'Missing entry parameter.' }, 400);

  const reports = store();
  if (!reports) return unavailable();

  const counts = await readCounts(reports, entryId);
  return json({ available: true, entryId, ...counts, needsRecheck: needsRecheck(counts) });
};

export const POST: APIRoute = async ({ request }) => {
  const reports = store();
  const secret = env.REPORT_SECRET;
  if (!reports || !secret) return unavailable();

  let payload: { entry?: unknown; verdict?: unknown };
  try {
    payload = await request.json() as typeof payload;
  } catch {
    return json({ error: 'Body must be JSON.' }, 400);
  }

  const entryId = typeof payload.entry === 'string' ? payload.entry.slice(0, 128) : '';
  if (!/^[a-z0-9-]+$/.test(entryId)) return json({ error: 'Invalid entry id.' }, 400);
  if (!isVerdict(payload.verdict)) return json({ error: 'Verdict must be worked or failed.' }, 400);

  // Cloudflare sets this; a request without it cannot be de-duplicated, so it is refused
  // rather than counted and left open to unlimited repeat submissions.
  const address = request.headers.get('CF-Connecting-IP');
  if (!address) return json({ error: 'Report could not be attributed.' }, 400);

  const seenKey = dedupeKey(await fingerprint(address, entryId, secret));
  const counts = await readCounts(reports, entryId);

  const alreadyReported = await reports.get(seenKey);
  if (alreadyReported) {
    return json({ available: true, entryId, ...counts, counted: false, needsRecheck: needsRecheck(counts) });
  }

  const updated = {
    ...counts,
    [payload.verdict]: counts[payload.verdict] + 1,
  };

  await reports.put(countsKey(entryId), JSON.stringify({ ...updated, entryId, updatedAt: new Date().toISOString() }));
  await reports.put(seenKey, '1', { expirationTtl: DEDUPE_TTL_SECONDS });

  return json({ available: true, entryId, ...updated, counted: true, needsRecheck: needsRecheck(updated) });
};
