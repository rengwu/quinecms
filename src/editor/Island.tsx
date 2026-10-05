import { useEffect, useRef, useState } from 'react';
import type { Block, Context, Handle } from '../core/types';
import { definitions } from '../generated/definitions';
import { renderers } from '../generated/browser';
export default function Island({
  block,
  context,
}: {
  block: Block;
  context: Context;
}) {
  const host = useRef<HTMLDivElement>(null),
    handle = useRef<Handle | null>(null),
    latest = useRef({ block, context });
  latest.current = { block, context };
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    setError('');
    const key = `${block.type}@${block.version}` as keyof typeof renderers;
    (async () => {
      const d = definitions.find(
        (d) => d.type === block.type && d.version === block.version,
      );
      if (!d || !renderers[key])
        throw Error(
          'This block version is not installed. Its content is preserved.',
        );
      const component: any = await renderers[key]();
      const adapter =
        d.framework === 'vanilla'
          ? component
          : await {
              react: () => import('./adapters/react'),
              vue: () => import('./adapters/vue'),
              svelte: () => import('./adapters/svelte'),
            }[d.framework]();
      if (cancelled) return;
      const { block: b, context: c } = latest.current;
      handle.current =
        d.framework === 'vanilla'
          ? adapter.mount(host.current, b.props, c)
          : adapter.mount(component.default, host.current, b.props, c);
    })().catch((e) => {
      if (!cancelled) setError(e.message);
    });
    return () => {
      cancelled = true;
      const current = handle.current;
      handle.current = null;
      queueMicrotask(() => current?.destroy());
    };
  }, [block.type, block.version]);
  useEffect(() => {
    handle.current?.update(block.props, context);
  }, [block.props, context]);
  return (
    <>
      {error && <p role="alert">{error}</p>}
      <div ref={host} />
    </>
  );
}
