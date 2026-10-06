import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@cloudflare/kumo/components/button';
import styles from './editor.module.css';

const NavigationContext = createContext<{
  outlet: HTMLDivElement | null;
  active: string | undefined;
  enter(id: string): void;
  leave(id: string): void;
} | null>(null);
export const usePanelNavigation = () => useContext(NavigationContext);

/** One navigation surface for the entire inspector, including custom layouts.
 * Keep parent forms mounted for live values, but remove them from view and AX.
 */
export function PanelNavigation({ children }: { children: ReactNode }) {
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
        setLevels((current) => {
          const index = current.indexOf(id);
          return index < 0 ? current : current.slice(0, index);
        });
      },
    }),
    [],
  );
  const active = levels.at(-1);
  useEffect(() => {
    if (!outlet) return;
    const surface = outlet.closest<HTMLElement>(
      '[aria-label="Site builder"], [aria-label="Admin workspace"]',
    );
    if (surface) surface.scrollTop = 0;
    if (active)
      outlet
        .querySelector<HTMLElement>('[data-panel-level]:not([hidden]) h2')
        ?.focus();
  }, [active, outlet]);
  return (
    <NavigationContext.Provider value={{ outlet, active, ...actions }}>
      <div
        hidden={!!active}
        style={{ display: active ? 'none' : 'contents' }}
        data-panel-parent
      >
        {children}
      </div>
      <div ref={setOutlet} />
    </NavigationContext.Provider>
  );
}

export function PanelLevel({
  title,
  context,
  onBack,
  children,
}: {
  title: string;
  context?: string;
  onBack(): void;
  children: ReactNode;
}) {
  const navigation = usePanelNavigation();
  const id = useId();
  const enter = navigation?.enter,
    leave = navigation?.leave;
  useEffect(() => {
    enter?.(id);
    return () => leave?.(id);
  }, [enter, leave, id]);
  if (!navigation?.outlet) return null;
  const hidden = navigation.active !== id;
  return createPortal(
    <div
      hidden={hidden}
      style={{ display: hidden ? 'none' : undefined }}
      className={styles.formStack}
      data-panel-level={id}
    >
      <Button variant="ghost" className={styles.back} onClick={onBack}>
        ← Back
      </Button>
      <h2 tabIndex={-1}>{title}</h2>
      {context && <p className={styles.muted}>{context}</p>}
      {children}
    </div>,
    navigation.outlet,
  );
}
