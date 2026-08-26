/**
 * HTTP adapter for reader reports. The decisions live in src/lib/code-reports.ts,
 * which is where the model, the free-plan budget and the reasoning are written down;
 * this file reads the bindings off `env`, the configuration off the operational data,
 * sets the headers and serialises.
 *
 * Neither verb is called on page load. The control's visibility is decided at build
 * time from `services.reports`, so a page view costs nothing here — no invocation, no
 * KV read. A request arrives only when a reader clicks.
 */
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { operations } from '../../data/operations';
import {
  answerAvailability,
  answerReport,
  readerReportsEnabled,
  reportableEntryIds,
  type CodeReportAnswer,
  type CodeReportBindings,
} from '../../lib/code-reports';

export const prerender = false;

/**
 * The configuration half of the gate, read once when this module is evaluated and
 * never again. Both values come out of src/content/operations.json, which is already
 * in this bundle and is validated at build by `pnpm check:data` and by importing it
 * here, so a request pays nothing for either.
 *
 * The flag is what keeps the write budget shut. Until it was read here, binding the
 * namespace and the secret opened 1,000 KV writes a day to anyone who found the route,
 * while `services.reports.enabled: false` kept the control off every page — a live
 * budget with no user interface, which is the worst of both.
 *
 * The id set is what keeps the budget bounded once the flag is on: an entry id that
 * this build did not publish never becomes a key.
 */
const REPORTS_ENABLED = readerReportsEnabled(operations);
const REPORTABLE_ENTRY_IDS = reportableEntryIds(operations);

const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });

const answer = (result: CodeReportAnswer) => json(result.body, result.status);

/**
 * Reader reports need the store and the hashing secret together. Without the secret
 * the dedup fingerprint would be reversible, so the endpoint refuses rather than
 * storing something that leaks an address — and it refuses on both verbs, so a
 * half-configured deployment cannot advertise a control that can never accept a click.
 */
const bindings = (): CodeReportBindings => ({
  store: env.REPORTS,
  secret: env.REPORT_SECRET,
  enabled: REPORTS_ENABLED,
  reportable: REPORTABLE_ENTRY_IDS,
});

/** Configuration only: `{ available: true }`, no counts, no KV read. */
export const GET: APIRoute = () => answer(answerAvailability(bindings()));

export const POST: APIRoute = async ({ request }) => {
  const binding = bindings();
  // Refuse before reading the body: an unconfigured endpoint has nothing to do with it.
  const availability = answerAvailability(binding);
  if (availability.status !== 200) return answer(availability);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Body must be JSON.' }, 400);
  }
  // `JSON.parse` does not throw on `null`, `42` or `"x"`, and reading `.entry` off the
  // first of those threw a TypeError that surfaced as a 500. A body that is not a JSON
  // object gets the same 400 as a body that is not JSON at all.
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return json({ error: 'Body must be JSON.' }, 400);
  }
  const submission = payload as { entry?: unknown; verdict?: unknown };

  const result = await answerReport(binding, {
    entry: submission.entry,
    verdict: submission.verdict,
    address: request.headers.get('CF-Connecting-IP'),
  });

  // A spent write budget and a broken binding both answer 429, because a reader can act
  // on neither. Only this line separates them for whoever reads the logs; the KV error
  // carries no reader data, and the answer is unchanged either way.
  if (result.refusal) {
    console.error('code-report write refused', {
      quota: result.refusal.quota,
      cause: String(result.refusal.cause),
    });
  }

  return answer(result);
};
