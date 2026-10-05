import { useId, type ReactNode } from 'react';
import styles from './editor.module.css';

// One layout contract for sidebar groups. Kumo continues to own the controls.
export default function PanelSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section className={styles.panelSection} aria-labelledby={headingId}>
      <div className={styles.sectionHeader}>
        <h2 id={headingId}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
