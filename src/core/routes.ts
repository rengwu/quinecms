import type { Collection, Content, Entry, Page } from './types';

export function entryPath(collection: Collection, entry: Entry) {
  if (!collection.genericPageId || !collection.path) return undefined;
  return collection.mode === 'single'
    ? collection.path
    : entry.slug
      ? `${collection.path.replace(/\/$/, '')}/${entry.slug}`
      : undefined;
}

// Used by static generation and tests. Collections never own an index route.
export function publicRoutes(
  content: Pick<Content, 'pages' | 'collections' | 'entries'>,
) {
  const routes: {
    path: string;
    page: Page;
    entry?: Entry;
    collection?: Collection;
  }[] = content.pages
    .filter((p) => p.kind === 'static')
    .map((page) => ({ path: page.path ?? '', page }));
  for (const entry of content.entries) {
    const collection = content.collections.find(
      (c) => c.id === entry.collectionId,
    );
    const page = content.pages.find(
      (p) => p.id === collection?.genericPageId && p.kind === 'generic',
    );
    const path = collection && entryPath(collection, entry);
    if (collection && page && path)
      routes.push({
        path,
        page,
        entry,
        collection,
      });
  }
  return routes;
}
