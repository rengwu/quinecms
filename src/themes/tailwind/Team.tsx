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
export default function Team(v: LayoutProps) {
  return (
    <Shell category="team" variant={v.variant}>
      <Intro {...v} />
      <div className="tw-people">
        <Items {...v}>
          {(r, i) => (
            <article key={key(r, i)}>
              <Image value={r.image} context={v.context} />
              <div>
                <h3>{text(r.name)}</h3>
                <p className="tw-eyebrow">{text(r.role)}</p>
                {v.variant !== 1 && <p>{text(r.bio)}</p>}
                {href(r.url) && (
                  <a className="tw-link" href={href(r.url)}>
                    Profile ↗
                  </a>
                )}
              </div>
            </article>
          )}
        </Items>
      </div>
    </Shell>
  );
}
