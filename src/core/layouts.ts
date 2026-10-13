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
export {
  migrateSite,
  siteLayouts,
  pageLayout,
  contentForPage,
  contentForLayout,
  layoutPages,
  layoutRemovalReason,
  setLayoutActive,
  removeLayout,
  replaceLayout,
} from './layout-state';
import {
  legacyLayout,
  migrateSite,
  siteLayouts,
  replaceLayout,
} from './layout-state';

export function activeLayout(site: Site): LayoutSelection {
  if (site.layout) return site.layout;
  if (site.layouts !== undefined) {
    const layout = site.layouts.find((layout) => layout.active);
    if (!layout) throw Error('At least one layout must stay active.');
    return layout.design;
  }
  return legacyLayout(site);
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
  layoutId?: string,
): Content {
  const next = migrateSite(content);
  const current = siteLayouts(next.site).find((layout) =>
    layoutId ? layout.id === layoutId : layout.active,
  );
  if (!current) throw Error('This layout no longer exists.');
  if (layoutKey(current.design) === layoutKey(definition)) return next;
  return replaceLayout(next, {
    ...current,
    design: {
      id: definition.id,
      version: definition.version,
      settings: structuredClone(definition.defaults),
    },
  });
}
