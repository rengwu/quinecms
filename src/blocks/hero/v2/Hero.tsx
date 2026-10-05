import type { ViewProps } from '../../../core/types';
import styles from './hero.module.css';
export default function Hero({ props, context }: ViewProps) {
  return (
    <section
      className={styles.hero}
      data-theme={context.globals.theme === 'dark' ? 'dark' : 'light'}
      style={{
        textAlign: props.align === 'center' ? 'center' : 'left',
        ...(props.presentation &&
        typeof props.presentation === 'object' &&
        !Array.isArray(props.presentation)
          ? {
              color: String(props.presentation.accent),
              paddingTop: Number(props.presentation.inset),
              paddingBottom: Number(props.presentation.inset),
            }
          : {}),
      }}
    >
      <p className={styles.eyebrow}>{String(props.eyebrow ?? '')}</p>
      <h1>{String(props.title ?? '')}</h1>
      <p className={styles.body}>{String(props.description ?? '')}</p>
    </section>
  );
}
