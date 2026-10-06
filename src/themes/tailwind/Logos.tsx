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
export default function Logos(v: LayoutProps) {
  return (
    <Shell category="logos" variant={v.variant}>
      <Intro {...v} />
      <div className="tw-logo-grid">
        <Items {...v}>
          {(r, i) => (
            <a key={key(r, i)} href={href(r.url)} aria-label={text(r.name)}>
              <Image value={r.image} context={v.context} art={false} />
              {!r.image && <strong>{text(r.name)}</strong>}
            </a>
          )}
        </Items>
      </div>
    </Shell>
  );
}
