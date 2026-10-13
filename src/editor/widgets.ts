import type { ComponentType } from 'react';
import type { Field, Json, Media } from '../core/types';
import { customWidgets } from '../generated/custom-widgets';
export interface WidgetProps {
  value: Json | undefined;
  onChange(value: Json): void;
  field: Field;
  errors: readonly string[];
  readOnly: boolean;
  media?: Media[];
}
// Extensions register controls through their manifests, without editing the core.
export const widgets: Record<
  string,
  () => Promise<{ default: ComponentType<WidgetProps> }>
> = {
  ...customWidgets,
  markdown: () => import('./RichText'),
};
