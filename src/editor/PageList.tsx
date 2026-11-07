import { PlusIcon } from '@phosphor-icons/react';
import { useState, type ReactNode } from 'react';
import type { Page, SiteLayout } from '../core/types';
import styles from './editor.module.css';
import { useAdminTheme } from './AdminTheme';
import PageHeader from './PageHeader';
import { Button, Input, Table, Tabs } from './ui';

type Kind = 'all' | 'static' | 'generic';

export default function PageList({
  pages,
  layouts,
  busy,
  onAdd,
  onOpen,
  status,
}: {
  pages: Page[];
  layouts: SiteLayout[];
  busy: boolean;
  onAdd(): void;
  onOpen(id: string): void;
  /** The selected language's copy status, outside the main language. */
  status?(page: Page): ReactNode;
}) {
  const { mode } = useAdminTheme();
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<Kind>('all');
  const search = query.trim().toLowerCase();
  const shown = pages.filter(
    (page) =>
      (kind === 'all' || page.kind === kind) &&
      (!search ||
        [page.title, page.kind === 'static' ? (page.path ?? '') : ''].some(
          (text) => text.toLowerCase().includes(search),
        )),
  );
  const generic = pages.some((page) => page.kind === 'generic');
  return (
    <main
      data-editor-surface
      className={`admin-ui ${styles.home}`}
      data-mode={mode}
      aria-label="Pages"
    >
      <div className={styles.pageOverview}>
        <PageHeader
          title="Pages"
          actions={
            <Button
              variant="secondary"
              icon={<PlusIcon />}
              disabled={busy}
              onClick={onAdd}
            >
              Add page
            </Button>
          }
        />
        {pages.length > 0 && (
          <div className={styles.listTools}>
            <Input
              type="search"
              aria-label="Search pages"
              placeholder={`Search ${pages.length} ${pages.length === 1 ? 'page' : 'pages'}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {generic && (
              <Tabs
                value={kind}
                onValueChange={(value) => setKind(value as Kind)}
                tabs={[
                  { value: 'all', label: 'All' },
                  { value: 'static', label: 'Pages' },
                  { value: 'generic', label: 'Templates' },
                ]}
              />
            )}
          </div>
        )}
        <div className={styles.pageTable}>
          <Table aria-label="Pages">
            <Table.Header>
              <Table.Row>
                <Table.Head>Page title</Table.Head>
                <Table.Head className={styles.optional}>Type</Table.Head>
                <Table.Head>URL path</Table.Head>
                <Table.Head className={styles.optional}>Site layout</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {shown.map((page) => (
                <Table.Row
                  key={page.id}
                  className={styles.pageRow}
                  onClick={() => !busy && onOpen(page.id)}
                >
                  <Table.Cell>
                    <div className={styles.titleCell}>
                      <Button
                        variant="ghost"
                        className={styles.pageTitle}
                        disabled={busy}
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpen(page.id);
                        }}
                      >
                        {page.title || 'Untitled page'}
                      </Button>
                      {status?.(page)}
                    </div>
                  </Table.Cell>
                  <Table.Cell className={styles.optional}>
                    {page.kind === 'generic' ? 'Generic' : 'Static'}
                  </Table.Cell>
                  <Table.Cell>
                    {page.kind === 'static' ? page.path || '—' : '—'}
                  </Table.Cell>
                  <Table.Cell className={styles.optional}>
                    {layouts.find((layout) => layout.id === page.layoutId)
                      ?.name ?? 'Unavailable'}
                  </Table.Cell>
                </Table.Row>
              ))}
              {!shown.length && (
                <Table.Row>
                  <Table.Cell colSpan={4}>
                    <p className={styles.muted}>
                      {pages.length ? 'No pages match.' : 'No pages yet.'}
                    </p>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      </div>
    </main>
  );
}
