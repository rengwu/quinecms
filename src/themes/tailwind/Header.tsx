import {
  Shell,
  Intro,
  Image,
  Items,
  key,
  text,
  value,
  type LayoutProps,
} from './shared';
export default function Header(v: LayoutProps) {
  return (
    <Shell category="header" variant={v.variant} dark={v.variant === 2}>
      {v.variant === 2 && (
        <Image
          className="tw-backdrop"
          value={value(v.props, v.context, 'image')}
          context={v.context}
        />
      )}
      <Intro {...v} hero />
      {v.variant === 3 && (
        <dl className="tw-stats">
          <Items {...v}>
            {(r, i) => (
              <div key={key(r, i)}>
                <dt>{text(r.label)}</dt>
                <dd>{text(r.value)}</dd>
              </div>
            )}
          </Items>
        </dl>
      )}
    </Shell>
  );
}
