import { useId, useState } from 'react';
import { Button } from '@cloudflare/kumo/components/button';
import { Input } from '@cloudflare/kumo/components/input';
import { Label } from '@cloudflare/kumo/components/label';
import type { Binding, Block, Collection, Field, Media } from '../core/types';
import { bindingSource, bindingValid } from '../core/bindings';
import {
  fieldPaths,
  itemScope,
  resolvePath,
  rowFields,
  type Scope,
} from '../core/schema';
import { useModel } from './ModelContext';
import { PanelLevel } from './PanelNavigation';
import Fields from './Fields';
import styles from './editor.module.css';
function BindingControl({
  field,
  value,
  scopes,
  onChange,
  readOnly,
}: {
  field: Field;
  value?: Binding;
  scopes: Scope[];
  onChange(value?: Binding): void;
  readOnly: boolean;
}) {
  const model = useModel(),
    inputId = useId();
  const [mapping, setMapping] = useState(false);
  const source = value ? bindingSource(value) : '';
  const children = rowFields(field, model);
  const paths = [
    ...new Set(
      scopes.flatMap((s) => fieldPaths(s.fields, model).map((p) => p.path)),
    ),
  ];
  const items = scopes.flatMap((scope) => {
    const found = resolvePath(source, scope, model)?.field;
    const item =
      found?.type === 'array'
        ? itemScope(found.of, null, model)
        : found?.type === 'list'
          ? { fields: found.fields, values: {} }
          : undefined;
    return item ? [item] : [];
  });
  if (mapping && children)
    return (
      <PanelLevel
        title={`Map ${field.label} items`}
        onBack={() => setMapping(false)}
      >
        <p className={styles.muted}>
          Paths are relative to each item in {source}.
        </p>
        {children.map((child) => (
          <div className={styles.field} key={child.key}>
            <BindingControl
              field={child}
              scopes={items}
              readOnly={readOnly}
              value={
                typeof value === 'object' ? value.fields[child.key] : undefined
              }
              onChange={(next) => {
                const fields =
                  typeof value === 'object' ? { ...value.fields } : {};
                if (next) fields[child.key] = next;
                else delete fields[child.key];
                onChange({ source, fields });
              }}
            />
          </div>
        ))}
        <Button
          disabled={readOnly}
          onClick={() => {
            onChange(source || undefined);
            setMapping(false);
          }}
        >
          Use matching item fields
        </Button>
      </PanelLevel>
    );
  return (
    <div className={styles.field}>
      <Label htmlFor={inputId}>{field.label} source</Label>
      <Input
        id={inputId}
        aria-label={`Bind ${field.label}`}
        value={source}
        list={`${inputId}-paths`}
        disabled={readOnly}
        placeholder="Field path (optional)"
        onChange={(e) =>
          onChange(
            e.target.value
              ? typeof value === 'object'
                ? { ...value, source: e.target.value }
                : e.target.value
              : undefined,
          )
        }
      />
      <datalist id={`${inputId}-paths`}>
        {paths.map((path) => (
          <option key={path} value={path} />
        ))}
      </datalist>
      {!!value &&
        scopes.some((scope) => !bindingValid(value, field, scope, model)) && (
          <p role="alert">
            This source is missing or incompatible in an assigned collection.
            Check its path and item mappings.
          </p>
        )}
      {children && source && (
        <Button
          disabled={readOnly}
          onClick={() => {
            if (typeof value !== 'object')
              onChange({
                source,
                fields: Object.fromEntries(
                  children
                    .filter((child) =>
                      items.some((item) =>
                        item.fields.some((f) => f.key === child.key),
                      ),
                    )
                    .map((child) => [child.key, child.key]),
                ),
              });
            setMapping(true);
          }}
        >
          Map {field.label} items
        </Button>
      )}
    </div>
  );
}
export default function BlockFields({
  block,
  fields,
  generic,
  onChange,
  media,
  collections,
  readOnly,
  pageId,
}: {
  block: Block;
  fields: Field[];
  generic: boolean;
  onChange(b: Block): void;
  media: Media[];
  collections: Collection[];
  readOnly: boolean;
  pageId?: string;
}) {
  const scopes = collections
    .filter((c) => c.genericPageId === pageId)
    .map((c) => ({ fields: c.fields, values: {} }));
  if (!generic)
    return (
      <Fields
        fields={fields}
        values={block.props}
        media={media}
        collections={collections}
        readOnly={readOnly}
        onChange={(props) => onChange({ ...block, props })}
      />
    );
  return (
    <div className={styles.formStack}>
      {!scopes.length && (
        <p className={styles.muted}>
          Assign this generic page to a collection for field suggestions.
          Bindings are checked for every assigned collection.
        </p>
      )}
      {fields.map((field) => {
        const binding = block.bindings?.[field.key];
        return (
          <fieldset key={field.key} className={styles.bindingField}>
            <legend>{field.label}</legend>
            <BindingControl
              field={field}
              value={binding}
              scopes={scopes}
              readOnly={readOnly}
              onChange={(value) => {
                const bindings = { ...block.bindings };
                if (value) bindings[field.key] = value;
                else delete bindings[field.key];
                onChange({ ...block, bindings });
              }}
            />
            <Fields
              fields={[
                {
                  ...field,
                  label: binding ? 'Fallback value' : 'Fixed value',
                  required: binding ? false : field.required,
                },
              ]}
              values={block.props}
              media={media}
              collections={collections}
              readOnly={readOnly}
              onChange={(props) => onChange({ ...block, props })}
            />
          </fieldset>
        );
      })}
    </div>
  );
}
