// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, createElement, useState } from 'react';
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
  vi.unstubAllGlobals();
});
async function mount(disabled = false) {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  const frames = new Map<number, FrameRequestCallback>();
  let frameId = 0;
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((callback: FrameRequestCallback) => {
      frames.set(++frameId, callback);
      return frameId;
    }),
  );
  vi.stubGlobal(
    'cancelAnimationFrame',
    vi.fn((id: number) => frames.delete(id)),
  );
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  const onChange = vi.fn(),
    onSelect = vi.fn();
  let replace!: (value: Block[]) => void;
  let setDisabled!: (value: boolean) => void;
  function Harness() {
    const [value, setValue] = useState(blocks);
    const [locked, lock] = useState(disabled);
    replace = setValue;
    setDisabled = lock;
    return createElement(
      'div',
      null,
      createElement(BlockList, {
        blocks: value,
        definitions: [],
        disabled: locked,
        onChange: (next) => {
          onChange(next);
          setValue(next);
        },
        onSelect,
      }),
      // Represents a consumer of committed content, such as the site preview.
      createElement('output', { 'data-content-order': true }, ids(value)),
    );
  }
  await act(async () => root.render(createElement(Harness)));
  const list = host.querySelector('ol')!;
  list.setPointerCapture = vi.fn();
  list.hasPointerCapture = () => true;
  list.releasePointerCapture = vi.fn();
  const rows = [...host.querySelectorAll('li')];
  for (const button of host.querySelectorAll('button')) {
    button.setPointerCapture = vi.fn();
  }
  const animations: {
    row: HTMLElement;
    frames: Keyframe[];
    cancel: ReturnType<typeof vi.fn>;
  }[] = [];
  for (const row of rows) {
    Object.defineProperties(row, {
      offsetTop: {
        get: () =>
          (Array.from(list.children) as HTMLElement[])
            .slice(0, Array.from(list.children).indexOf(row))
            .reduce((top, previous) => top + previous.offsetHeight + 8, 0),
      },
      offsetHeight: { configurable: true, get: () => 48 },
    });
    vi.spyOn(row, 'getBoundingClientRect').mockImplementation(
      () => new DOMRect(0, row.offsetTop, 200, row.offsetHeight),
    );
    row.animate = vi.fn((frames) => {
      const animation = { row, frames: frames as Keyframe[], cancel: vi.fn() };
      animations.push(animation);
      return animation as unknown as Animation;
    });
  }
  const tick = async (time: number) => {
    const pending = [...frames.values()];
    frames.clear();
    await act(async () => pending.forEach((callback) => callback(time)));
  };
  return {
    onChange,
    onSelect,
    rows,
    list,
    animations,
    replace,
    setDisabled,
    tick,
    frames,
  };
}
const listOrder = () =>
  [...host.querySelectorAll('li')].map((row) => row.dataset.blockId).join('');
const contentOrder = () => host.querySelector('output')!.textContent;
async function pointer(
  target: Element,
  type: string,
  clientY = 0,
  clientX = 0,
) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientY,
    clientX,
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
  await pointer(button, 'pointermove', 150);
  expect(listOrder()).toBe('bcad');
  expect(contentOrder()).toBe('abcd');
  expect(onChange).not.toHaveBeenCalled();
  expect(host.querySelector('[data-drop]')).toBeNull();
  await pointer(button, 'pointerup', 150);
  await act(async () => button.click());
  expect(ids(onChange.mock.calls[0][0])).toBe('bcad');
  expect(onSelect).not.toHaveBeenCalled();
  expect(host.querySelector('[data-drop]')).toBeNull();
});

