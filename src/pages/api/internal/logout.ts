import type { APIRoute } from 'astro';
import { clearEditorialSessionCookie } from '../../../lib/editor-access';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const target = new URL('/internal/queue', request.url);
  const response = Response.redirect(target, 303);
  response.headers.append('Set-Cookie', clearEditorialSessionCookie());
  return response;
};
