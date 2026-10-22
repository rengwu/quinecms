import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useRef,
  type ComponentType,
  type ReactNode,
} from 'react';
import type { Content, Entry, Page } from '../core/types';
import type { LayoutProps } from '../core/layout-contract';
import { activeLayout, layoutKey } from '../core/layouts';
import { layoutRenderers } from '../generated/layout-browser';
import { contextFor } from '../core/content';
import { definitions } from '../generated/definitions';
import { bindingPlaceholders, resolveBlock } from '../core/bindings';
import Island from './Island';

const renderers = Object.fromEntries(
  Object.entries(layoutRenderers).map(([key, load]) => [
    key,
    lazy(load as () => Promise<{ default: ComponentType<LayoutProps> }>),
  ]),
);
class LayoutError extends Component<
  { children: ReactNode; content: Content },
  { error: string }
> {
  state = { error: '' };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  componentDidUpdate(
    previous: Readonly<{ children: ReactNode; content: Content }>,
  ) {
    if (this.state.error && previous.content !== this.props.content)
      this.setState({ error: '' });
  }
  render() {
    return this.state.error ? (
      <p role="alert">Unable to preview this layout: {this.state.error}</p>
    ) : (
      this.props.children
    );
  }
}
export default function LayoutSurface({
  content,
  children,
  onNavigate,
}: {
  content: Content;
  children?: ReactNode;
  onNavigate?: LayoutProps['onNavigate'];
}) {
  const active = activeLayout(content.site);
  const key = layoutKey(active);
  const Layout = renderers[key];
  return (
    <div data-layout-surface style={{ display: 'contents' }}>
      <LayoutError key={key} content={content}>
        <Suspense fallback={<p>Loading layout…</p>}>
          {Layout ? (
            <Layout
              content={content}
              settings={active.settings}
              preview
              onNavigate={onNavigate}
            >
              {children}
            </Layout>
          ) : (
            <p role="alert">Layout {key} is unavailable.</p>
          )}
        </Suspense>
      </LayoutError>
    </div>
  );
}
export function PageBlocks({
  content,
  page,
  entry,
  selectedId,
  revealId,
  className,
  fallback,
}: {
  content: Content;
  page?: Page;
  entry?: Entry;
  selectedId?: string;
  revealId?: string;
  className?: string;
  /** Names the main language when this content stands in for a missing copy. */
  fallback?: string;
}) {
  const fields = content.collections.find(
    (c) => c.id === entry?.collectionId,
  )?.fields;
  const revealed = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = revealed.current;
    if (!revealId || !element) return;
    // Islands mount asynchronously. Reveal once they have a visible height,
    // then leave scrolling alone while the author edits fields.
    const observer = new ResizeObserver(() => {
      if (!element.getBoundingClientRect().height) return;
      element.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      });
      observer.disconnect();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [revealId]);
  return (
    <>
      {page?.blocks.map((b) => (
        <section
          className={className}
          key={b.id}
          ref={b.id === revealId ? revealed : undefined}
          data-selected={selectedId === b.id}
          data-fallback={fallback}
        >
          <Island
            block={entry ? resolveBlock(b, entry.values, content, fields) : b}
            context={{
              ...contextFor(
                content,
                b.id,
                definitions.find(
                  (d) => d.type === b.type && d.version === b.version,
                ),
              ),
              preview: true,
              ...(page.kind === 'generic' && !entry
                ? { bindingPlaceholders: bindingPlaceholders(b) }
                : {}),
            }}
          />
        </section>
      ))}
    </>
  );
}
