import type { ReactNode } from 'react';
import styles from './editor.module.css';
import { Menu, type MenuItem } from './ui';

/** One header for every screen: title, actions on the right, an optional
 * description, and a ⋯ menu for the screen's less frequent actions. */
export default function PageHeader({
  title,
  description,
  actions,
  menu = [],
  menuLabel = 'More actions',
  menuHint,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  menu?: MenuItem[];
  menuLabel?: string;
  menuHint?: ReactNode;
  /** Status shown under the title, such as a language copy state. */
  children?: ReactNode;
}) {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.pageHeading}>
        <h1>{title}</h1>
        {(actions || menu.length > 0) && (
          <div className={styles.pageActions}>
            {actions}
            <Menu label={menuLabel} items={menu} hint={menuHint} />
          </div>
        )}
      </div>
      {description && <p className={styles.pageDescription}>{description}</p>}
      {children}
    </header>
  );
}
