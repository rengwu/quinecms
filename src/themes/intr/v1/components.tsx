import type { Context, Json, ViewProps } from '../../../core/types';
import { asset, anchor, href, rows, text } from './content';
import './styles.css';

export function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 18 18 6M6 6h12v12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
export function Action({
  label,
  url,
  light = false,
}: {
  label: Json | undefined;
  url: Json | undefined;
  light?: boolean;
}) {
  return href(url) && text(label) ? (
    <a
      className={`intr-action${light ? ' intr-action-light' : ''}`}
      href={href(url)}
    >
      <span>{text(label)}</span>
      <span className="intr-action-arrow">
        <Arrow />
      </span>
    </a>
  ) : null;
}
export function Image({
  value,
  context,
  className = '',
  eager = false,
  sizes = '(max-width: 640px) 100vw, 65vw',
}: {
  value: Json | undefined;
  context: Context;
  className?: string;
  eager?: boolean;
  sizes?: string;
}) {
  const image = asset(value, context);
  if (!image)
    return (
      <div className={`intr-image-empty ${className}`}>
        {context.preview ? 'Choose an image' : ''}
      </div>
    );
  const sources = [...image.variants, image]
    .filter((item) => item.width && href(item.url))
    .sort((a, b) => a.width! - b.width!);
  return (
    <img
      className={className}
      src={image.url}
      srcSet={
        sources.length > 1
          ? sources.map((item) => `${item.url} ${item.width}w`).join(', ')
          : undefined
      }
      sizes={sizes}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
    />
  );
}
export function SectionIntro({
  label,
  description,
  url,
  action,
}: {
  label: Json | undefined;
  description?: Json;
  url?: Json;
  action?: Json;
}) {
  return (
    <div className="intr-section-intro">
      <h2>{text(label)}</h2>
      <div>
        {text(description) && <p>{text(description)}</p>}
        {href(url) && text(action) && (
          <a className="intr-text-link" href={href(url)}>
            {text(action)}
          </a>
        )}
      </div>
    </div>
  );
}
export function Hero({ props, context }: ViewProps) {
  const metadata = rows(props.metadata);
  return (
    <section
      className={`intr-scope intr-hero${metadata.length ? ' intr-hero-project' : ''}`}
    >
      <Image
        value={props.image}
        context={context}
        className="intr-hero-image"
        sizes="(max-width: 640px) 1500px, 100vw"
        eager
      />
      {metadata.length > 0 && (
        <dl className="intr-hero-meta">
          {metadata.map((row, i) => (
            <div key={text(row._rowId) || i}>
              <dt>{text(row.label)}</dt>
              <dd>{text(row.value)}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="intr-hero-copy">
        <h1>{text(props.heading)}</h1>
        {text(props.description) && <p>{text(props.description)}</p>}
      </div>
      {href(props.scrollURL) && (
        <a className="intr-scroll" href={href(props.scrollURL)}>
          <span aria-hidden="true">↓</span>
          {text(props.scrollLabel)}
        </a>
      )}
    </section>
  );
}
export function Introduction({ props, context }: ViewProps) {
  return (
    <section className="intr-scope intr-introduction" id={anchor(props.anchor)}>
      <div className="intr-intro-top">
        <div className="intr-intro-title">
          <h2>{text(props.heading)}</h2>
          <p>{text(props.caption)}</p>
        </div>
        <div className="intr-intro-copy">
          <p>{text(props.description)}</p>
          <Action label={props.actionLabel} url={props.actionURL} />
        </div>
      </div>
      <div className="intr-intro-images">
        <Image
          value={props.leftImage}
          context={context}
          className="intr-intro-portrait"
          sizes="(max-width: 640px) 100vw, 32vw"
        />
        <div>
          <Image
            value={props.rightImage}
            context={context}
            sizes="(max-width: 640px) 100vw, 50vw"
          />
          <dl className="intr-stats">
            {rows(props.stats).map((row, i) => (
              <div key={text(row._rowId) || i}>
                <dt>{text(row.value)}</dt>
                <dd>{text(row.label)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
export function Projects({
  props,
  context,
  index = false,
}: ViewProps & { index?: boolean }) {
  const collection = context.collections?.find(
    (item) => item.id === props.collection,
  );
  const projects = rows(props.projects).flatMap((row) => {
    const entry = collection?.entries.find((item) => item.id === row.project);
    return entry ? [{ row, entry, values: entry.values ?? {} }] : [];
  });
  return (
    <section
      className={`intr-scope intr-projects ${index ? 'intr-project-index' : 'intr-frame'}`}
      id={anchor(props.anchor)}
    >
      {index ? (
        <h1 className="intr-index-title">{text(props.heading)}</h1>
      ) : (
        <SectionIntro
          label={props.heading}
          description={props.description}
          url={props.actionURL}
          action={props.actionLabel}
        />
      )}
      <div
        className={`intr-project-grid${index ? ' intr-project-grid-index' : ''}`}
      >
        {projects.map(({ row, entry, values }) => {
          const title = text(values[text(props.titleField)]) || entry.title;
          const body = (
            <>
              <div className="intr-project-image">
                <Image
                  value={values[text(props.imageField)]}
                  context={context}
                  sizes={
                    index
                      ? '(max-width: 640px) 100vw, 90vw'
                      : '(max-width: 640px) 100vw, 60vw'
                  }
                />
              </div>
              <div className="intr-project-caption">
                <h3>{title}</h3>
                <p>{text(values[text(props.summaryField)])}</p>
              </div>
            </>
          );
          const url = entry.url || href(values[text(props.urlField)]);
          return (
            <article key={text(row._rowId) || entry.id}>
              {url ? (
                <a href={url} aria-label={`View ${title}`}>
                  {body}
                </a>
              ) : (
                body
              )}
            </article>
          );
        })}
      </div>
      {!projects.length && context.preview && (
        <p className="intr-empty">
          Select projects in this block. Edit their shared titles, locations and
          images in Content → Projects.
        </p>
      )}
    </section>
  );
}
export function Features({ props, context }: ViewProps) {
  return (
    <section
      className="intr-scope intr-frame intr-features"
      id={anchor(props.anchor)}
    >
      <SectionIntro label={props.heading} description={props.description} />
      <div className="intr-feature-grid">
        {rows(props.items).map((row, i) => (
          <article className="intr-feature" key={text(row._rowId) || i}>
            <Image
              value={row.image}
              context={context}
              sizes="(max-width: 640px) 100vw, 25vw"
            />
            <div className="intr-feature-copy">
              <div>
                <h3>{text(row.title)}</h3>
                <span>{String(i + 1).padStart(2, '0')}</span>
              </div>
              <p>{text(row.description)}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
export function Services({ props, context }: ViewProps) {
  return (
    <section className="intr-scope intr-services" id={anchor(props.anchor)}>
      <div className="intr-service-intro">
        <Image
          value={props.image}
          context={context}
          sizes="(max-width: 640px) 100vw, 22vw"
        />
        <div>
          <h2>{text(props.heading)}</h2>
          <p>{text(props.description)}</p>
        </div>
      </div>
      <div className="intr-service-list">
        {rows(props.items).map((row, i) => (
          <article key={text(row._rowId) || i}>
            <h3>{text(row.title)}</h3>
            <p>{text(row.description)}</p>
            <span aria-hidden="true" className="intr-service-number">
              {String(i + 1).padStart(2, '0')}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
export function Process({ props, context }: ViewProps) {
  return (
    <section className="intr-scope intr-frame intr-process">
      <SectionIntro label={props.heading} description={props.description} />
      <div className="intr-process-grid">
        {rows(props.items).map((row, i) => (
          <article key={text(row._rowId) || i}>
            <span className="intr-step">{String(i + 1).padStart(2, '0')}</span>
            <h3>{text(row.title)}</h3>
            <p>{text(row.description)}</p>
            <Image
              value={row.image}
              context={context}
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          </article>
        ))}
      </div>
    </section>
  );
}
export function Partners({ props }: ViewProps) {
  return (
    <section className="intr-scope intr-frame intr-partners">
      <SectionIntro label={props.heading} description={props.description} />
      <ul className="intr-partner-grid">
        {rows(props.items).map((row, i) => (
          <li key={text(row._rowId) || i}>{text(row.name)}</li>
        ))}
      </ul>
    </section>
  );
}
export function Contact({ props, context }: ViewProps) {
  return (
    <section className="intr-scope intr-contact" id={anchor(props.anchor)}>
      <Image
        value={props.image}
        context={context}
        className="intr-contact-background"
        sizes="(max-width: 640px) 1500px, 100vw"
      />
      <div className="intr-contact-card">
        <div>
          <p>{text(props.caption)}</p>
          <span>{text(props.detail)}</span>
        </div>
        <Image
          value={props.insetImage}
          context={context}
          sizes="(max-width: 640px) 80vw, 25vw"
        />
      </div>
      <div className="intr-contact-copy">
        <h2>{text(props.heading)}</h2>
        <Action label={props.actionLabel} url={props.actionURL} light />
      </div>
    </section>
  );
}
export function Story({ props }: ViewProps) {
  return (
    <section className="intr-scope intr-story" id={anchor(props.anchor)}>
      <div className="intr-story-process">
        <h2>{text(props.listHeading)}</h2>
        <ul>
          {rows(props.items).map((row, i) => (
            <li key={text(row._rowId) || i}>{text(row.label)}</li>
          ))}
        </ul>
      </div>
      <div className="intr-story-copy">
        <h2>{text(props.heading)}</h2>
        <p>{text(props.description)}</p>
      </div>
    </section>
  );
}
export function Gallery({ props, context }: ViewProps) {
  return (
    <section className="intr-scope intr-gallery">
      <div className="intr-frame">
        {text(props.quote) && <blockquote>{text(props.quote)}</blockquote>}
        {text(props.heading) && (
          <SectionIntro label={props.heading} description={props.description} />
        )}
      </div>
      <div className="intr-gallery-grid">
        {rows(props.images).map((row, i) => (
          <figure key={text(row._rowId) || i}>
            <Image
              value={row.image}
              context={context}
              sizes="(max-width: 640px) 100vw, 65vw"
            />
            {text(row.caption) && <figcaption>{text(row.caption)}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  );
}
