import { useState } from 'react';
import { Button } from '@cloudflare/kumo/components/button';
import { Input, InputArea } from '@cloudflare/kumo/components/input';
import { Select } from '@cloudflare/kumo/components/select';
import { Checkbox } from '@cloudflare/kumo/components/checkbox';
import { Label } from '@cloudflare/kumo/components/label';
import { PlusIcon, CaretRightIcon } from '@phosphor-icons/react';
import type { Field, Media } from '../core/types';
import { blank } from '../core/content';
import { listRows } from '../core/lists';
import Fields from './Fields';
import styles from './editor.module.css';

export default function SchemaFieldEditor({
  field,
  values,
  media,
  titleField = false,
  nested = false,
  onChange,
  onBack,
  onDelete,
}: {
  field: Field;
  values: unknown[];
  media: Media[];
  titleField?: boolean;
  nested?: boolean;
  onChange(field: Field): void;
  onBack(): void;
  onDelete(): void;
}) {
  const [childIndex, selectChild] = useState<number | null>(null);
  const populated = values.some(
    (v) => !blank(v) && (!Array.isArray(v) || v.length > 0),
  );
  const child =
    field.type === 'list' && childIndex !== null
      ? field.fields[childIndex]
      : undefined;
  if (child && field.type === 'list')
    return (
      <SchemaFieldEditor
        key={childIndex}
        field={child}
        nested
        media={media}
        values={values.flatMap(listRows).map((r) => r[child.key])}
        onBack={() => selectChild(null)}
        onChange={(next) =>
          onChange({
            ...field,
            fields: field.fields.map((f, i) => (i === childIndex ? next : f)),
          })
        }
        onDelete={() => {
          onChange({
            ...field,
            fields: field.fields.filter((_, i) => i !== childIndex),
          });
          selectChild(null);
        }}
      />
    );
  return (
    <>
      <Button variant="ghost" className={styles.back} onClick={onBack}>
        ← Back
      </Button>
      <h2>{field.label || 'Untitled field'}</h2>
      <div className={styles.field}>
        <Label htmlFor="schema-label">Label</Label>
        <Input
          id="schema-label"
          aria-label="Label"
          value={field.label}
          onChange={(e) => onChange({ ...field, label: e.target.value })}
        />
      </div>
      <div className={styles.field}>
        <Label htmlFor="schema-key">Field key</Label>
        <Input
          id="schema-key"
          aria-label="Field key"
          disabled={populated}
          value={field.key}
          onChange={(e) => onChange({ ...field, key: e.target.value })}
        />
      </div>
      <div className={styles.field}>
        <Label htmlFor="schema-type">Field type</Label>
        <Select
          id="schema-type"
          aria-label="Field type"
          value={field.type}
          disabled={populated || field.type === 'custom'}
          onValueChange={(type) => {
            if (type)
              onChange({
                key: field.key,
                label: field.label,
                required: field.required,
                type,
                ...(type === 'select' ? { options: [] } : {}),
                ...(type === 'list' ? { fields: [] } : {}),
              } as Field);
          }}
        >
          {[
            'text',
            'url',
            'richtext',
            'number',
            'date',
            'toggle',
            'select',
            'media',
            ...(!nested ? ['list'] : []),
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
              onChange({
                ...field,
                options: e.target.value
                  .split('\n')
                  .map((value) => ({ value, label: value })),
              })
            }
          />
        </div>
      )}
      <Checkbox
        label="Required"
        checked={!!field.required}
        onCheckedChange={(required) => onChange({ ...field, required })}
      />
      {field.type === 'list' && (
        <>
          <div className={styles.sectionHeader}>
            <h3>Item fields</h3>
            <Button
              variant="primary"
              icon={<PlusIcon />}
              onClick={() => {
                let n = field.fields.length;
                while (field.fields.some((f) => f.key === 'field' + n)) n++;
                onChange({
                  ...field,
                  fields: [
                    ...field.fields,
                    { key: 'field' + n, label: 'New field', type: 'text' },
                  ],
                });
                selectChild(field.fields.length);
              }}
            >
              Add field
            </Button>
          </div>
          <ul className={styles.recordList} aria-label="Item fields">
            {field.fields.map((f, i) => (
              <li key={i}>
                <Button
                  className={styles.recordButton}
                  onClick={() => selectChild(i)}
                >
                  <span className={styles.recordLabel}>
                    {f.label}
                    <span className={styles.muted}>
                      {f.key} · {f.type}
                    </span>
                  </span>
                  <CaretRightIcon />
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
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
          onChange={(v) => onChange({ ...field, default: v.default })}
        />
      )}
      <div className={styles.actionFooter}>
        <Button
          variant="secondary-destructive"
          disabled={populated || titleField}
          onClick={onDelete}
        >
          Remove field
        </Button>
      </div>
    </>
  );
}
