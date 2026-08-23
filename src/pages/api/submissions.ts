import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { enforceRateLimit, errorResponse, readRequestForm, successResponse } from '../../lib/api';
import { insertCodeSubmission } from '../../lib/database';
import { FormError, parseSubmission } from '../../lib/forms';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let submittedForm: FormData | undefined;

  try {
    const { form, isSpam } = await readRequestForm(request);
    submittedForm = form;
    if (isSpam) return successResponse(request, form, '/submit', 'Submission received.');
    if (!env.DB) throw new FormError('Code submission is temporarily unavailable. Please try again shortly.', 503);

    const input = parseSubmission(form);
    await enforceRateLimit(env.DB, request, 'submission', 10, env.RATE_LIMIT_SALT);
    const reference = await insertCodeSubmission(env.DB, input);
    return successResponse(
      request,
      form,
      '/submit',
      `Submission queued for review. Your reference is ${reference}.`,
      { reference },
    );
  } catch (error) {
    return errorResponse(request, error, '/submit', submittedForm);
  }
};
