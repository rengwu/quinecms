// @vitest-environment jsdom
import { it, expect } from 'vitest';
import { createElement, act } from 'react';
import { defineComponent, h, nextTick } from 'vue';
import { mount as reactMount } from '../src/editor/adapters/react';
import { mount as vueMount } from '../src/editor/adapters/vue';
const context = { instanceId: 'test', globals: {}, media: [], links: {} };
it('updates and destroys a React preview root', async () => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement('div');
  document.body.append(host);
  let handle: ReturnType<typeof reactMount>;
  await act(async () => {
    handle = reactMount(
      ({ props }) => createElement('p', null, String(props.title)),
      host,
      { title: 'First' },
      context,
    );
  });
  expect(host.textContent).toBe('First');
  await act(async () => handle.update({ title: 'Second' }, context));
  expect(host.textContent).toBe('Second');
  await act(async () => handle.destroy());
  expect(host.childNodes).toHaveLength(0);
  host.remove();
});
it('updates and destroys a Vue preview root', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const Component = defineComponent({
    props: ['props', 'context'],
    setup(props) {
      return () => h('p', props.props.title);
    },
  });
  const handle = vueMount(Component, host, { title: 'First' }, context);
  expect(host.textContent).toBe('First');
  handle.update({ title: 'Second' }, context);
  await nextTick();
  expect(host.textContent).toBe('Second');
  handle.destroy();
  expect(host.childNodes).toHaveLength(0);
  host.remove();
});
