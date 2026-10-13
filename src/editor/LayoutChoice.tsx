import { Select } from '@cloudflare/kumo/components/select';
import { Label } from '@cloudflare/kumo/components/label';
import type { Content } from '../core/types';
import { siteLayouts } from '../core/layout-state';
import styles from './editor.module.css';

export default function LayoutChoice({
  content,
  value,
  onChange,
}: {
  content: Content;
  value?: string;
  onChange(id: string): void;
}) {
  const layouts = siteLayouts(content.site).filter((layout) => layout.active);
  return (
    <div className={styles.field}>
      <Label htmlFor="page-layout">Site layout</Label>
      <Select
        id="page-layout"
        aria-label="Site layout"
        placeholder="Choose a layout"
        value={value ?? ''}
        renderValue={(id) =>
          layouts.find((layout) => layout.id === id)?.name || 'Choose a layout'
        }
        onValueChange={(id) => {
          if (id) onChange(id);
        }}
      >
        {layouts.map((layout) => (
          <Select.Option key={layout.id} value={layout.id}>
            {layout.name}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
}
