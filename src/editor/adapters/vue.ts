import { createApp, shallowReactive, h } from 'vue';
import type { Component } from 'vue';
import type { Values, Context, Handle } from '../../core/types';
export function mount(
  Component: Component,
  host: HTMLElement,
  props: Values,
  context: Context,
): Handle {
  const state = shallowReactive({ props, context });
  const app = createApp({ render: () => h(Component, state) });
  app.mount(host);
  return {
    update(p, c) {
      state.props = p;
      state.context = c;
    },
    destroy: () => app.unmount(),
  };
}
