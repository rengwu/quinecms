import type { CSSProperties } from 'react';
import type { LayoutProps } from '../../../src/core/layout-contract';
import type { Site } from '../../../src/core/types';
import { layoutGlobals } from '../../../src/core/layouts';
import { siteStyle } from '../../../src/core/site-style';
import { resolveLink } from '../../../src/core/content';
// Contract fixture: proves layout props, navigation and scoped style delivery.
export default function View({
  settings,
  content,
  children,
  onNavigate,
}: LayoutProps) {
  const id = content.site.layout?.id;
  const globals = layoutGlobals(content.site);
  return (
    <div
      className={`site-surface ${id === 'starter' ? 'starter-layout' : 'chartr-site'}`}
      data-theme={globals.theme ?? 'light'}
      style={siteStyle(globals) as CSSProperties}
    >
      {(
        (settings.navigation ?? []) as unknown as NonNullable<
          Site['navigation']
        >
      )
        .filter((n) => n.to)
        .map((n) => (
          <a
            key={n.id}
            data-document-id={n.to.id}
            href={resolveLink(content, n.to)}
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.(resolveLink(content, n.to), n.to.id);
            }}
          >
            {n.label}
          </a>
        ))}
      <main>{children}</main>
    </div>
  );
}
