import {
  Shell,
  Intro,
  Items,
  Image,
  key,
  text,
  value,
  type LayoutProps,
} from './shared';
export default function Stats(v: LayoutProps) {
  return (
    <Shell category="stats-section" variant={v.variant}>
      <div>
        <Intro {...v} />
        {v.variant === 2 && (
          <Image
            value={value(v.props, v.context, 'image')}
            context={v.context}
          />
        )}
      </div>
      <dl className="tw-stats">
        <Items {...v}>
          {(r, i) => (
            <div key={key(r, i)}>
              <dt>{text(r.label)}</dt>
              <dd>{text(r.value)}</dd>
              {r.description && <p>{text(r.description)}</p>}
            </div>
          )}
        </Items>
      </dl>
    </Shell>
  );
}
