import type { CSSProperties } from 'react';
import type { LayoutProps } from '../../../core/layout-contract';
import Header from '../../../site/Header';
import Footer from '../../../themes/tailwind/Footer';
import { contextFor } from '../../../core/content';
import { layoutGlobals } from '../../../core/layouts';
import { siteStyle } from '../../../core/site-style';
import { starterContent } from './policy';
import './style.css';

export default function Starter({
  settings,
  content,
  children,
  preview,
  onNavigate,
}: LayoutProps) {
  const view = starterContent(content, settings);
  const footer = view.site.footer;
  const variant = footer
    ? Number(footer.type.match(/^tw-footer-([123])$/)?.[1])
    : 0;
  return (
    <div
      className="starter-layout site-surface"
      data-theme={settings.theme ?? 'light'}
      style={siteStyle(layoutGlobals(content.site)) as CSSProperties}
    >
      <Header content={view} preview={preview} onNavigate={onNavigate} />
      <main>{children}</main>
      {footer && variant ? (
        <Footer
          variant={variant as 1 | 2 | 3}
          props={footer.props}
          context={contextFor(view, footer.id)}
        />
      ) : (
        <footer className="site-footer">{view.site.title}</footer>
      )}
    </div>
  );
}
