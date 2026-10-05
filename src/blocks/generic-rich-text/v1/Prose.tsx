import type { ViewProps } from '../../../core/types';
import { markdown } from '../../../core/markdown';
import styles from '../../text/v1/text.module.css';
export default function Prose({ props, context }: ViewProps) {
  return (
    <section className={styles.text}>
      {context.bindingPlaceholders?.body ? (
        <p>{context.bindingPlaceholders.body}</p>
      ) : (
        <div
          dangerouslySetInnerHTML={{
            __html: markdown(props.body, context.media),
          }}
        />
      )}
    </section>
  );
}
