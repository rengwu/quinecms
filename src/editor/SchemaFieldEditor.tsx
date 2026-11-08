import { BackDepth, useBackDepth } from './browser-back';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { CaretRightIcon, PlusIcon } from '@phosphor-icons/react';
import type { Field, Media, ObjectShape } from '../core/types';
import { hasValue, isRecord } from '../core/schema';
import { useModel } from './ModelContext';
import { useLanguage } from './Languages';
import { localized } from '../core/languages';
import { PanelLevel } from './PanelNavigation';
import Fields from './Fields';
import styles from './editor.module.css';
import FormScreen from './FormScreen';
import { Button, Checkbox, Input, InputArea, Label, Select } from './ui';

export default function SchemaFieldEditor(
  props: ComponentProps<typeof FieldEditor>,
) {
  const depth = Math.max(1, useBackDepth()) + 1;
  return (
    <BackDepth.Provider value={depth}>
      <FieldEditor {...props} />
    </BackDepth.Provider>
  );
}
function FieldEditor({
  field,
  values,
  media,
  titleField = false,
  depth = 0,
  onChange,
  onBack,
  onDelete,
  onCreate,
}: {
  field: Field;
  values: unknown[];
  media: Media[];
  titleField?: boolean;
  depth?: number;
  onChange(field: Field): boolean | void;
  onBack(): void;
  onDelete(): void;
  onCreate?(): void;
}) {
  const model = useModel();
  const { enabled: languages } = useLanguage();
  const [childIndex, selectChild] = useState<number | null>(null),
    [editingDefault, setEditingDefault] = useState(false);
  const [pendingChild, setPendingChild] = useState<Field | null>(null);
  const populated = values.some(hasValue);
  const shape =
    field.type === 'object'
      ? field
      : field.type === 'array' && field.of.type === 'object'
        ? field.of
        : undefined;
  const children = shape?.fields ?? [];
  const child = childIndex === null ? undefined : children[childIndex];
  function setShape(next: ObjectShape) {
    if (field.type === 'object') {
      const { objectId, fields, ...rest } = field;
      return onChange({ ...rest, ...next });
    } else if (field.type === 'array')
      return onChange({ ...field, of: { type: 'object', ...next } });
  }
  const pendingEditor = pendingChild ? (
    <SchemaFieldEditor
      field={pendingChild}
      media={media}
      values={[]}
      depth={depth + 1}
      onChange={setPendingChild}
      onBack={() => setPendingChild(null)}
      onDelete={() => {}}
      onCreate={() => {
        if (setShape({ fields: [...children, pendingChild] }) !== false)
          setPendingChild(null);
      }}
    />
  ) : null;
  const childEditor = child ? (
    <SchemaFieldEditor
      key={childIndex}
      field={child}
      media={media}
      depth={depth + 1}
      values={(field.type === 'array'
        ? values.flatMap((v) => (Array.isArray(v) ? v : []))
        : values
      )
        .filter(isRecord)
        .map((v) => v[child.key])}
      onBack={() => selectChild(null)}
      onChange={(next) =>
        setShape({
          fields: children.map((f, i) => (i === childIndex ? next : f)),
        })
      }
      onDelete={() => {
        setShape({ fields: children.filter((_, i) => i !== childIndex) });
        selectChild(null);
      }}
    />
  ) : null;
  const reference =
    field.type === 'reference'
      ? field
      : field.type === 'array' && field.of.type === 'reference'
        ? field.of
        : undefined;
  if (editingDefault)
    return (
      <PanelLevel
        title={`Default · ${field.label}`}
        onBack={() => setEditingDefault(false)}
      >
        <Fields
          fields={[
            { ...field, key: 'default', label: field.label, required: false },
          ]}
          values={{ default: field.default ?? null }}
          media={media}
          depth={depth}
          onChange={(v) => onChange({ ...field, default: v.default })}
        />
      </PanelLevel>
    );
  return (
    <FormScreen
      stack
      title={onCreate ? 'New field' : field.label || 'Untitled field'}
      onBack={onBack}
      creation={onCreate ? { label: 'Create field', onCreate } : undefined}
      actions={
        onCreate ? undefined : (
          <Button
            variant="secondary-destructive"
            disabled={populated || titleField}
            onClick={onDelete}
          >
            Remove field
          </Button>
        )
      }
    >
      {pendingEditor}
      {childEditor}
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
          disabled={populated}
          onValueChange={(type) => {
            if (type)
              onChange({
                key: field.key,
                label: field.label,
                required: field.required,
                type,
                ...(type === 'select' ? { options: [] } : {}),
                ...(type === 'object' ? { fields: [] } : {}),
                ...(type === 'reference'
                  ? { collectionId: model.collections[0]?.id ?? '' }
                  : {}),
                ...(type === 'array'
                  ? {
                      of:
                        depth >= 3
                          ? {
                              type: 'reference',
                              collectionId: model.collections[0]?.id ?? '',
                            }
                          : { type: 'object', fields: [] },
                    }
                  : {}),
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
            'reference',
            ...(depth < 3 ? ['object', 'array'] : ['array']),
          ].map((type) => (
            <Select.Option key={type} value={type}>
              {type}
            </Select.Option>
          ))}
        </Select>
      </div>
      {populated && (
        <p className={styles.muted}>
          This field contains content. Clear affected values before changing its
          key or type.
        </p>
      )}
      {field.type === 'array' && (
        <div className={styles.field}>
          <Label htmlFor="array-items">Array items</Label>
          <Select
            id="array-items"
            aria-label="Array items"
            value={field.of.type}
            disabled={populated}
            onValueChange={(type) =>
              onChange({
                ...field,
                of:
                  type === 'reference'
                    ? {
                        type: 'reference',
                        collectionId: model.collections[0]?.id ?? '',
                      }
                    : { type: 'object', fields: [] },
              })
            }
          >
            {depth < 3 && (
              <Select.Option value="object">Owned objects</Select.Option>
            )}
            <Select.Option value="reference">References</Select.Option>
          </Select>
        </div>
      )}
      {reference && (
        <div className={styles.field}>
          <Label htmlFor="reference-collection">Target collection</Label>
          <Select
            id="reference-collection"
            aria-label="Target collection"
            value={reference.collectionId}
            disabled={populated}
            renderValue={(id) =>
              model.collections.find((c) => c.id === id)?.name ??
              'Choose collection'
            }
            onValueChange={(collectionId) => {
              if (field.type === 'reference')
                onChange({ ...field, collectionId: collectionId ?? '' });
              else if (field.type === 'array')
                onChange({
                  ...field,
                  of: { type: 'reference', collectionId: collectionId ?? '' },
                });
            }}
          >
            {model.collections.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      )}
      {shape && (
        <>
          <div className={styles.field}>
            <Label htmlFor="object-definition">Object definition</Label>
            <Select
              id="object-definition"
              aria-label="Object definition"
              value={shape.objectId ?? ''}
              disabled={populated}
              renderValue={(id) =>
                id
                  ? (model.objects.find((o) => o.id === id)?.name ??
                    'Missing object')
                  : 'Inline fields'
              }
              onValueChange={(objectId) =>
                setShape(objectId ? { objectId } : { fields: [] })
              }
            >
              <Select.Option value="">Inline fields</Select.Option>
              {model.objects.map((o) => (
                <Select.Option key={o.id} value={o.id}>
                  {o.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          {shape.objectId ? (
            <p className={styles.muted}>
              Edit the shared definition in Schemas → Objects. Each entry owns
              its values.
            </p>
          ) : (
            <>
              <div className={styles.sectionHeader}>
                <h3>
                  {field.type === 'array' ? 'Item fields' : 'Object fields'}
                </h3>
                <Button
                  variant="secondary"
                  icon={<PlusIcon />}
                  onClick={() => {
                    let n = children.length;
                    while (children.some((f) => f.key === 'field' + n)) n++;
                    setPendingChild({
                      key: 'field' + n,
                      label: 'New field',
                      type: 'text',
                    });
                  }}
                >
                  Add field
                </Button>
              </div>
              <ul className={styles.recordList}>
                {children.map((f, i) => (
                  <li key={i}>
                    <Button
                      className={styles.recordButton}
                      onClick={() => selectChild(i)}
                    >
                      <span className={styles.recordLabel}>
                        <span>{f.label || 'Untitled field'}</span>
                        <span className={styles.muted}>{f.type}</span>
                      </span>
                      <CaretRightIcon aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
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
      {(field.type === 'number' || field.type === 'array') && (
        <div className={styles.row}>
          {(['min', 'max'] as const).map((key) => (
            <div className={styles.field} key={key}>
              <Label htmlFor={`field-${key}`}>
                {key === 'min' ? 'Minimum' : 'Maximum'}
              </Label>
              <Input
                id={`field-${key}`}
                aria-label={key === 'min' ? 'Minimum' : 'Maximum'}
                type="number"
                value={field[key] ?? ''}
                onChange={(e) =>
                  onChange({
                    ...field,
                    [key]:
                      e.target.value === ''
                        ? undefined
                        : Number(e.target.value),
                  })
                }
              />
            </div>
          ))}
        </div>
      )}
      <Checkbox
        label="Required"
        checked={!!field.required}
        onCheckedChange={(required) => onChange({ ...field, required })}
      />
      {languages &&
        field.type !== 'object' &&
        !(field.type === 'array' && field.of?.type === 'object') && (
          <Checkbox
            label={
              field.type === 'media' ? 'Per-language image' : 'Per language'
            }
            checked={localized(field)}
            onCheckedChange={(on) => onChange({ ...field, localized: on })}
          />
        )}
      <Button
        className={styles.alignStart}
        onClick={() => setEditingDefault(true)}
      >
        Edit default value
      </Button>
    </FormScreen>
  );
}
