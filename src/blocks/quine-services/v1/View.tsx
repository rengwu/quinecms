import type { ViewProps } from '../../../core/types';
import { rows, text } from '../../../themes/quine/v1/content';
import '../../../themes/quine/v1/styles.css';
export default function Services({ props }: ViewProps) {
  return (
    <section className="quine-scope quine-section quine-services">
      <div className="quine-frame">
        <h2 className="quine-heading">{text(props.heading)}</h2>
        <dl className="quine-service-list">
          {rows(props.items).map((row, index) => (
            <div key={text(row._rowId) || index} className="quine-service-row">
              <dt className="quine-caption">{text(row.title)}</dt>
              <dd className="quine-body">{text(row.description)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
