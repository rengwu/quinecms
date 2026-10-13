import type { Definition } from '../core/types';
export const themeOf = (d: Definition) => d.theme || 'Uncategorized';
export const tagsOf = (d: Definition) => d.tags ?? [d.label.toLowerCase()];
export function catalogDefinitions(
  definitions: Definition[],
  kind: 'static' | 'generic',
  placement: 'page' | 'footer',
) {
  return definitions.filter(
    (d) =>
      (d.kind ?? 'static') === kind &&
      (d.placement ?? 'page') === placement &&
      !d.deprecated &&
      !definitions.some(
        (n) => n.type === d.type && !n.deprecated && n.version > d.version,
      ),
  );
}
export function filterCatalog(
  definitions: Definition[],
  query: string,
  theme: string,
  tags: string[],
) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return definitions.filter(
    (d) =>
      (!theme || themeOf(d) === theme) &&
      tags.every((t) => tagsOf(d).includes(t)) &&
      terms.every((t) =>
        [d.label, themeOf(d), ...tagsOf(d)].join(' ').toLowerCase().includes(t),
      ),
  );
}
