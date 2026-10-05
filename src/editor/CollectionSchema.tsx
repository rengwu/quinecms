import { useState } from 'react';
import { Button } from '@cloudflare/kumo/components/button';
import { Input, InputArea } from '@cloudflare/kumo/components/input';
import { Select } from '@cloudflare/kumo/components/select';
import { Checkbox } from '@cloudflare/kumo/components/checkbox';
import { Label } from '@cloudflare/kumo/components/label';
import { CaretRightIcon, PlusIcon } from '@phosphor-icons/react';
import type { Collection, Entry, Field, Media, Page } from '../core/types';
import { blank } from '../core/content';
import Fields from './Fields';
import styles from './editor.module.css';

export default function CollectionSchema({
  collection,
  pages,
  entries,
  media,
  onChange,
  onBack,
  onDelete,
}: {
  collection: Collection;
  pages: Page[];
  entries: Entry[];
  media: Media[];
  onChange(next: Collection): void;
  onBack(): void;
  onDelete(): void;
}) {
  const [fieldIndex, setFieldIndex] = useState<number | null>(null);
  const field = fieldIndex === null ? undefined : collection.fields[fieldIndex];
  const populated = field && entries.some((e) => !blank(e.values[field.key]));
  function updateField(next: Field) {
    onChange({
      ...collection,
      titleField:
        collection.titleField === field?.key ? next.key : collection.titleField,
      fields: collection.fields.map((f, i) => (i === fieldIndex ? next : f)),
    });
  }
  if (field)
    return (
      <>
        <Button
          className={styles.back}
          variant="ghost"
          onClick={() => setFieldIndex(null)}
        >
          ← Back
        </Button>
        <h2>{field.label || 'Untitled field'}</h2>
        <div className={styles.field}>
          <Label htmlFor="schema-label">Label</Label>
          <Input
            id="schema-label"
            aria-label="Label"
            value={field.label}
            onChange={(e) => updateField({ ...field, label: e.target.value })}
          />
        </div>
        <div className={styles.field}>
          <Label htmlFor="schema-key">Field key</Label>
          <Input
            id="schema-key"
            aria-label="Field key"
            value={field.key}
            disabled={populated}
            onChange={(e) => updateField({ ...field, key: e.target.value })}
          />
        </div>
        <div className={styles.field}>
          <Label htmlFor="schema-type">Field type</Label>
          <Select
            id="schema-type"
            aria-label="Field type"
            value={field.type}
            disabled={populated || field.type === 'custom'}
            onValueChange={(value) => {
              if (!value) return;
              updateField({
                key: field.key,
                label: field.label,
                required: field.required,
                type: value,
                ...(value === 'select' ? { options: [] } : {}),
              } as Field);
            }}
          >
            {[
              'text',
              'richtext',
              'number',
              'date',
              'toggle',
              'select',
              'media',
              ...(field.type === 'custom' ? ['custom'] : []),
            ].map((type) => (
              <Select.Option key={type} value={type}>
                {type}
              </Select.Option>
            ))}
          </Select>
        </div>
        {populated && (
          <p className={styles.muted}>
            The key and type are fixed because this field contains content.
          </p>
        )}
        {field.type === 'select' && (
          <div className={styles.field}>
            <Label htmlFor="schema-options">Options (one value per line)</Label>
            <InputArea
              id="schema-options"
              aria-label="Options (one value per line)"
              value={field.options.map((o) => o.value).join('\n')}
              onChange={(e) =>
                updateField({
                  ...field,
                  options: e.target.value.split('\n').map((value) => ({
                    value,
                    label:
                      field.options.find((o) => o.value === value)?.label ??
                      value,
                  })),
                })
              }
            />
          </div>
        )}
        <div className={styles.field}>
          <Checkbox
            label="Required"
            checked={!!field.required}
            onCheckedChange={(required) => updateField({ ...field, required })}
          />
        </div>
        {field.type !== 'custom' && (
          <Fields
            fields={[
              {
                ...field,
                key: 'default',
                label: 'Default value',
                required: false,
                widget: undefined,
              },
            ]}
            values={{ default: field.default ?? null }}
            media={media}
            onChange={(values) =>
              updateField({ ...field, default: values.default })
            }
          />
        )}
        <div className={styles.actionFooter}>
          <Button
            variant="secondary-destructive"
            disabled={populated || collection.titleField === field.key}
            onClick={() => {
              onChange({
                ...collection,
                fields: collection.fields.filter((_, i) => i !== fieldIndex),
              });
              setFieldIndex(null);
            }}
          >
            Remove field
          </Button>
        </div>
      </>
    );
  return (
    <>
      <Button className={styles.back} variant="ghost" onClick={onBack}>
        ← Back
      </Button>
      <h2>{collection.name || 'Untitled collection'} schema</h2>
      <div className={styles.field}>
        <Label htmlFor="collection-name">Name</Label>
        <Input
          id="collection-name"
          aria-label="Name"
          value={collection.name}
          onChange={(e) => onChange({ ...collection, name: e.target.value })}
        />
      </div>
      <div className={styles.field}>
        <Label htmlFor="collection-path">URL path</Label>
        <Input
          id="collection-path"
          aria-label="URL path"
          value={collection.path}
          onChange={(e) => onChange({ ...collection, path: e.target.value })}
        />
      </div>
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
            onChange({
              ...collection,
              fields: [
                ...collection.fields,
                { key: 'field' + n, label: 'New field', type: 'text' },
              ],
            });
            setFieldIndex(collection.fields.length);
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
      <div className={styles.actionFooter}>
        <Button
          variant="secondary-destructive"
          disabled={entries.length > 0}
          onClick={onDelete}
        >
          Delete empty collection
        </Button>
      </div>
    </>
  );
}