it.each([
  [0, 105, 'bacd'],
  [0, 108, 'bacd'],
  [0, 111, 'bacd'],
  [3, 105, 'abdc'],
  [3, 108, 'abdc'],
  [3, 111, 'abdc'],
])('drops item %s in the gutter at y=%s', async (source, y, expected) => {
  const { onChange, onSelect, rows } = await mount();
  const button = rows[source].querySelector('button')!;
  // The browser hits the list itself in the 8px space between b and c.
  document.elementFromPoint = vi.fn(() => host.querySelector('ol'));
  await pointer(button, 'pointerdown', source * 56 + 24);
  await pointer(button, 'pointermove', y);
  expect(listOrder()).toBe(expected);
  expect(onChange).not.toHaveBeenCalled();
  expect(host.querySelector('[data-drop]')).toBeNull();
  await pointer(button, 'pointerup', y);
  await act(async () => button.click());
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(ids(onChange.mock.calls[0][0])).toBe(expected);
  expect(onSelect).not.toHaveBeenCalled();
  expect(host.querySelector('[data-drop]')).toBeNull();
});

it('uses the release position when the final pointer move was over a different row', async () => {
  const { onChange, rows } = await mount();
  const button = rows[0].querySelector('button')!;
  document.elementFromPoint = vi.fn(() => rows[3]);
  await pointer(button, 'pointerdown', 24);
  await pointer(button, 'pointermove', 200);
  document.elementFromPoint = vi.fn(() => host.querySelector('ol'));
  await pointer(button, 'pointerup', 108);
  expect(ids(onChange.mock.calls[0][0])).toBe('bcad');
});

it('commits a release below the list at the final slot', async () => {
  const { onChange, rows } = await mount();
  const button = rows[0].querySelector('button')!;
  document.elementFromPoint = vi.fn(() => rows[2]);
  await pointer(button, 'pointerdown');
  await pointer(button, 'pointermove', 150);
  document.elementFromPoint = vi.fn(() => document.body);
  await pointer(button, 'pointerup', 300);
  expect(ids(onChange.mock.calls[0][0])).toBe('bcda');
  expect(listOrder()).toBe('bcda');
  expect(host.querySelector('[data-drop]')).toBeNull();
});

it('preserves short clicks and cancelled drags, and permits dragging back to the original order', async () => {
  const { onChange, onSelect, rows } = await mount();
  const button = rows[0].querySelector('button')!;
  document.elementFromPoint = vi.fn(() => rows[2]);
  await pointer(button, 'pointerdown');
  await pointer(button, 'pointermove', 2);
  await pointer(button, 'pointerup', 2);
  await act(async () => button.click());
  expect(onSelect).toHaveBeenCalledWith('a');
  await pointer(button, 'pointerdown');
  await pointer(button, 'pointermove', 150);
  await pointer(button, 'pointercancel');
  await pointer(button, 'pointerup', 10);
  expect(onChange).not.toHaveBeenCalled();
  await pointer(button, 'pointerdown');
  await pointer(button, 'pointermove', 150);
  document.elementFromPoint = vi.fn(() => null);
  await pointer(button, 'pointermove', 20);
  await pointer(button, 'pointerup', 20);
  expect(onChange).not.toHaveBeenCalled();
});

