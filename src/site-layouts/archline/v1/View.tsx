import { useEffect, useId, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { LayoutProps } from '../../../core/layout-contract';
import { contentSpacing } from '../../../core/site-style';
import { Image } from '../../../themes/archline/v1/components';
import { href, rows, text } from '../../../themes/archline/v1/content';
import definition from './definition.json';

export default function Archline({
  settings,
  content,
  children,
  preview,
  onNavigate,
}: LayoutProps) {
  const root = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDetailsElement>(null);
  const header = useRef<HTMLElement>(null);
  const mainId = useId();
  const spacing = contentSpacing(settings, definition.defaults);
  useEffect(() => {
    const surface = root.current;
    if (!surface) return;
    const hero = surface.querySelector('.archline-hero');
    const headerObserver = hero
      ? new IntersectionObserver(
          ([entry]) => {
            header.current?.toggleAttribute(
              'data-solid',
              !entry.isIntersecting,
            );
          },
          { threshold: 0, rootMargin: '-80px 0px 0px 0px' },
        )
      : null;
    if (hero) headerObserver?.observe(hero);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let reveal: IntersectionObserver | undefined;
    if (!preview && !reduced.matches) {
      surface.setAttribute('data-motion', '');
      reveal = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.removeAttribute('data-hidden');
              reveal?.unobserve(entry.target);
            }
          }),
        { threshold: 0.06 },
      );
      surface.querySelectorAll('[data-reveal]').forEach((el) => {
        if (el.getBoundingClientRect().top > window.innerHeight)
          el.setAttribute('data-hidden', '');
        reveal?.observe(el);
      });
    }
    const show = () => {
      if (reduced.matches) {
        surface.removeAttribute('data-motion');
        surface
          .querySelectorAll('[data-hidden]')
          .forEach((el) => el.removeAttribute('data-hidden'));
        reveal?.disconnect();
      }
    };
    reduced.addEventListener('change', show);
    return () => {
      headerObserver?.disconnect();
      reveal?.disconnect();
      reduced.removeEventListener('change', show);
      surface.removeAttribute('data-motion');
      surface
        .querySelectorAll('[data-hidden]')
        .forEach((el) => el.removeAttribute('data-hidden'));
    };
  }, [preview]);
  const navigation = rows(settings.navigation),
    socials = rows(settings.socials);
  const links = (items: typeof navigation) =>
    items.map((row, i) => (
      <a href={href(row.url)} key={text(row._rowId) || i}>
        {text(row.label)}
      </a>
    ));
  return (
    <div
      ref={root}
      className="archline-scope archline-site"
      data-preview={preview || undefined}
      style={
        {
          '--site-content-max-width': `${spacing.contentMaxWidth}px`,
          '--site-page-gutter': `${spacing.pageGutter}px`,
        } as CSSProperties
      }
      onKeyDown={(event) => {
        if (!menu.current?.open) return;
        if (event.key === 'Escape') {
          menu.current.open = false;
          menu.current.querySelector('summary')?.focus();
        }
        if (event.key === 'Tab') {
          const controls = Array.from(
            menu.current.querySelectorAll<HTMLElement>(
              'summary,a[href],button',
            ),
          );
          const first = controls[0],
            last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
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
        if (menu.current?.open) menu.current.open = false;
        if (preview) {
          event.preventDefault();
          const url = link.getAttribute('href') ?? '';
          const hash = url.indexOf('#');
          const target =
            hash >= 0
              ? root.current?.querySelector(
                  `[id="${CSS.escape(url.slice(hash + 1))}"]`,
                )
              : null;
          if (target) target.scrollIntoView({ block: 'start' });
          else if (url.startsWith('/')) onNavigate?.(url);
        }
      }}
    >
      <a className="archline-skip" href={`#${mainId}`}>
        Skip to content
      </a>
      <header ref={header} className="archline-header">
        <div className="archline-nav-bar">
          <a
            className="archline-brand"
            href="/"
            aria-label={`${text(settings.brand)} home`}
          >
            {text(settings.brand)}
          </a>
          <nav className="archline-inline-nav" aria-label="Main navigation">
            {links(navigation)}
          </nav>
          <details ref={menu} className="archline-menu">
            <summary aria-label="Navigation menu">
              <span className="archline-menu-icon" aria-hidden="true" /> MENU
            </summary>
            <div className="archline-menu-panel">
              <Image
                value={settings.menuImage}
                context={{ media: content.media, preview }}
              />
              <div className="archline-menu-columns">
                <div>
                  <h2>Menu</h2>
                  <nav aria-label="Expanded navigation">
                    <a href="/">Homepage</a>
                    {links(navigation)}
                  </nav>
                </div>
                <div>
                  <h2>Social</h2>
                  <nav aria-label="Social links">{links(socials)}</nav>
                </div>
                <div className="archline-menu-contact">
                  <h2>Contact</h2>
                  <a href={href(settings.phoneURL)}>{text(settings.phone)}</a>
                  <a href={href(settings.emailURL)}>{text(settings.email)}</a>
                </div>
              </div>
            </div>
          </details>
        </div>
      </header>
      <main id={mainId}>{children}</main>
      <footer className="archline-footer">
        <div className="archline-frame">
          <div className="archline-footer-top">
            <div className="archline-footer-links">
              <div>
                <h2>Menu</h2>
                <nav aria-label="Footer navigation">
                  <a href="/">Homepage</a>
                  {links(navigation)}
                </nav>
              </div>
              <div>
                <h2>Social</h2>
                <nav aria-label="Footer social links">{links(socials)}</nav>
              </div>
            </div>
            <div className="archline-footer-contact">
              <div>
                <h2>E-mail</h2>
                <a href={href(settings.emailURL)}>{text(settings.email)}</a>
              </div>
              <div>
                <h2>Phone Number</h2>
                <a href={href(settings.phoneURL)}>{text(settings.phone)}</a>
              </div>
              <div>
                <h2>Address</h2>
                <p>{text(settings.address)}</p>
              </div>
              <div>
                <h2>Working Hours</h2>
                <p>{text(settings.hours)}</p>
              </div>
            </div>
          </div>
          <div className="archline-footer-bottom">
            <p>{text(settings.copyright)}</p>
            <a className="archline-footer-identity" href="/">
              <b className="archline-brand">{text(settings.brand)}</b>
              <span>{text(settings.tagline)}</span>
            </a>
            <nav className="archline-footer-legal" aria-label="Legal">
              {links(rows(settings.legal))}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
