import ListField from './ListField';
import { PanelNavigation, usePanelNavigation } from './PanelNavigation';
import { Input } from '@cloudflare/kumo/components/input';
import { InputArea } from '@cloudflare/kumo/components/input';
import { Select } from '@cloudflare/kumo/components/select';
import { Checkbox } from '@cloudflare/kumo/components/checkbox';
import { Label } from '@cloudflare/kumo/components/label';
import { lazy, Suspense, useId } from 'react';
import type { Field, Media, Values, Collection } from '../core/types';
import { blank, compatible } from '../core/content';
import { widgets } from './widgets';
import styles from './editor.module.css';
const controls = Object.fromEntries(
  Object.entries(widgets).map(([name, loader]) => [name, lazy(loader)]),
);
export default function Fields({
  fields,
  values,
  onChange,
  media,
  collections = [],
  readOnly = false,
}: {
  fields: Field[];
  values: Values;
  onChange(v: Values): void;
  media: Media[];
  collections?: Collection[];
  readOnly?: boolean;
}) {
  const prefix = useId();
  const navigation = usePanelNavigation();
  if (!navigation)
    return (
      <PanelNavigation>
        <Fields
          fields={fields}
          values={values}
          onChange={onChange}
          media={media}
          collections={collections}
          readOnly={readOnly}
        />
      </PanelNavigation>
    );
  return (
    <div className={styles.formStack}>
      {fields.map((f) => {
        const value = values[f.key];
        const set = (v: any) => onChange({ ...values, [f.key]: v });
        const errors = [
          ...(!compatible(f, value)
            ? [`${f.label} has an incompatible value.`]
            : []),
          ...(f.required && blank(value)
            ? [`${f.label} is required for publication.`]
            : []),
        ];
        const Widget =
          f.type === 'richtext'
            ? controls.markdown
            : f.widget && controls[f.widget];
        const inputId = prefix + '-field-' + f.key;
        if (Widget)
          return (
            <fieldset className={styles.widgetField} key={f.key}>
              <legend>
                {f.label}
                {f.required ? ' *' : ''}
              </legend>
              <Suspense fallback={<p>Loading editor…</p>}>
                <Widget
                  field={f}
                  media={media}
                  value={value}
                  onChange={set}
                  readOnly={readOnly}
                  errors={errors}
                />
              </Suspense>
            </fieldset>
          );
        return (
          <div className={styles.field} key={f.key}>
            <Label htmlFor={f.type === 'toggle' ? undefined : inputId}>
              {f.label}
              {f.required ? ' *' : ''}
            </Label>
            {f.type === 'list' ? (
              <ListField
                field={f}
                value={value}
                onChange={set}
                media={media}
                collections={collections}
                readOnly={readOnly}
              />
            ) : f.collectionField ? (
              <Select
                id={inputId}
                aria-label={f.label}
                value={String(value ?? '')}
                disabled={readOnly}
                placeholder="Choose field…"
                renderValue={(key) =>
                  collections
                    .find(
                      (c) => c.id === values[f.collectionField!.collectionKey],
                    )
                    ?.fields.find((x) => x.key === key)?.label ||
                  key ||
                  'None'
                }
                onValueChange={(key) => set(key || null)}
              >
                <Select.Option value="">None</Select.Option>
                {(
                  collections.find(
                    (c) => c.id === values[f.collectionField!.collectionKey],
                  )?.fields ?? []
                )
                  .filter((x) => f.collectionField!.types.includes(x.type))
                  .map((x) => (
                    <Select.Option key={x.key} value={x.key}>
                      {x.label}
                    </Select.Option>
                  ))}
              </Select>
            ) : f.type === 'collection' ? (
              <Select
                id={inputId}
                aria-label={f.label}
                className={styles.full}
                value={String(value ?? '')}
                disabled={readOnly}
                placeholder="Choose collection…"
                renderValue={(key) =>
                  collections.find((c) => c.id === key)?.name ||
                  'Choose collection…'
                }
                onValueChange={(key) => set(key || null)}
              >
                <Select.Option value="">Choose collection…</Select.Option>
                {collections.map((c) => (
                  <Select.Option key={c.id} value={c.id}>
                    {c.name}
                  </Select.Option>
                ))}
              </Select>
            ) : f.type === 'toggle' ? (
              <Checkbox
                aria-label={f.label}

                checked={value === true}
                disabled={readOnly}
                onCheckedChange={(value) => set(value)}
              />
            ) : f.type === 'select' ? (
              <Select
                className={styles.full}
                id={inputId}
                aria-label={f.label}
                value={String(value ?? '')}
                placeholder="Choose…"
                renderValue={(value) =>
                  f.options.find((o) => o.value === value)?.label || 'Choose…'
                }
                disabled={readOnly}
                onValueChange={(value) => set((value ?? '') || null)}
              >
                <Select.Option value="">Choose…</Select.Option>
                {f.options.map((o) => (
                  <Select.Option key={o.value} value={o.value}>
                    {o.label}
                  </Select.Option>
                ))}
              </Select>
            ) : f.type === 'media' ? (
              <>
                <Select
                  className={styles.full}
                  id={inputId}
                  aria-label={f.label}
                  placeholder="Choose media…"
                  renderValue={(id) =>
                    media.find((m) => m.id === id)?.name || 'Choose media…'
                  }
                  value={
                    typeof value === 'object' &&
                    value !== null &&
                    !Array.isArray(value)
                      ? String(value.mediaId ?? '')
                      : ''
                  }
                  disabled={readOnly}
                  onValueChange={(value) =>
                    set(
                      (value ?? '') ? { mediaId: value ?? '', alt: '' } : null,
                    )
                  }
                >
                  <Select.Option value="">Choose media…</Select.Option>
                  {media.map((m) => (
                    <Select.Option key={m.id} value={m.id}>
                      {m.name}
                    </Select.Option>
                  ))}
                </Select>
                <Input
                  aria-label={`${f.label} alternative text`}
                  placeholder="Alternative text"
                  value={
                    typeof value === 'object' &&
                    value !== null &&
                    !Array.isArray(value)
                      ? String(value.alt ?? '')
                      : ''
                  }
                  disabled={readOnly || !value}
                  onChange={(e) =>
                    set({ ...(value as object), alt: e.target.value })
                  }
                />
              </>
            ) : f.type === 'text' && f.multiline ? (
              <InputArea
                id={inputId}
                aria-label={f.label}
                rows={4}
                value={String(value ?? '')}
                disabled={readOnly}
                onChange={(e) => set(e.target.value)}
              />
            ) : (
              <Input
                id={inputId}
                aria-label={f.label}
                type={
                  f.type === 'number'
                    ? 'number'
                    : f.type === 'date'
                      ? 'date'
                      : 'text'
                }
                value={String(value ?? '')}
                min={f.type === 'number' ? f.min : undefined}
                max={f.type === 'number' ? f.max : undefined}
                disabled={readOnly}
                onChange={(e) =>
                  set(
                    f.type === 'number'
                      ? e.target.value === ''
                        ? null
                        : Number(e.target.value)
                      : e.target.value,
                  )
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
