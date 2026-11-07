import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useAdminTheme } from './AdminTheme';
import styles from './editor.module.css';

export const EditorBusyContext = createContext(false);

const NavigationContext = createContext<{
  outlet: HTMLDivElement | null;
  active: string | undefined;
  levels: string[];
  enter(id: string): void;
  leave(id: string): void;
} | null>(null);
export const usePanelNavigation = () => useContext(NavigationContext);

export function StackProvider({ children }: { children: ReactNode }) {
  const parent = useRef<HTMLDivElement>(null);
  const [levels, setLevels] = useState<string[]>([]);
  const [outlet, setOutlet] = useState<HTMLDivElement | null>(null);
  const actions = useMemo(
    () => ({
      enter(id: string) {
        setLevels((current) =>
          current.includes(id) ? current : [...current, id],
        );
      },
      leave(id: string) {
        setLevels((current) => current.filter((level) => level !== id));
      },
    }),
    [],
  );
  useEffect(() => {
    const surfaces = parent.current?.querySelectorAll<HTMLElement>(
      '[data-editor-surface]',
    );
    surfaces?.forEach((node) => {
      node.toggleAttribute('inert', !!levels.length);
    });
  });
  return (
    <NavigationContext.Provider
      value={{ outlet, active: levels.at(-1), levels, ...actions }}
    >
      <div ref={parent} className={styles.stackParent} data-panel-parent>
        {children}
      </div>
      <div ref={setOutlet} className={styles.stackOutlet} />
    </NavigationContext.Provider>
  );
}

/** Nonmodal: the preview and global navigation stay available. Only the parent
 * editor is covered. Nested forms remain mounted with their pending values. */
export function SlideOver({
  title,
  onClose,
  dismissible = true,
  children,
}: {
  title: string;
  onClose(): void;
  /** Pressing the dimmed parent closes the panel. Creation forms opt out so
   * an accidental press keeps their unsaved values. */
  dismissible?: boolean;
  children: ReactNode;
}) {
  const navigation = usePanelNavigation();
  const busy = useContext(EditorBusyContext);
  const { mode } = useAdminTheme();
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const enter = navigation?.enter,
    leave = navigation?.leave;
  useEffect(() => {
    enter?.(id);
    return () => leave?.(id);
  }, [id, enter, leave]);
  const active = !navigation || navigation.active === id;
  const depth = Math.max(0, navigation?.levels.indexOf(id) ?? 0);
  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('h2')?.focus();
    return () => {
      if (previous?.isConnected && !previous.closest('[inert]'))
        previous.focus();
    };
  }, [active]);
  const panel = (
    <div
      className={`admin-ui ${styles.stackLayer}`}
      data-mode={mode}
      data-panel-level={id}
      inert={!active ? true : undefined}
      style={{ zIndex: 10 + depth }}
    >
      <div
        className={styles.stackScrim}
        aria-hidden="true"
        onClick={() => active && !busy && dismissible && onClose()}
      />
      <div
        ref={ref}
        role="dialog"
        aria-label={title}
        className={styles.slideOver}
        style={{ '--stack-depth': depth } as CSSProperties}
        onKeyDown={(e) => {
          if (active && !busy && e.key === 'Escape' && !e.defaultPrevented) {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }
        }}
      >
        <fieldset disabled={busy} className={styles.stackFields}>
          {children}
        </fieldset>
      </div>
    </div>
  );
  return navigation?.outlet
    ? createPortal(panel, navigation.outlet)
    : navigation
      ? null
      : panel;
}
