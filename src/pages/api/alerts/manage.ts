import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { enforceRateLimit, errorResponse, readRequestForm, successResponse } from '../../../lib/api';
import {
  deleteAlertSubscription,
  getAlertSubscription,
  updateAlertGames,
  updateAlertStatus,
} from '../../../lib/database';
import { FormError, parseManageAction, parseManagedGames } from '../../../lib/forms';
import { isOpaqueToken, sha256 } from '../../../lib/security';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let submittedForm: FormData | undefined;

  try {
    const { form } = await readRequestForm(request);
    submittedForm = form;
    if (!env.DB) throw new FormError('Alert management is temporarily unavailable. Please try again shortly.', 503);

    const tokenValue = form.get('token');
    const token = typeof tokenValue === 'string' ? tokenValue : '';
    if (!isOpaqueToken(token)) throw new FormError('This management link is invalid or expired.', 404);

    await enforceRateLimit(env.DB, request, 'alert_manage', 20, env.RATE_LIMIT_SALT);
    const tokenHash = await sha256(token);
    const subscription = await getAlertSubscription(env.DB, tokenHash);
    if (!subscription) throw new FormError('This management link is invalid or expired.', 404);

    const action = parseManageAction(form);
    const managePath = `/alerts/manage?t=${encodeURIComponent(token)}`;
    if (action === 'update') {
      await updateAlertGames(env.DB, tokenHash, parseManagedGames(form));
      return successResponse(request, form, '/alerts/manage', 'Alert games updated.', {
        redirectTo: `${managePath}&form=success&message=Alert+games+updated.`,
      });
    }
    if (action === 'pause' || action === 'resume') {
      await updateAlertStatus(env.DB, tokenHash, action === 'pause' ? 'paused' : 'active');
      const message = action === 'pause' ? 'Alerts paused.' : 'Alerts resumed.';
      return successResponse(
        request,
        form,
        '/alerts/manage',
        message,
        { redirectTo: `${managePath}&form=success&message=${encodeURIComponent(message)}` },
      );
    }

    await deleteAlertSubscription(env.DB, tokenHash);
    form.set('_return', '/alerts');
    return successResponse(
      request,
      form,
      '/alerts',
      'Alert subscription deleted.',
      { redirectTo: '/alerts?form=success&message=Alert+subscription+deleted.' },
    );
  } catch (error) {
    return errorResponse(request, error, '/alerts/manage', submittedForm);
  }
};
