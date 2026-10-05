// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import BlockList, { reorderBlocks } from '../src/editor/BlockList';
import type { Block } from '../src/core/types';

const blocks: Block[] = ['a', 'b', 'c', 'd'].map((id) => ({
  id,
  type: 'hero',
  version: 2,
  props: { heading: id },
}));
const ids = (value: Block[]) => value.map((b) => b.id).join('');

it.each([
  ['a', 'c', false, 'bacd'],
  ['a', 'c', true, 'bcad'],
  ['d', 'b', false, 'adbc'],
  ['d', 'b', true, 'abdc'],
])('drops %s relative to %s (after=%s)', (source, target, after, expected) => {
  const result = reorderBlocks(blocks, source, target, after);
  expect(ids(result)).toBe(expected);
  expect(ids(blocks)).toBe('abcd');
  for (const block of blocks)
    expect(result.find((b) => b.id === block.id)).toBe(block);
});

it('ignores stale IDs and dropping a block on itself', () => {
  for (const [source, target] of [
    ['missing', 'a'],
    ['a', 'missing'],
    ['b', 'b'],
  ])
    expect(reorderBlocks(blocks, source, target, true)).toBe(blocks);
});

let root: Root;
let host: HTMLDivElement;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  host?.remove();
  vi.restoreAllMocks();
});
async function mount(disabled = false) {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  const onChange = vi.fn(),
    onSelect = vi.fn();
  await act(async () =>
    root.render(
      createElement(BlockList, {
        blocks,
        definitions: [],
        disabled,
        onChange,
        onSelect,
      }),
    ),
  );
  for (const button of host.querySelectorAll('button')) {
    button.setPointerCapture = vi.fn();
    button.hasPointerCapture = () => true;
    button.releasePointerCapture = vi.fn();
  }
  return { onChange, onSelect, rows: [...host.querySelectorAll('li')] };
}
async function pointer(target: Element, type: string, clientY = 0) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientY,
  });
  Object.defineProperties(event, {
    pointerId: { value: 1 },
    isPrimary: { value: true },
  });
  await act(async () => {
    target.dispatchEvent(event);
  });
}

it('sorts a captured pointer drag without opening the block', async () => {
  const { onChange, onSelect, rows } = await mount();
  const button = rows[0].querySelector('button')!;
  document.elementFromPoint = vi.fn(() => rows[2]);
  await pointer(button, 'pointerup', 10);
  expect(onChange).not.toHaveBeenCalled();
  await pointer(button, 'pointerdown');
  await pointer(button, 'pointermove', 10);
  expect(rows[2].getAttribute('data-drop')).toBe('after');
  await pointer(button, 'pointerup', 10);
  await act(async () => button.click());
  expect(ids(onChange.mock.calls[0][0])).toBe('bcad');
  expect(onSelect).not.toHaveBeenCalled();
  expect(host.querySelector('[data-drop]')).toBeNull();
});

it('ignores short clicks, cancelled drags, and drops outside the list', async () => {
  const { onChange, onSelect, rows } = await mount();
  const button = rows[0].querySelector('button')!;
  document.elementFromPoint = vi.fn(() => rows[2]);
  await pointer(button, 'pointerdown');
  await pointer(button, 'pointermove', 2);
  await pointer(button, 'pointerup', 2);
  await act(async () => button.click());
  expect(onSelect).toHaveBeenCalledWith('a');
  await pointer(button, 'pointerdown');
  await pointer(button, 'pointermove', 10);
  await pointer(button, 'pointercancel');
  await pointer(button, 'pointerup', 10);
  expect(onChange).not.toHaveBeenCalled();
  await pointer(button, 'pointerdown');
  await pointer(button, 'pointermove', 10);
  document.elementFromPoint = vi.fn(() => null);
  await pointer(button, 'pointermove', 20);
  await pointer(button, 'pointerup', 20);
  expect(onChange).not.toHaveBeenCalled();
});

it('keeps keyboard sorting separate from opening a block', async () => {
  const { onChange, onSelect } = await mount();
  const button = host.querySelectorAll('button')[1];
  await act(async () => {
    button.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        altKey: true,
        bubbles: true,
      }),
    );
  });
  expect(ids(onChange.mock.calls[0][0])).toBe('bacd');
  expect(onSelect).not.toHaveBeenCalled();
  await act(async () => button.click());
  expect(onSelect).toHaveBeenCalledWith('b');
});

it('prevents sorting while a save is in progress', async () => {
  const { onChange, rows } = await mount(true);
  expect(
    [...host.querySelectorAll('button')].every((button) => button.disabled),
  ).toBe(true);
  const button = rows[0].querySelector('button')!;
  await pointer(button, 'pointerdown');
  await pointer(button, 'pointermove', 10);
  await pointer(button, 'pointerup', 10);
  expect(onChange).not.toHaveBeenCalled();
});
