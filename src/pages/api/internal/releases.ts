import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { enforceRateLimit, errorResponse, readRequestForm, successResponse } from '../../../lib/api';
import { hasEditorialAccess } from '../../../lib/editor-access';
import { createEditorialRelease, requeueEditorialRelease } from '../../../lib/database';
import { FormError } from '../../../lib/forms';

export const prerender = false;

const releaseIdPattern = /^release_[0-9a-f-]{36}$/;
const submissionIdPattern = /^submission_[0-9a-f-]{36}$/;

export const POST: APIRoute = async ({ request }) => {
  let form: FormData | undefined;
  try {
    const parsed = await readRequestForm(request);
    form = parsed.form;
    if (!env.DB || !env.ALERT_RELEASES || !(await hasEditorialAccess(request, env.EDITOR_ACCESS_SESSION_SECRET))) {
      throw new FormError('Editorial release publishing is not configured.', 503);
    }
    await enforceRateLimit(env.DB, request, 'editor_release', 30, env.RATE_LIMIT_SALT);
    const action = typeof form.get('action') === 'string' ? form.get('action') : 'publish';

    if (action === 'retry') {
      const releaseIdValue = form.get('release_id');
      const releaseId = typeof releaseIdValue === 'string' ? releaseIdValue : '';
      if (!releaseIdPattern.test(releaseId) || !(await requeueEditorialRelease(env.DB, releaseId))) {
        throw new FormError('This release cannot be retried.', 409);
      }
      await env.ALERT_RELEASES.send({ type: 'discord_release', releaseId });
      return successResponse(
        request,
        form,
        '/internal/queue',
        'Discord delivery has been queued again.',
        { redirectTo: '/internal/queue' },
        '/internal/queue',
      );
    }

    const submissionIds = Array.from(new Set(form.getAll('submission_ids')
      .filter((value): value is string => typeof value === 'string')));
    if (submissionIds.length === 0 || submissionIds.length > 25 || submissionIds.some((id) => !submissionIdPattern.test(id))) {
      throw new FormError('Choose one to 25 verified codes from the same game.');
    }
    const release = await createEditorialRelease(env.DB, submissionIds);
    if (!release) throw new FormError('Only un-published verified codes from one game can be released together.', 409);
    await env.ALERT_RELEASES.send({ type: 'discord_release', releaseId: release.id });
    return successResponse(
      request,
      form,
      '/internal/queue',
      'Release published and queued for Discord.',
      { redirectTo: '/internal/queue' },
      '/internal/queue',
    );
  } catch (error) {
    return errorResponse(request, error, '/internal/queue', form);
  }
};
