import SchemaFieldEditor from './SchemaFieldEditor';
import { useState } from 'react';
import { Button } from '@cloudflare/kumo/components/button';
import { Input } from '@cloudflare/kumo/components/input';
import { Select } from '@cloudflare/kumo/components/select';
import { Label } from '@cloudflare/kumo/components/label';
import { CaretRightIcon, PlusIcon } from '@phosphor-icons/react';
import type { Collection, Entry, Field, Media, Page } from '../core/types';
import styles from './editor.module.css';
import FormScreen from './FormScreen';

export default function CollectionSchema({
  collection,
  pages,
  entries,
  media,
  onChange,
  onBack,
  onDelete,
  onCreate,
}: {
  collection: Collection;
  pages: Page[];
  entries: Entry[];
  media: Media[];
  onChange(next: Collection): boolean | void;
  onBack(): void;
  onDelete(): void;
  onCreate?(): void;
}) {
  const [fieldIndex, setFieldIndex] = useState<number | null>(null);
  const [pendingField, setPendingField] = useState<Field | null>(null);
  const field = fieldIndex === null ? undefined : collection.fields[fieldIndex];
  function updateField(next: Field) {
    return onChange({
      ...collection,
      titleField:
        collection.titleField === field?.key ? next.key : collection.titleField,
      fields: collection.fields.map((f, i) => (i === fieldIndex ? next : f)),
    });
  }
  if (pendingField)
    return (
      <SchemaFieldEditor
        field={pendingField}
        media={media}
        values={[]}
        onChange={setPendingField}
        onBack={() => setPendingField(null)}
        onDelete={() => {}}
        onCreate={() => {
          if (
            onChange({
              ...collection,
              fields: [...collection.fields, pendingField],
            }) !== false
          )
            setPendingField(null);
        }}
      />
    );
  if (field)
    return (
      <SchemaFieldEditor
        field={field}
        media={media}
        values={entries.map((e) => e.values[field.key])}
        titleField={collection.titleField === field.key}
        onChange={updateField}
        onBack={() => setFieldIndex(null)}
        onDelete={() => {
          onChange({
            ...collection,
            fields: collection.fields.filter((_, i) => i !== fieldIndex),
          });
          setFieldIndex(null);
        }}
      />
    );
  return (
    <FormScreen
      title={
        onCreate
          ? 'New collection'
          : `${collection.name || 'Untitled collection'} schema`
      }
      onBack={onBack}
      creation={onCreate ? { label: 'Create collection', onCreate } : undefined}
    >
      <div className={styles.field}>
        <Label htmlFor="collection-name">Name</Label>
        <Input
          id="collection-name"
          aria-label="Name"
          value={collection.name}
          onChange={(e) => onChange({ ...collection, name: e.target.value })}
        />
      </div>
      <p className={styles.muted}>
        {collection.mode === 'single' ? 'Single entry' : 'Multiple entries'}
      </p>
      {collection.genericPageId && (
        <div className={styles.field}>
          <Label htmlFor="collection-path">
            {collection.mode === 'single' ? 'Public path' : 'URL prefix'}
          </Label>
          <Input
            id="collection-path"
            aria-label="URL path"
            value={collection.path ?? ''}
            onChange={(e) => onChange({ ...collection, path: e.target.value })}
          />
        </div>
      )}
      <div className={styles.field}>
        <Label htmlFor="generic-page">Generic page</Label>
        <Select
          id="generic-page"
          aria-label="Generic page"
          placeholder="None · data only"
          value={collection.genericPageId ?? ''}
          renderValue={(key) =>
            pages.find((p) => p.id === key)?.title ||
            (key ? 'Missing generic page' : 'None · data only')
          }
          onValueChange={(key) => {
            const { genericPageId, ...rest } = collection;
            onChange(key ? { ...rest, genericPageId: key } : rest);
          }}
        >
          <Select.Option value="">None · data only</Select.Option>
          {pages
            .filter((p) => p.kind === 'generic')
            .map((p) => (
              <Select.Option key={p.id} value={p.id}>
                {p.title}
              </Select.Option>
            ))}
        </Select>
      </div>
      <div className={styles.field}>
        <Label htmlFor="title-field">Entry title field</Label>
        <Select
          id="title-field"
          aria-label="Entry title field"
          renderValue={(key) =>
            collection.fields.find((f) => f.key === key)?.label || key
          }
          value={collection.titleField}
          onValueChange={(value) =>
            onChange({ ...collection, titleField: value ?? '' })
          }
        >
          {collection.fields
            .filter((f) => f.type === 'text')
            .map((f) => (
              <Select.Option key={f.key} value={f.key}>
                {f.label}
              </Select.Option>
            ))}
        </Select>
      </div>
      <div className={styles.sectionHeader}>
        <h2>Fields</h2>
        <Button
          variant="primary"
          icon={<PlusIcon />}
          onClick={() => {
            let n = collection.fields.length;
            while (collection.fields.some((f) => f.key === 'field' + n)) n++;
            setPendingField({
              key: 'field' + n,
              label: 'New field',
              type: 'text',
            });
          }}
        >
          Add field
        </Button>
      </div>
      <ul className={styles.recordList} aria-label="Schema fields">
        {collection.fields.map((f, i) => (
          <li key={i}>
            <Button
              className={styles.recordButton}
              onClick={() => setFieldIndex(i)}
            >
              <span className={styles.recordLabel}>
                {f.label || 'Untitled field'}
                <span className={styles.muted}>
                  {f.type}
                  {f.required ? ' · Required' : ''}
                </span>
              </span>
              <CaretRightIcon aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>
      {!onCreate && (
        <div className={styles.actionFooter}>
          <Button
            variant="secondary-destructive"
            disabled={collection.mode === 'many' && entries.length > 0}
            onClick={onDelete}
          >
            {collection.mode === 'single'
              ? 'Delete collection and its entry'
              : 'Delete empty collection'}
          </Button>
        </div>
      )}
    </FormScreen>
  );
}
