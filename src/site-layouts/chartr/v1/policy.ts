import type { LayoutPolicy } from '../../../core/layout-contract';
const policy: LayoutPolicy = {
  title: (settings) => String(settings.title ?? ''),
  globals: (settings) => ({
    theme: settings.appearance === 'dark' ? 'dark' : 'light',
    bodyFont: 'mono',
    headingFont: 'mono',
  }),
};
export default policy;
