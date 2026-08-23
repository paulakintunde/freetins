import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { enforceRateLimit, errorResponse, readRequestForm, successResponse } from '../../../lib/api';
import { createEditorialSessionCookie, passwordMatches } from '../../../lib/editor-access';
import { FormError } from '../../../lib/forms';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let form: FormData | undefined;
  try {
    const parsed = await readRequestForm(request);
    form = parsed.form;
    if (!env.DB || !env.EDITOR_ACCESS_PASSWORD || !env.EDITOR_ACCESS_SESSION_SECRET) {
      throw new FormError('Editorial access is not configured.', 503);
    }
    await enforceRateLimit(env.DB, request, 'editor_login', 5, env.RATE_LIMIT_SALT);
    const passwordValue = form.get('password');
    const password = typeof passwordValue === 'string' ? passwordValue.trim() : '';
    if (!passwordMatches(password, env.EDITOR_ACCESS_PASSWORD)) {
      throw new FormError('That password is not correct.', 401);
    }
    const response = successResponse(
      request,
      form,
      '/internal/queue',
      'Editorial access unlocked.',
      { redirectTo: '/internal/queue' },
      '/internal/queue',
    );
    response.headers.append('Set-Cookie', await createEditorialSessionCookie(env.EDITOR_ACCESS_SESSION_SECRET));
    return response;
  } catch (error) {
    return errorResponse(request, error, '/internal/queue', form);
  }
};
