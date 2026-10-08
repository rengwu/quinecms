import { useState } from 'react';
import { Button } from '@cloudflare/kumo/components/button';
import { Input } from '@cloudflare/kumo/components/input';
import type { Json } from '../core/types';
import { entryLabel } from '../core/schema';
import { useModel } from './ModelContext';
import { PanelLevel } from './PanelNavigation';
import styles from './editor.module.css';
export default function ReferenceField({
  label,
  collectionId,
  multiple,
  value,
  onChange,
  readOnly,
}: {
  label: string;
  collectionId: string;
  multiple: boolean;
  value: unknown;
  onChange(v: Json): void;
  readOnly: boolean;
}) {
  const model = useModel();
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState('');
  const selected = (
    multiple
      ? Array.isArray(value)
        ? value
        : []
      : typeof value === 'string' && value
        ? [value]
        : []
  ).filter((v): v is string => typeof v === 'string');
  const entries = model.entries.filter((e) => e.collectionId === collectionId);
  const name = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    return entry ? entryLabel(entry, model) : `Missing entry · ${id}`;
  };
  const change = (ids: string[]) => onChange(multiple ? ids : (ids[0] ?? null));
  const move = (i: number, offset: number) => {
    const ids = [...selected];
    [ids[i], ids[i + offset]] = [ids[i + offset], ids[i]];
    change(ids);
  };
  if (!open)
    return (
      <Button disabled={readOnly} onClick={() => setOpen(true)}>
        {selected.length
          ? multiple
            ? `${selected.length} selected · ${label}`
            : name(selected[0])
          : `Select ${label}`}
      </Button>
    );
  return (
    <PanelLevel
      title={label}
      context={`Choose existing entries from ${model.collections.find((c) => c.id === collectionId)?.name ?? 'the target collection'}.`}
      onBack={() => setOpen(false)}
    >
      {!!selected.length && (
        <ol className={styles.recordList} aria-label={`Selected ${label}`}>
          {selected.map((id, i) => (
            <li key={id}>
              <span>{name(id)}</span>
              <div className={styles.row}>
                {multiple && (
                  <>
                    <Button
                      aria-label={`Move ${name(id)} up`}
                      disabled={readOnly || i === 0}
                      onClick={() => move(i, -1)}
                    >
                      ↑
                    </Button>
                    <Button
                      aria-label={`Move ${name(id)} down`}
                      disabled={readOnly || i === selected.length - 1}
                      onClick={() => move(i, 1)}
                    >
                      ↓
                    </Button>
                  </>
                )}
                <Button
                  disabled={readOnly}
                  aria-label={`Remove ${name(id)}`}
                  onClick={() => change(selected.filter((x) => x !== id))}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}
      <Input
        aria-label={`Search ${label}`}
        placeholder="Search entries…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul className={styles.recordList} aria-label={`Available ${label}`}>
        {entries
          .filter(
            (e) =>
              !selected.includes(e.id) &&
              `${entryLabel(e, model)} ${e.id}`
                .toLowerCase()
                .includes(query.toLowerCase()),
          )
          .map((e) => (
            <li key={e.id}>
              <Button
                className={styles.recordButton}
                disabled={readOnly}
                onClick={() => {
                  change(multiple ? [...selected, e.id] : [e.id]);
                  if (!multiple) setOpen(false);
                }}
              >
                {entryLabel(e, model)}
              </Button>
            </li>
          ))}
      </ul>
      {!entries.length && <p>Create entries in Content first.</p>}
    </PanelLevel>
  );
}
