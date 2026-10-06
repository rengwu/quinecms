import type { Content } from '../core/types';
import { headerValues } from '../core/header';
import { contextFor } from '../core/content';
import { rows, text, href, Image, key } from '../themes/tailwind/shared';
import './header.css';
export default function Header({
  content,
  preview = false,
  onNavigate,
}: {
  content: Content;
  preview?: boolean;
  onNavigate?(url: string, documentId?: string): void;
}) {
  const p = headerValues(content);
  const items = rows(p.items);
  const nav = (
    <>
      {items.map((item, i) => {
        const links = rows(item.links);
        const groups = [...new Set(links.map((r) => text(r.group)))];
        return links.length ? (
          <details className="site-menu-group" key={key(item, i)}>
            <summary>
              {text(item.label)} <span aria-hidden="true">⌄</span>
            </summary>
            <div className="site-dropdown">
              {href(item.url) && (
                <a className="site-group-overview" href={href(item.url)}>
                  {text(item.label)} overview ↗
                </a>
              )}
              {groups.map((group) => (
                <div key={group}>
                  {group && <strong>{group}</strong>}
                  {links
                    .filter((r) => text(r.group) === group)
                    .map((r, j) => (
                      <a key={key(r, j)} href={href(r.url)}>
                        <span>{text(r.label)}</span>
                        {r.description && <small>{text(r.description)}</small>}
                      </a>
                    ))}
                </div>
              ))}
            </div>
          </details>
        ) : (
          <a
            key={key(item, i)}
            href={href(item.url)}
            data-document-id={
              !content.site.header
                ? (() => {
                    const ref = content.site.navigation.find(
                      (n) => n.id === item._rowId,
                    )?.to;
                    return ref && ref.kind !== 'external' ? ref.id : undefined;
                  })()
                : undefined
            }
          >
            {text(item.label)}
          </a>
        );
      })}
      {p.actionLabel && href(p.actionURL) && (
        <a className="site-header-action" href={href(p.actionURL)}>
          {text(p.actionLabel)}
        </a>
      )}
    </>
  );
  return (
    <header
      className="site-global-header"
      onClick={
        preview
          ? (e) => {
              const a = (e.target as HTMLElement).closest('a');
              if (a) {
                e.preventDefault();
                onNavigate?.(
                  a.getAttribute('href') ?? '',
                  a.dataset.documentId,
                );
              }
            }
          : undefined
      }
    >
      <div className="site-header-inner">
        <a className="site-brand" href="/">
          <Image
            value={p.logo}
            context={contextFor(content, 'header')}
            art={false}
          />
          {text(p.brand) || content.site.title}
        </a>
        <nav className="site-desktop-nav" aria-label="Main">
          {nav}
        </nav>
        <details className="site-mobile-nav">
          <summary>
            Menu <span aria-hidden="true">☰</span>
          </summary>
          <nav aria-label="Mobile main">{nav}</nav>
        </details>
      </div>
    </header>
  );
}
