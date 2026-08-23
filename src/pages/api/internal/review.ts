import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { enforceRateLimit, errorResponse, readRequestForm, successResponse } from '../../../lib/api';
import { hasEditorialAccess } from '../../../lib/editor-access';
import { reviewCodeSubmission } from '../../../lib/database';
import { FormError } from '../../../lib/forms';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let form: FormData | undefined;
  try {
    const parsed = await readRequestForm(request);
    form = parsed.form;
    if (!env.DB || !(await hasEditorialAccess(request, env.EDITOR_ACCESS_SESSION_SECRET))) {
      throw new FormError('Editorial access is required.', 401);
    }
    const submissionIdValue = form.get('submission_id');
    const actionValue = form.get('action');
    const submissionId = typeof submissionIdValue === 'string' ? submissionIdValue : '';
    const action = typeof actionValue === 'string' ? actionValue : '';
    if (!/^submission_[0-9a-f-]{36}$/.test(submissionId) || !['verified', 'rejected'].includes(action)) {
      throw new FormError('Invalid review request.');
    }
    await enforceRateLimit(env.DB, request, 'editor_review', 120, env.RATE_LIMIT_SALT);
    const changed = await reviewCodeSubmission(env.DB, submissionId, action as 'verified' | 'rejected', 'password-gated-editor');
    if (!changed) throw new FormError('This submission has already been reviewed.', 409);
    return successResponse(
      request,
      form,
      '/internal/queue',
      `Submission ${action}.`,
      { redirectTo: '/internal/queue' },
      '/internal/queue',
    );
  } catch (error) {
    return errorResponse(request, error, '/internal/queue', form);
  }
};
