/**
 * Filter for the searchable element/answer index used by the Little Alchemy pages.
 *
 * This previously lived in a `<script>` placed after `</BaseLayout>` in
 * EditorialArticle.astro, which put it outside `</html>` in the output. Astro could
 * not hoist it from there, so it shipped inline and the site's own
 * `script-src 'self'` policy blocked it on all 19 editorial pages — the filter
 * silently did nothing on the page whose main feature is a searchable list.
 *
 * Bundled as a module it is served from /_astro/ and satisfies the policy unchanged.
 * Events are delegated so the filter survives view-transition navigations.
 */

const indexes = () => [...document.querySelectorAll<HTMLElement>('[data-element-index]')];

const applyFilter = (index: HTMLElement) => {
  const input = index.querySelector<HTMLInputElement>('[data-element-search]');
  const count = index.querySelector<HTMLOutputElement>('[data-element-count]');
  const empty = index.querySelector<HTMLElement>('[data-element-empty]');
  if (!input || !count || !empty) return;

  const query = input.value.trim().toLowerCase();
  let visible = 0;

  for (const card of index.querySelectorAll<HTMLElement>('[data-element-card]')) {
    const matches = !query || card.dataset.search?.includes(query) === true;
    card.hidden = !matches;
    if (matches) visible += 1;
  }

  for (const group of index.querySelectorAll<HTMLElement>('[data-element-group]')) {
    group.hidden = !group.querySelector('[data-element-card]:not([hidden])');
  }

  count.textContent = `${visible} ${visible === 1 ? 'element' : 'elements'}`;
  empty.hidden = visible !== 0;
};

document.addEventListener('input', (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target?.matches('[data-element-search]')) return;
  const index = target.closest<HTMLElement>('[data-element-index]');
  if (index) applyFilter(index);
});

/** Re-apply on navigation so a restored input value still matches what is shown. */
const sync = () => indexes().forEach(applyFilter);

document.addEventListener('astro:page-load', sync);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', sync, { once: true });
} else {
  sync();
}

export {};
