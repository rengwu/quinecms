import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import App from './App';
import type { ComponentProps } from 'react';
import '../styles/public.css';

export function mount(
  host: HTMLElement,
  props: ComponentProps<typeof App>,
  onLock: () => void,
) {
  const root = createRoot(host);
  flushSync(() => root.render(<App {...props} onLock={onLock} />));
  return () => flushSync(() => root.unmount());
}
