import { useRef, useId } from 'react';
import type { LayoutProps } from '../../../core/layout-contract';
import { contentSpacing } from '../../../core/site-style';
import definition from './definition.json';
import { Action } from '../../../themes/quine/v1/components';
import { href, rows, text } from '../../../themes/quine/v1/content';

export default function Quine({
  settings,
  children,
  preview,
  onNavigate,
}: LayoutProps) {
  const root = useRef<HTMLDivElement>(null);
  const mainId = useId();
  const spacing = contentSpacing(settings, definition.defaults);
  return (
    <div
      ref={root}
      className="quine-site quine-scope"
      style={
        {
          '--site-content-max-width': `${spacing.contentMaxWidth}px`,
          '--site-page-gutter': `${spacing.pageGutter}px`,
        } as import('react').CSSProperties
      }
      data-preview={preview || undefined}
      onClick={(event) => {
        const link = (event.target as HTMLElement).closest('a');
        if (
          !link ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        const url = link.getAttribute('href') ?? '';
        if (url.startsWith('#')) {
          const target = root.current?.querySelector<HTMLElement>(
            `[id="${CSS.escape(url.slice(1))}"]`,
          );
          if (target) {
            event.preventDefault();
            target.scrollIntoView({
              behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'instant'
                : 'smooth',
            });
          }
        } else if (preview) {
          event.preventDefault();
          onNavigate?.(url);
        }
      }}
    >
      <a className="quine-skip" href={`#${mainId}`}>
        Skip to content
      </a>
      <header className="quine-header">
        <div className="quine-frame quine-header-inner">
          <a
            className="quine-logo"
            href={href(settings.homeURL)}
            aria-label={`${text(settings.brand)} home`}
          >
            <img src="/quine/v1/logo.svg" width="30" height="32" alt="" />
          </a>
          <nav aria-label="Main navigation">
            {rows(settings.navigation).map((row, index) => (
              <a key={text(row._rowId) || index} href={href(row.url)}>
                {text(row.label)}
              </a>
            ))}
          </nav>
          {settings.actionLabel && (
            <Action url={settings.actionURL} arrow>
              {text(settings.actionLabel)}
            </Action>
          )}
        </div>
      </header>
      <main id={mainId}>{children}</main>
    </div>
  );
}
