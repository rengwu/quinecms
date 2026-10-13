import { useEffect, useId, useState } from 'react';
import type { Context, Json, ViewProps } from '../../../core/types';
import { anchor, asset, href, rows, text } from './content';
import './styles.css';

export function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={back ? { transform: 'rotate(180deg)' } : undefined}
    >
      <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
export function Action({
  label,
  url,
  pill = false,
  light = false,
}: {
  label?: Json;
  url?: Json;
  pill?: boolean;
  light?: boolean;
}) {
  return text(label) && href(url) ? (
    <a
      className={`archline-action${pill ? ' archline-pill' : ''}${light ? ' archline-light' : ''}`}
      href={href(url)}
    >
      <span>{text(label)}</span>
      <Arrow />
    </a>
  ) : null;
}
export function Image({
  value,
  context,
  className = '',
  eager = false,
  sizes = '(max-width: 700px) 100vw, 50vw',
}: {
  value?: Json;
  context: Pick<Context, 'media' | 'preview'>;
  className?: string;
  eager?: boolean;
  sizes?: string;
}) {
  const image = asset(value, context);
  if (!image)
    return (
      <div className={`archline-image-empty ${className}`}>
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
export function Eyebrow({ children }: { children: Json | undefined }) {
  return text(children) ? (
    <p className="archline-eyebrow">{text(children)}</p>
  ) : null;
}
function Copy({ value }: { value?: Json }) {
  return (
    <>
      {text(value)
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
    </>
  );
}
export function Hero({ props, context }: ViewProps) {
  return (
    <section className="archline-scope archline-hero" id={anchor(props.anchor)}>
      <Image
        value={props.image}
        context={context}
        className="archline-cover"
        sizes="100vw"
        eager
      />
      <div className="archline-hero-shade" />
      <div className="archline-hero-grid" aria-hidden="true" />
      <div className="archline-frame archline-hero-content">
        <h1>{text(props.heading)}</h1>
        <div className="archline-hero-bottom">
          <p>{text(props.description)}</p>
          <Action label={props.actionLabel} url={props.actionURL} pill light />
        </div>
        <a className="archline-scroll" href={href(props.scrollURL)}>
          {text(props.scrollLabel)}
        </a>
      </div>
    </section>
  );
}
export function Introduction({ props, context }: ViewProps) {
  return (
    <section
      className="archline-scope archline-section"
      id={anchor(props.anchor)}
    >
      <div className="archline-frame">
        <Eyebrow>{props.label}</Eyebrow>
        <h2 className="archline-statement" data-reveal>
          {text(props.heading)}
        </h2>
        <div className="archline-about-grid">
          <Image
            value={props.smallImage}
            context={context}
            sizes="(max-width:700px) 100vw, 16vw"
          />
          <div className="archline-about-copy">
            <Copy value={props.description} />
            <Action label={props.actionLabel} url={props.actionURL} />
          </div>
          <Image
            value={props.largeImage}
            context={context}
            className="archline-about-portrait"
            sizes="(max-width:700px) 100vw, 33vw"
          />
        </div>
      </div>
    </section>
  );
}
export function Stats({ props }: ViewProps) {
  return (
    <section className="archline-scope archline-stat-section">
      <div className="archline-frame">
        <dl className="archline-stats">
          {rows(props.items).map((row, i) => (
            <div key={text(row._rowId) || i} data-reveal>
              <dt>{text(row.value)}</dt>
              <dd>{text(row.label)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
export function WideImage({ props, context }: ViewProps) {
  return (
    <section className="archline-scope archline-wide-image">
      <Image value={props.image} context={context} sizes="100vw" />
      {text(props.caption) && <p>{text(props.caption)}</p>}
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
  const all = collection?.entries ?? [];
  const selected = rows(props.projects);
  const entries = selected.length
    ? selected.flatMap((row) => {
        const entry = all.find((item) => item.id === row.project);
        return entry ? [entry] : [];
      })
    : all;
  return (
    <section
      className={`archline-scope archline-section archline-projects${index ? ' archline-project-index' : ''}`}
      id={anchor(props.anchor)}
    >
      <div className="archline-frame">
        <div className="archline-section-head" data-reveal>
          <div>
            <Eyebrow>{props.label}</Eyebrow>
            {index ? (
              <h1>{text(props.heading)}</h1>
            ) : (
              <h2>{text(props.heading)}</h2>
            )}
          </div>
          {text(props.description) && <p>{text(props.description)}</p>}
        </div>
        <div
          className={`archline-project-grid${index ? ' archline-project-grid-three' : ''}`}
        >
          {entries.map((entry, i) => {
            const values = entry.values ?? {};
            const title = text(values[text(props.titleField)]) || entry.title;
            const card = (
              <>
                <div className="archline-project-photo">
                  <Image
                    value={values[text(props.imageField)]}
                    context={context}
                    sizes={index ? '(max-width:700px) 100vw, 33vw' : undefined}
                  />
                  <span className="archline-project-hover">
                    View project <Arrow />
                  </span>
                </div>
                <div className="archline-project-caption">
                  <h3>{title}</h3>
                  <span>{text(values[text(props.summaryField)])}</span>
                </div>
              </>
            );
            return href(entry.url) ? (
              <a
                key={entry.id}
                href={href(entry.url)}
                className="archline-project-card"
                aria-label={`View ${title}`}
                data-reveal
              >
                {card}
              </a>
            ) : (
              <article
                key={entry.id || i}
                className="archline-project-card"
                data-reveal
              >
                {card}
              </article>
            );
          })}
        </div>
        {!entries.length && context.preview && (
          <p className="archline-empty">
            Choose a project collection to show its entries.
          </p>
        )}
        <div className="archline-section-tail">
          <Action label={props.actionLabel} url={props.actionURL} />
        </div>
      </div>
    </section>
  );
}
export function ProjectIndex(view: ViewProps) {
  return <Projects {...view} index />;
}
export function Services({ props, context }: ViewProps) {
  const items = rows(props.items);
  const images = rows(props.images);
  return (
    <section
      className="archline-scope archline-services archline-section"
      id={anchor(props.anchor)}
    >
      <div className="archline-frame">
        <h2 className="archline-statement" data-reveal>
          {text(props.heading)}
        </h2>
        <Eyebrow>{props.label}</Eyebrow>
        <div className="archline-service-grid">
          {items.map((item, i) => (
            <div
              className={`archline-service-pair archline-service-pair-${i % 2}`}
              key={text(item._rowId) || i}
            >
              {images[i] ? (
                <Image
                  value={images[i].image}
                  context={context}
                  sizes="(max-width:700px) 50vw, 25vw"
                />
              ) : (
                <div className="archline-service-link">
                  <Action label={props.actionLabel} url={props.actionURL} />
                </div>
              )}
              <div className="archline-service-card" data-reveal>
                <div>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <h3>{text(item.title)}</h3>
                </div>
                <p>{text(item.description)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export function Process({ props, context }: ViewProps) {
  return (
    <section
      className="archline-scope archline-section"
      id={anchor(props.anchor)}
    >
      <div className="archline-frame archline-process-grid">
        <ol className="archline-steps">
          {rows(props.steps).map((row, i) => (
            <li key={text(row._rowId) || i}>
              <span>{i + 1}</span>
              {text(row.title)}
            </li>
          ))}
        </ol>
        <div className="archline-process-copy" data-reveal>
          <Eyebrow>{props.label}</Eyebrow>
          <h2>{text(props.heading)}</h2>
          <Copy value={props.description} />
          <Action label={props.actionLabel} url={props.actionURL} />
        </div>
        <Image
          value={props.leftImage}
          context={context}
          className="archline-process-left"
        />
        <Image
          value={props.rightImage}
          context={context}
          className="archline-process-right"
        />
      </div>
    </section>
  );
}
export function Partners({ props }: ViewProps) {
  const items = rows(props.items);
  return (
    <section
      className="archline-scope archline-partners"
      aria-label={text(props.label) || 'Partners'}
    >
      <div className="archline-partner-track">
        {items.map((row, i) => (
          <span key={text(row._rowId) || i}>
            <span aria-hidden="true" className="archline-partner-symbol">
              {['◈', '◉', '✳', '⊞', '◇', '✺'][i % 6]}
            </span>
            {text(row.name)}
          </span>
        ))}
      </div>
    </section>
  );
}
export function Testimonials({ props, context }: ViewProps) {
  const items = rows(props.items);
  const [selected, setSelected] = useState(0);
  const id = useId();
  const index = Math.min(selected, Math.max(items.length - 1, 0));
  const item = items[index];
  useEffect(() => {
    setSelected(0);
  }, [items.length]);
  if (!item)
    return context.preview ? (
      <section className="archline-scope archline-empty">
        Add a testimonial.
      </section>
    ) : null;
  return (
    <section
      className="archline-scope archline-testimonials"
      aria-roledescription="carousel"
      aria-label={text(props.label) || 'Client reflections'}
    >
      <Image
        value={props.image}
        context={context}
        className="archline-cover"
        sizes="100vw"
      />
      <div className="archline-testimonial-shade" />
      <div
        className="archline-testimonial-content"
        id={id}
        aria-live="polite"
        aria-atomic="true"
      >
        <blockquote>{text(item.quote)}</blockquote>
        <div className="archline-testimonial-author">
          <Image value={item.image} context={context} sizes="48px" />
          <div>
            <p>{text(item.name)}</p>
            <span>{text(item.role)}</span>
          </div>
        </div>
      </div>
      {items.length > 1 && (
        <>
          <button
            type="button"
            className="archline-carousel-prev"
            aria-label="Previous testimonial"
            aria-controls={id}
            onClick={() =>
              setSelected((index - 1 + items.length) % items.length)
            }
          >
            <Arrow back />
          </button>
          <button
            type="button"
            className="archline-carousel-next"
            aria-label="Next testimonial"
            aria-controls={id}
            onClick={() => setSelected((index + 1) % items.length)}
          >
            <Arrow />
          </button>
          <div className="archline-carousel-dots">
            {items.map((row, i) => (
              <button
                type="button"
                key={text(row._rowId) || i}
                aria-label={`Show testimonial ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => setSelected(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
export function Insights({ props, context }: ViewProps) {
  return (
    <section
      className="archline-scope archline-section"
      id={anchor(props.anchor)}
    >
      <div className="archline-frame">
        <div className="archline-section-head">
          <div>
            <Eyebrow>{props.label}</Eyebrow>
            <h2>{text(props.heading)}</h2>
          </div>
        </div>
        <div className="archline-insight-grid">
          {rows(props.items).map((row, i) => {
            const body = (
              <>
                <Image
                  value={row.image}
                  context={context}
                  sizes={
                    i === 0
                      ? '(max-width:700px) 100vw, 50vw'
                      : '(max-width:700px) 100vw, 25vw'
                  }
                />
                <h3>{text(row.title)}</h3>
                <div className="archline-insight-meta">
                  <span>{text(row.readTime)}</span>
                  <time>{text(row.date)}</time>
                </div>
              </>
            );
            return href(row.url) ? (
              <a
                href={href(row.url)}
                className="archline-insight-card"
                key={text(row._rowId) || i}
                data-reveal
              >
                {body}
              </a>
            ) : (
              <article
                className="archline-insight-card"
                key={text(row._rowId) || i}
                data-reveal
              >
                {body}
              </article>
            );
          })}
        </div>
        <div className="archline-insight-tail">
          <Action label={props.actionLabel} url={props.actionURL} />
        </div>
      </div>
    </section>
  );
}
export function Marquee({ props }: ViewProps) {
  return (
    <section
      className="archline-scope archline-marquee"
      aria-label={text(props.text)}
    >
      <div className="archline-marquee-track" aria-hidden="true">
        <span>{text(props.text)}&nbsp;</span>
        <span>{text(props.text)}&nbsp;</span>
      </div>
    </section>
  );
}
export function Faq({ props }: ViewProps) {
  return (
    <section
      className="archline-scope archline-section"
      id={anchor(props.anchor)}
    >
      <div className="archline-frame archline-faq-grid">
        <div className="archline-faq-copy">
          <div>
            <Eyebrow>{props.label}</Eyebrow>
            <h2>{text(props.heading)}</h2>
          </div>
          <div>
            <p>{text(props.description)}</p>
            <Action label={props.actionLabel} url={props.actionURL} />
          </div>
        </div>
        <div className="archline-faq-list">
          {rows(props.items).map((row, i) => (
            <details key={text(row._rowId) || i}>
              <summary>
                {text(row.question)}
                <span aria-hidden="true" />
              </summary>
              <div>
                <Copy value={row.answer} />
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
export function Enquiry({ props, context }: ViewProps) {
  return (
    <section
      className="archline-scope archline-enquiry"
      id={anchor(props.anchor)}
    >
      <Image
        value={props.background}
        context={context}
        className="archline-cover"
        sizes="100vw"
      />
      <div className="archline-enquiry-shade" />
      <div className="archline-postcard" data-reveal>
        <div className="archline-postcard-brand">{text(props.brand)}</div>
        <p className="archline-postcard-tagline">{text(props.tagline)}</p>
        <Image
          value={props.image}
          context={context}
          className="archline-postcard-image"
          sizes="(max-width:700px) 90vw, 600px"
        />
        <div className="archline-postcard-symbol">
          <span>{text(props.leftMark)}</span>
          <b aria-hidden="true">✺</b>
          <span>{text(props.rightMark)}</span>
        </div>
        <h2>{text(props.heading)}</h2>
        <p>{text(props.description)}</p>
        <Action label={props.actionLabel} url={props.actionURL} pill />
      </div>
    </section>
  );
}
export function ProjectHero({ props, context }: ViewProps) {
  return (
    <section className="archline-scope archline-project-hero">
      <div className="archline-frame archline-project-heading">
        <div>
          <a className="archline-back" href={href(props.backURL)}>
            <Arrow back />
            {text(props.backLabel)}
          </a>
          <h1>{text(props.heading) || context.bindingPlaceholders?.heading}</h1>
        </div>
        <dl>
          {rows(props.metadata).map((row, i) => (
            <div key={text(row._rowId) || i}>
              <dt>{text(row.label)}</dt>
              <dd>{text(row.value)}</dd>
            </div>
          ))}
        </dl>
      </div>
      <Image
        value={props.image}
        context={context}
        className="archline-project-cover"
        sizes="100vw"
        eager
      />
    </section>
  );
}
export function ProjectStory({ props, context }: ViewProps) {
  return (
    <section className="archline-scope archline-section">
      <div className="archline-frame archline-story-grid">
        <aside className="archline-project-summary">
          <h2>{text(props.summaryLabel)}</h2>
          <Copy value={props.description} />
          <dl>
            {rows(props.facts).map((row, i) => (
              <div key={text(row._rowId) || i}>
                <dt>{text(row.label)}</dt>
                <dd>{text(row.value)}</dd>
              </div>
            ))}
          </dl>
        </aside>
        <div>
          {rows(props.chapters).map((row, i) => (
            <article className="archline-chapter" key={text(row._rowId) || i}>
              <h2>{text(row.title)}</h2>
              <Image
                value={row.image}
                context={context}
                sizes="(max-width:700px) 100vw, 60vw"
              />
              <Copy value={row.description} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
export function Gallery({ props, context }: ViewProps) {
  return (
    <section className="archline-scope archline-section">
      <div className="archline-frame">
        <h2 className="archline-gallery-heading">{text(props.heading)}</h2>
        <div className="archline-gallery">
          {rows(props.images).map((row, i) => (
            <figure key={text(row._rowId) || i} data-reveal>
              <Image value={row.image} context={context} />
              {text(row.caption) && (
                <figcaption>{text(row.caption)}</figcaption>
              )}
            </figure>
          ))}
        </div>
        <div className="archline-section-tail">
          <Action label={props.actionLabel} url={props.actionURL} />
        </div>
      </div>
    </section>
  );
}
