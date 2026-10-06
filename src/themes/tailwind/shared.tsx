import type { ReactNode } from 'react';
import type { Context, Values, ViewProps } from '../../core/types';
import { safeURL } from '../../core/content';
import { listRows } from '../../core/lists';
import { markdown } from '../../core/markdown';
import './theme.css';
export type LayoutProps = ViewProps & { variant: number };
export const text = (v: unknown) =>
  typeof v === 'string' || typeof v === 'number' ? String(v) : '';
export const rows = listRows;
export const href = (v: unknown) => (safeURL(v) ? v : undefined);
export const key = (row: Values, i: number) => text(row._rowId) || i;
export function value(p: Values, c: Context, name: string) {
  return c.bindingPlaceholders?.[name] ?? p[name];
}
export function Image({
  value: v,
  context: c,
  className = '',
  art = true,
}: {
  value: unknown;
  context: Context;
  className?: string;
  art?: boolean;
}) {
  if (typeof v === 'string' && v.startsWith('{{'))
    return <p className="tw-binding">{v}</p>;
  const ref =
    v && typeof v === 'object' && !Array.isArray(v) ? (v as Values) : null;
  const media =
    ref &&
    c.media.find(
      (m) => m.id === ref.mediaId && m.original.mime.startsWith('image/'),
    );
  return media && href(media.original.url) ? (
    <img
      className={'tw-image ' + className}
      src={media.original.url}
      alt={text(ref?.alt)}
      loading="lazy"
    />
  ) : art ? (
    <div className={'tw-art ' + className} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  ) : null;
}
export function Shell({
  category,
  variant,
  children,
  dark = false,
}: {
  category: string;
  variant: number;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <section
      className={`tw-block tw-${category} tw-v${variant}${dark ? ' tw-dark' : ''}`}
    >
      <div className="tw-container">{children}</div>
    </section>
  );
}
export function Intro({
  props: p,
  context: c,
  hero = false,
}: ViewProps & { hero?: boolean }) {
  const H = hero ? 'h1' : 'h2';
  return (
    <div className="tw-intro">
      {value(p, c, 'eyebrow') && (
        <p className="tw-eyebrow">{text(value(p, c, 'eyebrow'))}</p>
      )}
      {value(p, c, 'heading') && <H>{text(value(p, c, 'heading'))}</H>}
      {value(p, c, 'description') && (
        <p className="tw-lead">{text(value(p, c, 'description'))}</p>
      )}
    </div>
  );
}
export function Actions({ props: p, context: c }: ViewProps) {
  return (
    <div className="tw-actions">
      {['', 'secondary'].map((prefix) => {
        const label = prefix ? 'secondaryLabel' : 'actionLabel',
          url = prefix ? 'secondaryURL' : 'actionURL';
        return value(p, c, label) && href(value(p, c, url)) ? (
          <a
            key={label}
            className={prefix ? 'tw-link' : 'tw-button'}
            href={href(value(p, c, url))}
          >
            {text(value(p, c, label))}
            <span aria-hidden="true"> ↗</span>
          </a>
        ) : null;
      })}
    </div>
  );
}
export function Rich({
  value: v,
  context,
}: {
  value: unknown;
  context: Context;
}) {
  return (
    <div
      className="tw-prose"
      dangerouslySetInnerHTML={{ __html: markdown(v, context.media) }}
    />
  );
}
export function Items({
  props: p,
  context: c,
  children,
}: ViewProps & { children: (row: Values, i: number) => ReactNode }) {
  const placeholder = c.bindingPlaceholders?.items;
  return placeholder ? (
    <p className="tw-binding">{placeholder}</p>
  ) : (
    <>{rows(p.items).map(children)}</>
  );
}
