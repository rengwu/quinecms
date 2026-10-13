import type {
  Content,
  LayoutSelection,
  Page,
  Site,
  SiteLayout,
  Values,
} from './types';

/** The previous single-layout formats are read without dropping their settings. */
export function legacyLayout(site: Site): LayoutSelection {
  return (
    site.layout ?? {
      id: 'starter',
      version: 1,
      settings: {
        ...site.globals,
        title: site.title ?? '',
        navigation: site.navigation ?? [],
        ...(site.header ? { header: site.header } : {}),
        ...(site.footer ? { footer: site.footer as unknown as Values } : {}),
      },
    }
  );
}

export function siteLayouts(site: Site): SiteLayout[] {
  return (
    site.layouts ?? [
      {
        id: `layout_${site.id}`,
        name: 'Main layout',
        active: true,
        design: legacyLayout(site),
      },
    ]
  );
}

export function migrateSite(content: Content): Content {
  if (content.site.layouts !== undefined) return content;
  const layouts = siteLayouts(content.site);
  return {
    ...content,
    site: {
      formatVersion: content.site.formatVersion,
      id: content.site.id,
      globals: {},
      layouts,
    },
    pages: content.pages.map((page) => ({
      ...page,
      layoutId: page.layoutId ?? layouts[0].id,
    })),
  };
}

export function pageLayout(content: Content, page: Page): SiteLayout {
  const layout = siteLayouts(content.site).find((layout) =>
    page.layoutId
      ? layout.id === page.layoutId
      : content.site.layouts === undefined,
  );
  if (!layout || !layout.active)
    throw Error(
      `Choose an active site layout for ${page.title || 'this page'}.`,
    );
  return layout;
}

/** A render-only view for existing author APIs. Never persist this view. */
export function contentForLayout(
  content: Content,
  selection: LayoutSelection,
): Content {
  return { ...content, site: { ...content.site, layout: selection } };
}
export const contentForPage = (content: Content, page: Page) =>
  contentForLayout(content, pageLayout(content, page).design);

export function layoutPages(content: Content, layoutId: string): Page[] {
  return content.pages.filter(
    (page) =>
      page.layoutId === layoutId ||
      (content.site.layouts === undefined &&
        !page.layoutId &&
        siteLayouts(content.site)[0].id === layoutId),
  );
}

export function layoutRemovalReason(
  content: Content,
  layoutId: string,
): string | undefined {
  const layouts = siteLayouts(content.site);
  const layout = layouts.find((layout) => layout.id === layoutId);
  if (!layout) return 'This layout no longer exists.';
  const uses = layoutPages(content, layoutId).length;
  if (uses)
    return `Used by ${uses} ${uses === 1 ? 'page' : 'pages'}. Reassign those pages first.`;
  if (layout.active && layouts.filter((layout) => layout.active).length === 1)
    return 'At least one layout must stay active.';
}

export function setLayoutActive(
  content: Content,
  layoutId: string,
  active: boolean,
): Content {
  const next = migrateSite(content);
  if (!active) {
    const reason = layoutRemovalReason(next, layoutId);
    if (reason) throw Error(reason);
  }
  return {
    ...next,
    site: {
      ...next.site,
      layouts: next.site.layouts!.map((layout) =>
        layout.id === layoutId ? { ...layout, active } : layout,
      ),
    },
  };
}

export function removeLayout(content: Content, layoutId: string): Content {
  const next = migrateSite(content);
  const reason = layoutRemovalReason(next, layoutId);
  if (reason) throw Error(reason);
  return {
    ...next,
    site: {
      ...next.site,
      layouts: next.site.layouts!.filter((layout) => layout.id !== layoutId),
    },
  };
}

export function replaceLayout(content: Content, layout: SiteLayout): Content {
  return {
    ...content,
    site: {
      ...content.site,
      layouts: siteLayouts(content.site).map((current) =>
        current.id === layout.id ? layout : current,
      ),
    },
  };
}
