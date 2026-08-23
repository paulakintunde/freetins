import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { enforceRateLimit, errorResponse, readRequestForm, successResponse } from '../../lib/api';
import { insertContactRequest } from '../../lib/database';
import { FormError, parseContact } from '../../lib/forms';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let submittedForm: FormData | undefined;

  try {
    const { form, isSpam } = await readRequestForm(request);
    submittedForm = form;
    if (isSpam) return successResponse(request, form, '/contact', 'Message received.');
    if (!env.DB) throw new FormError('Contact is temporarily unavailable. Please try again shortly.', 503);

    const input = parseContact(form);
    await enforceRateLimit(env.DB, request, 'contact', 5, env.RATE_LIMIT_SALT);
    const reference = await insertContactRequest(env.DB, input);
    return successResponse(
      request,
      form,
      '/contact',
      `Message received. Your reference is ${reference}.`,
      { reference },
    );
  } catch (error) {
    return errorResponse(request, error, '/contact', submittedForm);
  }
};
