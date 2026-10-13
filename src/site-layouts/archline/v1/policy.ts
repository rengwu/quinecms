import type { LayoutPolicy } from '../../../core/layout-contract';
import { contentSpacing } from '../../../core/site-style';
import definition from './definition.json';
const policy: LayoutPolicy = {
  title: (settings) => String(settings.title ?? ''),
  globals: (settings) => ({
    ...contentSpacing(settings, definition.defaults),
    theme: 'light',
  }),
};
export default policy;