it('keeps keyboard sorting separate from opening a block', async () => {
  const { onChange, onSelect, animations } = await mount();
  const button = host.querySelectorAll('button')[1];
  button.focus();
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
  expect(animations).toHaveLength(2);
  expect(document.activeElement).toBe(button);
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

it('FLIPs local rows on hover, stays stable over the same slot, and commits once', async () => {
  const { onChange, rows, list, animations } = await mount();
  const button = rows[0].querySelector('button')!;
  document.elementFromPoint = vi.fn(() => list);
  await pointer(button, 'pointerdown', 24);
  expect(button.setPointerCapture).toHaveBeenCalledWith(1);
  expect(list.setPointerCapture).not.toHaveBeenCalled();
  await pointer(button, 'pointermove', 150);
  expect(list.setPointerCapture).toHaveBeenCalledWith(1);
  expect(listOrder()).toBe('bcad');
  expect(contentOrder()).toBe('abcd');
  expect(onChange).not.toHaveBeenCalled();
  expect(animations).toHaveLength(2);
  expect(animations.find((a) => a.row === rows[1])!.frames[0]).toEqual({
    transform: 'translate(0px, 56px)',
  });
  expect(animations.some((a) => a.row === rows[0])).toBe(false);
  expect(animations.every((a) => a.row.parentElement === list)).toBe(true);
  // Transferring capture away from the button must not cancel the drag.
  await pointer(button, 'lostpointercapture', 150);
  expect(listOrder()).toBe('bcad');
  await pointer(button, 'pointermove', 150);
  expect(listOrder()).toBe('bcad');
  expect(animations).toHaveLength(2);
  await pointer(button, 'pointerup', 150);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(contentOrder()).toBe('bcad');
  expect(listOrder()).toBe('bcad');
  expect(animations.at(-1)!.row).toBe(rows[0]);
  expect(animations.at(-1)!.frames[0]).toEqual({
    transform: 'translate(0px, 14px)',
  });
});

it.each(['pointercancel', 'lostpointercapture', 'Escape'])(
  'rolls back the local order on %s without changing content',
  async (cancel) => {
    const { onChange, rows, list, animations } = await mount();
    const button = rows[0].querySelector('button')!;
    document.elementFromPoint = vi.fn(() => list);
    await pointer(button, 'pointerdown', 24);
    await pointer(button, 'pointermove', 150);
    expect(listOrder()).toBe('bcad');
    const moving = [...animations];
    if (cancel === 'Escape') {
      await act(async () =>
        button.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
        ),
      );
    } else {
      await pointer(list, cancel, 150);
    }
    expect(listOrder()).toBe('abcd');
    expect(contentOrder()).toBe('abcd');
    expect(onChange).not.toHaveBeenCalled();
    expect(moving.every((a) => a.cancel.mock.calls.length === 1)).toBe(true);
  },
);

it('skips animations for reduced motion while retaining optimistic sorting', async () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: true })),
  );
  const { onChange, rows, list, animations } = await mount();
  document.elementFromPoint = vi.fn(() => list);
  const button = rows[0].querySelector('button')!;
  await pointer(button, 'pointerdown', 24);
  await pointer(button, 'pointermove', 150);
  expect(listOrder()).toBe('bcad');
  expect(animations).toHaveLength(0);
  expect(onChange).not.toHaveBeenCalled();
  await pointer(button, 'pointerup', 150);
  expect(contentOrder()).toBe('bcad');
});

it('cancels an in-progress draft when committed content changes externally', async () => {
  const { onChange, rows, list, replace } = await mount();
  document.elementFromPoint = vi.fn(() => list);
  const button = rows[0].querySelector('button')!;
  await pointer(button, 'pointerdown', 24);
  await pointer(button, 'pointermove', 150);
  await act(async () => replace([...blocks].reverse()));
  expect(listOrder()).toBe('dcba');
  await pointer(list, 'pointerup', 150);
  expect(contentOrder()).toBe('dcba');
  expect(onChange).not.toHaveBeenCalled();
});

it('retargets a displaced neighbor from its interrupted position and cleans up on unmount', async () => {
  const { rows, list, animations, frames } = await mount();
  const button = rows[0].querySelector('button')!;
  document.elementFromPoint = vi.fn(() => list);
  await pointer(button, 'pointerdown', 24);
  await pointer(button, 'pointermove', 150);
  let visualOffset = 28;
  vi.mocked(rows[1].getBoundingClientRect).mockImplementation(
    () => new DOMRect(0, rows[1].offsetTop + visualOffset, 200, 48),
  );
  animations
    .find((a) => a.row === rows[1])!
    .cancel.mockImplementation(() => {
      visualOffset = 0;
    });
  const firstAnimations = animations.length;
  await pointer(button, 'pointermove', 10);
  expect(listOrder()).toBe('abcd');
  expect(
    animations.slice(firstAnimations).find((a) => a.row === rows[1])!.frames[0],
  ).toEqual({ transform: 'translate(0px, -28px)' });
  expect(contentOrder()).toBe('abcd');
  const active = animations.slice(firstAnimations);
  await act(async () => root.unmount());
  expect(active.every((a) => a.cancel.mock.calls.length === 1)).toBe(true);
  expect(frames.size).toBe(0);
  expect(document.querySelector('[data-sort-overlay]')).toBeNull();
});

