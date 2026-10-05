import { mount as attach, unmount } from 'svelte';
import Preview from './Preview.svelte';
import { createState } from './state.svelte';
import type { Values, Context, Handle } from '../../core/types';
export function mount(
  Renderer: any,
  host: HTMLElement,
  props: Values,
  context: Context,
): Handle {
  const state = createState({ props, context });
  const instance = attach(Preview, {
    target: host,
    props: { Renderer, state },
  });
  return {
    update(p, c) {
      state.props = p;
      state.context = c;
    },
    destroy() {
      void unmount(instance);
    },
  };
}
