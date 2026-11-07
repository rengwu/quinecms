import { createContext, useContext, useEffect, type RefObject } from 'react';
import { flushSync } from 'react-dom';

const stateKey = 'quinecms:back';
export const BackDepth = createContext(0);
export const useBackDepth = () => useContext(BackDepth);

/** Portalled levels hide their parent; an open dialog owns navigation. */
function backButton(root: HTMLElement): HTMLButtonElement | undefined {
  const visible = (element: Element) =>
    !element.closest('[hidden], [inert], [aria-hidden="true"], [data-closed]');
  const dialog = [...root.querySelectorAll('[role="dialog"]')]
    .filter(visible)
    .at(-1);
  const buttons = [
    ...(dialog ?? root).querySelectorAll<HTMLButtonElement>(
      '[data-editor-back]',
    ),
  ].filter(visible);
  return buttons.sort(
    (a, b) => Number(b.dataset.editorBack) - Number(a.dataset.editorBack),
  )[0];
}

/** History holds navigation depth only, never draft values. Seed parent entries
 * when a view opens: Chrome may skip entries pushed during a popstate callback.
 * Browser Back invokes the visible control, preserving its existing semantics.
 */
export function useBrowserBack(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!ref.current) return;
    const root = ref.current;
    const history = window.history;
    const owner = history.state?.[stateKey]?.owner ?? crypto.randomUUID();
    const owned = (state: any) => state?.[stateKey]?.owner === owner;
    let position: number = owned(history.state)
      ? history.state[stateKey].depth
      : 0;
    let moving = false;
    let navigating = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    const depth = () => Number(backButton(root)?.dataset.editorBack ?? 0);
    const state = (value: number) => ({
      ...history.state,
      [stateKey]: { owner, depth: value },
    });
    history.replaceState(state(position), '');

    function move(target: number) {
      moving = true;
      history.go(target - position);
    }
    function sync() {
      if (disposed || moving || navigating) return;
      const target = depth();
      if (target < position) move(target);
      else while (position < target) history.pushState(state(++position), '');
    }
    function pop(event: PopStateEvent) {
      if (!owned(event.state)) return;
      clearTimeout(timer);
      navigating = false;
      const previous = position;
      position = event.state[stateKey].depth;
      if (moving) {
        moving = false;
        sync();
        return;
      }
      if (position > previous) {
        // Forward is not a restore operation for cancelled/deleted forms.
        move(previous);
        return;
      }
      navigating = true;
      function step(lastDepth?: number) {
        if (disposed) return;
        const current = depth();
        if (current <= position) {
          navigating = false;
          sync();
          return;
        }
        if (lastDepth !== undefined && current >= lastDepth) {
          // Busy/disabled actions retain the view and its existing entries.
          navigating = false;
          move(previous);
          return;
        }
        const button = backButton(root);
        if (button && !button.matches(':disabled'))
          flushSync(() => button.click());
        // PanelLevel restores its parent in an effect after unmounting. Observe
        // that settled view before taking another step or reconciling history.
        timer = setTimeout(() => step(current), 0);
      }
      step();
    }

    const observer = new MutationObserver(sync);
    observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        'hidden',
        'inert',
        'aria-hidden',
        'data-closed',
        'data-editor-back',
      ],
    });
    window.addEventListener('popstate', pop);
    sync();
    return () => {
      disposed = true;
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('popstate', pop);
      // Ignore StrictMode's effect replay; release owned entries on real unmount.
      queueMicrotask(() => {
        if (!root.isConnected && !moving && owned(history.state)) {
          const remaining = history.state[stateKey].depth;
          if (remaining) history.go(-remaining);
        }
      });
    };
  }, [ref]);
}
