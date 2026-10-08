import { useState } from 'react';
import { Button } from '@cloudflare/kumo/components/button';
import { PlusIcon } from '@phosphor-icons/react';
import type { Collection, Field, Media, Values } from '../core/types';
import { fieldDefaults, listRows, rowId, normalizeLists } from '../core/lists';
import BlockList from './BlockList';
import Fields from './Fields';
import { PanelLevel } from './PanelNavigation';
import { rowFields } from '../core/schema';
import { useModel } from './ModelContext';
import styles from './editor.module.css';

export default function ListField({
  field,
  value,
  onChange,
  media,
  collections,
  readOnly,
  depth = 0,
}: {
  field: Extract<Field, { type: 'list' | 'array' }>;
  depth?: number;
  value: unknown;
  onChange(value: Values[]): void;
  media: Media[];
  collections: Collection[];
  readOnly: boolean;
}) {
  const [selected, select] = useState('');
  const [pending, setPending] = useState<Values | null>(null);
  const model = useModel();
  const fields = rowFields(field, model) ?? [];
  if (depth >= 3)
    return <p role="alert">This list exceeds the three-level nesting limit.</p>;
  const rows = listRows(value);
  // Older/imported lists without IDs remain editable; assign identities on the first mutation.
  const identified: (Values & { _rowId: string })[] = rows.map((row, i) => ({
    ...row,
    _rowId: String(row._rowId || `legacy-${i}`),
  }));
  const row = identified.find((r) => r._rowId === selected);
  const rowLabel = (row: Values, i: number) =>
    String(
      fields
        .filter((f) => ['text', 'date', 'number'].includes(f.type))
        .map((f) => row[f.key])
        .find((v) => v !== null && v !== undefined && v !== '') ??
        `Item ${i + 1}`,
    );
  const save = (next: Values[]) =>
    onChange(
      next.map((r) => ({
        ...r,
        _rowId: String(r._rowId).startsWith('legacy-') ? rowId() : r._rowId,
      })),
    );
  if (pending)
    return (
      <PanelLevel
        title="New item"
        context={field.label}
        onBack={() => setPending(null)}
        creation={{
          label: 'Create item',
          onCreate: () => {
            save([...identified, pending]);
            setPending(null);
          },
        }}
      >
        <Fields
          fields={fields}
          depth={depth + 1}
          values={pending}
          media={media}
          collections={collections}
          readOnly={readOnly}
          onChange={setPending}
        />
      </PanelLevel>
    );
  if (row)
    return (
      <PanelLevel
        title={rowLabel(row, identified.indexOf(row))}
        context={field.label}
        onBack={() => select('')}
      >
        <Fields
          fields={fields}
          depth={depth + 1}
          values={row}
          media={media}
          collections={collections}
          readOnly={readOnly}
          onChange={(next) =>
            onChange(identified.map((r) => (r._rowId === selected ? next : r)))
          }
        />
        <Button
          disabled={
            readOnly || (field.max !== undefined && rows.length >= field.max)
          }
          onClick={() => {
            const copy = (
              normalizeLists(field, [row], model, depth) as Values[]
            )[0];
            save([...identified, copy]);
            select(String(copy._rowId));
          }}
        >
          Duplicate item
        </Button>
        <Button
          variant="secondary-destructive"
          disabled={readOnly}
          onClick={() => {
            save(identified.filter((r) => r._rowId !== selected));
            select('');
          }}
        >
          Remove item
        </Button>
      </PanelLevel>
    );
  const blocks = identified.map((r) => ({
    id: r._rowId,
    type: r._rowId,
    version: 1,
    props: r,
  }));
  return (
    <div className={styles.formStack}>
      {!!rows.length && (
        <BlockList
          blocks={blocks}
          definitions={identified.map((r, i) => ({
            type: r._rowId,
            version: 1,
            label: String(
              fields
                .filter((f) => ['text', 'date', 'number'].includes(f.type))
                .map((f) => r[f.key])
                .find((v) => v !== null && v !== undefined && v !== '') ??
                `Item ${i + 1}`,
            ),
          }))}
          disabled={readOnly}
          onSelect={select}
          onChange={(next) => save(next.map((b) => b.props))}
          label={field.label}
          showVersion={false}
        />
      )}
      {!rows.length && <p className={styles.muted}>No items yet.</p>}
      <Button
        variant="primary"
        icon={<PlusIcon />}
        disabled={
          readOnly || (field.max !== undefined && rows.length >= field.max)
        }
        onClick={() => {
          const item = {
            ...fieldDefaults(fields, model, depth + 1),
            _rowId: rowId(),
          };
          setPending(item);
        }}
      >
        Add item
      </Button>
    </div>
  );
}
