import data from './layouts.json';
import type { LayoutDefinition } from '../../../src/core/types';
import type { LayoutPolicy } from '../../../src/core/layout-contract';
import { contentSpacing } from '../../../src/core/site-style';
import starter from './policy';
export const layoutDefinitions = data as LayoutDefinition[];
export const layoutPolicies: Record<string, LayoutPolicy> = Object.fromEntries(
  layoutDefinitions.map((d) => [
    d.id + '@' + d.version,
    d.id === 'starter'
      ? starter
      : {
          title: (settings) => String(settings.title ?? ''),
          globals: (settings) => ({
            ...settings,
            ...contentSpacing(settings, d.defaults as any),
          }),
        },
  ]),
);
