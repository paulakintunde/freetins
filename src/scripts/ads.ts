import { hasConsent } from './consent';

/**
 * The AdSense loader and the per-unit push.
 *
 * Three rules shape this file, and each one is a rule the rest of the site
 * already keeps:
 *
 *  1. Nothing happens without consent. The loader is not requested, the script
 *     tag is not written and the block stays hidden until `advertising` is a
 *     stored `true`. A reader who rejects, or who has not answered, causes no
 *     request to Google at all.
 *  2. Nothing happens on a page with no ad block. A page view that renders no
 *     `AdSlot` costs exactly what it cost before this file existed.
 *  3. The publisher id is read from the block, not imported. Importing it would
 *     pull src/data/operations.ts — and with it the whole operational record —
 *     into the client bundle to learn one string that is already in the DOM.
 */

const LOADER = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/*
 * The DOM is the record of whether the loader was asked for, not a module
 * variable. A module executes once per URL, but this one is imported by the
 * script BaseLayout re-runs, and the abort-controller dance at the top of
 * src/scripts/site.ts exists because that has been observed to run twice. A flag
 * that resets with the module would append a second loader tag on the second
 * run; the query cannot.
 */
const requestLoader = (client: string) => {
  if (document.querySelector(`script[src^="${LOADER}"]`)) return;

  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `${LOADER}?client=${encodeURIComponent(client)}`;
  document.head.append(script);
};

/**
 * Fill every block on the current document that has not been filled yet.
 *
 * `data-ft-ad-filled` is this file's own mark rather than AdSense's
 * `data-adsbygoogle-status`, because the status attribute is set asynchronously:
 * two calls in the same frame — a page load that races a consent click — would
 * both see an unmarked unit and push it twice, and a unit pushed twice is the
 * "All ads in this ad unit have been filled" console error and a blank box.
 */
export const fillAdSlots = () => {
  const pending = Array.from(document.querySelectorAll<HTMLElement>('ins.adsbygoogle'))
    .filter((unit) => unit.dataset.ftAdFilled !== 'true');
  if (pending.length === 0) return;

  if (!hasConsent('advertising')) return;

  const client = pending[0]?.dataset.adClient;
  if (!client) return;

  requestLoader(client);
  window.adsbygoogle ??= [];

  for (const unit of pending) {
    unit.dataset.ftAdFilled = 'true';
    /*
     * Reveal the block as it is pushed. Before this point it has occupied no
     * space, so the reveal is a shift — but it happens either at page load with a
     * choice already stored, or within a few hundred milliseconds of the reader's
     * own click on Accept. Layout shift after a user interaction is excluded from
     * the metric, and an always-reserved empty box for readers who decline is a
     * worse page than a one-time shift for readers who do not.
     */
    unit.closest<HTMLElement>('.ad-slot')?.removeAttribute('hidden');
    window.adsbygoogle.push({});
  }
};

/**
 * A rejection cannot un-request a script that has already run, so the honest
 * thing on a withdrawal is to take the blocks off the page and stop feeding it
 * new ones. The loader stays where it is until the next full navigation.
 */
const clearAdSlots = () => {
  for (const slot of document.querySelectorAll<HTMLElement>('.ad-slot')) {
    slot.setAttribute('hidden', '');
  }
};

export const syncAdSlots = () => {
  if (hasConsent('advertising')) fillAdSlots();
  else clearAdSlots();
};
