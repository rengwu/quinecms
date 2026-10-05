import { Input } from '@cloudflare/kumo/components/input';
import { Label } from '@cloudflare/kumo/components/label';
import type { Block, Collection, Field, Media } from '../core/types';
import Fields from './Fields';
import styles from './editor.module.css';

export default function BlockFields({
  block,
  fields,
  generic,
  onChange,
  media,
  collections,
  readOnly,
}: {
  block: Block;
  fields: Field[];
  generic: boolean;
  onChange(b: Block): void;
  media: Media[];
  collections: Collection[];
  readOnly: boolean;
}) {
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
      {fields.map((field) => {
        const binding = block.bindings?.[field.key] ?? '';
        return (
          <fieldset key={field.key} className={styles.bindingField}>
            <legend>{field.label}</legend>
            <div className={styles.field}>
              <Label htmlFor={`binding-${field.key}`}>Schema field</Label>
              <Input
                id={`binding-${field.key}`}
                aria-label={`Bind ${field.label}`}
                value={binding}
                disabled={readOnly}
                placeholder="Field key (optional)"
                onChange={(e) => {
                  const bindings = { ...block.bindings };
                  if (e.target.value) bindings[field.key] = e.target.value;
                  else delete bindings[field.key];
                  onChange({ ...block, bindings });
                }}
              />
            </div>
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
