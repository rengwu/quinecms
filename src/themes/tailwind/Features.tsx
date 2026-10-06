import {
  Shell,
  Intro,
  Items,
  Image,
  key,
  value,
  text,
  href,
  type LayoutProps,
} from './shared';
export default function Features(v: LayoutProps) {
  return (
    <Shell category="features" variant={v.variant}>
      <Intro {...v} />
      <div className="tw-feature-body">
        <div className="tw-feature-grid">
          <Items {...v}>
            {(r, i) => (
              <article key={key(r, i)}>
                <span className="tw-feature-number" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3>{text(r.title)}</h3>
                <p>{text(r.description)}</p>
                {href(r.url) && (
                  <a className="tw-link" href={href(r.url)}>
                    Learn more ↗
                  </a>
                )}
              </article>
            )}
          </Items>
        </div>
        {v.variant === 2 && (
          <Image
            value={value(v.props, v.context, 'image')}
            context={v.context}
          />
        )}{' '}
        {v.variant === 3 && (
          <blockquote>
            <p>“{text(value(v.props, v.context, 'quote'))}”</p>
            <cite>{text(value(v.props, v.context, 'author'))}</cite>
          </blockquote>
        )}
      </div>
    </Shell>
  );
}
