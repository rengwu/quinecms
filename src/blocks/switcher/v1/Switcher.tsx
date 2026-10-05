import { useState } from 'react';
import type { ViewProps } from '../../../core/types';
import styles from './switcher.module.css';
export default function Switcher({ props, context }: ViewProps) {
  const [selected, setSelected] = useState(0);
  return (
    <section className={styles.switcher}>
      <h2>{String(props.title ?? '')}</h2>
      <div role="tablist" aria-label={String(props.title ?? 'Panels')}>
        {[0, 1].map((i) => (
          <button
            key={i}
            type="button"
            role="tab"
            id={`${context.instanceId}-tab-${i}`}
            aria-selected={selected === i}
            aria-controls={`${context.instanceId}-panel-${i}`}
            tabIndex={selected === i ? 0 : -1}
            onClick={() => setSelected(i)}
            onKeyDown={(e) => {
              if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                e.preventDefault();
                const next =
                  e.key === 'Home' ? 0 : e.key === 'End' ? 1 : 1 - selected;
                setSelected(next);
                document
                  .getElementById(`${context.instanceId}-tab-${next}`)
                  ?.focus();
              }
            }}
          >
            {String(props[i === 0 ? 'firstLabel' : 'secondLabel'] ?? '')}
          </button>
        ))}
      </div>
      {[0, 1].map((i) => (
        <p
          key={i}
          role="tabpanel"
          id={`${context.instanceId}-panel-${i}`}
          aria-labelledby={`${context.instanceId}-tab-${i}`}
          hidden={selected !== i}
        >
          {String(props[i === 0 ? 'firstBody' : 'secondBody'] ?? '')}
        </p>
      ))}
    </section>
  );
}
