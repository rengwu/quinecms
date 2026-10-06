import Layout from '../../../themes/tailwind/Header';
import type { ViewProps } from '../../../core/types';
export default function View(props: ViewProps) {
  return <Layout {...props} variant={1} />;
}
