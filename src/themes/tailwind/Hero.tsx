import {
  Shell,
  Intro,
  Actions,
  Image,
  Items,
  key,
  value,
  type LayoutProps,
} from './shared';
export default function Hero(v: LayoutProps) {
  return (
    <Shell category="hero" variant={v.variant}>
      <div className="tw-hero-copy">
        <Intro {...v} hero />
        <Actions {...v} />
      </div>
      {v.variant === 2 && (
        <Image value={value(v.props, v.context, 'image')} context={v.context} />
      )}
      {v.variant === 3 && (
        <div className="tw-tiles">
          <Items {...v}>
            {(r, i) => (
              <Image key={key(r, i)} value={r.image} context={v.context} />
            )}
          </Items>
        </div>
      )}
    </Shell>
  );
}
