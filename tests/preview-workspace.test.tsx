// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, useEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  PreviewProvider,
  PreviewToggle,
  Preview,
  Workbench,
  constrainPreview,
} from '../src/editor/PreviewWorkspace';
let root: Root, host: HTMLDivElement;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  host?.remove();
  localStorage.clear();
  vi.restoreAllMocks();
});
async function mount() {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() {}
  } as any;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  let mounts = 0,
    unmounts = 0;
  function Island() {
    const [value, set] = useState(0);
    useEffect(() => {
      mounts++;
      return () => {
        unmounts++;
      };
    }, []);
    return <button onClick={() => set((n) => n + 1)}>Count {value}</button>;
  }
  await act(async () =>
    root.render(
      <PreviewProvider>
        <PreviewToggle />
        <Workbench preview>
          <div>Editor</div>
          <Preview>
            <Island />
          </Preview>
        </Workbench>
      </PreviewProvider>,
    ),
  );
  return () => ({ mounts, unmounts });
}
async function click(name: string) {
  const button = [...host.querySelectorAll('button')].find(
    (b) => (b.getAttribute('aria-label') ?? b.textContent) === name,
  )!;
  expect(button).toBeDefined();
  await act(async () => button.click());
}
it('keeps one live island through split, float, device changes and closing/reopening preview', async () => {
  const lifecycle = await mount();
  await click('Count 0');
  const canvas = host.querySelector('[data-device]')!;
  for (const action of [
    'Float preview',
    'Toggle preview width',
    'Close preview',
    'Toggle preview',
    'Float preview',
    'Dock preview',
  ]) {
    await click(action);
    expect(host.querySelector('[data-device]')).toBe(canvas);
    expect(canvas.textContent).toBe('Count 1');
    expect(lifecycle()).toEqual({ mounts: 1, unmounts: 0 });
  }
  expect(canvas.getAttribute('data-device')).toBe('mobile');
  expect((canvas as HTMLElement).style.width).toBe('390px');
  expect((canvas as HTMLElement).style.height).toBe('600px');
});
it('fills split height instead of letterboxing a fixed desktop aspect ratio', async () => {
  await mount();
  const canvas = host.querySelector<HTMLElement>('[data-device]')!;
  // The test observer leaves the default available area at 640 × 600.
  expect(canvas.style.width).toBe('1280px');
  expect(canvas.style.height).toBe('1200px');
  expect(canvas.style.transform).toBe('scale(0.5)');
  await click('Float preview');
  expect(canvas.style.height).toBe('800px');
  await click('Dock preview');
  expect(canvas.style.height).toBe('1200px');
});

it('persists preview preferences and clamps the keyboard splitter', async () => {
  await mount();
  const divider = host.querySelector('[role="separator"]')!;
  await act(async () => {
    for (let i = 0; i < 40; i++)
      divider.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
      );
  });
  expect(divider.getAttribute('aria-valuenow')).toBe('70');
  await click('Float preview');
  await click('Toggle preview width');
  await act(async () => root.unmount());
  host.remove();
  await mount();
  expect(
    host
      .querySelector('[data-preview-mode]')
      ?.getAttribute('data-preview-mode'),
  ).toBe('float');
  expect(host.querySelector('[data-device]')?.getAttribute('data-device')).toBe(
    'mobile',
  );
});
it('keeps floating windows inside reduced workspaces at both aspect ratios', () => {
  for (const ratio of [1280 / 800, 390 / 844]) {
    const bounds = { width: 300, height: 400 };
    const box = constrainPreview(
      { x: 900, y: -30, width: 1200 },
      bounds,
      ratio,
    );
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(bounds.width);
    expect(box.y + box.width / ratio + 28).toBeLessThanOrEqual(bounds.height);
  }
});
