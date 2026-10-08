import { useState } from 'react';
import { Button } from '@cloudflare/kumo/components/button';
import type { Field, Media, Values } from '../core/types';
import { isRecord, objectFields } from '../core/schema';
import { fieldDefaults } from '../core/lists';
import { useModel } from './ModelContext';
import { PanelLevel } from './PanelNavigation';
import Fields from './Fields';
export default function ObjectField({
  field,
  value,
  onChange,
  media,
  readOnly,
  depth,
}: {
  field: Extract<Field, { type: 'object' }>;
  value: unknown;
  onChange(value: Values | null): void;
  media: Media[];
  readOnly: boolean;
  depth: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Values | null>(null);
  const model = useModel();
  const fields = objectFields(field, model);
  if (depth >= 3)
    return (
      <p role="alert">This object exceeds the three-level nesting limit.</p>
    );
  if (field.objectId && !model.objects.some((o) => o.id === field.objectId))
    return (
      <p role="alert">
        The object definition is missing. Repair its schema in Schemas.
      </p>
    );
  if (pending)
    return (
      <PanelLevel
        title={`New ${field.label}`}
        onBack={() => setPending(null)}
        creation={{
          label: `Create ${field.label}`,
          onCreate: () => {
            onChange(pending);
            setPending(null);
          },
        }}
      >
        <Fields
          fields={fields}
          values={pending}
          onChange={setPending}
          media={media}
          readOnly={readOnly}
          depth={depth + 1}
        />
      </PanelLevel>
    );
  if (open)
    return (
      <PanelLevel title={field.label} onBack={() => setOpen(false)}>
        <Fields
          fields={fields}
          values={isRecord(value) ? value : {}}
          onChange={onChange}
          media={media}
          readOnly={readOnly}
          depth={depth + 1}
        />
        <Button
          variant="secondary-destructive"
          disabled={readOnly}
          onClick={() => {
            onChange(null);
            setOpen(false);
          }}
        >
          Clear object
        </Button>
      </PanelLevel>
    );
  return (
    <Button
      disabled={readOnly}
      onClick={() => {
        if (!isRecord(value))
          setPending(fieldDefaults(fields, model, depth + 1));
        else setOpen(true);
      }}
    >
      {isRecord(value) ? 'Edit' : 'Add'} {field.label}
    </Button>
  );
}
