import { Button } from '@cloudflare/kumo/components/button';
import { Input } from '@cloudflare/kumo/components/input';
import type { WidgetProps } from '../../../editor/widgets';
import styles from '../../../editor/editor.module.css';
export default function Presentation({
  value,
  onChange,
  readOnly,
}: WidgetProps) {
  if (!value)
    return (
      <Button
        type="button"
        onClick={() => onChange({ accent: '#243326', inset: 80 })}
        disabled={readOnly}
      >
        Set design
      </Button>
    );
  const v =
    value && typeof value === 'object' && !Array.isArray(value)
      ? value
      : { accent: '#243326', inset: 80 };
  return (
    <div className={styles.formStack}>
      <Input
        label="Accent"
        className={styles.full}
        aria-label="Accent"
        type="text"
        placeholder="#243326"
        value={String(v.accent)}
        disabled={readOnly}
        onChange={(e) => onChange({ ...v, accent: e.target.value })}
      />
      <Input
        label="Spacing"
        className={styles.full}
        aria-label="Spacing"
        type="number"
        min="24"
        max="160"
        value={Number(v.inset)}
        disabled={readOnly}
        onChange={(e) => onChange({ ...v, inset: Number(e.target.value) })}
      />
    </div>
  );
}
