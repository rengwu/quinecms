import {
  Shell,
  Intro,
  Image,
  Items,
  key,
  text,
  href,
  type LayoutProps,
} from './shared';
import Form from './Form';
export default function Contact(v: LayoutProps) {
  return (
    <Shell category="contact" variant={v.variant}>
      <div>
        <Intro {...v} />
        <Form {...v} contact />
      </div>
      {v.variant === 2 && <Image value={v.props.image} context={v.context} />}{' '}
      {v.variant === 3 && (
        <div className="tw-contact-details">
          <Items {...v}>
            {(r, i) => (
              <article key={key(r, i)}>
                <h3>{text(r.label)}</h3>
                <p>
                  {href(r.url) ? (
                    <a href={href(r.url)}>{text(r.detail)}</a>
                  ) : (
                    text(r.detail)
                  )}
                </p>
              </article>
            )}
          </Items>
        </div>
      )}
    </Shell>
  );
}
