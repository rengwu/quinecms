import type { ViewProps } from '../../../core/types';
import { markdown } from '../../../core/markdown';
import styles from './text.module.css';
export default function Text({ props, context }: ViewProps) {
  return (
    <section
      className={styles.text}
      dangerouslySetInnerHTML={{
        __html: markdown(String(props.body ?? ''), context.media),
      }}
    />
  );
}
