import {
  Shell,
  Intro,
  Items,
  Image,
  key,
  text,
  href,
  type LayoutProps,
} from './shared';
export default function Bento(v: LayoutProps) {
  return (
    <Shell category="bento" variant={v.variant}>
      <Intro {...v} />
      <div className="tw-bento-grid">
        <Items {...v}>
          {(r, i) => (
            <article key={key(r, i)}>
              <div>
                <p className="tw-eyebrow">{text(r.eyebrow)}</p>
                <h3>{text(r.title)}</h3>
                <p>{text(r.description)}</p>
                {href(r.url) && (
                  <a className="tw-link" href={href(r.url)}>
                    Explore <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
              <Image value={r.image} context={v.context} />
            </article>
          )}
        </Items>
      </div>
    </Shell>
  );
}
