import { operations } from './operations';
import type { AdPlacement } from './operations';

const advertising = operations.services.advertising;

/**
 * The AdSense publisher id, `ca-pub-` and sixteen digits.
 *
 * It is read whether or not advertising is switched on, and that is deliberate.
 * Google will not approve a site it cannot recognise, and the two ways to be
 * recognised are `public/ads.txt` and the `google-adsense-account` meta tag. Both
 * are inert: a name in a file and a name in the head, no script, no cookie, no
 * request of any kind on a page view. Gating them behind `enabled` would mean the
 * site could never be approved until it was already serving ads, which is the
 * wrong way round.
 *
 * `null` renders no tag at all, the same failure mode `googleSiteVerification`
 * chose for the same reason: an absent claim beats a broken one.
 */
export const adsensePublisherId = advertising.publisherId;

/**
 * Whether an ad block may render. Both halves are required: the flag says an
 * operator meant to serve ads, the publisher id says there is an account to serve
 * them from. One without the other is a misconfiguration, not a state.
 */
export const advertisingEnabled = advertising.enabled && Boolean(advertising.publisherId);

/**
 * The block named `id`, or `undefined` if advertising is off or nothing by that
 * name is configured. An `AdSlot` that resolves to `undefined` renders nothing —
 * no wrapper, no reserved space, no label — so a page with an unconfigured block
 * is a page with one fewer section rather than a page with a hole in it.
 */
export const adPlacement = (id: string): AdPlacement | undefined => (
  advertisingEnabled ? advertising.placements.find((placement) => placement.id === id) : undefined
);

export type { AdPlacement };
