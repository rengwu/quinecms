export function lifecycle() {
  const cleanups: (() => void)[] = [];
  return {
    on(
      target: EventTarget | null,
      type: string,
      handler: EventListener,
      options?: AddEventListenerOptions,
    ) {
      target?.addEventListener(type, handler, options);
      cleanups.push(() => target?.removeEventListener(type, handler, options));
    },
    destroy() {
      for (const cleanup of cleanups.splice(0)) cleanup();
    },
  };
}
export function demoScope(root: HTMLElement): HTMLElement {
  return root.closest<HTMLElement>('[data-layout-surface]') ?? root;
}
