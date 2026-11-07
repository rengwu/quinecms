import type { Content, Entry } from '../core/types';
import Fields from './Fields';
import styles from './editor.module.css';
import { SharedBadge } from './Languages';
import { Button, Input, Label } from './ui';

/** Shared by pending creation and existing entry editing. */
export default function EntryFields({
  entry,
  content,
  onChange,
  onEditTemplate,
  readOnly = false,
  section = 'all',
}: {
  entry: Entry;
  content: Content;
  onChange(entry: Entry): void;
  onEditTemplate?: () => void;
  readOnly?: boolean;
  section?: 'all' | 'fields' | 'meta';
}) {
  const collection = content.collections.find(
    (c) => c.id === entry.collectionId,
  );
  const template = content.pages.find(
    (p) => p.id === collection?.genericPageId && p.kind === 'generic',
  );
  return (
    <>
      {section !== 'fields' && collection?.genericPageId && (
        <div className={styles.field}>
          <p className={styles.muted}>
            Template: {template?.title || 'Unavailable template'}
          </p>
          {template && (
            <>
              <Button
                type="button"
                disabled={readOnly || !onEditTemplate}
                onClick={onEditTemplate}
              >
                Edit shared template
              </Button>
              <p className={styles.muted}>
                Template changes affect all entries using it.
              </p>
            </>
          )}
        </div>
      )}
      {section !== 'fields' &&
        collection?.genericPageId &&
        collection.mode === 'many' && (
          <div className={styles.field}>
            <Label htmlFor="entry-slug">
              URL slug
              <SharedBadge />
            </Label>
            <Input
              id="entry-slug"
              aria-label="URL slug"
              value={entry.slug ?? ''}
              onChange={(event) =>
                onChange({ ...entry, slug: event.target.value })
              }
            />
          </div>
        )}
      {section !== 'meta' && (
        <Fields
          fields={collection?.fields ?? []}
          values={entry.values}
          collections={content.collections}
          media={content.media}
          readOnly={readOnly}
          onChange={(values) => onChange({ ...entry, values })}
        />
      )}
    </>
  );
}
