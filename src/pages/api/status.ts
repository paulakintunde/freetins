import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { readCheckerSnapshot } from '../../lib/checker-status';

export const prerender = false;

export const GET: APIRoute = async () => {
  const snapshot = await readCheckerSnapshot(env.STATUS);
  return new Response(JSON.stringify(snapshot), {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=300',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};
