import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { readCheckerSnapshot } from '../../lib/checker-status';

export const prerender = false;

export const GET: APIRoute = async () => {
  const snapshot = await readCheckerSnapshot(env.STATUS);
  return Response.json(snapshot, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
};
