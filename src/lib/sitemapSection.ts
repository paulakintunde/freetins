/** Explicit editorial membership takes precedence over a legacy URL prefix. */
export const belongsToSitemapSection = (
  pathname: string,
  prefix: string,
  editorialSections: ReadonlyMap<string, string>,
) => {
  const section = editorialSections.get(pathname);
  return section ? section === prefix : pathname.startsWith(prefix);
};
