import { Input } from '@cloudflare/kumo/components/input';
import { Label } from '@cloudflare/kumo/components/label';
import type { Content, Entry, Page } from '../core/types';
import EntryFields from './EntryFields';
import LayoutChoice from './LayoutChoice';
import FormScreen from './FormScreen';
import styles from './editor.module.css';

export default function DocumentCreation({
  document,
  content,
  onChange,
  onCreate,
  onCancel,
}: {
  document: Page | Entry;
  content: Content;
  onChange(next: Page | Entry): void;
  onCreate(): void;
  onCancel(): void;
}) {
  const page = 'kind' in document;
  return (
    <FormScreen
      title={
        page
          ? document.kind === 'generic'
            ? 'New generic page'
            : 'New page'
          : 'New entry'
      }
      onBack={onCancel}
      creation={{ label: page ? 'Create page' : 'Create entry', onCreate }}
    >
      {page ? (
        <>
          <div className={styles.field}>
            <Label htmlFor="new-page-title">Page title</Label>
            <Input
              id="new-page-title"
              aria-label="Page title"
              value={document.title}
              onChange={(e) => onChange({ ...document, title: e.target.value })}
            />
          </div>
          <LayoutChoice
            content={content}
            value={document.layoutId}
            onChange={(layoutId) => onChange({ ...document, layoutId })}
          />
          {document.kind === 'static' && (
            <div className={styles.field}>
              <Label htmlFor="new-page-path">URL path</Label>
              <Input
                id="new-page-path"
                aria-label="URL path"
                value={document.path ?? ''}
                onChange={(e) =>
                  onChange({ ...document, path: e.target.value })
                }
              />
            </div>
          )}
        </>
      ) : (
        <EntryFields entry={document} content={content} onChange={onChange} />
      )}
    </FormScreen>
  );
}
