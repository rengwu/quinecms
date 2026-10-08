import type { ViewProps, Values } from '../../../core/types';
import { listRows } from '../../../core/lists';
import styles from './details.module.css';
export default function StructuredDetails({ props, context }: ViewProps) {
  const text = (value: unknown) => (value == null ? '' : String(value));
  const placeholder = context.bindingPlaceholders;
  return (
    <section className={styles.details}>
      <h2>{placeholder?.heading ?? text(props.heading)}</h2>
      {!!props.author && <p>By {placeholder?.author ?? text(props.author)}</p>}
      {placeholder?.groups ? (
        <p>{placeholder.groups}</p>
      ) : (
        listRows(props.groups).map((group, i) => (
          <section key={text(group._rowId ?? i)}>
            <h3>{text(group.title)}</h3>
            <dl>
              {listRows(group.rows).map((row: Values, j) => (
                <div key={text(row._rowId ?? j)}>
                  <dt>{text(row.label)}</dt>
                  <dd>{text(row.value)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))
      )}
    </section>
  );
}
