import Layout from '../../../themes/tailwind/Hero';
import type { ViewProps } from '../../../core/types';
export default function View(props: ViewProps) {
  return <Layout {...props} variant={3} />;
}
