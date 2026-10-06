import { Shell, Intro, Image, Rich, value, type LayoutProps } from './shared';
export default function Content(v: LayoutProps) {
  return (
    <Shell category="content" variant={v.variant}>
      <div>
        <Intro {...v} />
        <Rich value={value(v.props, v.context, 'body')} context={v.context} />
      </div>
      {v.variant !== 1 && (
        <figure>
          <Image
            value={value(v.props, v.context, 'image')}
            context={v.context}
          />
        </figure>
      )}
    </Shell>
  );
}