it('rolls back when sorting becomes disabled during a drag', async () => {
  const { onChange, rows, list, setDisabled } = await mount();
  const button = rows[0].querySelector('button')!;
  document.elementFromPoint = vi.fn(() => list);
  await pointer(button, 'pointerdown', 24);
  await pointer(button, 'pointermove', 150);
  await act(async () => setDisabled(true));
  expect(listOrder()).toBe('abcd');
  await pointer(list, 'pointerup', 150);
  expect(contentOrder()).toBe('abcd');
  expect(onChange).not.toHaveBeenCalled();
});

it('carries from the exact grab point with X locked, including outside the list, and commits on release', async () => {
  const { rows, list, onChange } = await mount();
  const button = rows[0].querySelector('button')!;
  await pointer(button, 'pointerdown', 17, 80);
  const overlay = () =>
    document.querySelector<HTMLElement>('[data-sort-overlay]')!;
  expect(overlay().style.transform).toBe('translateY(0px)');
  expect(overlay().style.left).toBe('0px');
  expect(overlay().hasAttribute('inert')).toBe(true);
  await pointer(button, 'pointermove', 19, 81);
  expect(overlay().style.transform).toBe('translateY(2px)');
  expect(listOrder()).toBe('abcd');
  await pointer(list, 'pointermove', 150, 700);
  expect(overlay().style.left).toBe('0px');
  expect(overlay().style.transform).toBe('translateY(133px)');
  expect(listOrder()).toBe('bcad');
  expect(contentOrder()).toBe('abcd');
  expect(onChange).not.toHaveBeenCalled();
  await pointer(list, 'pointermove', 151, -300);
  expect(overlay().style.transform).toBe('translateY(134px)');
  expect(listOrder()).toBe('bcad');
  await pointer(list, 'pointerup', 151, -300);
  expect(contentOrder()).toBe('bcad');
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(document.querySelector('[data-sort-overlay]')).toBeNull();
});

it('edge-scrolls a long list without moving the carried row away from the pointer', async () => {
  const { rows, list, tick, onChange } = await mount();
  host.style.overflowY = 'auto';
  Object.defineProperties(host, {
    clientHeight: { value: 112 },
    scrollHeight: { value: 216 },
  });
  vi.spyOn(host, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 200, 112),
  );
  vi.spyOn(list, 'getBoundingClientRect').mockImplementation(
    () => new DOMRect(0, -host.scrollTop, 200, 216),
  );
  const button = rows[0].querySelector('button')!;
  await pointer(button, 'pointerdown', 24);
  await pointer(list, 'pointermove', 110);
  const overlay = document.querySelector<HTMLElement>('[data-sort-overlay]')!;
  expect(overlay.style.transform).toBe('translateY(86px)');
  for (let i = 1; i <= 90; i++) await tick(i * 16.67);
  expect(host.scrollTop).toBeGreaterThan(20);
  expect(host.scrollTop).toBeLessThanOrEqual(104);
  expect(overlay.style.transform).toBe('translateY(86px)');
  expect(contentOrder()).toBe('abcd');
  expect(onChange).not.toHaveBeenCalled();
  await pointer(list, 'pointerup', 110);
  expect(onChange).toHaveBeenCalledTimes(1);
});

it('keeps the grab point fixed when variable-height items change slots', async () => {
  const { rows, list, animations } = await mount();
  Object.defineProperty(rows[1], 'offsetHeight', { value: 80 });
  Object.defineProperty(rows[2], 'offsetHeight', { value: 32 });
  const button = rows[1].querySelector('button')!;
  await pointer(button, 'pointerdown', 73);
  await pointer(list, 'pointermove', 10);
  expect(listOrder()).toBe('bacd');
  const overlay = document.querySelector<HTMLElement>('[data-sort-overlay]')!;
  expect(overlay.style.height).toBe('80px');
  expect(overlay.style.transform).toBe('translateY(-7px)');
  expect(animations.find((a) => a.row === rows[0])!.frames[0]).toEqual({
    transform: 'translate(0px, -88px)',
  });
  expect(contentOrder()).toBe('abcd');
  await pointer(list, 'pointerup', 10);
  expect(contentOrder()).toBe('bacd');
  expect(animations.at(-1)!.frames[0]).toEqual({
    transform: 'translate(0px, -7px)',
  });
});
