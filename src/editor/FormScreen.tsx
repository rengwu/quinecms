import { BackDepth, useBackDepth } from './browser-back';
import type { ReactNode } from 'react';
import styles from './editor.module.css';
import { Button, type MenuItem } from './ui';
import { XIcon } from '@phosphor-icons/react';
import { SlideOver } from './Stack';
import PageHeader from './PageHeader';

export interface Creation {
  label: string;
  onCreate(): void;
}

/** Creation values stay with the caller until the explicit submit action.
 * Panels share one footer: removal and secondary actions on the left, then
 * Cancel and the submit action, or Done for edits that already apply. */
export default function FormScreen({
  title,
  backDepth,
  subtitle,
  onBack,
  creation,
  stack = !!creation,
  actions,
  menu,
  menuHint,
  done = true,
  children,
}: {
  title: string;
  backDepth?: number;
  subtitle?: string;
  onBack(): void;
  creation?: Creation;
  stack?: boolean;
  /** Footer actions before Done, such as Remove or Duplicate. */
  actions?: ReactNode;
  /** Less frequent actions for a full screen, shown under ⋯ in its header. */
  menu?: MenuItem[];
  /** Why some menu actions are unavailable. */
  menuHint?: ReactNode;
  /** Panels that only choose something, such as Add block, have no footer. */
  done?: boolean;
  children: ReactNode;
}) {
  const parentDepth = useBackDepth();
  const depth = backDepth ?? Math.max(1, parentDepth);
  const footer = creation ? (
    <div className={styles.actionFooter}>
      {actions && <div className={styles.footerStart}>{actions}</div>}
      <Button data-editor-back={depth} type="button" onClick={onBack}>
        Cancel
      </Button>
      <Button type="submit" variant="primary">
        {creation.label}
      </Button>
    </div>
  ) : stack && (done || actions) ? (
    <div className={styles.actionFooter}>
      {actions && <div className={styles.footerStart}>{actions}</div>}
      {done && (
        <Button
          data-editor-back={depth}
          type="button"
          variant="primary"
          onClick={onBack}
        >
          Done
        </Button>
      )}
    </div>
  ) : (
    actions && <div className={styles.actionFooter}>{actions}</div>
  );
  const body = (
    <>
      {stack ? (
        <div className={styles.formHeading}>
          <h2 tabIndex={-1}>{title}</h2>
          <Button
            data-editor-back={depth}
            type="button"
            variant="ghost"
            shape="square"
            aria-label="Close panel"
            icon={<XIcon />}
            onClick={onBack}
          />
          {subtitle && <p>{subtitle}</p>}
        </div>
      ) : (
        <PageHeader
          title={title}
          description={subtitle}
          menu={menu}
          menuHint={menuHint}
        />
      )}
      <BackDepth.Provider value={depth}>{children}</BackDepth.Provider>
      {footer}
    </>
  );
  const screen = creation ? (
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
  return stack ? (
    <SlideOver title={title} onClose={onBack} dismissible={!creation}>
      {screen}
    </SlideOver>
  ) : (
    screen
  );
}
