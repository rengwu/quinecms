import { useBackDepth } from './browser-back';
import type { ReactNode } from 'react';
import styles from './editor.module.css';
import FormScreen, { type Creation } from './FormScreen';
export { StackProvider as PanelNavigation, usePanelNavigation } from './Stack';

export function PanelLevel({
  title,
  subtitle,
  context,
  onBack,
  creation,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  context?: string;
  onBack(): void;
  creation?: Creation;
  /** Footer actions before Done, such as Remove. */
  actions?: ReactNode;
  children: ReactNode;
}) {
  const depth = useBackDepth() + 1;
  return (
    <FormScreen
      stack
      backDepth={depth}
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      creation={creation}
      actions={actions}
    >
      {context && <p className={styles.muted}>{context}</p>}
      {children}
    </FormScreen>
  );
}
