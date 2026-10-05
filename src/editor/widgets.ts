import type { ComponentType } from 'react';
import type { Field, Json, Media } from '../core/types';
export interface WidgetProps {
  value: Json | undefined;
  onChange(value: Json): void;
  field: Field;
  errors: readonly string[];
  readOnly: boolean;
  media?: Media[];
}
// Extend this developer-owned registry with custom React controls. Values still
// conform to the field's type and are validated on both save and build.
export const widgets: Record<
  string,
  () => Promise<{ default: ComponentType<WidgetProps> }>
> = {
  'hero-presentation': () => import('../blocks/hero/v2/Presentation'),
  markdown: () => import('./RichText'),
};
