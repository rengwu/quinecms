import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import type { LayoutProps } from '../../../core/layout-contract';
import type { Values } from '../../../core/types';
import { safeURL } from '../../../core/content';
import { siteStyle } from '../../../core/site-style';
import '../../../themes/chartr/v1/styles.css';

const preferenceKey = 'chartr-website-theme';
const text = (value: unknown) => String(value ?? '');
const links = (value: unknown): Values[] =>
  Array.isArray(value)
    ? value.filter(
        (row) => row && typeof row === 'object' && !Array.isArray(row),
      )
    : [];
const href = (value: unknown) => (safeURL(value) ? value : undefined);
// Runs as the root is parsed, before its visible content. The editor uses the
// same resolver in its effect without writing visitor preferences.
const initialThemeScript = `(()=>{const root=document.currentScript.parentElement;let mode=root.dataset.appearance||'system';try{if(root.dataset.allowToggle==='true')mode=localStorage.getItem('${preferenceKey}')||mode}catch{}root.dataset.theme=(mode==='dark'||mode==='warp-dark'||(mode==='system'&&matchMedia('(prefers-color-scheme: dark)').matches))?'warp-dark':'warp'})()`;

export default function Chartr({
  settings,
  content,
  children,
  preview,
  onNavigate,
}: LayoutProps) {
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const mainId = useId();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(settings.appearance === 'dark');
  const manual = useRef<boolean | null>(null);
  useEffect(() => {
    const system = window.matchMedia('(prefers-color-scheme: dark)');
    manual.current = null;
    if (!preview && settings.allowToggle) {
      try {
        const saved = localStorage.getItem(preferenceKey);
        if (['warp', 'warp-dark'].includes(saved ?? ''))
          manual.current = saved === 'warp-dark';
      } catch {}
    }
    const update = () =>
      setDark(
        manual.current ??
          (settings.appearance === 'dark' ||
            (settings.appearance === 'system' && system.matches)),
      );
    update();
    system.addEventListener('change', update);
    return () => system.removeEventListener('change', update);
  }, [settings.appearance, settings.allowToggle, preview]);
  useEffect(() => {
    const element = root.current!.querySelector<HTMLElement>('.header-inner')!;
    const resize = new ResizeObserver(() => {
      if (element.clientWidth > 900) setOpen(false);
    });
    resize.observe(element);
    return () => resize.disconnect();
  }, []);
  useEffect(() => {
    if (open) {
      const first =
        root.current?.querySelector<HTMLElement>('nav.mobile-menu a');
      (
        first ?? root.current?.querySelector<HTMLElement>('[data-menu-toggle]')
      )?.focus();
    }
  }, [open]);
  const navigation = (mobile = false) => (
    <>
      {links(settings.navigation).map((link, i) => (
        <a key={text(link._rowId) || i} href={href(link.url)}>
          {text(link.label)}
        </a>
      ))}
      {mobile && settings.sourceLabel && (
        <a href={href(settings.sourceURL)}>{text(settings.sourceLabel)} ↗</a>
      )}
    </>
  );
  function toggle() {
    manual.current = !dark;
    setDark(!dark);
    if (!preview)
      try {
        localStorage.setItem(preferenceKey, dark ? 'warp' : 'warp-dark');
      } catch {}
  }
  const brand = (
    <a
      className="brand"
      href={href(settings.homeURL)}
      aria-label={`${text(settings.brand)} home`}
    >
      <img src="/chartr/v1/chartr-icon-64.png" width="30" height="30" alt="" />
      <span>{text(settings.brand)}</span>
    </a>
  );
  return (
    <div
      ref={root}
      className="chartr-site chartr-scope"
      data-theme={dark ? 'warp-dark' : 'warp'}
      data-appearance={text(settings.appearance)}
      data-allow-toggle={String(!!settings.allowToggle)}
      suppressHydrationWarning
      style={
        {
          ...siteStyle(content.site.globals),
          '--site-body-font': '"IBM Plex Mono", monospace',
          '--site-heading-font': '"IBM Plex Mono", monospace',
        } as CSSProperties
      }
      onClick={(e) => {
        const a = (e.target as HTMLElement).closest('a');
        if (!a) return;
        setOpen(false);
        const url = a.getAttribute('href') ?? '';
        if (url.startsWith('#')) {
          const target = root.current?.querySelector<HTMLElement>(
            `[id="${CSS.escape(url.slice(1))}"]`,
          );
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
          }
        } else if (preview && !a.hasAttribute('data-download')) {
          e.preventDefault();
          onNavigate?.(url);
        }
      }}
      onKeyDown={(e) => {
        if (!open) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          setOpen(false);
          root.current
            ?.querySelector<HTMLButtonElement>('[data-menu-toggle]')
            ?.focus();
        }
        if (e.key === 'Tab') {
          const controls = [
            ...root.current!.querySelectorAll<HTMLElement>(
              'header a, header button',
            ),
          ].filter((el) => el.getClientRects().length > 0);
          const first = controls[0],
            last = controls.at(-1);
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }}
    >
      {!preview && (
        <script dangerouslySetInnerHTML={{ __html: initialThemeScript }} />
      )}
      <a className="skip-link" href={`#${mainId}`}>
        Skip to content
      </a>
      <header className="site-header">
        <div className="container chartr-frame">
          <div className="header-inner">
            {brand}
            <nav className="desktop-nav" aria-label="Main navigation">
              {navigation()}
            </nav>
            <div className="header-actions">
              {settings.allowToggle && (
                <button
                  className="theme-toggle"
                  type="button"
                  aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
                  title={`Switch to ${dark ? 'light' : 'dark'} mode`}
                  data-theme-toggle
                  onClick={toggle}
                >
                  <svg
                    className="theme-icon-moon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.9 13.1A9 9 0 0 1 10.9 3.1 9 9 0 1 0 20.9 13.1Z" />
                  </svg>
                  <svg
                    className="theme-icon-sun"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                  </svg>
                </button>
              )}
              {settings.sourceLabel && (
                <a className="source-link" href={href(settings.sourceURL)}>
                  {text(settings.sourceLabel)} ↗
                </a>
              )}
              {settings.downloadLabel && (
                <a
                  className="button button-primary"
                  href={href(settings.downloadURL)}
                  data-download
                >
                  <span className="download-label">
                    {settings.downloadLabel === 'Download chartr' ? (
                      <>
                        Download
                        <span className="download-product-name"> chartr</span>
                      </>
                    ) : (
                      text(settings.downloadLabel)
                    )}
                  </span>
                  <span aria-hidden="true">↓</span>
                </a>
              )}
              <button
                className="menu-toggle"
                aria-expanded={open}
                aria-controls={menuId}
                aria-label={open ? 'Close navigation' : 'Open navigation'}
                data-menu-toggle
                onClick={() => setOpen(!open)}
              >
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
        <nav
          className="mobile-menu"
          id={menuId}
          aria-label="Mobile navigation"
          hidden={!open}
        >
          {navigation(true)}
        </nav>
      </header>
      <main className="chartr-main" id={mainId} inert={open}>
        {children}
      </main>
      <div className="container chartr-frame">
        <footer className="site-footer" inert={open}>
          {brand}
          <nav aria-label="Footer links">
            {links(settings.footerLinks).map((link, i) => (
              <a key={text(link._rowId) || i} href={href(link.url)}>
                {text(link.label)}
              </a>
            ))}
          </nav>
          <span className="copyright">{text(settings.copyright)}</span>
        </footer>
      </div>
    </div>
  );
}
