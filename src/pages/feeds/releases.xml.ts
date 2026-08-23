import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { gameCatalogue } from '../../data/home';

export const prerender = false;

interface ReleaseRow {
  id: string;
  game_slug: string;
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

const releaseItem = (release: ReleaseRow) => {
  const game = gameCatalogue.find((item) => item.slug === release.game_slug);
  const gameName = game?.name ?? release.game_slug;
  const link = `${siteUrl}/roblox/${encodeURIComponent(release.game_slug)}-codes?release=${encodeURIComponent(release.id)}`;
  let count = 0;
  try {
    const codes: unknown = JSON.parse(release.code_ids_json);
    count = Array.isArray(codes) ? codes.length : 0;
  } catch {
    count = 0;
  }
  const title = `${count || 'New'} verified ${gameName} code${count === 1 ? '' : 's'}`;
  return `<entry><id>${escapeXml(`${siteUrl}/releases/${release.id}`)}</id><title>${escapeXml(title)}</title><link href="${escapeXml(link)}"/><updated>${escapeXml(release.published_at)}</updated><summary>${escapeXml(`Verified codes are available on the ${gameName} page.`)}</summary></entry>`;
};

export const GET: APIRoute = async () => {
  const db = env.DB;
  if (!db) return new Response('Feed temporarily unavailable.', { status: 503 });

  const releases = await db.prepare(`
    SELECT id, game_slug, code_ids_json, published_at
    FROM alert_releases
    ORDER BY published_at DESC
    LIMIT 50
  `).all<ReleaseRow>();
  const updated = releases.results[0]?.published_at ?? new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><id>${siteUrl}/feeds/releases.xml</id><title>Freetins verified releases</title><updated>${escapeXml(updated)}</updated><link href="${siteUrl}/feeds/releases.xml" rel="self"/>${releases.results.map(releaseItem).join('')}</feed>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
