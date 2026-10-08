import type {
  Content,
  LayoutDefinition,
  LayoutSelection,
  Site,
  Values,
} from './types';
import { layoutDefinitions, layoutPolicies } from '../generated/layouts';

export { layoutDefinitions };
export const layoutKey = (layout: Pick<LayoutSelection, 'id' | 'version'>) =>
  `${layout.id}@${layout.version}`;
export function activeLayout(site: Site): LayoutSelection {
  if (site.layout) return site.layout;
  return {
    id: 'starter',
    version: 1,
    settings: {
      ...site.globals,
      title: site.title ?? '',
      navigation: site.navigation ?? [],
      ...(site.header ? { header: site.header } : {}),
      ...(site.footer ? { footer: site.footer as unknown as Values } : {}),
    },
  };
}
/** Conversion is lossless; canonical records contain no inactive settings. */
export function migrateSite(content: Content): Content {
  if (content.site.layout) return content;
  return {
    ...content,
    site: {
      formatVersion: content.site.formatVersion,
      id: content.site.id,
      globals: {},
      layout: activeLayout(content.site),
    },
  };
}
export function layoutDefinition(site: Site) {
  const active = activeLayout(site);
  return layoutDefinitions.find(
    (d) => d.id === active.id && d.version === active.version,
  );
}
export function layoutPolicy(site: Site) {
  return layoutPolicies[
    layoutKey(activeLayout(site)) as keyof typeof layoutPolicies
  ];
}
export function layoutGlobals(site: Site): Values {
  const active = activeLayout(site);
  return layoutPolicy(site)?.globals?.(active.settings) ?? {};
}
export function layoutTitle(site: Site): string {
  return layoutPolicy(site)?.title?.(activeLayout(site).settings) ?? '';
}
export function selectLayout(
  content: Content,
  definition: LayoutDefinition,
): Content {
  const next = migrateSite(content);
  const current = activeLayout(next.site);
  if (layoutKey(current) === layoutKey(definition)) return next;
  return {
    ...next,
    site: {
      ...next.site,
      layout: {
        id: definition.id,
        version: definition.version,
        settings: structuredClone(definition.defaults),
      },
    },
  };
}
/** Selection policy only. Never use this filtered catalog to resolve an active layout. */
export function layoutWhitelist(
  raw: string | undefined,
  definitions = layoutDefinitions,
): string[] | undefined {
  if (raw === undefined) return undefined;
  const ids = [
    ...new Set(
      raw
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ];
  if (!ids.length)
    throw new Error(
      'SITE_LAYOUT_WHITELIST must contain at least one installed layout ID, or be unset.',
    );
  const unknown = ids.filter((id) => !definitions.some((d) => d.id === id));
  if (unknown.length)
    throw new Error(`Unknown SITE_LAYOUT_WHITELIST IDs: ${unknown.join(', ')}`);
  return ids;
}
export function layoutChoices(
  allowedIds?: string[],
  definitions = layoutDefinitions,
) {
  return definitions.filter((d) => !allowedIds || allowedIds.includes(d.id));
}
