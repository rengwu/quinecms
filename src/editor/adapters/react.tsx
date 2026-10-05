import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import type { ComponentType } from 'react';
import type { Values, Context, ViewProps, Handle } from '../../core/types';
export function mount(
  Component: ComponentType<ViewProps>,
  host: HTMLElement,
  props: Values,
  context: Context,
): Handle {
  const root = createRoot(host);
  const update = (p: Values, c: Context) =>
    root.render(createElement(Component, { props: p, context: c }));
  update(props, context);
  return { update, destroy: () => root.unmount() };
}
