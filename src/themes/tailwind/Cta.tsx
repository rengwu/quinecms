import { Shell, Intro, Actions, Image, type LayoutProps } from './shared';
export default function Cta(v: LayoutProps) {
  return (
    <Shell category="cta" variant={v.variant} dark={v.variant === 3}>
      <div>
        <Intro {...v} />
        <Actions {...v} />
      </div>
      {v.variant !== 1 && <Image value={v.props.image} context={v.context} />}
    </Shell>
  );
}
