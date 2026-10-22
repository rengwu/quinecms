import type { ReactNode } from 'react';
import { Badge } from '@cloudflare/kumo/components/badge';
import { Tabs } from '@cloudflare/kumo/components/tabs';
import spike from './spike.module.css';
import {
  blank,
  languageName,
  publicPath,
  view,
  visitor,
  type Content,
  type Copy,
  type Doc,
  type Values,
  type View,
} from './model';

export type PreviewMode = 'draft' | 'visitor';
interface Resolved {
  view: View;
  /** Set when a secondary-language request receives the whole main-language item. */
  fallback: 'none' | 'incomplete' | null;
  blocked: boolean;
  /** Current unsaved copy of the edited item; blank values are marked, never filled. */
  draft: boolean;
}

export default function Preview({
  content: c,
  doc,
  lang,
  copy,
  mode,
  setMode,
  admin,
}: {
  content: Content;
  doc: Doc;
  lang: string;
  copy?: Copy;
  mode: PreviewMode;
  setMode(mode: PreviewMode): void;
  admin: string;
}) {
  const main = c.settings.main;
  const secondaryLang = c.settings.enabled && lang !== main;
  // The edited item follows the preview mode; every other item resolves as a
  // visitor would receive it, independently (DEC-195).
  const resolve = (target: Doc): Resolved => {
    if (target.id === doc.id && secondaryLang && mode === 'draft') {
      if (copy) return { view: view(c, target, lang, copy), fallback: null, blocked: false, draft: true };
      return { view: view(c, target, main), fallback: 'none', blocked: c.settings.policy === 'strict', draft: false };
    }
    return { ...visitor(c, target, lang), draft: false };
  };
  const layoutDoc = doc.kind === 'layout' ? doc : c.docs.find((d) => d.kind === 'layout')!;
  const collection = c.collections.find((x) => x.id === doc.collectionId);
  const pageDoc =
    doc.kind === 'layout'
      ? c.docs.find((d) => d.id === 'page-home')!
      : doc.kind === 'entry'
        ? c.docs.find((d) => d.id === collection?.templateId)!
        : doc;
  const entryDoc =
    doc.kind === 'entry' ? doc : pageDoc.id === 'tpl-product' ? c.docs.find((d) => d.id === 'p-serum') : undefined;
  const shownDoc = doc.kind === 'layout' ? pageDoc : doc;
  const path = publicPath(c, shownDoc, lang) ?? `${publicPath(c, entryDoc!, lang)} (sample entry)`;
  return (
    <>
      <div className={`kumo-ui ${spike.previewBar}`} data-mode={admin}>
        <div className={spike.previewRow}>
          <Badge variant="info">{languageName(c, c.settings.enabled ? lang : main)}</Badge>
          <code className={spike.previewPath}>{path}</code>
          {secondaryLang && (
            <Tabs
              variant="segmented"
              size="sm"
              value={mode}
              onValueChange={(v) => setMode(v as PreviewMode)}
              tabs={[
                { value: 'draft', label: 'Draft' },
                { value: 'visitor', label: 'Visitor' },
              ]}
            />
          )}
        </div>
      </div>
      <Site c={c} r={resolve(layoutDoc)} lang={lang}>
        {entryDoc && collection?.id !== 'ingredients' ? (
          <ProductPage c={c} entry={resolve(entryDoc)} template={resolve(pageDoc)} resolve={resolve} lang={lang} />
        ) : (
          <HomePage c={c} page={resolve(pageDoc)} resolve={resolve} lang={lang} />
        )}
      </Site>
    </>
  );
}

function Text({ value, r, label }: { value: unknown; r: Resolved; label: string }) {
  if (!blank(value)) return <>{String(value)}</>;
  if (!r.draft) return null;
  return <span className={spike.missing}>Missing {label}</span>;
}

function Origin({ c, r, lang, children, inline }: { c: Content; r: Resolved; lang: string; children: ReactNode; inline?: boolean }) {
  if (!r.fallback) return <>{children}</>;
  const Tag = inline ? 'span' : 'div';
  const reason = r.fallback === 'none' ? `no ${languageName(c, lang)} copy` : `${languageName(c, lang)} copy incomplete`;
  return (
    <Tag
      className={spike.origin}
      data-label={`${languageName(c, c.settings.main)} · ${reason}${r.blocked ? ' · blocks Publish' : ''}`}
    >
      {children}
    </Tag>
  );
}

function Media({ c, value, r }: { c: Content; value: Values | null; r: Resolved }) {
  const media = c.media.find((m) => m.id === value?.mediaId);
  if (!media) return <div className={spike.mediaEmpty}>No image</div>;
  return (
    <figure className={spike.media}>
      <div
        role="img"
        aria-label={String(value?.alt ?? '')}
        className={spike.mediaArt}
        style={{ background: `linear-gradient(140deg, hsl(${media.hue} 55% 86%), hsl(${media.hue + 35} 45% 64%))` }}
      >
        <svg viewBox="0 0 60 100" aria-hidden="true">
          <rect x="22" y="4" width="16" height="16" rx="3" fill="#fff8" />
          <rect x="12" y="20" width="36" height="74" rx="10" fill="#fffc" />
        </svg>
      </div>
      <figcaption className={spike.altNote}>
        alt: <Text value={value?.alt} r={r} label="alt text" />
      </figcaption>
    </figure>
  );
}

