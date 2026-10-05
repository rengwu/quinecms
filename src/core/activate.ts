import type { Activation, Handle } from './types';
export function activate(
  host: HTMLElement,
  policy: Activation,
  mount: () => Handle,
): () => void {
  let handle: Handle | undefined,
    observer: IntersectionObserver | undefined,
    idle: number | undefined,
    timer: ReturnType<typeof setTimeout> | undefined,
    disposed = false;
  const start = () => {
    if (disposed || handle) return;
    observer?.disconnect();
    handle = mount();
  };
  if (policy === 'load') start();
  else if (policy === 'visible') {
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) start();
      });
      observer.observe(host);
    } else start();
  } else if (policy === 'idle') {
    if ('requestIdleCallback' in window)
      idle = window.requestIdleCallback(start, { timeout: 2000 });
    else timer = setTimeout(start, 100);
  }
  const destroy = () => {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    if (idle !== undefined) window.cancelIdleCallback(idle);
    if (timer) clearTimeout(timer);
    handle?.destroy();
    window.removeEventListener('pagehide', destroy);
  };
  window.addEventListener('pagehide', destroy, { once: true });
  return destroy;
}
