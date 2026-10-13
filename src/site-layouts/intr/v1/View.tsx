import { useId, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { LayoutProps } from '../../../core/layout-contract';
import { contentSpacing } from '../../../core/site-style';
import definition from './definition.json';
import { Action } from '../../../themes/intr/v1/components';
import { href, rows, text } from '../../../themes/intr/v1/content';

export default function Intr({
  settings,
  content,
  children,
  preview,
  onNavigate,
}: LayoutProps) {
  const root = useRef<HTMLDivElement>(null);
  const mainId = useId();
  const spacing = contentSpacing(settings, definition.defaults);
  const projects = content.entries.filter(
    (entry) => entry.collectionId === settings.projectCollection,
  );
  return (
    <div
      ref={root}
      className="intr-site intr-scope"
      style={
        {
          '--site-content-max-width': `${spacing.contentMaxWidth}px`,
          '--site-page-gutter': `${spacing.pageGutter}px`,
        } as CSSProperties
      }
      data-preview={preview || undefined}
      onKeyDown={(event) => {
        if (event.key === 'Escape')
          root.current
            ?.querySelectorAll('details[open]')
            .forEach((el) => el.removeAttribute('open'));
      }}
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
        root.current
          ?.querySelectorAll('details[open]')
          .forEach((el) => el.removeAttribute('open'));
        const url = link.getAttribute('href') ?? '';
        if (preview) {
          event.preventDefault();
          if (url.startsWith('#'))
            root.current
              ?.querySelector(`[id="${CSS.escape(url.slice(1))}"]`)
              ?.scrollIntoView();
          else if (url.startsWith('/')) onNavigate?.(url);
        }
      }}
    >
      <a className="intr-skip" href={`#${mainId}`}>
        Skip to content
      </a>
      <header className="intr-nav">
        <a
          className="intr-brand"
          href="/"
          aria-label={`${text(settings.brand)} home`}
        >
          {text(settings.brand)}
        </a>
        <div className="intr-nav-bar">
          <details className="intr-menu">
            <summary aria-label="Navigation menu">
              <span className="intr-menu-icon" aria-hidden="true" />
            </summary>
            <nav className="intr-menu-links" aria-label="Main navigation">
              {rows(settings.navigation).map((row, i) => (
                <a key={text(row._rowId) || i} href={href(row.url)}>
                  {text(row.label)}
                </a>
              ))}
            </nav>
          </details>
          <Action label={settings.actionLabel} url={settings.actionURL} light />
        </div>
      </header>
      <main id={mainId}>{children}</main>
      <footer className="intr-footer" id="footer">
        <div className="intr-footer-grid">
          <div className="intr-footer-about">
            <p className="intr-footer-brand">{text(settings.brand)}</p>
            <p className="intr-footer-description">
              {text(settings.footerDescription)}
            </p>
          </div>
          <div>
            <h2>Links</h2>
            <ul>
              {rows(settings.navigation).map((row, i) => (
                <li key={text(row._rowId) || i}>
                  <a href={href(row.url)}>{text(row.label)}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Projects</h2>
            <ul>
              {projects.map((entry) => (
                <li key={entry.id}>
                  {href(entry.values.url) ? (
                    <a href={href(entry.values.url)}>
                      {text(entry.values.title)}
                    </a>
                  ) : (
                    text(entry.values.title)
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="intr-footer-contact">
            <h2>Contact</h2>
            <ul>
              <li>
                {href(settings.phoneURL) && (
                  <a href={href(settings.phoneURL)}>{text(settings.phone)}</a>
                )}
              </li>
              <li>
                {href(settings.emailURL) && (
                  <a href={href(settings.emailURL)}>{text(settings.email)}</a>
                )}
              </li>
            </ul>
          </div>
        </div>
        <p className="intr-copyright">{text(settings.copyright)}</p>
      </footer>
    </div>
  );
}
