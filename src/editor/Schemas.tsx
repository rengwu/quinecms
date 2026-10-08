import { CaretRightIcon, PlusIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Button } from '@cloudflare/kumo/components/button';
import { Input } from '@cloudflare/kumo/components/input';
import { Label } from '@cloudflare/kumo/components/label';
import type {
  Content,
  ObjectDefinition,
  Collection,
  Entry,
  Field,
} from '../core/types';
import { id, schemaChanges } from '../core/content';
import { definitionUses, walkValues, schemaIssues } from '../core/schema';
import { fieldDefaults } from '../core/lists';
import SchemaFieldEditor from './SchemaFieldEditor';
import CollectionSchema from './CollectionSchema';
import styles from './editor.module.css';
import FormScreen from './FormScreen';
import { ModelContext } from './ModelContext';
export default function Schemas({
  area,
  content,
  onChange,
}: {
  area: 'collections' | 'objects';
  content: Content;
  onChange(c: Content): void;
}) {
  const [selected, select] = useState(''),
    [error, setError] = useState('');
  const [pending, setPending] = useState<Collection | ObjectDefinition | null>(
    null,
  );
  const collection =
      pending && 'mode' in pending
        ? pending
        : content.collections.find((c) => c.id === selected),
    object =
      pending && !('mode' in pending)
        ? pending
        : content.objects.find((o) => o.id === selected);
  const model = pending
    ? {
        ...content,
        collections: collection
          ? [...content.collections, collection]
          : content.collections,
        objects: object ? [...content.objects, object] : content.objects,
      }
    : content;
  const cancel = () => {
    setPending(null);
    select('');
    setError('');
  };
  function change(next: Content): boolean {
    const errors = [
      ...schemaChanges(content, next),
      ...schemaIssues(next).filter((i) =>
        /three owned|Recursive object/.test(i.message),
      ),
    ];
    if (errors.length) {
      setError(errors.map((e) => `${e.path}: ${e.message}`).join('\n'));
      return false;
    }
    setError('');
    onChange(next);
    return true;
  }
  function createCollection(mode: Collection['mode']) {
    const c: Collection = {
      formatVersion: 1,
      id: id('collection'),
      mode,
      name: mode === 'single' ? 'New single entry' : 'New collection',
      titleField: 'title',
      fields: [{ key: 'title', label: 'Title', type: 'text', required: true }],
    };
    setPending(c);
  }
  function commit() {
    if (!pending) return;
    const issues = schemaIssues(model);
    if (issues.length) {
      setError(issues.map((i) => `${i.path}: ${i.message}`).join('\n'));
      return;
    }
    let next = model;
    if ('mode' in pending && pending.mode === 'single') {
      const entry: Entry = {
        formatVersion: 1,
        id: id('entry'),
        collectionId: pending.id,
        values: fieldDefaults(pending.fields, model),
      };
      next = { ...model, entries: [...content.entries, entry] };
    }
    if (change(next)) {
      select(pending.id);
      setPending(null);
    }
  }

  return (
    <ModelContext.Provider value={model}>
      {error && (
        <p role="alert" style={{ whiteSpace: 'pre-wrap' }}>
          {error}
        </p>
      )}
      {collection ? (
        <CollectionSchema
          collection={collection}
          pages={content.pages}
          entries={content.entries.filter(
            (e) => e.collectionId === collection.id,
          )}
          media={content.media}
          onBack={cancel}
          onCreate={pending ? commit : undefined}
          onChange={(next) => {
            if (pending) {
              setPending(next);
              return;
            }
            return change({
              ...content,
              collections: content.collections.map((c) =>
                c.id === next.id ? next : c,
              ),
            });
          }}
          onDelete={() => {
            if (
              change({
                ...content,
                collections: content.collections.filter(
                  (c) => c.id !== collection.id,
                ),
                entries: content.entries.filter(
                  (e) => e.collectionId !== collection.id,
                ),
              })
            )
              select('');
          }}
        />
      ) : object ? (
        <ObjectSchema
          key={object.id}
          object={object}
          content={content}
          onBack={cancel}
          onCreate={pending ? commit : undefined}
          onChange={(next) => {
            if (pending) {
              setPending(next);
              return;
            }
            return change({
              ...content,
              objects: content.objects.map((o) =>
                o.id === next.id ? next : o,
              ),
            });
          }}
          onDelete={() => {
            if (
              change({
                ...content,
                objects: content.objects.filter((o) => o.id !== object.id),
              })
            )
              select('');
          }}
        />
      ) : (
        <>
          <h2>{area === 'collections' ? 'Collections' : 'Objects'}</h2>
          <div className={styles.row}>
            {area === 'collections' ? (
              <>
                <Button
                  variant="primary"
                  icon={<PlusIcon />}
                  onClick={() => createCollection('many')}
                >
                  Add collection
                </Button>
                <Button
                  variant="primary"
                  icon={<PlusIcon />}
                  onClick={() => createCollection('single')}
                >
                  Add single-entry collection
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                icon={<PlusIcon />}
                onClick={() => {
                  const o: ObjectDefinition = {
                    formatVersion: 1,
                    id: id('object'),
                    name: 'New object',
                    fields: [],
                  };
                  setPending(o);
                }}
              >
                Add object
              </Button>
            )}
          </div>
          <ul
            className={styles.recordList}
            aria-label={
              area === 'collections'
                ? 'Collection schemas'
                : 'Object definitions'
            }
          >
            {(area === 'collections'
              ? content.collections
              : content.objects
            ).map((record) => (
              <li key={record.id}>
                <Button
                  className={styles.recordButton}
                  onClick={() => select(record.id)}
                >
                  <span>
                    {record.name}
                    <span className={styles.muted}>
                      {' · '}
                      {record.fields.length} fields
                      {'mode' in record && record.mode === 'single'
                        ? ' · Single entry'
                        : ''}
                    </span>
                  </span>
                  <CaretRightIcon />
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </ModelContext.Provider>
  );
}
function ObjectSchema({
  object,
  content,
  onChange,
  onBack,
  onDelete,
  onCreate,
}: {
  object: ObjectDefinition;
  content: Content;
  onChange(o: ObjectDefinition): boolean | void;
  onBack(): void;
  onDelete(): void;
  onCreate?(): void;
}) {
  const [selected, select] = useState<number | null>(null);
  const [pendingField, setPendingField] = useState<Field | null>(null);
  const field = selected === null ? undefined : object.fields[selected];
  const uses = definitionUses(content, object.id);
  const values: Record<string, unknown>[] = [];
  for (const entry of content.entries) {
    const col = content.collections.find((c) => c.id === entry.collectionId);
    if (col)
      walkValues(col.fields, entry.values, content, ({ field, value }) => {
        if (
          field.type === 'object' &&
          field.objectId === object.id &&
          value &&
          !Array.isArray(value) &&
          typeof value === 'object'
        )
          values.push(value);
        if (
          field.type === 'array' &&
          field.of.type === 'object' &&
          field.of.objectId === object.id &&
          Array.isArray(value)
        )
          for (const row of value)
            if (row && typeof row === 'object' && !Array.isArray(row))
              values.push(row);
      });
  }
  if (pendingField)
    return (
      <SchemaFieldEditor
        field={pendingField}
        media={content.media}
        values={[]}
        onChange={setPendingField}
        onBack={() => setPendingField(null)}
        onDelete={() => {}}
        onCreate={() => {
          if (
            onChange({
              ...object,
              fields: [...object.fields, pendingField],
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
        values={values.map((v) => v[field.key])}
        media={content.media}
        onBack={() => select(null)}
        onChange={(next) =>
          onChange({
            ...object,
            fields: object.fields.map((f, i) => (i === selected ? next : f)),
          })
        }
        onDelete={() => {
          onChange({
            ...object,
            fields: object.fields.filter((_, i) => i !== selected),
          });
          select(null);
        }}
      />
    );
  return (
    <FormScreen
      title={onCreate ? 'New object' : object.name || 'Untitled object'}
      onBack={onBack}
      creation={onCreate ? { label: 'Create object', onCreate } : undefined}
    >
      <div className={styles.field}>
        <Label htmlFor="object-name">Name</Label>
        <Input
          id="object-name"
          aria-label="Name"
          value={object.name}
          onChange={(e) => onChange({ ...object, name: e.target.value })}
        />
      </div>
      {!!uses.length && (
        <>
          <h3>Used by</h3>
          <p className={styles.muted}>
            Changes apply to these schemas and their entries.
          </p>
          <ul>
            {uses.map((use, i) => (
              <li key={i}>
                {use.label} · {use.path}
              </li>
            ))}
          </ul>
        </>
      )}
      <div className={styles.sectionHeader}>
        <h3>Fields</h3>
        <Button
          variant="primary"
          icon={<PlusIcon />}
          onClick={() => {
            let n = object.fields.length;
            while (object.fields.some((f) => f.key === 'field' + n)) n++;
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
      <ul className={styles.recordList}>
        {object.fields.map((f, i) => (
          <li key={i}>
            <Button className={styles.recordButton} onClick={() => select(i)}>
              {f.label} · {f.type} →
            </Button>
          </li>
        ))}
      </ul>
      {!onCreate && (
        <Button
          variant="secondary-destructive"
          disabled={uses.length > 0}
          onClick={onDelete}
        >
          Delete unused object
        </Button>
      )}
    </FormScreen>
  );
}
