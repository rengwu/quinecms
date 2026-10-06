import { Shell, Intro, type LayoutProps } from './shared';
import Form from './Form';
export default function Newsletter(v: LayoutProps) {
  return (
    <Shell category="newsletter" variant={v.variant} dark={v.variant === 1}>
      <Intro {...v} />
      <Form {...v} />
    </Shell>
  );
}
