import type { ViewProps } from '../../../core/types';
import styles from './list.module.css';
export default function CollectionList({ props, context }: ViewProps) {
  const collection = context.collections?.find(
    (c) => c.id === props.collection,
  );
  return (
    <section className={styles.list}>
      {props.heading && <h2>{String(props.heading)}</h2>}
      <ul>
        {collection?.entries.map((e) => (
          <li key={e.id}>
            {e.url ? <a href={e.url}>{e.title}</a> : <span>{e.title}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
