/**
 * The stored consent choice, shared by the banner in src/scripts/site.ts and the
 * ad loader in src/scripts/ads.ts.
 *
 * It lives here rather than in either of them because two readers of one cookie
 * that each parse it their own way is how a reader comes to have declined
 * advertising in the panel and be served it anyway. One parser, one name, one
 * answer.
 */
export type ConsentState = Record<string, boolean>;

export const CONSENT_COOKIE = 'ft_consent=';

export const readConsentCookie = (): ConsentState | null => {
  const entry = document.cookie.split('; ').find((cookie) => cookie.startsWith(CONSENT_COOKIE));
  if (!entry) return null;

  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(entry.slice(CONSENT_COOKIE.length)));
    return parsed && typeof parsed === 'object' ? parsed as ConsentState : null;
  } catch {
    return null;
  }
};

/**
 * Whether a purpose is allowed. Anything other than a stored `true` is a no: an
 * absent cookie, an unparseable one and an explicit rejection all read the same
 * way, so the default before a reader has answered is the same as the answer they
 * would give by rejecting.
 */
export const hasConsent = (purpose: string): boolean => readConsentCookie()?.[purpose] === true;
