import { FormError, safeReturnPath } from './forms';
import { sha256 } from './security';

const MAX_FORM_BYTES = 32_768;

export interface ParsedRequestForm {
  form: FormData;
  isSpam: boolean;
}

const isEnhancedRequest = (request: Request) =>
  request.headers.get('X-Freetins-Request') === 'form';

export const readRequestForm = async (request: Request): Promise<ParsedRequestForm> => {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) {
    throw new FormError('This form must be submitted from Freetins.', 403);
  }

  const contentLength = Number(request.headers.get('Content-Length') ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_FORM_BYTES) {
    throw new FormError('This form is too large.', 413);
  }

  const contentType = request.headers.get('Content-Type') ?? '';
  if (!contentType.includes('form-data') && !contentType.includes('application/x-www-form-urlencoded')) {
    throw new FormError('Submit this request using the form.', 415);
  }

  const form = await request.formData();
  const website = form.get('website');
  return { form, isSpam: typeof website === 'string' && website.trim().length > 0 };
};

export const enforceRateLimit = async (
  db: FreetinsDatabase,
  request: Request,
  scope: string,
  limit: number,
  salt = 'freetins-rate-limit-v1',
) => {
  const forwardedAddress = request.headers.get('CF-Connecting-IP')
    ?? request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
    ?? 'local';
  const fingerprint = await sha256(`${salt}:${scope}:${forwardedAddress}`);
  const bucket = new Date().toISOString().slice(0, 13);
  const result = await db.prepare(`
    INSERT INTO request_rate_limits (scope, bucket, fingerprint_hash, hits)
    VALUES (?, ?, ?, 1)
    ON CONFLICT (scope, bucket, fingerprint_hash)
    DO UPDATE SET hits = hits + 1
    RETURNING hits
  `).bind(scope, bucket, fingerprint).first<{ hits: number }>();

  if ((result?.hits ?? limit + 1) > limit) {
    throw new FormError('Too many requests. Please try again in an hour.', 429);
  }

  // Spread cleanup across a small sample of requests instead of adding a write to every form post.
  if (fingerprint.startsWith('00')) {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1_000).toISOString().slice(0, 13);
    await db.prepare('DELETE FROM request_rate_limits WHERE bucket < ?').bind(cutoff).run();
  }
};

const jsonHeaders = {
  'Cache-Control': 'private, no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
} as const;

export const successResponse = (
  request: Request,
  form: FormData,
  fallbackPath: string,
  message: string,
  extra: Record<string, unknown> = {},
  nativeRedirectPath?: string,
) => {
  if (isEnhancedRequest(request)) {
    return new Response(JSON.stringify({ ok: true, message, ...extra }), { headers: jsonHeaders });
  }

  const target = new URL(nativeRedirectPath ?? safeReturnPath(form, fallbackPath), request.url);
  target.searchParams.set('form', 'success');
  target.searchParams.set('message', message);
  return Response.redirect(target, 303);
};

export const errorResponse = (
  request: Request,
  error: unknown,
  fallbackPath: string,
  form?: FormData,
) => {
  const knownError = error instanceof FormError;
  const status = knownError ? error.status : 500;
  const message = knownError
    ? error.message
    : 'The service is temporarily unavailable. Please try again shortly.';

  if (!knownError) {
    console.error(JSON.stringify({
      event: 'form_request_failed',
      requestId: request.headers.get('CF-Ray') ?? crypto.randomUUID(),
      error: error instanceof Error ? error.name : 'UnknownError',
    }));
  }

  if (isEnhancedRequest(request)) {
    return new Response(JSON.stringify({ ok: false, message }), { status, headers: jsonHeaders });
  }

  const target = new URL(form ? safeReturnPath(form, fallbackPath) : fallbackPath, request.url);
  target.searchParams.set('form', 'error');
  target.searchParams.set('message', message);
  return Response.redirect(target, 303);
};
