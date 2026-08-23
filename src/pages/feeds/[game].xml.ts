import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { gameCatalogue } from '../../data/home';

export const prerender = false;

interface ReleaseRow {
  id: string;
  code_ids_json: string;
  published_at: string;
}

const siteUrl = 'https://www.freetins.com';

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

export const GET: APIRoute = async ({ params }) => {
  const game = gameCatalogue.find((item) => item.slug === params.game);
  const db = env.DB;
  if (!game || !db) return new Response('Feed not found.', { status: 404 });

  const releases = await db.prepare(`
    SELECT id, code_ids_json, published_at
    FROM alert_releases
    WHERE game_slug = ?
    ORDER BY published_at DESC
    LIMIT 50
  `).bind(game.slug).all<ReleaseRow>();
  const updated = releases.results[0]?.published_at ?? new Date().toISOString();
  const entries = releases.results.map((release) => {
    const link = `${siteUrl}/roblox/${game.slug}-codes?release=${encodeURIComponent(release.id)}`;
    return `<entry><id>${escapeXml(`${siteUrl}/releases/${release.id}`)}</id><title>${escapeXml(`Verified ${game.name} codes`)}</title><link href="${escapeXml(link)}"/><updated>${escapeXml(release.published_at)}</updated></entry>`;
  }).join('');
  const xml = `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><id>${siteUrl}/feeds/${game.slug}.xml</id><title>${escapeXml(`Freetins: ${game.name} verified releases`)}</title><updated>${escapeXml(updated)}</updated><link href="${siteUrl}/feeds/${game.slug}.xml" rel="self"/>${entries}</feed>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
