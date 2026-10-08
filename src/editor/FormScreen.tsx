import type { ReactNode } from 'react';
import { Button } from '@cloudflare/kumo/components/button';
import styles from './editor.module.css';

export interface Creation {
  label: string;
  onCreate(): void;
}

/** Creation values stay with the caller until the explicit submit action. */
export default function FormScreen({
  title,
  subtitle,
  onBack,
  creation,
  children,
}: {
  title: string;
  subtitle?: string;
  onBack(): void;
  creation?: Creation;
  children: ReactNode;
}) {
  const body = (
    <>
      {!creation && (
        <Button
          type="button"
          variant="ghost"
          className={styles.back}
          onClick={onBack}
        >
          ← Back
        </Button>
      )}
      <div className={styles.formHeading}>
        <h2 tabIndex={-1}>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
      {creation && (
        <div className={styles.actionFooter}>
          <div className={styles.dialogActions}>
            <Button type="button" onClick={onBack}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {creation.label}
            </Button>
          </div>
        </div>
      )}
    </>
  );
  return creation ? (
    <form
      className={styles.formStack}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        creation.onCreate();
      }}
    >
      {body}
    </form>
  ) : (
    <div className={styles.formStack}>{body}</div>
  );
}
