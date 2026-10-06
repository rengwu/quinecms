import {
  Shell,
  Intro,
  Items,
  Image,
  key,
  text,
  type LayoutProps,
} from './shared';
export default function Testimonials(v: LayoutProps) {
  return (
    <Shell category="testimonials" variant={v.variant}>
      <Intro {...v} />
      <div className="tw-quotes">
        <Items {...v}>
          {(r, i) => (
            <figure key={key(r, i)}>
              <blockquote>“{text(r.quote)}”</blockquote>
              <figcaption>
                <Image value={r.image} context={v.context} art={false} />
                <div>
                  <strong>{text(r.name)}</strong>
                  <span>{text(r.role)}</span>
                </div>
              </figcaption>
            </figure>
          )}
        </Items>
      </div>
    </Shell>
  );
}
