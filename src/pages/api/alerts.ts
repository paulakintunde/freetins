import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { enforceRateLimit, errorResponse, readRequestForm, successResponse } from '../../lib/api';
import { createAlertSubscriptionRequest } from '../../lib/database';
import { FormError, parseAlert } from '../../lib/forms';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let submittedForm: FormData | undefined;

  try {
    const { form, isSpam } = await readRequestForm(request);
    submittedForm = form;
    if (isSpam) return successResponse(request, form, '/alerts', 'Alert preferences saved.');
    if (env.EMAIL_DIGEST_ENABLED !== 'true' || !env.DB || !env.ALERT_EMAIL || !env.ALERT_CONFIRMATION_SECRET || !env.CONTACT_HASH_SECRET) {
      throw new FormError('Email digest signup is temporarily unavailable. Please try again shortly.', 503);
    }

    const input = parseAlert(form);
    await enforceRateLimit(env.DB, request, 'alert_signup', 5, env.RATE_LIMIT_SALT);
    const signup = await createAlertSubscriptionRequest(env.DB, input, env.CONTACT_HASH_SECRET);
    await env.ALERT_EMAIL.send({ type: 'confirmation', requestId: signup.id });

    return successResponse(
      request,
      form,
      '/alerts',
      'Check your inbox to confirm the weekly digest. No alerts are sent until you confirm.',
    );
  } catch (error) {
    return errorResponse(request, error, '/alerts', submittedForm);
  }
};
