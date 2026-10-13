import { definitions } from './definitions';
export const renderers = Object.fromEntries(
  definitions.map((d) => [d.type + '@' + d.version, () => import('./view')]),
);
