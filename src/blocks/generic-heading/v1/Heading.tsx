import type { ViewProps } from '../../../core/types';
import styles from './heading.module.css';
export default function Heading({ props, context }: ViewProps) {
  const value = (key: string) =>
    context.bindingPlaceholders?.[key] ?? String(props[key] ?? '');
  return (
    <header className={styles.heading}>
      {value('date') && <p>{value('date')}</p>}
      <h1>{value('title')}</h1>
      {value('description') && <p>{value('description')}</p>}
    </header>
  );
}
