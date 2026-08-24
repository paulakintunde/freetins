import type { APIRoute } from 'astro';
import { searchIndex } from '../data/search';

export const prerender = true;

/** Emitted as a static asset at build time and fetched once by the search page. */
export const GET: APIRoute = () =>
  Response.json(
    { version: 1, records: searchIndex },
    { headers: { 'X-Robots-Tag': 'noindex' } },
  );
