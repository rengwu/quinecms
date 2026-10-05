// @vitest-environment jsdom
import { it, expect, vi, afterEach } from 'vitest';
import { activate } from '../src/core/activate';
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it('mounts load blocks once and destroys them', () => {
  const destroy = vi.fn(),
    mount = vi.fn(() => ({ update() {}, destroy }));
  const cleanup = activate(document.createElement('div'), 'load', mount);
  expect(mount).toHaveBeenCalledOnce();
  cleanup();
  expect(destroy).toHaveBeenCalledOnce();
});
it('waits for visibility and cancels observers on removal', () => {
  let callback: (entries: any[]) => void = () => {};
  const disconnect = vi.fn();
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(fn: any) {
        callback = fn;
      }
      observe() {}
      disconnect = disconnect;
    },
  );
  const mount = vi.fn(() => ({ update() {}, destroy() {} }));
  const cleanup = activate(document.createElement('div'), 'visible', mount);
  expect(mount).not.toHaveBeenCalled();
  callback([{ isIntersecting: true }]);
  callback([{ isIntersecting: true }]);
  expect(mount).toHaveBeenCalledOnce();
  cleanup();
  expect(disconnect).toHaveBeenCalled();
});
it('never activates static blocks, including after cleanup', () => {
  const mount = vi.fn();
  const cleanup = activate(document.createElement('div'), 'never', mount);
  cleanup();
  expect(mount).not.toHaveBeenCalled();
});
it('cancels idle work if removed before it starts', () => {
  let callback: () => void = () => {};
  const cancel = vi.fn();
  vi.stubGlobal('requestIdleCallback', (fn: any) => {
    callback = fn;
    return 42;
  });
  vi.stubGlobal('cancelIdleCallback', cancel);
  const mount = vi.fn();
  activate(document.createElement('div'), 'idle', mount)();
  callback();
  expect(mount).not.toHaveBeenCalled();
  expect(cancel).toHaveBeenCalledWith(42);
});
