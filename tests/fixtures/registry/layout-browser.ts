import { layoutDefinitions } from './layouts';
export const layoutRenderers = Object.fromEntries(
  layoutDefinitions.map((d) => [
    d.id + '@' + d.version,
    () => import('./layout-view'),
  ]),
);
export const layoutEditors = Object.fromEntries(
  layoutDefinitions.map((d) => [
    d.id + '@' + d.version,
    d.id === 'starter'
      ? () => import('./settings')
      : () => import('./other-settings'),
  ]),
);
