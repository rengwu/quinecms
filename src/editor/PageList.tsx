import { Button } from '@cloudflare/kumo/components/button';
import { Table } from '@cloudflare/kumo/components/table';
import { PlusIcon } from '@phosphor-icons/react';
import type { Page } from '../core/types';
import styles from './editor.module.css';

export default function PageList({
  pages,
  busy,
  onAdd,
  onOpen,
}: {
  pages: Page[];
  busy: boolean;
  onAdd(): void;
  onOpen(id: string): void;
}) {
  return (
    <main
      className={`kumo-ui ${styles.home}`}
      data-mode="dark"
      aria-label="Pages"
    >
      <div className={styles.pageOverview}>
        <div className={styles.sectionHeader}>
          <h1>Pages</h1>
          <Button
            variant="primary"
            icon={<PlusIcon />}
            disabled={busy}
            onClick={onAdd}
          >
            Add page
          </Button>
        </div>
        <div className={styles.pageTable}>
          <Table aria-label="Pages">
            <Table.Header>
              <Table.Row>
                <Table.Head>Page title</Table.Head>
                <Table.Head>Type</Table.Head>
                <Table.Head>URL path</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {pages.map((page) => (
                <Table.Row
                  key={page.id}
                  className={styles.pageRow}
                  onClick={() => !busy && onOpen(page.id)}
                >
                  <Table.Cell>
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
                  </Table.Cell>
                  <Table.Cell>
                    {page.kind === 'generic' ? 'Generic' : 'Static'}
                  </Table.Cell>
                  <Table.Cell>
                    {page.kind === 'static' ? page.path || '—' : '—'}
                  </Table.Cell>
                </Table.Row>
              ))}
              {!pages.length && (
                <Table.Row>
                  <Table.Cell colSpan={3}>
                    <p className={styles.muted}>No pages yet.</p>
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
