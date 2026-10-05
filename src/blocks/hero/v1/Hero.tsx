import type { ViewProps } from '../../../core/types';
import styles from './hero.module.css';
export default function Hero({ props }: ViewProps) {
  return (
    <section className={styles.hero}>
      <h1>{String(props.title ?? '')}</h1>
      <p className={styles.body}>{String(props.description ?? '')}</p>
    </section>
  );
}
