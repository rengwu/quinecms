import type { Collection, Content, Entry, Page } from './types';

export function entryPath(collection: Collection, entry: Entry) {
  return `${collection.path.replace(/\/$/, '')}/${entry.slug}`;
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
    if (collection && page)
      routes.push({
        path: entryPath(collection, entry),
        page,
        entry,
        collection,
      });
  }
  return routes;
}
