// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Context } from '../src/core/types';
import * as workspace from '../src/blocks/chartr-workspace/v1/View';
import * as themes from '../src/blocks/chartr-themes/v1/View';
import * as panes from '../src/blocks/chartr-panes/v1/View';
import * as download from '../src/blocks/chartr-download/v1/View';
import * as intro from '../src/blocks/chartr-intro/v1/View';
import workspaceDefinition from '../src/blocks/chartr-workspace/v1/definition.json';
import { DEFAULT_APP_THEME } from '../src/themes/chartr/v1/native-themes.js';

let observers: { disconnect: ReturnType<typeof vi.fn> }[];
let cleanups: (() => void)[];
const context = (id: string): Context => ({
  instanceId: id,
  globals: {},
  media: [],
  links: {},
  preview: true,
});
beforeEach(() => {
  observers = [];
  cleanups = [];
  class Observer {
    disconnect = vi.fn();
    observe() {}
    unobserve() {}
    constructor() {
      observers.push(this);
    }
  }
  vi.stubGlobal('ResizeObserver', Observer);
  vi.stubGlobal('IntersectionObserver', Observer);
  vi.stubGlobal('matchMedia', () =>
    Object.assign(new EventTarget(), { matches: true }),
  );
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn(() => 1),
  );
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = true;
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    },
  });
});
afterEach(() => {
  for (const cleanup of cleanups) cleanup();
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function scope() {
  const el = document.createElement('main');
  el.dataset.layoutSurface = '';
  document.body.append(el);
  return el;
}
function block(
  parent: HTMLElement,
  implementation: typeof workspace,
  id: string,
) {
  const host = document.createElement('div');
  parent.append(host);
  const handle = implementation.mount(host, {}, context(id));
  cleanups.push(() => handle.destroy());
  return { host, handle };
}

it('mounts independent workspace instances with unique IDs and synchronized keyboard view controls', () => {
  const parent = scope();
  const one = block(parent, workspace, 'workspace-one');
  const two = block(parent, workspace, 'workspace-two');
  two.handle.update({ anchor: 'preview-two' }, context('workspace-two'));
  const card = one.host.querySelector<HTMLButtonElement>(
    '[data-demo-view="tabs"]',
  )!;
  card.click();
  expect(
    one.host.querySelector('[data-workspace-demo]')?.getAttribute('data-view'),
  ).toBe('tabs');
  expect(
    two.host.querySelector('[data-workspace-demo]')?.getAttribute('data-view'),
  ).toBe('spaces');
  expect(card.getAttribute('aria-checked')).toBe('true');
  expect(
    one.host
      .querySelector('[data-demo-group="view"][data-demo-value="tabs"]')
      ?.getAttribute('aria-selected'),
  ).toBe('true');
  card.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
  );
  expect(
    one.host.querySelector('[data-workspace-demo]')?.getAttribute('data-view'),
  ).toBe('chats');
  const ids = [...parent.querySelectorAll('[id]')].map((el) => el.id);
  expect(new Set(ids).size).toBe(ids.length);
  // Layout/context updates preserve interaction state.
  one.handle.update(
    {},
    { ...context('workspace-one'), globals: { theme: 'dark' } },
  );
  expect(
    one.host.querySelector('[data-workspace-demo]')?.getAttribute('data-view'),
  ).toBe('chats');
  one.handle.destroy();
  two.handle.destroy();
  expect(
    observers.every((observer) => observer.disconnect.mock.calls.length > 0),
  ).toBe(true);
});

it('recolors every demo in its preview scope without changing their state or another preview', () => {
  const parent = scope();
  const other = scope();
  const one = block(parent, workspace, 'one');
  const animation = block(parent, panes, 'panes');
  const picker = block(parent, themes, 'themes');
  const isolated = block(other, workspace, 'isolated');
  one.host.querySelector<HTMLButtonElement>('[data-demo-view="tabs"]')!.click();
  const options =
    picker.host.querySelectorAll<HTMLButtonElement>('.theme-choice');
  expect(options.length).toBe(15);
  options[1].click();
  const chosen = options[1].dataset.appTheme;
  expect(
    [...parent.querySelectorAll<HTMLElement>('.native-demo')].every(
      (el) => el.dataset.appTheme === chosen,
    ),
  ).toBe(true);
  expect(
    isolated.host.querySelector<HTMLElement>('.native-demo')?.dataset.appTheme,
  ).toBe(DEFAULT_APP_THEME);
  expect(
    one.host.querySelector<HTMLElement>('[data-workspace-demo]')?.dataset.view,
  ).toBe('tabs');
  expect(
    animation.host.querySelector<HTMLElement>('[data-pane-demo]')?.dataset
      .playing,
  ).toBeUndefined();
  expect(
    animation.host.querySelector<HTMLElement>('.paning-layout')?.dataset.layout,
  ).toBe('four');
  expect(animation.host.querySelectorAll('.paning-pane')).toHaveLength(4);
  expect(parent.dataset.theme).toBeUndefined();
});

it('keeps download dialogs local, usable from layout actions, and cleans up on removal', () => {
  const parent = scope();
  const other = scope();
  const action = document.createElement('a');
  action.dataset.download = '';
  action.href = '#download';
  parent.append(action);
  const first = block(parent, download, 'download-one');
  const second = block(other, download, 'download-two');
  const dialog = first.host.querySelector<HTMLDialogElement>('dialog')!;
  action.click();
  expect(dialog.open).toBe(true);
  expect(second.host.querySelector<HTMLDialogElement>('dialog')!.open).toBe(
    false,
  );
  first.host.querySelector<HTMLButtonElement>('[data-dialog-close]')!.click();
  expect(dialog.open).toBe(false);
  expect(first.host.querySelectorAll('.platform-list a')).toHaveLength(6);
  first.handle.destroy();
  action.click();
  expect(dialog.open).toBe(false);
});

it('escapes editable text and unsafe links, while leaving author-supplied demo markup intact', () => {
  const html = intro.render(
    {
      heading: '<script>alert(1)</script>',
      primaryURL: 'javascript:alert(1)',
      description: 'one\ntwo',
    },
    context('safe'),
  );
  expect(html).not.toContain('<script>');
  expect(html).not.toContain('javascript:');
  expect(html).toContain('&lt;script&gt;');
  expect(html).toContain('one<br>two');
  const markup = workspace.render(
    workspaceDefinition.defaults,
    context('markup'),
  );
  expect(markup).toContain('data-workspace-demo');
  expect(markup).not.toContain('<iframe');
  expect(markup).not.toContain('screenshot');
});