function Site({ c, r, lang, children }: { c: Content; r: Resolved; lang: string; children: ReactNode }) {
  const v = r.view.values;
  return (
    <div className={spike.site} lang={r.view.lang}>
      <Origin c={c} r={r} lang={lang}>
        {!blank(v.announcement) && <p className={spike.announcement}>{v.announcement}</p>}
        <header className={spike.siteHeader}>
          <strong>{v.brand}</strong>
          <nav>
            {(v.nav as Values[]).map((link) => (
              <a key={link._rowId} href="#" onClick={(event) => event.preventDefault()}>
                <Text value={link.label} r={r} label="label" />
              </a>
            ))}
          </nav>
          {c.settings.enabled && (
            <span className={spike.siteLanguages}>
              {c.settings.languages.map((l) => (
                <b key={l.code} aria-current={l.code === lang ? 'true' : undefined}>
                  {l.code.toUpperCase()}
                </b>
              ))}
            </span>
          )}
        </header>
      </Origin>
      <main>{children}</main>
      <Origin c={c} r={r} lang={lang}>
        <footer className={spike.siteFooter}>
          <Text value={v.footer} r={r} label="footer note" />
        </footer>
      </Origin>
    </div>
  );
}

function ProductPage({ c, entry, template, resolve, lang }: {
  c: Content;
  entry: Resolved;
  template: Resolved;
  resolve(doc: Doc): Resolved;
  lang: string;
}) {
  const v = entry.view.values;
  const t = template.view.blocks[0]?.values ?? {};
  const featuredDoc = c.docs.find((d) => d.id === v.featured);
  const featured = featuredDoc && resolve(featuredDoc);
  return (
    <Origin c={c} r={entry} lang={lang}>
      <section className={spike.productHero}>
        <Media c={c} value={v.photo} r={entry} />
        <div className={spike.productCopy}>
          {!blank(v.tagline) && <p className={spike.eyebrow}>{v.tagline}</p>}
          <h1>
            <Text value={v.name} r={entry} label="name" />
          </h1>
          <p className={spike.meta}>{v.size}</p>
          <p>
            <Text value={v.description} r={entry} label="description" />
          </p>
          <Origin c={c} r={template} lang={lang} inline>
            <span className={spike.cta}>
              <Text value={t.cta} r={template} label="button label" />
            </span>
          </Origin>
        </div>
      </section>
      <section className={spike.siteSection}>
        <h2>
          <Origin c={c} r={template} lang={lang} inline>
            <Text value={t.ingredientsHeading} r={template} label="heading" />
          </Origin>
        </h2>
        <ul className={spike.cards}>
          {(v.ingredients as Values[]).map((row) => (
            <li key={row._rowId}>
              <strong>
                <Text value={row.name} r={entry} label="ingredient name" />
              </strong>
              <span>{row.benefit}</span>
              <small>{row.percent}</small>
            </li>
          ))}
        </ul>
      </section>
      {featured && (
        <section className={spike.siteSection}>
          <h2>
            <Origin c={c} r={template} lang={lang} inline>
              {t.featuredHeading}
            </Origin>
          </h2>
          <Origin c={c} r={featured} lang={lang}>
            <div className={spike.feature}>
              <strong>{featured.view.values.name}</strong>
              <p>{featured.view.values.summary}</p>
              <small>{featured.view.values.origin}</small>
            </div>
          </Origin>
        </section>
      )}
    </Origin>
  );
}

function HomePage({ c, page, resolve, lang }: { c: Content; page: Resolved; resolve(doc: Doc): Resolved; lang: string }) {
  return (
    <Origin c={c} r={page} lang={lang}>
      {page.view.blocks.map((b) => {
        const v = b.values;
        if (b.type === 'hero')
          return (
            <section key={b.id} className={spike.homeHero}>
              <div className={spike.productCopy}>
                <h1>
                  <Text value={v.heading} r={page} label="heading" />
                </h1>
                <p>
                  <Text value={v.body} r={page} label="body" />
                </p>
                <span className={spike.cta}>
                  <Text value={v.cta} r={page} label="button label" />
                </span>
              </div>
              <Media c={c} value={v.image} r={page} />
            </section>
          );
        if (b.type === 'featured')
          return (
            <section key={b.id} className={spike.siteSection}>
              <h2>
                <Text value={v.heading} r={page} label="heading" />
              </h2>
              <ul className={spike.cards}>
                {(v.items as Values[]).map((row) => {
                  const product = c.docs.find((d) => d.id === row.product);
                  if (!product) return null;
                  const r = resolve(product);
                  return (
                    <li key={row._rowId}>
                      <Origin c={c} r={r} lang={lang}>
                        <Media c={c} value={r.view.values.photo} r={r} />
                        <strong>{r.view.values.name}</strong>
                        <span>{r.view.values.tagline}</span>
                      </Origin>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        return (
          <section key={b.id} className={spike.siteSection}>
            <h2>
              <Text value={v.heading} r={page} label="heading" />
            </h2>
            <p>
              <Text value={v.body} r={page} label="body" />
            </p>
          </section>
        );
      })}
    </Origin>
  );
}
